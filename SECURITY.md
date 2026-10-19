# Security Policy

This policy covers **`autumnnote-plus`**, `autumnnote-plus-react` and `autumnnote-plus-vue`, an unofficial fork of [Autumn Note](https://github.com/cmm-cmm/Autumn-Note). For the original `autumnnote` packages, follow [Autumn Note's own policy](https://github.com/cmm-cmm/Autumn-Note/blob/main/SECURITY.md).

## Supported versions

Security fixes land on the latest minor release of the current major.

| Version | Supported |
|---|---|
| `autumnnote-plus` 4.x | ✅ |
| `autumnnote` ≤ 3.1.x (original project) | ❌ Affected by the issues fixed in `autumnnote-plus` 4.0.0 — see the [CHANGELOG](CHANGELOG.md#security). Switch to `autumnnote-plus`, or follow the original project for its own fix. |

---

## Reporting a vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

If you discover a security vulnerability in this fork, report it privately:

1. **[Security → Report a vulnerability](https://github.com/habibiahmada/autumnnote-plus/security/advisories/new)** on this repository, or
2. Contact the maintainer, [@habibiahmada](https://github.com/habibiahmada), through GitHub.

If the issue is also present in the original Autumn Note, it will be passed on to its maintainer privately.

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You will get a reply as soon as possible. Please allow reasonable time for a fix before any public disclosure.

---

## Security design

Autumn Note includes a built-in DOM-based HTML sanitiser applied to all user input:

- Strips `<script>`, `<object>`, `<embed>` and other active-content elements
- Removes all `on*` event handler attributes (e.g. `onclick`, `onerror`)
- Removes SVG animation elements (`<animate>`, `<set>`, `<animateTransform>`, `<animateMotion>`), which can rewrite an attribute *after* sanitisation finishes and so defeat an attribute-level filter
- Removes the MathML HTML-integration points (`<mglyph>`, `<malignmark>`, `<annotation-xml>`) that let a fragment re-parse into different markup than it serialised from (mXSS); sanitising is a fixed point
- Removes comments and the raw-text elements `<xmp>`, `<noembed>`, `<noframes>` and `<plaintext>`, and empties kept iframes: that content serialises unescaped and could become live markup when the HTML is parsed again
- Removes `name` attributes, which would let content shadow members of `document` (DOM clobbering)
- Allows only HTTP(S), `mailto:`, `tel:`, safe relative links, and approved raster image data
- Filters every URL-bearing attribute, not just `href`/`src` — `poster`, `background` and `srcset` are validated, and `ping` is removed
- Allowlists inline style properties and rejects any value that fetches an external resource (`url()`, `image-set()`, `src()`, `expression()`, `@import`)
- Preserves HTTPS YouTube/Vimeo iframes only when iframe support is explicitly enabled
- Sanitisation runs on: paste, HTML dropped in from outside the editor, `setHTML()`, `insertHTML()`, code-view output, and the initial content the editor is mounted over
- Editing operations never delete characters from serialised HTML and parse it again: they move or clone nodes. Undo/redo snapshots use a random per-editor token for embedded images, so content cannot forge one

Despite these measures, **Autumn Note is a client-side editor** — always sanitise content server-side before storing or rendering it to other users.

---

## Supply chain

Releases are meant to be published from CI (`.github/workflows/publish.yml`) through [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers), so no long-lived npm token exists to leak or rotate, and each such version carries a provenance attestation linking the tarball to the commit and workflow run that built it. Check a version with:

```bash
npm view autumnnote-plus dist.attestations
```

A version without an attestation was published by hand (the first release of a new package name has to be, before a trusted publisher can be attached); see [docs/PUBLISHING.md](docs/PUBLISHING.md).

CI additionally fails the build on any high-severity advisory in the dependency tree. The published package itself has **zero runtime dependencies**.
