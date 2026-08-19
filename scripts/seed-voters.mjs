/**
 * Registers the voters listed in `scripts/voters.json` in the `emails`
 * collection. Emails are normalized the same way the ballot normalizes them,
 * and addresses already present are skipped, so the script is idempotent.
 *
 * Usage: pnpm seed:voters [-- --dry-run]
 */
import { readFile } from "node:fs/promises";
import { initializeApp } from "firebase/app";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";

const EMAILS = "emails";
const ROSTER = new URL("./voters.json", import.meta.url);
const isDryRun = process.argv.includes("--dry-run");

const normalizeEmail = (value) => value.trim().toLowerCase();

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}. Load it from .env.`);
  return value;
};

const db = getFirestore(
  initializeApp({
    apiKey: requireEnv("VITE_FIREBASE_API_KEY"),
    authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requireEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireEnv("VITE_FIREBASE_APP_ID"),
  }),
);

const roster = JSON.parse(await readFile(ROSTER, "utf8"));
const snapshot = await getDocs(collection(db, EMAILS));
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

  await addDoc(collection(db, EMAILS), { email: address, voted: false });
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
