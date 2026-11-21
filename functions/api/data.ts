import { jsonResponse, verifyAccessRequest } from "../_utils/access";

type D1Statement = { bind(...values: any[]): D1Statement; all<T = unknown>(): Promise<{ results: T[] }>; };
type D1Database = { prepare(sql: string): D1Statement; batch(statements: D1Statement[]): Promise<unknown[]> };
type Env = { DB: D1Database };
type RecordRow = { collection: string; record_id: string; version_id: string; data_json: string; updated_at: string };

const COLLECTIONS = new Set(["schools", "sections", "config", "versions"]);

async function requireAdmin(request: Request): Promise<string> {
  const identity = await verifyAccessRequest(request);
  const email = String(identity.email || "").trim().toLowerCase();
  if (email !== "arne.nys@ptiz.be") throw new Error("FORBIDDEN");
  return email;
}

function parseRow(row: RecordRow) {
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
      const result = collection === "sections"
        ? await env.DB.prepare("SELECT * FROM app_records WHERE collection = ? AND version_id = ? ORDER BY rowid").bind(collection, versionId).all<RecordRow>()
        : await env.DB.prepare("SELECT * FROM app_records WHERE collection = ? ORDER BY rowid").bind(collection).all<RecordRow>();
      return jsonResponse({ records: (result.results || []).map(parseRow) });
    } catch {
      return jsonResponse({ error: "De gegevens konden niet uit Cloudflare D1 worden gelezen." }, 500);
    }
  }

  if (request.method === "PUT") {
    try {
      await requireAdmin(request);
    } catch (error) {
      return jsonResponse({ error: error instanceof Error && error.message === "FORBIDDEN" ? "Geen schrijfrechten." : "Geldige Cloudflare Access-aanmelding vereist." }, error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401);
    }

    if (!COLLECTIONS.has(collection)) return jsonResponse({ error: "Ongeldige gegevenscollectie." }, 400);
    let body: any;
    try { body = await request.json(); } catch { return jsonResponse({ error: "Ongeldige JSON-inhoud." }, 400); }

    if (body?.deleteVersionId && collection === "versions") {
      const id = String(body.deleteVersionId);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM app_records WHERE collection = 'sections' AND version_id = ?").bind(id),
        env.DB.prepare("DELETE FROM app_records WHERE collection = 'versions' AND record_id = ?").bind(id),
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
        statements.push(collection === "sections"
          ? env.DB.prepare("DELETE FROM app_records WHERE collection = ? AND version_id = ?").bind(collection, keyVersion)
          : env.DB.prepare("DELETE FROM app_records WHERE collection = ?").bind(collection));
      }
      for (const record of records) {
        if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id.trim()) continue;
        statements.push(env.DB.prepare(
          "INSERT INTO app_records (collection, record_id, version_id, data_json, updated_at) VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(collection, record_id, version_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at"
        ).bind(collection, record.id, keyVersion, JSON.stringify(record)));
      }
      if (statements.length) await env.DB.batch(statements);
      return jsonResponse({ success: true, saved: records.length });
    } catch {
      return jsonResponse({ error: "Opslaan in Cloudflare D1 is mislukt." }, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};
