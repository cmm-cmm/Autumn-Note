# Publishing autumnnote-plus

This repository publishes three npm packages, always with the same version:

| Package | Directory |
|---|---|
| `autumnnote-plus` | repository root |
| `autumnnote-plus-react` | `packages/react` |
| `autumnnote-plus-vue` | `packages/vue` |

They are an unofficial fork of Autumn Note (`autumnnote`). Keep the fork notice in the READMEs and package descriptions, and keep `LICENSE` (with Minh Pham's copyright line) in every package: the MIT license requires it.

## How releases normally happen

Changes reach `main` only through `dev` → `staging` → `main` (see "Branches" in [CONTRIBUTING.md](../CONTRIBUTING.md#branches)), so a release is checked on the staging Preview before it goes out.

1. A commit to `main` changes the version in `package.json`.
2. **Auto Release** (`.github/workflows/auto-release.yml`) tags `v<version>`, creates the GitHub Release and starts **Publish to npm**.
3. **Publish to npm** (`.github/workflows/publish.yml`) runs the browser tests on Chromium, Firefox and WebKit, checks that all three `package.json` versions match the tag, runs `pnpm check` and `pnpm audit`, and publishes each package whose version is not on npm yet, through npm trusted publishing (no token; every version gets a provenance attestation).

So **pushing a version bump to `main` is a release.** Do it only when the version is ready to go out.

Trusted publishing only works once each package exists on npm and has the workflow attached as a trusted publisher. The first release is therefore done by hand.

## First release (4.0.0)

### Before you start

- An npm account with two-factor authentication. The names `autumnnote-plus`, `autumnnote-plus-react` and `autumnnote-plus-vue` were free when this guide was written; check again with `npm view <name>` (a 404 means free).
- Node.js 22.22.2+ (or 24.15+) and pnpm 11 (`corepack enable`), as required by `package.json`.
- Turn on **private vulnerability reporting** for the GitHub repository (Settings → Code security → Private vulnerability reporting), because `SECURITY.md` points reporters there.
- Make sure the commit you release is the one on `main`, and that the three `package.json` files say `4.0.0`.

### Build and check

```bash
pnpm install --frozen-lockfile
pnpm check            # lint, typecheck, tests, build, bundle sizes, package contents
BROWSER=chromium pnpm test:browser
pnpm build:wrappers
npm pack --dry-run                    # inspect what the core package will contain
npm pack ./packages/react --dry-run
npm pack ./packages/vue --dry-run
```

Each tarball must list `LICENSE`, `README.md`, `package.json` and its `dist/` files.

### Publish

```bash
npm login
pnpm publish --access public --no-git-checks
pnpm --filter autumnnote-plus-react publish --access public --no-git-checks
pnpm --filter autumnnote-plus-vue publish --access public --no-git-checks
```

Use `pnpm publish`, not `npm publish`, for the wrappers: pnpm rewrites their `workspace:*` dependency on the core package to the real version.

Publish the core package first, because the wrappers depend on it.

### Attach the trusted publisher

For each of the three packages on npmjs.com: **Settings → Trusted publishing → GitHub Actions**, with:

- Organization or user: `habibiahmada`
- Repository: `autumnnote-plus`
- Workflow filename: `publish.yml`
- Environment: leave empty

From then on, releases go through CI as described above. Optionally, once all three are attached, set **Publishing access** to require trusted publishing (disallow tokens).

### Tag the first release

The manual publish does not create a tag or a GitHub Release. Create them so the history matches npm:

```bash
git tag -a v4.0.0 -m v4.0.0
git push origin v4.0.0
gh release create v4.0.0 --title v4.0.0 --notes-file <(sed -n '/^## \[4.0.0\]/,/^## \[3.1.0\]/p' CHANGELOG.md | sed '$d')
```

Publish to npm will then start from the release event and skip every package that is already on npm at this version.

## Later releases

1. Update `CHANGELOG.md`: move the entries under `## [Unreleased]` into a new `## [x.y.z] - YYYY-MM-DD` section.
2. Set the same version in `package.json`, `packages/react/package.json` and `packages/vue/package.json`. If the core's major version changes, update the wrappers' `peerDependencies` range for `autumnnote-plus` too.
3. Commit on `dev`, open a pull request from `dev` to `staging`, and merge it once CI is green.
4. Check the staging Preview at <https://staging-autumnnote-plus.habibiahmadaziz.workers.dev> once the Cloudflare check on the merge commit is green.
5. Open a pull request from `staging` to `main` and merge it once CI is green. That merge is the release: Auto Release and Publish to npm do the rest; watch both runs in the Actions tab.

`staging` and `main` are protected: a direct push is refused, and the branch-policy check rejects a pull request into `main` from anywhere but `staging`.

Follow semantic versioning: a change that breaks existing pages or imports is a new major version.

## The site's domain

The demo site is the Cloudflare Worker `autumnnote-plus`, and it should answer on one hostname only: the custom domain `autumnnote.habibiahmada.dev` (in `wrangler.toml`). The zone `habibiahmada.dev` also holds a separate personal site at `habibiahmada.dev` and `www.habibiahmada.dev`, hosted on Vercel.

**Never add a Worker route for that zone.** A route such as `*.habibiahmada.dev/*` also matches `www`, so it replaced the personal site with this one until the route was deleted. Custom domains don't need routes. `wrangler deploy` neither creates nor removes routes it didn't define, so a route added in the dashboard stays until someone deletes it.

To check, look at **Workers & Pages → autumnnote-plus → Settings → Domains & Routes**: it should list `autumnnote.habibiahmada.dev` and no routes. From a shell:

```bash
curl -sI https://www.habibiahmada.dev | grep -i x-vercel                  # personal site: answers from Vercel
curl -s https://autumnnote.habibiahmada.dev | grep -o '<title>[^<]*'      # this site
```

## Using a build without publishing

To try a commit in another project before releasing it:

```bash
pnpm build
npm pack          # writes autumnnote-plus-<version>.tgz
```

Then, in the other project, `npm install /path/to/autumnnote-plus-<version>.tgz`.
