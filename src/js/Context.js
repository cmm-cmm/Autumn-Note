/**
 * Context.js - Central hub for the editor instance
 * Holds references to all sub-modules and manages inter-module communication.
 * Inspired by Summernote's Context.js
 */

import { mergeDeep } from './core/func.js';
import { defaultOptions } from './settings.js';
import { renderLayout } from './renderer.js';
import { on } from './core/dom.js';

// Modules
import { Editor } from './module/Editor.js';
import { Toolbar } from './module/Toolbar.js';
import { Statusbar } from './module/Statusbar.js';
import { Clipboard } from './module/Clipboard.js';
import { Placeholder } from './module/Placeholder.js';
import { Codeview } from './module/Codeview.js';
import { Fullscreen } from './module/Fullscreen.js';
import { LinkDialog } from './module/LinkDialog.js';
import { ImageDialog } from './module/ImageDialog.js';
import { VideoDialog } from './module/VideoDialog.js';
import { ImageResizer } from './module/ImageResizer.js';
import { VideoResizer } from './module/VideoResizer.js';
import { LinkTooltip } from './module/LinkTooltip.js';
import { ImageTooltip } from './module/ImageTooltip.js';
import { VideoTooltip } from './module/VideoTooltip.js';
import { TableTooltip } from './module/TableTooltip.js';
import { CodeTooltip } from './module/CodeTooltip.js';
import { EmojiDialog } from './module/EmojiDialog.js';
import { IconDialog } from './module/IconDialog.js';
import { ContextMenu } from './module/ContextMenu.js';
import { ShortcutsDialog } from './module/ShortcutsDialog.js';
import { FindReplace } from './module/FindReplace.js';
import { ImageCropOverlay } from './module/ImageCropOverlay.js';

/** Module registry shared across all Context instances (populated via AutumnNote.registerModule). */
export const _customModules = new Map();

export class Context {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(targetEl, userOptions = {}) {
    this.targetEl = targetEl;
    this.options = mergeDeep(defaultOptions, userOptions);

    /** @type {{ container: HTMLElement, editable: HTMLElement, toolbar?: HTMLElement, statusbar?: HTMLElement }} */
    this.layoutInfo = {};

    /** @type {Map<string, Function[]>} */
    this._listeners = new Map();

    /** @type {Map<string, object>} */
    this._modules = new Map();

    this._disposers = [];
    this._alive = false;
  }

  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------

  initialize() {
    // 1. Render the DOM skeleton
    const { container, editable } = renderLayout(this.targetEl, this.options);
    this.layoutInfo.container = container;
    this.layoutInfo.editable = editable;

    // 2. Register core modules
    this._registerModules();

    // 3. Attach toolbar/statusbar to container
    const toolbar = this._modules.get('toolbar');
    if (toolbar && toolbar.el) {
      container.insertBefore(toolbar.el, editable);
      this.layoutInfo.toolbar = toolbar.el;
    }

    const statusbar = this._modules.get('statusbar');
    if (statusbar && statusbar.el) {
      container.appendChild(statusbar.el);
      this.layoutInfo.statusbar = statusbar.el;
    }

    // 4. Bind editor-level events
    this._bindEditorEvents(editable);

    // 5. Auto-focus if requested
    if (this.options.focus) {
      editable.focus();
    }

    this._alive = true;

    // Initial toolbar sync so dropdowns show the correct font on load
    this.invoke('toolbar.refresh');

    if (typeof this.options.onInit === 'function') {
      this.options.onInit(this);
    }

    return this;
  }

  _registerModules() {
    const register = (name, ModuleClass) => {
      const instance = new ModuleClass(this);
      instance.initialize();
      this._modules.set(name, instance);
    };

    register('editor', Editor);
    register('toolbar', Toolbar);
    register('statusbar', Statusbar);
    register('clipboard', Clipboard);
    register('contextMenu', ContextMenu);
    register('placeholder', Placeholder);
    register('codeview', Codeview);
    register('fullscreen', Fullscreen);
    register('linkDialog', LinkDialog);
    register('imageDialog', ImageDialog);
    register('videoDialog', VideoDialog);
    register('imageResizer', ImageResizer);
    register('videoResizer', VideoResizer);
    register('linkTooltip', LinkTooltip);
    register('imageTooltip', ImageTooltip);
    register('videoTooltip', VideoTooltip);
    register('tableTooltip', TableTooltip);
    register('codeTooltip', CodeTooltip);
    register('emojiDialog', EmojiDialog);
    register('iconDialog', IconDialog);
    register('shortcutsDialog', ShortcutsDialog);
    register('findReplace', FindReplace);
    register('imageCropOverlay', ImageCropOverlay);

    // Custom modules registered via AutumnNote.registerModule()
    for (const [name, ModuleClass] of _customModules) {
      register(name, ModuleClass);
    }
  }

