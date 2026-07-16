# Repository Guidelines

## Project Structure & Module Organization

Core editor code lives in `src/js/`. Shared DOM and utility logic is under `src/js/core/`, editing behavior under `src/js/editing/`, UI features under `src/js/module/`, and translations under `src/js/i18n/`. Sass sources are in `src/styles/`; public type declarations are in `types/`. React and Vue wrappers live in `packages/react/` and `packages/vue/`. Tests mirror these concerns under `test/core/`, `test/editing/`, `test/module/`, `test/integration/`, and `test/plugin/`. Use `demo/` and `examples/` for manual demonstrations. Treat `dist/`, `_site/`, and `coverage/` as generated output.

## Build, Test, and Development Commands

Development requires Node 20.19 or newer and pnpm 11.1.3; CI uses Node 22. The published runtime remains compatible with Node 18 or newer.

- `pnpm install` installs workspace dependencies.
- `pnpm dev` starts the Vite development server.
- `pnpm build` creates ESM and UMD library bundles.
- `pnpm build:demo` builds the documentation/demo site.
- `pnpm test` runs the Vitest suite once; `pnpm test:watch` runs it interactively.
- `pnpm test:coverage` runs tests and enforces coverage thresholds.
- `pnpm lint` checks `src/` with ESLint; `pnpm typecheck` validates JavaScript/JSDoc against the declarations.

## Coding Style & Naming Conventions

Write ES2022 modules in vanilla JavaScript; do not add runtime dependencies without discussion. Follow the existing two-space indentation, semicolons, and single-quoted imports. Use `PascalCase` for classes and module files such as `ImageDialog.js`, `camelCase` for functions and variables, and leading underscores for intentionally private or ignored values. Keep type definitions in `types/` synchronized with public API changes. Run lint and type checking before submission.

## Testing Guidelines

Vitest runs `test/**/*.test.js` in jsdom. Name tests after the unit or feature, for example `History.test.js`, and place them in the matching test area. Add integration tests for behavior spanning editor modules. Coverage excludes translations and must remain at least 87% lines, 83% statements, 80% functions, and 70% branches.

## Commit & Pull Request Guidelines

Use focused branches such as `feat/markdown-paste`, `fix/toolbar-focus`, or `docs/api-table`. Follow the history's Conventional Commit style: `fix: ...`, `feat: ...`, or scoped forms such as `chore(release): ...`. Open PRs against `main`, summarize the change, select its type, link relevant issues, and include screenshots for visible UI changes. Before requesting review, run tests, lint, type checking, and both relevant builds; update README or CHANGELOG when behavior changes.
