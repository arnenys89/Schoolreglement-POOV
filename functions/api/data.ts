import { jsonResponse } from "../_utils/access";

type D1Statement = { bind(...values: any[]): D1Statement; all<T = unknown>(): Promise<{ results: T[] }>; };
type D1Database = { prepare(sql: string): D1Statement; batch(statements: D1Statement[]): Promise<unknown[]> };
type Env = { DB: D1Database };
type JsonRow = { data_json: string };

const COLLECTIONS = new Set(["schools", "sections", "config", "versions"]);

async function requireAdmin(request: Request): Promise<void> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion") || "";
  if (!token) throw new Error("UNAUTHENTICATED");
  let response: Response;
  try {
    response = await fetch("https://sapoov-identity-api.arne-nys.workers.dev/api/access/schoolreglementen", {
      headers: { "Cf-Access-Jwt-Assertion": token }
    });
  } catch {
    throw new Error("CENTRAL_UNAVAILABLE");
  }
  const access: any = await response.json().catch(() => ({}));
  const permissions: string[] = [...new Set((access.roles || []).flatMap((role: any) => role.permissions || []))];
  if (!response.ok || !access.authorized || (!permissions.includes("*") && !permissions.includes("regulations.manage"))) {
    throw new Error("FORBIDDEN");
  }
}

function parsePayload(row: JsonRow) {
  return JSON.parse(row.data_json);
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  if (!env.DB) return jsonResponse({ error: "Cloudflare D1-binding DB ontbreekt." }, 503);
  const url = new URL(request.url);
  const collection = url.searchParams.get("collection") || "";
  const versionId = url.searchParams.get("versionId") || "";

  if (request.method === "GET") {
    if (!COLLECTIONS.has(collection)) return jsonResponse({ error: "Ongeldige gegevenscollectie." }, 400);
    try {
      let rows: any[];
      if (collection === "schools") {
        const result = await env.DB.prepare("SELECT payload_json AS data_json FROM schools ORDER BY rowid").all<JsonRow>();
        rows = (result.results || []).map(parsePayload);
      } else if (collection === "sections") {
        const result = await env.DB.prepare("SELECT payload_json AS data_json FROM regulation_sections WHERE version_id = ? ORDER BY rowid").bind(versionId).all<JsonRow>();
        rows = (result.results || []).map(parsePayload);
      } else if (collection === "versions") {
        const result = await env.DB.prepare("SELECT payload_json AS data_json FROM school_years ORDER BY school_year DESC").all<JsonRow>();
        rows = (result.results || []).map(parsePayload);
      } else {
        const result = await env.DB.prepare("SELECT key, value_json FROM app_settings ORDER BY key").all<{ key: string; value_json: string }>();
        rows = (result.results || []).map((row) => ({ id: row.key, ...JSON.parse(row.value_json) }));
      }
      return jsonResponse({ records: rows });
    } catch {
      return jsonResponse({ error: "De gegevens konden niet uit Cloudflare D1 worden gelezen." }, 500);
    }
  }

  if (request.method === "PUT") {
    try {
      await requireAdmin(request);
    } catch (error) {
      const forbidden = error instanceof Error && error.message === "FORBIDDEN";
      const unavailable = error instanceof Error && error.message === "CENTRAL_UNAVAILABLE";
      return jsonResponse({ error: unavailable ? "De centrale SAPOOV-rechtenservice is tijdelijk niet bereikbaar." : forbidden ? "Geen schrijfrechten." : "Geldige Cloudflare Access-aanmelding vereist." }, unavailable ? 503 : forbidden ? 403 : 401);
    }

    if (!COLLECTIONS.has(collection)) return jsonResponse({ error: "Ongeldige gegevenscollectie." }, 400);
    let body: any;
    try { body = await request.json(); } catch { return jsonResponse({ error: "Ongeldige JSON-inhoud." }, 400); }

    if (body?.deleteVersionId && collection === "versions") {
      const id = String(body.deleteVersionId);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM regulation_sections WHERE version_id = ?").bind(id),
        env.DB.prepare("DELETE FROM school_years WHERE id = ?").bind(id),
      ]);
      return jsonResponse({ success: true });
    }

    const records = Array.isArray(body?.records) ? body.records : [body?.record ?? body];
    if (records.length > 1000) return jsonResponse({ error: "Te veel records in één aanvraag." }, 413);
    const keyVersion = collection === "sections" ? String(body?.versionId || versionId) : "";
    if (collection === "sections" && !keyVersion) return jsonResponse({ error: "Een schooljaarversie is vereist." }, 400);

    try {
      const statements: D1Statement[] = [];
      if (body?.replace === true) {
        if (collection === "schools") statements.push(env.DB.prepare("DELETE FROM schools"));
        if (collection === "sections") statements.push(env.DB.prepare("DELETE FROM regulation_sections WHERE version_id = ?").bind(keyVersion));
        if (collection === "versions") statements.push(env.DB.prepare("DELETE FROM school_years"));
      }

      for (const record of records) {
        if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id.trim()) continue;
        const payload = JSON.stringify(record);
        if (collection === "schools") {
          statements.push(env.DB.prepare("INSERT INTO schools (id, name, payload_json, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name, payload_json=excluded.payload_json, updated_at=CURRENT_TIMESTAMP").bind(record.id, String(record.name || ""), payload));
        } else if (collection === "sections") {
          statements.push(env.DB.prepare("INSERT INTO regulation_sections (id, version_id, section_number, chapter_number, payload_json, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(version_id,id) DO UPDATE SET section_number=excluded.section_number, chapter_number=excluded.chapter_number, payload_json=excluded.payload_json, updated_at=CURRENT_TIMESTAMP").bind(record.id, keyVersion, String(record.sectionNumber || ""), Number(record.chapterNumber || 0), payload));
        } else if (collection === "versions") {
          statements.push(env.DB.prepare("INSERT INTO school_years (id, school_year, is_published, created_at, payload_json, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET school_year=excluded.school_year, is_published=excluded.is_published, created_at=excluded.created_at, payload_json=excluded.payload_json, updated_at=CURRENT_TIMESTAMP").bind(record.id, String(record.schoolYear || record.id), record.isPublished ? 1 : 0, String(record.createdAt || new Date().toISOString()), payload));
        } else {
          const { id, ...value } = record;
          statements.push(env.DB.prepare("INSERT INTO app_settings (key, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, updated_at=CURRENT_TIMESTAMP").bind(id, JSON.stringify(value)));
        }
      }
      if (statements.length) await env.DB.batch(statements);
      return jsonResponse({ success: true, saved: records.length });
    } catch {
      return jsonResponse({ error: "Opslaan in Cloudflare D1 is mislukt." }, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};
