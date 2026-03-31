# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-31

### Added
- Core WYSIWYG editor built with vanilla JavaScript (ES2022+), no jQuery
- Toolbar with full text formatting: bold, italic, underline, strikethrough, superscript, subscript
- Paragraph styles: Normal, H1–H6, Blockquote, Code block
- Font family dropdown (10 families by default)
- Line height dropdown (1.0 – 3.0)
- Text & highlight colour picker with last-used colour memory
- Alignment: left, center, right, justify
- Ordered and unordered lists with indent/outdent; Tab/Shift+Tab support
- Undo/redo history stack (100 levels, Ctrl+Z / Ctrl+Y)
- Insert: horizontal rule, link dialog, image dialog (URL & file upload), video dialog (YouTube, Vimeo, direct URL)
- Table — interactive grid picker (up to 10×10) with full row/column/cell management tooltip
- Emoji picker (~380 Unicode emoji, 7 categories, keyword search)
- FontAwesome icon picker (FA 6 Free Solid, 8 categories, keyword search)
- Inline floating tooltips for link, image, video, table, and code block elements
- Right-click context menu (undo, redo, cut, copy, paste, format tools)
- Image & video drag-to-resize handles
- Statusbar with live word/character count and height drag handle
- Code view (toggle raw HTML with sanitisation)
- Fullscreen mode
- CSS placeholder via `::before` pseudo-element
- Bootstrap 4/5 integration (`useBootstrap` option)
- FontAwesome auto-detection with SVG icon fallback
- Custom module registration via `AutumnNote.registerModule()`
- DOM-based HTML sanitiser: strips `<script>`, `<iframe>`, `on*` handlers, `javascript:` and `data:` URLs
- ES module + UMD builds via Vite
- TypeScript type definitions
- GitHub Pages live demo: https://cmm-cmm.github.io/Autumn-Note/