  /**
   * Registers and initialises a custom module on this instance.
   * @param {string} name
   * @param {Function} ModuleClass
   * @returns {this}
   */
  registerModule(name, ModuleClass) {
    if (this._modules.has(name)) return this;
    const instance = new ModuleClass(this);
    instance.initialize();
    this._modules.set(name, instance);
    return this;
  }

  _bindEditorEvents(editable) {
    const d1 = on(editable, 'focus', () => {
      this.layoutInfo.container.classList.add('an-focused');
      if (typeof this.options.onFocus === 'function') {
        this.options.onFocus(this);
      }
    });
    const d2 = on(editable, 'blur', () => {
      this.layoutInfo.container.classList.remove('an-focused');
      this._syncToTarget();
      if (typeof this.options.onBlur === 'function') {
        this.options.onBlur(this);
      }
    });
    // Sync textarea/input value on every change so form.submit() always gets fresh content
    const d3 = this.on('change', () => this._syncToTarget());
    this._disposers.push(d1, d2, d3);

    // Auto-save to localStorage on every change
    if (this.options.autoSave && this.options.autoSaveKey) {
      const d4 = this.on('change', () => {
        try { localStorage.setItem(this.options.autoSaveKey, this.getHTML()); } catch (_) {}
      });
      this._disposers.push(d4);
    }
  }

  // ---------------------------------------------------------------------------
  // Module invocation
  // ---------------------------------------------------------------------------

