## JavaScript tooling

- Use Bun 1.4.4 for dependency management, development, builds, tests, and JavaScript execution.
- Run project commands through `bun run`. Do not use Node.js, npm, npx, Yarn, pnpm, or another JavaScript runtime or package manager.
- Prefer built-in features in the pinned stable Bun release over additional tooling packages. Verify that the built-in feature covers the requirement before removing a dependency, and retain packages that the framework directly requires.
- Use `bun check` for standalone type checks and `bun fmt` for formatting.
- Keep `bun.lock` as the only dependency lockfile. Update the Docker image tags and package metadata together when changing the Bun version.
- Verify changes with `bun run test`, `bun run lint`, `bun run typecheck`, and `bun run build`.
- After framework or authentication dependency changes, build first and run `bun run test:runtime` against its local simulated provider.

## Deployment

- List container variables explicitly under Compose `environment`. Use `${VAR:?message}` for required values and `${VAR:-}` for optional values. Do not use `env_file`.
- After changing Compose configuration, run `bun run test:compose`.

## Follow-ups

- [Low] `app/layout.tsx:22` defines viewport settings inside `metadata`, which Next.js warns about at runtime. Move them to the supported `viewport` export in a separate change.

- [Low] `package.json:12` uses `next start` with `output: standalone`, which Next.js warns about. Review the local production startup command separately; Docker already runs the standalone server with Bun.
