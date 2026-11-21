import { jsonResponse, verifyAccessRequest } from "../_utils/access";

export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  if (request.method !== "GET") return jsonResponse({ authenticated: false, error: "Method not allowed" }, 405);
  try {
    const claims = await verifyAccessRequest(request);
    const email = claims.email.trim().toLowerCase();
    return jsonResponse({
      authenticated: true,
      email,
      role: email === "arne.nys@ptiz.be" ? "super" : "none",
      issuer: "cloudflare-access",
      expiresAt: claims.exp,
    });
  } catch {
    return jsonResponse({ authenticated: false, error: "Ongeldige of verlopen Cloudflare Access-sessie" }, 401);
  }
};
