# Security Policy

## Supported versions

Security fixes land on the latest minor release. Older lines are not backported — upgrading within a major is intended to be a drop-in.

| Version | Supported |
|---|---|
| 2.1.x | ✅ |
| 2.0.x | ⚠️ Upgrade to 2.1.x — it contains sanitiser fixes |
| < 2.0 | ❌ |

---

## Reporting a vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

If you discover a security vulnerability, report it privately by:

1. Going to **[Security → Report a vulnerability](https://github.com/cmm-cmm/Autumn-Note/security/advisories/new)** on this repository, or
2. Contacting the maintainer directly via GitHub: [@cmm-cmm](https://github.com/cmm-cmm)

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You will receive a response within **72 hours**. We ask that you give us reasonable time to address the issue before any public disclosure.

---

## Security design

Autumn Note includes a built-in DOM-based HTML sanitiser applied to all user input:

- Strips `<script>`, `<object>`, `<embed>` and other active-content elements
- Removes all `on*` event handler attributes (e.g. `onclick`, `onerror`)
- Removes SVG animation elements (`<animate>`, `<set>`, `<animateTransform>`, `<animateMotion>`), which can rewrite an attribute *after* sanitisation finishes and so defeat an attribute-level filter
- Removes the MathML HTML-integration points (`<mglyph>`, `<malignmark>`, `<annotation-xml>`) that let a fragment re-parse into different markup than it serialised from (mXSS); sanitising is a fixed point
- Allows only HTTP(S), `mailto:`, `tel:`, safe relative links, and approved raster image data
- Filters every URL-bearing attribute, not just `href`/`src` — `poster`, `background` and `srcset` are validated, and `ping` is removed
- Allowlists inline style properties and rejects any value that fetches an external resource (`url()`, `image-set()`, `src()`, `expression()`, `@import`)
- Preserves HTTPS YouTube/Vimeo iframes only when iframe support is explicitly enabled
- Sanitisation runs on: paste, `setHTML()`, `insertHTML()`, code-view output, and the initial content the editor is mounted over

Despite these measures, **Autumn Note is a client-side editor** — always sanitise content server-side before storing or rendering it to other users.

---

## Supply chain

Releases are published to npm through [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers), so no long-lived npm token exists to leak or rotate. Every published version carries a SLSA provenance attestation linking the tarball to the exact commit and workflow run that built it:

```bash
npm view autumnnote dist.attestations
```

CI additionally fails the build on any high-severity advisory in the dependency tree. The published package itself has **zero runtime dependencies**.
