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
export { default } from './index.js';
