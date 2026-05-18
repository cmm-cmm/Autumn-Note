/**
 * Mention.js — @mention autocomplete support.
 *
 * Activated when `mention.onSearch` option is provided.
 *
 * When the user types the trigger character (default `@`) followed by at least
 * `mention.minChars` characters, `onSearch(query, callback)` is called.
 * The callback receives an array of `{ id, label, avatar? }` items which are
 * rendered in a floating dropdown.  Selecting an item inserts a non-editable
 * mention chip and fires `onInsert` (if provided) to override the default HTML.
 *
 * Options shape (passed as `mention` option object):
 * {
 *   trigger:      '@',
 *   minChars:     1,
 *   maxResults:   8,
 *   debounce:     200,
 *   onSearch:     (query, callback) => void,
 *   onInsert:     (item) => string | null,
 *   mentionClass: 'an-mention',
 *   allowSpaces:  false,
 * }
 */

import { on } from '../core/dom.js';

export class Mention {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;

    /** @type {HTMLElement|null} */
    this._dropdown = null;
    /** @type {string} */
    this._query = '';
    /** @type {number|null} */
    this._debounceTimer = null;
    /** @type {number} current highlighted index */
    this._activeIndex = -1;
    /** @type {Array<{id, label, avatar?}>} */
    this._items = [];
    /** @type {boolean} */
    this._open = false;
    /** Position of trigger character in the text node */
    this._triggerNode = null;
    this._triggerOffset = 0;
    /** @type {DOMRect|null} Caret rect captured synchronously during input event */
    this._caretRect = null;

