import { jsonResponse } from "../_utils/access";

export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  if (request.method !== "GET") return jsonResponse({ authenticated: false, error: "Method not allowed" }, 405);
  try {
    const token = request.headers.get("Cf-Access-Jwt-Assertion") || "";
    if (!token) return jsonResponse({ authenticated: false, error: "Cloudflare Access-aanmelding vereist." }, 401);
    const response = await fetch("https://sapoov-identity-api.arne-nys.workers.dev/api/access/schoolreglementen", {
      headers: { "Cf-Access-Jwt-Assertion": token }
    });
    const access: any = await response.json().catch(() => ({}));
    if (!response.ok || !access.authorized) return jsonResponse({ authenticated: false, error: access.error || "Geen centrale toegang." }, 403);
    const email = String(access.user?.email || "").trim().toLowerCase();
    const permissions: string[] = [...new Set((access.roles || []).flatMap((role: any) => role.permissions || []))];
    const role = permissions.includes("*") || permissions.includes("regulations.manage") ? "super" : "none";
    return jsonResponse({ authenticated: true, email, role, issuer: "sapoov-central-identity" });
  } catch {
    return jsonResponse({ authenticated: false, error: "De centrale SAPOOV-rechtenservice is tijdelijk niet bereikbaar." }, 503);
  }
};
