# Illini Grove Board Election

A single-page voting form for the Illini Grove HOA annual board election. Voters
authenticate with an email from the homeowner roster, pick up to three
candidates (listed or write-in), and their ballot is recorded in Firestore.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, and Firebase.

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in your Firebase credentials
pnpm dev
```

| Script             | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Start the dev server                         |
| `pnpm build`       | Typecheck and build for prod                 |
| `pnpm lint`        | Run ESLint                                   |
| `pnpm preview`     | Preview the production build                 |
| `pnpm seed:voters` | Register the roster in `scripts/voters.json` |

## Environment

All variables live in `.env` (see `.env.example`):

- `VITE_FIREBASE_*` — Firebase project credentials.
- `VITE_ANALYTICS_PASSWORD` — entering this value in the email field opens the
  results panel instead of submitting a ballot.

## Firestore data model

- **`emails`** — one document per registered voter: `{ email: string, voted: boolean }`.
  A ballot is only accepted for an email that exists here with `voted: false`.
  Emails are stored trimmed and lowercased, matching `normalizeEmail`.
- **`votes`** — one document per selection: `{ vote: string }`. A voter choosing
  three candidates writes three documents.

## Project structure

```
scripts/
  voters.json       Homeowner roster (unit, name, email)
  seed-voters.mjs   Idempotent seeder for the `emails` collection
src/
  components/       Feature components (ballot, results, background)
    ui/             Presentational primitives (Button, Alert, TextField, Icons)
  hooks/            useBallot (ballot state + validation), useResults (tallies)
  lib/              constants, formatting helpers, Firestore service layer
  firebase.ts       Firebase app + Firestore initialization
  globals.css       Tailwind v4 `@theme` tokens plus the `surface` / `focus-ring` utilities
```

Components stay presentational: all Firestore access is isolated in
`lib/votingService.ts`, and all ballot rules live in `hooks/useBallot.ts`.

## Voter roster

`scripts/voters.json` is the source of truth for who may vote: one entry per
unit with `unit`, `name`, and `email`. Only the email reaches Firestore — the
unit and name are there so the roster stays readable.

```bash
pnpm seed:voters -- --dry-run   # report what would change
pnpm seed:voters                # write the missing voters
```

The seeder normalizes each address and skips any that already exist, so it is
safe to re-run after adding rows to the roster.

## Ballot rules

- The email must exist in `emails` and must not have voted already.
- Between 1 and 3 selections are required; the UI disables further options once
  three are picked, and submission re-validates the limit.
- A write-in slot is selected by clicking anywhere on its row or by typing in
  it; the checkbox clears it. A selected slot must contain a name, and write-ins
  are title-cased.

## Dependencies

Tailwind v4 is configured CSS-first: design tokens live in the `@theme` block in
`src/globals.css`, not in a `tailwind.config.js`. ESLint uses flat config in
`eslint.config.js`.

`pnpm-workspace.yaml` pins a few transitive packages (`protobufjs`,
`@grpc/grpc-js`, `websocket-driver`, `flatted`, `yaml`) to patched releases via
`overrides`, since firebase, eslint, and vite still resolve older ranges. These
are Node-only code paths that never reach the browser bundle. Drop an override
once its parent ships the fix.

TypeScript is held on the 6.x line: `typescript-eslint` does not support
TypeScript 7.0, so upgrading the compiler would mean losing TypeScript linting.
Revisit once typescript-eslint ships TS 7 support.
