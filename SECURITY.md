# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 1.0.x | ✅ |

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

AutumnNote includes a built-in DOM-based HTML sanitiser applied to all user input:

- Strips `<script>`, `<iframe>`, `<object>`, `<embed>` elements
- Removes all `on*` event handler attributes (e.g. `onclick`, `onerror`)
- Rejects `javascript:` and `data:` URIs in `href` and `src` attributes
- Sanitisation runs on: paste, `setHTML()`, and code-view output

Despite these measures, **AutumnNote is a client-side editor** — always sanitise content server-side before storing or rendering it to other users.
