/**
 * presets/full.js — every module the editor ships with.
 *
 * This is what the default `autumnnote` entry point installs, so its behaviour
 * is unchanged. Because this file is the only place the module classes are
 * imported, a build that never reaches it — see `presets/core.js` — drops them
 * all, which is what makes `autumnnote/core` smaller rather than merely
 * differently configured.
 *
 * Order matters: modules are registered in array order and `toolbar` /
 * `statusbar` are attached to the container by name afterwards.
 */

import { Editor } from '../module/Editor.js';
import { Toolbar } from '../module/Toolbar.js';
import { Statusbar } from '../module/Statusbar.js';
import { Clipboard } from '../module/Clipboard.js';
import { ContextMenu } from '../module/ContextMenu.js';
import { Placeholder } from '../module/Placeholder.js';
import { Codeview } from '../module/Codeview.js';
import { Fullscreen } from '../module/Fullscreen.js';
import { LinkDialog } from '../module/LinkDialog.js';
import { ImageDialog } from '../module/ImageDialog.js';
import { VideoDialog } from '../module/VideoDialog.js';
import { ImageResizer } from '../module/ImageResizer.js';
import { VideoResizer } from '../module/VideoResizer.js';
import { LinkTooltip } from '../module/LinkTooltip.js';
import { ImageTooltip } from '../module/ImageTooltip.js';
import { VideoTooltip } from '../module/VideoTooltip.js';
import { TableTooltip } from '../module/TableTooltip.js';
import { CodeTooltip } from '../module/CodeTooltip.js';
import { EmojiDialog } from '../module/EmojiDialog.js';
import { IconDialog } from '../module/IconDialog.js';
import { ShortcutsDialog } from '../module/ShortcutsDialog.js';
import { FindReplace } from '../module/FindReplace.js';
import { ImageCropOverlay } from '../module/ImageCropOverlay.js';
import { AutoSaveRestore } from '../module/AutoSaveRestore.js';
import { MarkdownShortcuts } from '../module/MarkdownShortcuts.js';
import { BubbleToolbar } from '../module/BubbleToolbar.js';
import { Mention } from '../module/Mention.js';
import { SlashMenu } from '../module/SlashMenu.js';

import { CORE_MODULES } from './core.js';

/**
 * @type {import('../Context.js').ModuleDef[]}
 */
export const FULL_MODULES = [
  ...CORE_MODULES,
  { name: 'contextMenu',      Class: ContextMenu },
  { name: 'codeview',         Class: Codeview },
  { name: 'fullscreen',       Class: Fullscreen },
  { name: 'linkDialog',       Class: LinkDialog },
  { name: 'imageDialog',      Class: ImageDialog },
  { name: 'videoDialog',      Class: VideoDialog },
  { name: 'imageResizer',     Class: ImageResizer },
  { name: 'videoResizer',     Class: VideoResizer },
  { name: 'linkTooltip',      Class: LinkTooltip },
  { name: 'imageTooltip',     Class: ImageTooltip },
  { name: 'videoTooltip',     Class: VideoTooltip },
  { name: 'tableTooltip',     Class: TableTooltip },
  { name: 'codeTooltip',      Class: CodeTooltip },
  { name: 'emojiDialog',      Class: EmojiDialog },
  { name: 'iconDialog',       Class: IconDialog },
  { name: 'shortcutsDialog',  Class: ShortcutsDialog },
  { name: 'findReplace',      Class: FindReplace },
  { name: 'imageCropOverlay', Class: ImageCropOverlay },

  // Option-gated. `enabled` is consulted both at mount and after
  // updateOptions(), so a runtime toggle starts or tears the module down.
  { name: 'autoSaveRestore',   Class: AutoSaveRestore,   enabled: (o) => !!o.autoSaveRestore },
  { name: 'markdownShortcuts', Class: MarkdownShortcuts, enabled: (o) => o.markdownShortcuts !== false },
  { name: 'bubbleToolbar',     Class: BubbleToolbar,     enabled: (o) => !!o.bubbleToolbar },
  { name: 'mention',           Class: Mention,           enabled: (o) => !!o.mention },
  { name: 'slashMenu',         Class: SlashMenu,         enabled: (o) => o.slashMenu !== false },
];

export {
  Editor, Toolbar, Statusbar, Clipboard, ContextMenu, Placeholder, Codeview,
  Fullscreen, LinkDialog, ImageDialog, VideoDialog, ImageResizer, VideoResizer,
  LinkTooltip, ImageTooltip, VideoTooltip, TableTooltip, CodeTooltip,
  EmojiDialog, IconDialog, ShortcutsDialog, FindReplace, ImageCropOverlay,
  AutoSaveRestore, MarkdownShortcuts, BubbleToolbar, Mention, SlashMenu,
};
