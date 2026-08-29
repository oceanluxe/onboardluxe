# Agent Learnings

## Database and migrations

- The Neon database can contain both `drizzle.__drizzle_migrations` and a separate `public.applied_migrations`; never treat the latter as the repository's Drizzle journal or clear either journal without review.
- `npm run db:migrate` calls `server/migrate.ts`, which can report success solely because Drizzle journal rows already exist; always verify the required `hr_*` tables afterward.
- This repository's migration SQL is unqualified and resolves to the connection's `search_path`; the investigated target used `public`, and no HR tables existed in any non-system schema.
- The server does not automatically load `.env` in the observed startup path; detached Windows launches need environment variables explicitly propagated or dotenv loading added before relying on local `.env` values.
- On Windows, the package scripts' inline `NODE_ENV=...` syntax fails under `npm.cmd`; launch the equivalent `node.exe node_modules/tsx/dist/cli.mjs server/index.ts` process when needed.

## Preview and tooling

- The preview server must be detached with PowerShell using separate stdout/stderr files; Vite or the server may select a different free port when the default is occupied.
- `npx neon@latest skills -s neon -s neon-postgres -y` requires an explicit supported agent in this workspace; `--agent codex` installs successfully.
