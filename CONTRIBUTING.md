# Contributing to Autumn Note

Thank you for your interest in contributing! 🎉  
Every contribution — bug reports, feature suggestions, code, or documentation — is welcome.

---

## Getting started

The repo is a pnpm workspace (core, React and Vue wrappers). It needs
Node 22 LTS (22.22.2+) or Node 24.15+, and pnpm 11.1.3 — the version pinned in
`packageManager`. Use pnpm rather than npm: `npm install` ignores the workspace
and the pnpm overrides, and writes a `package-lock.json` the repo does not use.

```bash
git clone https://github.com/cmm-cmm/Autumn-Note.git
cd Autumn-Note
pnpm install
pnpm dev           # start dev server
pnpm test          # run tests
pnpm build         # build library
```

---

## Workflow

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b fix/my-bug-fix
   # or
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes** — keep them focused and minimal.

3. **Run the checks** before committing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
   `pnpm check` runs everything the release runs (coverage, wrapper tests,
   bundle and package checks, demo build).

4. **Commit** with a clear message:
   ```
   fix: correct toolbar button focus state
   feat: add markdown paste support
   docs: update API table
   ```

5. **Open a Pull Request** against `main` and fill in the PR template.

---

## Branch naming

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Build, CI, config changes |
| `refactor/` | Code restructuring without behavior change |

---

## Code style

- Vanilla ES2022+ — no TypeScript in source, but type definitions in `types/`
- No external runtime dependencies
- Keep existing formatting — run `pnpm lint` before submitting

---

## Reporting bugs

Use the [Bug Report template](https://github.com/cmm-cmm/Autumn-Note/issues/new?template=bug_report.md) and include:
- Autumn Note version
- Browser & OS
- Minimal reproduction steps

## Requesting features

Use the [Feature Request template](https://github.com/cmm-cmm/Autumn-Note/issues/new?template=feature_request.md).

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
