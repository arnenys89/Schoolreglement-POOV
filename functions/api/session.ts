const TEAM_DOMAIN = "sapoov.cloudflareaccess.com";
const APPLICATION_AUD = "9115b101d19007cbb6ece0b0de54a653c03f4b3d084226993a8c480a54caad09";
const ISSUER = `https://${TEAM_DOMAIN}`;

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
      "pragma": "no-cache",
      "x-content-type-options": "nosniff",
      "vary": "Cookie, Cf-Access-Jwt-Assertion",
    },
  });
}

async function verifyAccessJwt(token: string): Promise<Record<string, any>> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed Access JWT");

  const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
  if (header.alg !== "RS256" || typeof header.kid !== "string") {
    throw new Error("Unsupported Access JWT signing method");
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== ISSUER || !Array.isArray(claims.aud) && typeof claims.aud !== "string") {
    throw new Error("Invalid Access JWT issuer or audience");
  }
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(APPLICATION_AUD) || typeof claims.exp !== "number" || claims.exp <= now) {
    throw new Error("Access JWT audience or expiry check failed");
  }
  if (typeof claims.iat !== "number" || claims.iat > now + 60 || now - claims.iat > 86400) {
    throw new Error("Access JWT issued-at check failed");
  }
  if (typeof claims.sub !== "string" || typeof claims.email !== "string" || !claims.email.includes("@")) {
    throw new Error("Access JWT has no usable identity");
  }

  const certResponse = await fetch(`${ISSUER}/cdn-cgi/access/certs`, {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  } as RequestInit);
  if (!certResponse.ok) throw new Error("Unable to retrieve Access signing certificates");
  const certs = await certResponse.json() as { keys?: JsonWebKey[] };
  const jwk = certs.keys?.find((key: any) => key.kid === header.kid);
  if (!jwk) throw new Error("Access signing key not found");

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!verified) throw new Error("Invalid Access JWT signature");
  return claims;
}

export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  if (request.method !== "GET") {
    return jsonResponse({ authenticated: false, error: "Method not allowed" }, 405);
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return jsonResponse({ authenticated: false, error: "Cloudflare Access identity ontbreekt" }, 401);
  }

  try {
    const claims = await verifyAccessJwt(token);
    const email = claims.email.trim().toLowerCase();
    const role = email === "arne.nys@ptiz.be" ? "super" : "none";
    return jsonResponse({
      authenticated: true,
      email,
      role,
      issuer: "cloudflare-access",
      expiresAt: claims.exp,
    });
  } catch {
    return jsonResponse({ authenticated: false, error: "Ongeldige of verlopen Cloudflare Access-sessie" }, 401);
  }
};
