/**
 * Registers the emails listed in `scripts/voters.json` in the `emails`
 * collection. Addresses are normalized the same way the ballot normalizes them,
 * and ones already present are skipped, so the script is idempotent.
 *
 * `firestore.rules` denies roster creation to the browser, so this runs on the
 * Admin SDK, which bypasses rules. It needs Google credentials, from either
 * `gcloud auth application-default login` or a service-account key path in
 * GOOGLE_APPLICATION_CREDENTIALS. Note that `firebase login` does NOT count:
 * the CLI keeps its own credential store that the Admin SDK never reads. To add
 * a voter or two without either, use the Firebase console, which also bypasses
 * rules.
 *
 * Usage: pnpm seed:voters [--dry-run]
 */
import { readFile } from "node:fs/promises";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const EMAILS = "emails";
const ROSTER = new URL("./voters.json", import.meta.url);
const isDryRun = process.argv.includes("--dry-run");

const normalizeEmail = (value) => value.trim().toLowerCase();

const fail = (...lines) => {
  for (const line of lines) console.error(line);
  process.exit(1);
};

/**
 * Prefers an explicit service-account key, falling back to application-default
 * credentials so `gcloud auth application-default login` is enough. Resolves a
 * token eagerly: the Firestore client reports missing credentials as an
 * uncaught exception rather than a rejected request.
 */
const resolveCredential = async () => {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credential = keyPath
    ? cert(JSON.parse(await readFile(keyPath, "utf8")))
    : applicationDefault();

  try {
    await credential.getAccessToken();
  } catch (error) {
    fail(
      `Could not authenticate with Google: ${error.message}`,
      "",
      "The Admin SDK needs credentials of its own. Either run",
      "  gcloud auth application-default login",
      "or set GOOGLE_APPLICATION_CREDENTIALS to a service-account key path.",
      "`firebase login` does not count - that authenticates only the CLI.",
      "To add one or two voters instead, use the Firebase console.",
    );
  }
  return credential;
};

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (!projectId) fail("Missing VITE_FIREBASE_PROJECT_ID. Load it from .env.");

const db = getFirestore(
  initializeApp({ credential: await resolveCredential(), projectId }),
);

const roster = JSON.parse(await readFile(ROSTER, "utf8"));
const snapshot = await db.collection(EMAILS).get();
const registered = new Set(
  snapshot.docs.map((doc) => normalizeEmail(String(doc.data().email ?? ""))),
);

let added = 0;
for (const email of roster) {
  const address = normalizeEmail(email);

  if (registered.has(address)) {
    console.log(`skip  ${address} - already registered`);
    continue;
  }
  if (isDryRun) {
    console.log(`would add  ${address}`);
    registered.add(address);
    continue;
  }

  await db.collection(EMAILS).add({ email: address, voted: false });
  registered.add(address);
  added += 1;
  console.log(`added ${address}`);
}

console.log(
  isDryRun
    ? "Dry run complete - no documents written."
    : `Done. ${added} voter(s) added, ${roster.length - added} skipped.`,
);
process.exit(0);
