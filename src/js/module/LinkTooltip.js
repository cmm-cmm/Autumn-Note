// LinkTooltip.js - Hover tooltip for links inside the editor
// Displays a small action bar with: visit link, edit link, unlink
import { createElement, on } from '../core/dom.js';

const ICONS = {
  open:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  edit:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  unlink: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>`,
  copy:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
};

/** Delay in ms before showing / after hiding to avoid flicker */
const SHOW_DELAY = 120;
const HIDE_DELAY = 200;

export class LinkTooltip {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this._el = null;
    this._activeAnchor = null;
    this._showTimer = null;
    this._hideTimer = null;
    this._disposers = [];
  }

  initialize() {
    this._el = this._buildTooltip();
    document.body.appendChild(this._el);

    const editable = this.context.layoutInfo.editable;

    this._disposers.push(
      // Detect when pointer enters a link
      on(editable, 'mouseover', (e) => {
        const anchor = e.target.closest('a[href]');
        if (anchor && editable.contains(anchor)) {
          this._scheduleShow(anchor);
        }
      }),
      // Detect when pointer leaves the editable area entirely
      on(editable, 'mouseout', (e) => {
        const to = e.relatedTarget;
        if (!to || (!editable.contains(to) && !this._el.contains(to))) {
          this._scheduleHide();
        }
      }),
    );

    return this;
  }

  destroy() {
    this._clearTimers();
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  _buildTooltip() {
    const el = createElement('div', { class: 'an-link-tooltip', role: 'toolbar', 'aria-label': 'Link actions' });
    el.style.display = 'none';

    // URL preview text (truncated)
    this._urlLabel = createElement('span', { class: 'an-link-tooltip-url' });
    el.appendChild(this._urlLabel);

    // Separator
    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    // Action buttons
    this._openBtn   = this._makeBtn(ICONS.open,   'Open link',   () => this._openLink());
    this._copyBtn   = this._makeBtn(ICONS.copy,   'Copy URL',    () => this._copyLink());
    this._editBtn   = this._makeBtn(ICONS.edit,   'Edit link',   () => this._editLink());
    this._unlinkBtn = this._makeBtn(ICONS.unlink, 'Remove link', () => this._unlink());

    el.appendChild(this._openBtn);
    el.appendChild(this._copyBtn);
    el.appendChild(this._editBtn);
    el.appendChild(this._unlinkBtn);

    // Keep tooltip alive while hovering it
    this._disposers.push(
      on(el, 'mouseenter', () => this._clearTimers()),
      on(el, 'mouseleave', () => this._scheduleHide()),
    );

    return el;
  }

  _makeBtn(icon, title, handler) {
    const btn = createElement('button', { type: 'button', class: 'an-link-tooltip-btn', title });
    btn.innerHTML = icon;
    this._disposers.push(on(btn, 'click', (e) => { e.preventDefault(); e.stopPropagation(); handler(); }));
    return btn;
  }

  // ---------------------------------------------------------------------------
  // Show / Hide logic
  // ---------------------------------------------------------------------------

  _scheduleShow(anchor) {
    if (this._activeAnchor === anchor && this._el.style.display !== 'none') return;
    clearTimeout(this._hideTimer);
    this._hideTimer = null;
    clearTimeout(this._showTimer);
    this._showTimer = setTimeout(() => {
      this._activeAnchor = anchor;
      this._show(anchor);
    }, SHOW_DELAY);
  }

  _scheduleHide() {
    clearTimeout(this._showTimer);
    this._showTimer = null;
    if (this._hideTimer) return;
    this._hideTimer = setTimeout(() => {
      this._hide();
    }, HIDE_DELAY);
  }

  _show(anchor) {
    const isReadOnly = this.context.layoutInfo.container.classList.contains('an-disabled');
    const url = anchor.getAttribute('href') || '';
    this._urlLabel.textContent = this._truncateUrl(url);
    this._urlLabel.title = url;
    // In read-only mode keep only open + copy; hide edit and unlink
    this._editBtn.style.display   = isReadOnly ? 'none' : '';
    this._unlinkBtn.style.display = isReadOnly ? 'none' : '';
    this._el.style.display = 'flex';
    this._positionNear(anchor);
  }

  _hide() {
    this._el.style.display = 'none';
    this._activeAnchor = null;
    this._clearTimers();
  }

  _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = null;
    this._hideTimer = null;
  }

  _positionNear(anchor) {
    const rect   = anchor.getBoundingClientRect();
    const tipW   = this._el.offsetWidth  || 260;
    const tipH   = this._el.offsetHeight || 34;
    const margin = 6;

    // Prefer below the link; if no room, put above
    let top  = rect.bottom + margin;
    let left = rect.left;

    if (top + tipH > window.innerHeight - margin) {
      top = rect.top - tipH - margin;
    }
    if (left + tipW > window.innerWidth - margin) {
      left = window.innerWidth - tipW - margin;
    }
    if (left < margin) left = margin;

    this._el.style.top  = `${top}px`;
    this._el.style.left = `${left}px`;
  }

  _truncateUrl(url) {
    try {
      const u = new URL(url);
      const display = u.host + (u.pathname !== '/' ? u.pathname : '');
      return display.length > 48 ? display.slice(0, 48) + '…' : display;
    } catch {
      return url.length > 48 ? url.slice(0, 48) + '…' : url;
    }
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _openLink() {
    const url = this._activeAnchor && this._activeAnchor.getAttribute('href');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    this._hide();
  }

  _copyLink() {
    const url = this._activeAnchor && this._activeAnchor.getAttribute('href');
    if (url) {
      navigator.clipboard.writeText(url).catch(() => {
        // Fallback for environments where clipboard API is unavailable
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    }
    // Brief visual feedback  
    if (this._copyBtn) {
      this._copyBtn.classList.add('an-link-tooltip-btn--copied');
      setTimeout(() => this._copyBtn && this._copyBtn.classList.remove('an-link-tooltip-btn--copied'), 1000);
    }
  }

  _editLink() {
    const anchor = this._activeAnchor;
    if (!anchor) return;
    this._hide();

    // Place cursor inside the anchor, then open the link dialog (which pre-fills from selection)
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(anchor);
    sel.removeAllRanges();
    sel.addRange(range);

    this.context.invoke('linkDialog.show');
  }

  _unlink() {
    const anchor = this._activeAnchor;
    if (!anchor) return;
    this._hide();

    // Select the anchor text, then remove the link
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNode(anchor);
    sel.removeAllRanges();
    sel.addRange(range);

    document.execCommand('unlink');
    this.context.invoke('editor.afterCommand');
  }
}
