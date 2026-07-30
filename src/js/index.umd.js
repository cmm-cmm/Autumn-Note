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
 */
// Script-tag consumers have no bundler to tree-shake with, so every locale is
// pre-registered here and `lang: 'vi'` works without extra imports. ESM
// consumers opt in per locale via `autumnnote/i18n/<code>` instead.
import './i18n/all.js';

export { default } from './index.js';
