/**
 * Deploys `firestore.rules` to the project named in `.env`, so the project id
 * never has to be committed in a `.firebaserc`.
 *
 * Usage: pnpm rules:deploy
 */
import { spawnSync } from "node:child_process";

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error("Missing VITE_FIREBASE_PROJECT_ID. Load it from .env.");
  process.exit(1);
}

const { status } = spawnSync(
  "firebase",
  ["deploy", "--only", "firestore:rules", "--project", projectId],
  { stdio: "inherit", shell: true },
);
process.exit(status ?? 1);
