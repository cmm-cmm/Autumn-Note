/**
 * index.js - Public entry point for AutumnNote
 *
 * Installs every module, so this is the full editor with no configuration
 * needed. For a smaller bundle that leaves the dialogs, tooltips and pickers
 * out entirely, import `autumnnote/core` instead.
 *
 * Usage (module):
 *   import AutumnNote from 'autumnnote';
 *   const editor = AutumnNote.create('#my-editor', { placeholder: 'Start typing…' });
 *
 * Usage (UMD / script tag):
 *   const editor = AutumnNote.create('#my-editor');
 */

// @ts-ignore
import '../styles/autumnnote.scss';
import { setModuleDefs } from './Context.js';
import { FULL_MODULES } from './presets/full.js';

setModuleDefs(FULL_MODULES);

export * from './factory.js';
export { default } from './factory.js';
