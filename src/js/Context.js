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
import { ContextMenu } from './module/ContextMenu.js';

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
  }

  _bindEditorEvents(editable) {
    const d1 = on(editable, 'focus', () => {
      this.layoutInfo.container.classList.add('asn-focused');
      if (typeof this.options.onFocus === 'function') {
        this.options.onFocus(this);
      }
    });
    const d2 = on(editable, 'blur', () => {
      this.layoutInfo.container.classList.remove('asn-focused');
      // Sync content back to original element
      this._syncToTarget();
      if (typeof this.options.onBlur === 'function') {
        this.options.onBlur(this);
      }
    });
    this._disposers.push(d1, d2);
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
    if (!module) return undefined;
    if (typeof module[methodName] !== 'function') return undefined;
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
   * Clears the editor content.
   */
  clear() {
    this.invoke('editor.clear');
  }

  /**
   * Sets whether the editor is disabled (readonly).
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    const editable = this.layoutInfo.editable;
    if (disabled) {
      editable.setAttribute('contenteditable', 'false');
      this.layoutInfo.container.classList.add('asn-disabled');
    } else {
      editable.setAttribute('contenteditable', 'true');
      this.layoutInfo.container.classList.remove('asn-disabled');
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
