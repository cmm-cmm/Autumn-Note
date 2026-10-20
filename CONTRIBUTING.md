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
git clone https://github.com/habibiahmada/autumnnote-plus.git
cd autumnnote-plus
pnpm install
pnpm dev           # start dev server
pnpm test          # run tests
pnpm build         # build library
```

---

## Branches

Work moves through three long-lived branches, always in this order:

```
feature branch / fork  ──PR──▶  dev  ──PR──▶  staging  ──PR──▶  main
```

| Branch | What it is | Who changes it |
|---|---|---|
| `dev` | Integration. Every change lands here first. | Pull requests from feature branches and forks. Maintainers may also push directly. |
| `staging` | The next release, being checked. Each push deploys a Cloudflare **Preview** of the site, separate from production. | Only a pull request from `dev`. |
| `main` | What is released. Each push deploys the production site, and a merge that changes the version in `package.json` publishes to npm. | Only a pull request from `staging`. |

The rules are enforced, not just agreed on:

- `staging` and `main` are protected. A direct push is refused, for maintainers too, and force pushes and deletion are blocked. A pull request merges only once the seven CI checks pass (unit tests on Node 24 and latest, the Ubuntu and Windows builds, and the browser tests on Chromium, Firefox and WebKit).
- The **branch-policy** check fails a pull request into `staging` that does not come from `dev`, and one into `main` that does not come from `staging`.
- `dev` is protected only against force pushes and deletion.

So: open your pull request against **`dev`**. A maintainer takes it on to `staging`, checks the Preview, and releases from `main`.

## Workflow

1. **Fork** the repository and create a branch from `dev`:
   ```bash
   git checkout dev
   git checkout -b fix/my-bug-fix
   # or
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes**: keep them focused and minimal. User-facing changes get a line under `## [Unreleased]` in `CHANGELOG.md`.

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

5. **Open a pull request against `dev`** and fill in the PR template.

### For maintainers: promoting and releasing

1. **dev → staging.** Open a pull request from `dev` to `staging` and merge it once CI is green. Then check the Preview at <https://staging-autumnnote-plus.habibiahmadaziz.workers.dev> once the Cloudflare check on the merge commit is green.
2. **staging → main.** When the Preview looks right, open a pull request from `staging` to `main` and merge it once CI is green. That deploys the production site.
3. **Releasing** is the same path with a version bump on `dev` first. The steps are in [docs/PUBLISHING.md](docs/PUBLISHING.md).

---

## Branch naming

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Build, CI, config changes |
| `refactor/` | Code restructuring without behavior change |

Branch from `dev` and target `dev`. The names `dev`, `staging` and `main` are reserved for the three long-lived branches.

---

## Code style

- Vanilla ES2022+ — no TypeScript in source, but type definitions in `types/`
- No external runtime dependencies
- Keep existing formatting — run `pnpm lint` before submitting

---

## Reporting bugs

Use the [Bug Report template](https://github.com/habibiahmada/autumnnote-plus/issues/new?template=bug_report.md) and include:
- Autumn Note version
- Browser & OS
- Minimal reproduction steps

## Requesting features

Use the [Feature Request template](https://github.com/habibiahmada/autumnnote-plus/issues/new?template=feature_request.md).

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
