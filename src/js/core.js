/**
 * core.js - Minimal entry point for AutumnNote (`autumnnote/core`).
 *
 * Same API as the default entry, but only the modules a usable editor needs:
 * typing, toolbar, status bar, paste handling and the placeholder. The dialogs,
 * floating tooltips, emoji and icon pickers and the crop overlay are not
 * imported at all, so a bundler leaves them out of the output rather than
 * shipping them switched off.
 *
 *   import AutumnNote from 'autumnnote/core';
 *   import 'autumnnote/dist/autumnnote.css';   // same stylesheet as the full build
 *
 *   AutumnNote.create('#editor', {
 *     toolbar: [['bold', 'italic', 'underline'], ['ul', 'ol']],
 *   });
 *
 * Toolbar buttons whose module is absent still render, but invoking one logs a
 * warning and does nothing — give this preset a toolbar naming only buttons the
 * core modules serve, or use the default entry.
 */

// The stylesheet is not imported here on purpose: it is identical to the full
// build's and is already emitted as dist/autumnnote.css, which both entries
// point consumers at. Importing it again would only duplicate ~8 KB gzip in the
// package for no benefit.
import { setModuleDefs } from './Context.js';
import { CORE_MODULES } from './presets/core.js';

setModuleDefs(CORE_MODULES);

export * from './factory.js';
export { default } from './factory.js';
