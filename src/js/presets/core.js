/**
 * presets/core.js — the smallest set that still makes a usable editor.
 *
 * Typing, the toolbar, the status bar, paste handling and the placeholder. No
 * dialogs, no floating tooltips, no emoji or icon pickers, no crop overlay.
 *
 * Nothing here imports a heavy module, which is the whole point: a build that
 * uses only this preset never reaches `presets/full.js` and the bundler drops
 * everything it lists.
 *
 * Toolbar buttons whose module is absent still render; invoking one logs a
 * warning from `Context.invoke` and does nothing. Pair this preset with a
 * toolbar that only names buttons the core modules can serve.
 */

import { Editor } from '../module/Editor.js';
import { Toolbar } from '../module/Toolbar.js';
import { Statusbar } from '../module/Statusbar.js';
import { Clipboard } from '../module/Clipboard.js';
import { Placeholder } from '../module/Placeholder.js';

/**
 * @type {import('../Context.js').ModuleDef[]}
 */
export const CORE_MODULES = [
  { name: 'editor',      Class: Editor },
  { name: 'toolbar',     Class: Toolbar },
  { name: 'statusbar',   Class: Statusbar },
  { name: 'clipboard',   Class: Clipboard },
  { name: 'placeholder', Class: Placeholder },
];

export { Editor, Toolbar, Statusbar, Clipboard, Placeholder };
