/**
 * index.umd.js — UMD entry point for AutumnNote
 *
 * Re-exports only the default export so the UMD global is the factory object
 * directly, enabling the script-tag usage documented in the README:
 *
 *   <script src="dist/autumnnote.umd.js"></script>
 *   <script>
 *     const editor = AutumnNote.create('#my-editor');
 *   </script>
 *
 * English is built in. Other locales are separate scripts, dist/i18n/<code>.umd.js,
 * that register themselves when loaded after this file; bundling them all here
 * made every CDN page pay ~3 KB gzip per language it never showed.
 */
export { default } from './index.js';
