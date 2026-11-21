const TEAM_DOMAIN = "sapoov.cloudflareaccess.com";
const APPLICATION_AUD = "9115b101d19007cbb6ece0b0de54a653c03f4b3d084226993a8c480a54caad09";
const ISSUER = `https://${TEAM_DOMAIN}`;

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function verifyAccessRequest(request: Request): Promise<Record<string, any>> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) throw new Error("Cloudflare Access JWT ontbreekt");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed Access JWT");

  const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Unsupported signing method");

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== ISSUER || !audiences.includes(APPLICATION_AUD)) throw new Error("Invalid issuer or audience");
  if (typeof claims.exp !== "number" || claims.exp <= now) throw new Error("Expired Access JWT");
  if (typeof claims.iat !== "number" || claims.iat > now + 60 || now - claims.iat > 86400) throw new Error("Invalid issued-at time");
  if (typeof claims.sub !== "string" || typeof claims.email !== "string" || !claims.email.includes("@")) throw new Error("Identity claims missing");

  const certResponse = await fetch(`${ISSUER}/cdn-cgi/access/certs`, { headers: { accept: "application/json" } });
  if (!certResponse.ok) throw new Error("Unable to retrieve Access signing certificates");
  const certs = await certResponse.json() as { keys?: any[] };
  const jwk = certs.keys?.find((key: any) => key.kid === header.kid);
  if (!jwk) throw new Error("Access signing key not found");

  const publicKey = await crypto.subtle.importKey("jwk", jwk, {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
  }, false, ["verify"]);
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!verified) throw new Error("Invalid Access JWT signature");
  return claims;
}

export function jsonResponse(body: Record<string, unknown>, status = 200): Response {
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