    this._disposers = [];
  }

  initialize() {
    const cfg = this.context.options.mention;
    if (!cfg || typeof cfg.onSearch !== 'function') return this;
    this._cfg = {
      trigger: cfg.trigger || '@',
      minChars: cfg.minChars ?? 0,
      maxResults: cfg.maxResults ?? 8,
      debounce: cfg.debounce ?? 200,
      onSearch: cfg.onSearch,
      onInsert: cfg.onInsert || null,
      mentionClass: cfg.mentionClass || 'an-mention',
      allowSpaces: cfg.allowSpaces || false,
    };

    this._buildDropdown();

    const editable = this.context.layoutInfo.editable;
    const d1 = on(editable, 'keydown', (e) => this._onKeydown(e));
    const d2 = on(editable, 'input', () => this._onInput());
    const d3 = on(document, 'click', (e) => this._onDocClick(e));
    this._disposers.push(d1, d2, d3);
    return this;
  }

  destroy() {
    clearTimeout(this._debounceTimer);
    if (this._dropdown && this._dropdown.parentNode) {
      this._dropdown.parentNode.removeChild(this._dropdown);
    }
    this._dropdown = null;
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  // ---------------------------------------------------------------------------
  // Dropdown DOM
  // ---------------------------------------------------------------------------

  _buildDropdown() {
    const el = document.createElement('div');
    el.className = 'an-mention-dropdown';
    el.setAttribute('role', 'listbox');

    // Event delegation: single listeners on the container instead of per-item
    el.addEventListener('mousedown', (e) => e.preventDefault());
    el.addEventListener('click', (e) => {
      const item = e.target.closest('.an-mention-item');
      if (item) this._select(+item.dataset.index);
    });
    el.addEventListener('mousemove', (e) => {
      const item = e.target.closest('.an-mention-item');
      if (item) this._highlightItem(+item.dataset.index);
    });

    document.body.appendChild(el);
    this._dropdown = el;
  }

  _renderItems(items) {
    const dd = this._dropdown;
    this._items = items.slice(0, this._cfg.maxResults);
    this._activeIndex = this._items.length > 0 ? 0 : -1;

    // Build all items in a DocumentFragment — one batch DOM insertion
    const frag = document.createDocumentFragment();
    this._items.forEach((item, i) => {
      const li = document.createElement('div');
      li.className = 'an-mention-item';
      li.setAttribute('role', 'option');
      li.dataset.index = i;
      if (item.avatar) {
        const img = document.createElement('img');
        img.src = item.avatar;
        img.className = 'an-mention-avatar';
        img.alt = '';
        li.appendChild(img);
      }
      const label = document.createElement('span');
      label.textContent = item.label;
      li.appendChild(label);
      frag.appendChild(li);
    });

    dd.innerHTML = '';        // one clear
    dd.appendChild(frag);    // one batch insert

    this._highlightItem(this._activeIndex);
  }

  _highlightItem(index) {
    if (!this._dropdown) return;
    this._dropdown.querySelectorAll('.an-mention-item').forEach((el, i) => {
      el.classList.toggle('an-mention-active', i === index);
    });
    this._activeIndex = index;
  }

  _positionDropdown() {
    const dd = this._dropdown;
    const rect = this._caretRect;
    if (!rect || rect.height === 0) return;

    // Measure while invisible to avoid layout flash
    dd.style.visibility = 'hidden';
    dd.style.display = 'block';

    const ddh = dd.offsetHeight;
    const ddw = dd.offsetWidth;

    // position:fixed — coords are already viewport-relative, no scroll offset needed
    let top = rect.bottom + 4;
    let left = rect.left;

    if (rect.bottom + ddh + 8 > window.innerHeight) {
      top = rect.top - ddh - 4;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - ddw - 8));

    dd.style.top = `${top}px`;
    dd.style.left = `${left}px`;
    dd.style.visibility = '';
  }

  _showDropdown() {
    this._open = true;
    this._positionDropdown();
  }

  _hideDropdown() {
    if (this._dropdown) this._dropdown.style.display = 'none';
    this._open = false;
    this._items = [];
    this._activeIndex = -1;
    this._triggerNode = null;
    this._caretRect = null;
    this._query = '';
  }

  /**
   * Captures the caret rect synchronously during the input event.
   * Must be called while the DOM event is still live — getClientRects() on a
   * collapsed range is reliable at this point but often empty inside async callbacks.
   */
  _captureCaretRect() {
    // Prefer a range over the trigger character — it has non-zero width and
    // getBoundingClientRect() reliably returns a valid rect.
    if (this._triggerNode && this._triggerNode.isConnected) {
      try {
        const r = document.createRange();
        const end = Math.min(this._triggerOffset + 1, this._triggerNode.textContent.length);
        r.setStart(this._triggerNode, this._triggerOffset);
        r.setEnd(this._triggerNode, end);
        const candidate = r.getBoundingClientRect();
        if (candidate.height > 0) {
          this._caretRect = candidate;
          return;
        }
      } catch (_) {}
    }

    // Fallback: use getClientRects() on the current collapsed selection
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const rects = sel.getRangeAt(0).getClientRects();
    if (rects.length > 0) {
      this._caretRect = rects[rects.length - 1];
    }
  }

  // ---------------------------------------------------------------------------
  // Query detection
  // ---------------------------------------------------------------------------

  _getQueryAtCursor() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent.slice(0, range.startOffset);
    const trigger = this._cfg.trigger;

    // Find the last occurrence of trigger in the text before cursor
    const triggerIdx = text.lastIndexOf(trigger);
    if (triggerIdx === -1) return null;

    const afterTrigger = text.slice(triggerIdx + trigger.length);

    // No spaces allowed unless configured
    if (!this._cfg.allowSpaces && /\s/.test(afterTrigger)) return null;

    if (afterTrigger.length < this._cfg.minChars) return null;

    this._triggerNode = node;
    this._triggerOffset = triggerIdx;
    return afterTrigger;
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _onInput() {
    if (!this._cfg) return;
    const query = this._getQueryAtCursor();
    if (query === null) {
      this._hideDropdown();
      return;
    }

    // Capture caret rect NOW, synchronously while the input event is live.
    // Inside a setTimeout/debounce callback the selection may still be valid
    // but getClientRects() on a collapsed range often returns empty in that context.
    this._captureCaretRect();

    this._query = query;
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._cfg.onSearch(this._query, (items) => {
        if (!Array.isArray(items) || items.length === 0) {
          this._hideDropdown();
          return;
        }
        this._renderItems(items);
        this._showDropdown();
      });
    }, this._cfg.debounce);
  }

  _onKeydown(e) {
    if (!this._cfg || !this._open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (this._activeIndex + 1) % this._items.length;
      this._highlightItem(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (this._activeIndex - 1 + this._items.length) % this._items.length;
      this._highlightItem(prev);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (this._activeIndex >= 0) {
        e.preventDefault();
        this._select(this._activeIndex);
      }
    } else if (e.key === 'Escape') {
      this._hideDropdown();
    }
  }

  _onDocClick(e) {
    if (!this._open) return;
    if (this._dropdown && this._dropdown.contains(e.target)) return;
    this._hideDropdown();
  }

  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------

  _select(index) {
    const item = this._items[index];
    if (!item) return;

    // Delete the trigger + query text from the DOM
    if (this._triggerNode) {
      const node = this._triggerNode;
      const before = node.textContent.slice(0, this._triggerOffset);
      const after = node.textContent.slice(this._triggerOffset + this._cfg.trigger.length + this._query.length);
      node.textContent = before + after;

      // Move cursor to where the trigger was
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(node, this._triggerOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Build the chip HTML
    let html;
    if (typeof this._cfg.onInsert === 'function') {
      html = this._cfg.onInsert(item);
    }
    if (!html) {
      const cls = this._cfg.mentionClass;
      html = `<span class="${cls}" data-mention-id="${item.id}" contenteditable="false">@${item.label}</span>`;
    }

    // Insert a trailing space so the cursor lands outside the chip
    this.context.invoke('editor.insertHTML', html + '&#8203;');
    this._hideDropdown();
    this.context.triggerEvent('change', this.context.getHTML());
  }
}
