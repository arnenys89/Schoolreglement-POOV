import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const projectId = "gen-lang-client-0743659608";
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!raw) {
  console.warn("FIREBASE_SERVICE_ACCOUNT_JSON ontbreekt: Firestore-regels zijn voorbereid maar worden in deze build niet gepubliceerd.");
  process.exit(0);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON bevat geen geldige JSON.");
}

if (serviceAccount.project_id !== projectId || !serviceAccount.client_email || !serviceAccount.private_key) {
  throw new Error("De Firebase-serviceaccount hoort niet bij het geconfigureerde project of mist verplichte velden.");
}

const directory = mkdtempSync(join(tmpdir(), "firebase-rules-"));
const credentialPath = join(directory, "service-account.json");

try {
  writeFileSync(credentialPath, raw, { mode: 0o600 });
  const result = spawnSync("npx", [
    "--yes",
    "firebase-tools@latest",
    "deploy",
    "--only",
    "firestore:rules",
    "--project",
    projectId,
    "--non-interactive",
  ], {
    stdio: "inherit",
    env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: credentialPath },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Firebase rules deployment failed with exit code ${result.status}`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
