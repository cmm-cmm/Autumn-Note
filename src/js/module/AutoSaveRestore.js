/**
 * AutoSaveRestore.js — Detects a previously auto-saved draft and offers the
 * user a banner to restore or discard it.
 *
 * Activated when both `autoSave` and `autoSaveRestore` options are true.
 * On initialize it checks localStorage for a draft that is within the
 * `autoSaveRestoreTimeout` day globalThis.  If one is found a dismissible banner
 * is prepended to the editor container.
 */

export class AutoSaveRestore {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;

    /** @type {HTMLElement|null} */
    this._banner = null;
  }

  initialize() {
    if (!this.options.autoSave || !this.options.autoSaveRestore) return this;

    const key = this.options.autoSaveKey;
    const metaKey = key + ':asrmeta';

    let saved;
    let meta;
    try {
      saved = localStorage.getItem(key);
      meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
    } catch (_) {
      void _;
      return this;
    }

    if (!saved) return this;

    const timeout = this.options.autoSaveRestoreTimeout;
    if (timeout > 0) {
      const ageMs = Date.now() - (meta.savedAt || 0);
      if (ageMs > timeout * 86400000) {
        try { localStorage.removeItem(key); localStorage.removeItem(metaKey); } catch (_) { void _; }
        return this;
      }
    }

    this._showBanner(saved, meta);
    return this;
  }

  destroy() {
    this._removeBanner();
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  _showBanner(draftHtml, meta) {
    const locale = this.context.locale;
    const t = locale.autoSaveRestore || {};
    const label = t.found || 'Draft found. Restore?';
    const restoreLabel = t.restore || 'Restore';
    const discardLabel = t.discard || 'Discard';

    const banner = document.createElement('div');
    banner.className = 'an-asr-banner';
    banner.setAttribute('role', 'alert');

    const msg = document.createElement('span');
    msg.className = 'an-asr-msg';
    if (meta.savedAt) {
      const d = new Date(meta.savedAt);
      const formatted = d.toLocaleString();
      msg.textContent = (t.foundAt || 'Draft from {date}. Restore?').replace('{date}', formatted);
    } else {
      msg.textContent = label;
    }

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'an-btn an-asr-btn-restore';
    restoreBtn.textContent = restoreLabel;
    restoreBtn.addEventListener('click', () => this._restore(draftHtml));

    const discardBtn = document.createElement('button');
    discardBtn.type = 'button';
    discardBtn.className = 'an-btn an-asr-btn-discard';
    discardBtn.textContent = discardLabel;
    discardBtn.addEventListener('click', () => this._discard());

    banner.appendChild(msg);
    banner.appendChild(restoreBtn);
    banner.appendChild(discardBtn);

    this._banner = banner;
    const container = this.context.layoutInfo.container;
    container.insertBefore(banner, container.firstChild);
  }

  _restore(draftHtml) {
    this.context.setHTML(draftHtml);
    this.context.clearHistory();
    this._removeBanner();

    if (typeof this.options.onAutoSaveRestore === 'function') {
      this.options.onAutoSaveRestore(draftHtml, this.context);
    }
  }

  _discard() {
    const key = this.options.autoSaveKey;
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(key + ':asrmeta');
    } catch (_) { void _; }
    this._removeBanner();
  }

  _removeBanner() {
    this._banner?.remove();
    this._banner = null;
  }
}
