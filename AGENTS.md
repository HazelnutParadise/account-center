## JavaScript tooling

- Use Bun 1.4.4 for dependency management, development, builds, tests, and JavaScript execution.
- Run project commands through `bun run`. Do not use Node.js, npm, npx, Yarn, pnpm, or another JavaScript runtime or package manager.
- Keep `bun.lock` as the only dependency lockfile. Update the Docker image tags and package metadata together when changing the Bun version.
- Verify changes with `bun run test`, `bun run lint`, `bun run typecheck`, and `bun run build`.

## Follow-ups

- [Low] `app/layout.tsx:22` defines viewport settings inside `metadata`, which Next.js warns about at runtime. Move them to the supported `viewport` export in a separate change.

- [Low] `package.json:12` uses `next start` with `output: standalone`, which Next.js warns about. Review the local production startup command separately; Docker already runs the standalone server with Bun.