  /**
   * Invokes a method on a registered module.
   * Format: 'moduleName.methodName'
   * @param {string} path - e.g. 'editor.bold'
   * @param {...*} args
   * @returns {*}
   */
  invoke(path, ...args) {
    const [moduleName, methodName] = path.split('.');
    const module = this._modules.get(moduleName);
    if (!module) {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        console.warn(`[AutumnNote] invoke: module "${moduleName}" not found (path: "${path}")`);
      }
      return undefined;
    }
    if (typeof module[methodName] !== 'function') {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        console.warn(`[AutumnNote] invoke: method "${methodName}" not found on module "${moduleName}" (path: "${path}")`);
      }
      return undefined;
    }
    return module[methodName](...args);
  }

  // ---------------------------------------------------------------------------
  // Event system
  // ---------------------------------------------------------------------------

  /**
   * Subscribes to an editor event.
   * @param {string} eventName
   * @param {Function} handler
   * @returns {() => void} unsubscribe
   */
  on(eventName, handler) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, []);
    }
    this._listeners.get(eventName).push(handler);
    return () => this.off(eventName, handler);
  }

  /**
   * Unsubscribes from an editor event.
   * @param {string} eventName
   * @param {Function} handler
   */
  off(eventName, handler) {
    const handlers = this._listeners.get(eventName);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  /**
   * Triggers an editor event.
   * @param {string} eventName
   * @param {...*} args
   */
  triggerEvent(eventName, ...args) {
    const handlers = this._listeners.get(eventName) || [];
    handlers.forEach((h) => h(...args));

    // Also call options callback if present (e.g. onChange)
    const cbName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    if (typeof this.options[cbName] === 'function') {
      this.options[cbName](...args);
    }
  }

  // ---------------------------------------------------------------------------
  // Public editor API
  // ---------------------------------------------------------------------------

  /**
   * Returns the current HTML content of the editor.
   * @returns {string}
   */
  getHTML() {
    return this.invoke('editor.getHTML');
  }

  /**
   * Sets the HTML content of the editor.
   * @param {string} html
   */
  setHTML(html) {
    this.invoke('editor.setHTML', html);
  }

  /**
   * Returns the plain text content of the editor.
   * @returns {string}
   */
  getText() {
    return this.invoke('editor.getText');
  }

  /**
   * Sets the editor content as plain text (HTML-escaped).
   * @param {string} text
   */
  setText(text) {
    this.invoke('editor.setText', text);
  }

  /**
   * Clears the editor content.
   */
  clear() {
    this.invoke('editor.clear');
  }

  /**
   * Resets the undo/redo history stack.
   * Useful after programmatically loading a new document via setHTML() / setMarkdown()
   * so that Ctrl+Z cannot undo back to the previous document.
   */
  clearHistory() {
    this.invoke('editor.clearHistory');
  }

  /**
   * Returns true when the editor has no meaningful content.
   * @returns {boolean}
   */
  isEmpty() {
    return this.invoke('editor.isEmpty');
  }

  /**
   * Inserts HTML at the current cursor position.
   * @param {string} html
   */
  insertHTML(html) {
    this.invoke('editor.insertHTML', html);
  }

  /**
   * Inserts plain text at the current cursor position.
   * @param {string} text
   */
  insertText(text) {
    this.invoke('editor.insertText', text);
  }

  /**
   * Sets editor content from a Markdown string.
   * @param {string} md
   */
  setMarkdown(md) {
    this.invoke('editor.setMarkdown', md);
  }

  /**
   * Returns the editor content as Markdown.
   * @returns {string}
   */
  getMarkdown() {
    return this.invoke('editor.getMarkdown');
  }

  /**
   * Returns the current word count of the editor content.
   * @returns {number}
   */
  getWordCount() {
    return this.invoke('statusbar.getWordCount') ?? 0;
  }

  /**
   * Returns the current character count of the editor content.
   * @returns {number}
   */
  getCharCount() {
    return this.invoke('statusbar.getCharCount') ?? 0;
  }

  /**
   * Downloads the editor content as an HTML file.
   * @param {string} [filename='document.html']
   */
  downloadHTML(filename = 'document.html') {
    this._download(this.getHTML(), filename, 'text/html');
  }

  /**
   * Downloads the editor content as a plain-text file.
   * @param {string} [filename='document.txt']
   */
  downloadText(filename = 'document.txt') {
    this._download(this.getText(), filename, 'text/plain');
  }

  /**
   * Downloads the editor content as a Markdown file.
   * @param {string} [filename='document.md']
   */
  downloadMarkdown(filename = 'document.md') {
    this._download(this.getMarkdown(), filename, 'text/markdown');
  }

  /**
   * Creates a temporary Blob URL and triggers a browser file download.
   * @param {string} content
   * @param {string} filename
   * @param {string} mimeType
   */
  _download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Opens the editor content in a new window and triggers the browser print dialog.
   * @param {string} [title='']
   */
  print(title = '') {
    const content = this.getHTML();
    const safeTitle = (title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const w = window.open('', '_blank');
    if (!w) return; // popup blocked by browser
    w.document.write(
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
      `<title>${safeTitle}</title>` +
      '<style>' +
      'body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:14px;line-height:1.6;padding:20mm;color:#111827;}' +
      'ul.an-checklist{list-style:none;padding-left:0;}' +
      'ul.an-checklist li{padding-left:24px;position:relative;margin:2px 0;}' +
      'ul.an-checklist li input[type="checkbox"]{position:absolute;left:0;top:3px;}' +
      'code{background:#f3f4f6;border-radius:3px;padding:.1em .35em;font-family:monospace;}' +
      'pre{background:#f3f4f6;padding:.75em 1em;border-radius:4px;overflow-x:auto;}' +
      'table{border-collapse:collapse;}td,th{border:1px solid #d1d5db;padding:4px 8px;}' +
      '</style>' +
      `</head><body>${content}</body></html>`,
    );
    w.document.close();
    w.onload = () => { w.print(); };
  }

  /**
   * Sets whether the editor is disabled (readonly).
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    const editable = this.layoutInfo.editable;
    if (disabled) {
      editable.setAttribute('contenteditable', 'false');
      this.layoutInfo.container.classList.add('an-disabled');
    } else {
      editable.setAttribute('contenteditable', 'true');
      this.layoutInfo.container.classList.remove('an-disabled');
    }
  }

  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------

  /**
   * Completely removes the editor and restores the original element.
   */
  destroy() {
    if (!this._alive) return;

    this._modules.forEach((module) => {
      if (typeof module.destroy === 'function') module.destroy();
    });
    this._modules.clear();

    this._disposers.forEach((d) => d());
    this._disposers = [];

    const container = this.layoutInfo.container;
    if (container && container.parentNode) {
      // Restore original element
      this.targetEl.style.display = '';
      container.parentNode.removeChild(container);
    }

    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy(this);
    }

    this._alive = false;
    this._listeners.clear();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Syncs editor HTML back into the original textarea/input for form submission.
   */
  _syncToTarget() {
    if (this.targetEl.tagName === 'TEXTAREA' || this.targetEl.tagName === 'INPUT') {
      this.targetEl.value = this.getHTML();
    }
  }
}
