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

| Script              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the dev server                         |
| `pnpm build`        | Typecheck and build for prod                 |
| `pnpm lint`         | Run ESLint                                   |
| `pnpm preview`      | Preview the production build                 |
| `pnpm seed:voters`  | Register the roster in `scripts/voters.json` |
| `pnpm rules:deploy` | Deploy `firestore.rules`                     |

## Environment

All variables live in `.env` (see `.env.example`):

- `VITE_FIREBASE_*` — Firebase project credentials.
- `VITE_ANALYTICS_PASSWORD` — entering this value in the email field opens the
  results panel instead of submitting a ballot. Note this ships in the client
  bundle, so it gates the panel by obscurity only — it is not a secret.
- `GOOGLE_APPLICATION_CREDENTIALS` — optional, used only by `pnpm seed:voters`:
  the path to a service-account key JSON file. Leave it unset to fall back to
  application-default credentials. See “Adding voters” below.

## Firestore data model

- **`emails`** — one document per registered voter: `{ email: string, voted: boolean }`.
  A ballot is only accepted for an email that exists here with `voted: false`.
  Emails are stored trimmed and lowercased, matching `normalizeEmail`.
- **`votes`** — one document per selection: `{ vote: string }`. A voter choosing
  three candidates writes three documents. The flag and the votes are committed
  in a single batch, so a voter is never marked as having voted without their
  ballot being counted.

## Project structure

```
firestore.rules     Deployed Firestore security rules
scripts/
  voters.json          Voter emails — gitignored
  voters.example.json  Template for a new checkout
  seed-voters.mjs   Idempotent seeder for the `emails` collection (Admin SDK)
  deploy-rules.mjs  Deploys firestore.rules to the project in .env
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

## Security rules

`firestore.rules` is the deployed ruleset; `pnpm rules:deploy` pushes it using
the project id from `.env`.

The election has no user authentication, so the rules constrain **what** a write
may change, never **who** may change it:

- `emails` is readable (the ballot looks up an address, the results panel counts
  turnout) but a client may only flip one voter's `voted` flag from `false` to
  `true`. The address itself cannot be edited, and creates and deletes are
  denied outright.
- `votes` accepts a create carrying exactly one `vote` string of 1–60
  characters — the cap `MAX_WRITE_IN_LENGTH` mirrors. Recorded ballots can never
  be updated or deleted.
- Every other path is denied.

Two limits are worth stating plainly. Anyone can read the roster, and anyone who
knows a registered address can vote on that person's behalf — only real
authentication would close that, and rules cannot. Enabling **App Check** in the
Firebase console raises the bar by rejecting traffic that does not come from the
deployed app.

Because roster writes are denied to the browser, `pnpm seed:voters` runs on the
Admin SDK, which bypasses rules entirely. No admin carve-out exists in the
ruleset — one would be usable by anyone.

## Voter roster

`scripts/voters.json` is the source of truth for who may vote: a flat JSON
array of email addresses.

It holds real addresses, so it is **gitignored and must never be committed**.
Copy `scripts/voters.example.json` to `scripts/voters.json` on a new machine and
fill it in from whatever is already in Firestore.

```bash
pnpm seed:voters -- --dry-run   # report what would change
pnpm seed:voters                # write the missing voters
```

The seeder normalizes each address and skips any that already exist, so it is
safe to re-run after adding rows to the roster.

### Adding voters

The rules deny roster creation to the browser, so a roster change needs
credentials that bypass rules. In rough order of effort:

1. **Firebase console** — Firestore → `emails` → Add document, with `email`
   (string, lowercased) and `voted` (boolean, `false`). The console bypasses
   rules for project owners, so this needs no setup at all. Best for one or two
   additions; add the address to `scripts/voters.json` too, to keep it accurate.
2. **`gcloud auth application-default login`** — a one-time browser sign-in that
   makes `pnpm seed:voters` work with no key file to manage.
3. **A service-account key** — Firebase console → Project settings → Service
   accounts → Generate new private key, then point
   `GOOGLE_APPLICATION_CREDENTIALS` at it. Keep it out of the repo.

`firebase login` does **not** enable options 2 or 3: the CLI keeps its own
credential store, which the Admin SDK never reads. It only authenticates
`pnpm rules:deploy`.

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
