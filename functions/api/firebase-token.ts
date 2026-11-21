import { jsonResponse, verifyAccessRequest } from "../_utils/access";

const FIREBASE_PROJECT_ID = "gen-lang-client-0743659608";
const FIREBASE_TOKEN_AUDIENCE = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function encodeJson(value: unknown): string {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToDer(pem: string): Uint8Array {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s/g, "");
  const binary = atob(body);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function createFirebaseCustomToken(serviceAccount: any, uid: string, customClaims: Record<string, unknown>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "RS256", typ: "JWT" });
  const payload = encodeJson({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: FIREBASE_TOKEN_AUDIENCE,
    iat: now,
    exp: now + 3600,
    uid,
    claims: customClaims,
  });
  const signingInput = `${header}.${payload}`;
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`;
}

export const onRequest = async ({ request, env }: { request: Request; env: Record<string, string | undefined> }): Promise<Response> => {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const identity = await verifyAccessRequest(request);
    const email = identity.email.trim().toLowerCase();
    const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return jsonResponse({ error: "Firebase service-account secret is nog niet geconfigureerd" }, 503);
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    if (
      serviceAccount.project_id !== FIREBASE_PROJECT_ID ||
      typeof serviceAccount.client_email !== "string" ||
      typeof serviceAccount.private_key !== "string"
    ) {
      return jsonResponse({ error: "Firebase service-accountconfiguratie is ongeldig" }, 503);
    }

    const uidDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity.sub));
    const uid = `cloudflare-${base64Url(new Uint8Array(uidDigest)).slice(0, 40)}`;
    const adminRole = email === "arne.nys@ptiz.be" ? "super" : "none";
    const customToken = await createFirebaseCustomToken(serviceAccount, uid, {
      accessEmail: email,
      adminRole,
      accessIssuer: "cloudflare-access",
    });

    return jsonResponse({ customToken, expiresIn: 3600 });
  } catch {
    return jsonResponse({ error: "Firebase-aanmelding via Cloudflare Access is mislukt" }, 401);
  }
};
