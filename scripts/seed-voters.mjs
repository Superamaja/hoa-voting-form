/**
 * Registers the voters listed in `scripts/voters.json` in the `emails`
 * collection. Emails are normalized the same way the ballot normalizes them,
 * and addresses already present are skipped, so the script is idempotent.
 *
 * `firestore.rules` denies roster creation to the browser, so this runs on the
 * Admin SDK, which bypasses rules. Point GOOGLE_APPLICATION_CREDENTIALS at a
 * service-account key (see the README).
 *
 * Usage: pnpm seed:voters [--dry-run]
 */
import { readFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const EMAILS = "emails";
const ROSTER = new URL("./voters.json", import.meta.url);
const isDryRun = process.argv.includes("--dry-run");

const normalizeEmail = (value) => value.trim().toLowerCase();

const requireEnv = (key, hint) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}. ${hint}`);
  return value;
};

const keyPath = requireEnv(
  "GOOGLE_APPLICATION_CREDENTIALS",
  "Set it to the path of a service-account key JSON file.",
);
const db = getFirestore(
  initializeApp({
    credential: cert(JSON.parse(await readFile(keyPath, "utf8"))),
    projectId: requireEnv("VITE_FIREBASE_PROJECT_ID", "Load it from .env."),
  }),
);

const roster = JSON.parse(await readFile(ROSTER, "utf8"));
const snapshot = await db.collection(EMAILS).get();
const registered = new Set(
  snapshot.docs.map((doc) => normalizeEmail(String(doc.data().email ?? ""))),
);

let added = 0;
for (const { unit, name, email } of roster) {
  const address = normalizeEmail(email);
  const label = `#${unit} ${name} <${address}>`;

  if (registered.has(address)) {
    console.log(`skip  ${label} — already registered`);
    continue;
  }
  if (isDryRun) {
    console.log(`would add  ${label}`);
    registered.add(address);
    continue;
  }

  await db.collection(EMAILS).add({ email: address, voted: false });
  registered.add(address);
  added += 1;
  console.log(`added ${label}`);
}

console.log(
  isDryRun
    ? "Dry run complete — no documents written."
    : `Done. ${added} voter(s) added, ${roster.length - added} skipped.`,
);
process.exit(0);
