/**
 * FindReplace.js - Find & Replace dialog
 *
 * Opens via Ctrl+F (find only) or Ctrl+H (find + replace).
 * Uses TreeWalker to locate text matches and wraps them with <mark> elements
 * for highlighting. Supports case-sensitive search, Prev/Next navigation and
 * single / replace-all replacement.
 */

import { createElement, on, trapFocus } from '../core/dom.js';

export class FindReplace {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;

    /** @type {HTMLElement|null} */
    this._dialog = null;
    /** @type {HTMLInputElement|null} */
    this._findInput = null;
    /** @type {HTMLInputElement|null} */
    this._replaceInput = null;
    /** @type {HTMLInputElement|null} */
    this._caseCheckbox = null;
    /** @type {HTMLElement|null} */
    this._counterEl = null;
    /** @type {HTMLElement|null} */
    this._closeBtn = null;

    /** Live matches — each entry is { mark: HTMLElement } after highlighting */
    this._matches = [];
    this._currentIndex = -1;
    this._caseSensitive = false;
    /** @type {'find'|'replace'} */
    this._mode = 'find';

    /** Cached compiled regex — reused when query and case-sensitivity are unchanged */
    this._queryRegex = null;
    this._lastQuery = null;
    this._lastCaseSensitive = null;

    this._disposers = [];
    this._removeTrap = null;
    this._focusTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this._dialog = this._buildDialog();
    document.body.appendChild(this._dialog);
    return this;
  }

  destroy() {
    clearTimeout(this._focusTimer);
    this._focusTimer = null;
    this._clearHighlights();
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dialog && this._dialog.parentNode) {
      this._dialog.parentNode.removeChild(this._dialog);
    }
    this._dialog = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Opens the dialog in 'find' or 'replace' mode.
   * @param {'find'|'replace'} [mode='find']
   */
  show(mode = 'find') {
    this._mode = mode;
    this._updateMode();
    this._open();
    // Pre-select whatever was previously typed so the user can retype immediately
    clearTimeout(this._focusTimer);
    this._focusTimer = setTimeout(() => {
      if (this._findInput) {
        this._findInput.select();
        this._findInput.focus();
      }
    }, 50);
  }

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  _open() {
    if (!this._dialog) return;
    // If already visible, just focus the search input — don't re-trap.
    if (this._dialog.style.display === 'flex') {
      if (this._findInput) this._findInput.focus();
      return;
    }
    this._dialog.style.display = 'flex';
    // Release any previous trap before installing a new one.
    if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
    this._removeTrap = trapFocus(this._dialog, () => this._close());
  }

  _close() {
    this._clearHighlights();
    if (this._dialog) this._dialog.style.display = 'none';
    if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
    // Return focus to the editor
    this.context.invoke('editor.focus');
  }

  _updateMode() {
    if (!this._dialog) return;
    const replaceRow = this._dialog.querySelector('.an-fr-replace-row');
    const replaceActions = this._dialog.querySelector('.an-fr-replace-actions');
    const title = this._dialog.querySelector('.an-dialog-title');

    const isReplace = this._mode === 'replace';
    if (replaceRow) replaceRow.style.display = isReplace ? '' : 'none';
    if (replaceActions) replaceActions.style.display = isReplace ? '' : 'none';
    if (title) title.textContent = isReplace ? 'Find & Replace' : 'Find';
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const overlay = createElement('div', {
      class: 'an-dialog-overlay an-fr-dialog',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Find and Replace',
    });
    const box = createElement('div', { class: 'an-dialog-box' });

    // ---- Title row ----
    const titleRow = createElement('div', { class: 'an-icon-title-row' });
    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = 'Find';
    const closeBtn = createElement('button', {
      type: 'button',
      class: 'an-icon-close',
      'aria-label': 'Close',
    });
    closeBtn.textContent = '×';
    this._closeBtn = closeBtn;
    titleRow.append(title, closeBtn);
    box.appendChild(titleRow);

    // ---- Find row ----
    const findRow = createElement('div', { class: 'an-fr-find-row' });
    const findInput = createElement('input', {
      type: 'text',
      class: 'an-input',
      placeholder: 'Find…',
      'aria-label': 'Search text',
    });
    this._findInput = findInput;
    findRow.appendChild(findInput);
    box.appendChild(findRow);

    // ---- Options row (case-sensitive toggle + match counter) ----
    const optRow = createElement('div', { class: 'an-fr-options-row' });
    const caseLabel = createElement('label', { class: 'an-label an-label-inline' });
    const caseCheckbox = createElement('input', {
      type: 'checkbox',
      'aria-label': 'Case sensitive',
    });
    this._caseCheckbox = caseCheckbox;
    caseLabel.append(caseCheckbox, document.createTextNode('\u00a0Case sensitive'));
    const counter = createElement('span', { class: 'an-fr-counter' });
    this._counterEl = counter;
    optRow.append(caseLabel, counter);
    box.appendChild(optRow);

    // ---- Find actions ----
    const findActions = createElement('div', { class: 'an-dialog-actions an-fr-find-actions' });
    const prevBtn = createElement('button', { type: 'button', class: 'an-btn' });
    prevBtn.textContent = '\u2190 Prev';
    const nextBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    nextBtn.textContent = 'Next \u2192';
    findActions.append(prevBtn, nextBtn);
    box.appendChild(findActions);

    // ---- Replace row (hidden by default) ----
    const replaceRow = createElement('div', { class: 'an-fr-replace-row' });
    replaceRow.style.display = 'none';
    const replaceInput = createElement('input', {
      type: 'text',
      class: 'an-input',
      placeholder: 'Replace with\u2026',
      'aria-label': 'Replace with',
    });
    this._replaceInput = replaceInput;
    replaceRow.appendChild(replaceInput);
    box.appendChild(replaceRow);

    // ---- Replace actions (hidden by default) ----
    const replaceActions = createElement('div', { class: 'an-dialog-actions an-fr-replace-actions' });
    replaceActions.style.display = 'none';
    const replaceBtn = createElement('button', { type: 'button', class: 'an-btn' });
    replaceBtn.textContent = 'Replace';
    const replaceAllBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    replaceAllBtn.textContent = 'Replace All';
    replaceActions.append(replaceBtn, replaceAllBtn);
    box.appendChild(replaceActions);

    overlay.appendChild(box);

    // ---- Event bindings ----
    const d1 = on(closeBtn, 'click', () => this._close());
    const d2 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    const d3 = on(findInput, 'input', () => this._onSearch());
    const d4 = on(caseCheckbox, 'change', () => {
      this._caseSensitive = caseCheckbox.checked;
      this._onSearch();
    });
    const d5 = on(nextBtn, 'click', () => this._next());
    const d6 = on(prevBtn, 'click', () => this._prev());
    const d7 = on(replaceBtn, 'click', () => this._replace());
    const d8 = on(replaceAllBtn, 'click', () => this._replaceAll());
    const d9 = on(findInput, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.shiftKey ? this._prev() : this._next();
      }
    });
    const d10 = on(replaceInput, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._replace();
      }
    });
    this._disposers.push(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Search logic
  // ---------------------------------------------------------------------------

  _onSearch() {
    this._clearHighlights();
    const query = this._findInput ? this._findInput.value : '';
    if (!query) {
      this._updateCounter();
      return;
    }
    this._findAndHighlight(query);
    this._updateCounter();
  }

  /**
   * Finds all occurrences of `query` in the editable area text nodes,
   * then wraps each match in a <mark class="an-highlight"> element.
   * Iterates text nodes in reverse so earlier offsets remain valid.
   * @param {string} query
   */
  _findAndHighlight(query) {
    const editable = this.context.layoutInfo.editable;
    if (!editable) return;

    // Collect raw matches: { node, start, end }
    const rawMatches = this._findRawMatches(query, editable);
    if (rawMatches.length === 0) return;

    this._currentIndex = 0;

    // Wrap matches in reverse order so earlier text offsets stay valid when
    // later sections of the same text node are split by surroundContents().
    // Use push() instead of unshift() to avoid O(n²) shifting on every insert;
    // reverse() at the end restores forward document order in O(n).
    for (let i = rawMatches.length - 1; i >= 0; i--) {
      const { node, start, end } = rawMatches[i];
      try {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);
        const mark = document.createElement('mark');
        mark.className = 'an-highlight';
        range.surroundContents(mark);
        this._matches.push({ mark });
      } catch (_) {
        // surroundContents fails when the range crosses element boundaries.
        // This can happen with <br> inside matched text — skip safely.
        this._matches.push({ mark: null });
      }
    }
    this._matches.reverse(); // O(n) — restore forward document order

    // Drop entries where wrapping failed so the counter and navigation are accurate
    this._matches = this._matches.filter((m) => m.mark);
    if (this._matches.length === 0) return;

    // Highlight the first (current) match
    if (this._matches[0] && this._matches[0].mark) {
      this._matches[0].mark.className = 'an-highlight an-highlight-current';
      this._matches[0].mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  /**
   * Walks all text nodes under `root` and returns positional match descriptors.
   * @param {string} query
   * @param {HTMLElement} root
   * @returns {{ node: Text, start: number, end: number }[]}
   */
  _findRawMatches(query, root) {
    const results = [];
    // Reuse compiled regex when query and case-sensitivity haven't changed
    if (this._lastQuery !== query || this._lastCaseSensitive !== this._caseSensitive) {
      const flags = this._caseSensitive ? 'g' : 'gi';
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this._queryRegex = new RegExp(escaped, flags);
      this._lastQuery = query;
      this._lastCaseSensitive = this._caseSensitive;
    }
    const re = this._queryRegex;

    const walker = document.createTreeWalker(root, 0x4 /* NodeFilter.SHOW_TEXT */);
    let node;
    while ((node = walker.nextNode())) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(node.textContent)) !== null) {
        results.push({ node, start: m.index, end: m.index + m[0].length });
      }
    }
    return results;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  _next() {
    if (this._matches.length === 0) return;
    this._currentIndex = (this._currentIndex + 1) % this._matches.length;
    this._scrollToMatch(this._currentIndex);
    this._updateCounter();
  }

  _prev() {
    if (this._matches.length === 0) return;
    this._currentIndex = (this._currentIndex - 1 + this._matches.length) % this._matches.length;
    this._scrollToMatch(this._currentIndex);
    this._updateCounter();
  }

  _scrollToMatch(index) {
    const match = this._matches[index];
    if (!match || !match.mark) return;
    // Update CSS classes
    this._matches.forEach((m, i) => {
      if (m.mark) {
        m.mark.className = i === index
          ? 'an-highlight an-highlight-current'
          : 'an-highlight';
      }
    });
    match.mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Replace
  // ---------------------------------------------------------------------------

  _replace() {
    if (this._matches.length === 0 || this._currentIndex < 0) return;
    const match = this._matches[this._currentIndex];
    if (!match || !match.mark || !match.mark.parentNode) return;

    const replacement = this._replaceInput ? this._replaceInput.value : '';
    const parent = match.mark.parentNode;
    const textNode = document.createTextNode(replacement);
    parent.insertBefore(textNode, match.mark);
    parent.removeChild(match.mark);
    parent.normalize();
    this.context.invoke('editor.afterCommand');
    const savedIndex = this._currentIndex;
    this._onSearch();
    if (this._matches.length > 0) {
      this._currentIndex = Math.min(savedIndex, this._matches.length - 1);
      this._scrollToMatch(this._currentIndex);
      this._updateCounter();
    }
  }

  _replaceAll() {
    if (this._matches.length === 0) return;
    const replacement = this._replaceInput ? this._replaceInput.value : '';

    this._matches.forEach(({ mark }) => {
      if (!mark || !mark.parentNode) return;
      const textNode = document.createTextNode(replacement);
      mark.parentNode.insertBefore(textNode, mark);
      mark.parentNode.removeChild(mark);
    });

    if (this.context.layoutInfo.editable) {
      this.context.layoutInfo.editable.normalize();
    }
    this._matches = [];
    this._currentIndex = -1;
    this.context.invoke('editor.afterCommand');
    this._onSearch();
  }

  // ---------------------------------------------------------------------------
  // Highlight management
  // ---------------------------------------------------------------------------

  /**
   * Removes all <mark class="an-highlight"> elements from the editable area,
   * restoring the original text nodes via normalization.
   */
  _clearHighlights() {
    const editable = this.context.layoutInfo.editable;
    if (!editable) return;

    editable.querySelectorAll('mark.an-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    // Merge adjacent text nodes after unwrapping
    editable.normalize();

    this._matches = [];
    this._currentIndex = -1;
  }

  // ---------------------------------------------------------------------------
  // Counter display
  // ---------------------------------------------------------------------------

  _updateCounter() {
    if (!this._counterEl) return;
    const total = this._matches.length;
    if (total === 0) {
      const query = this._findInput ? this._findInput.value : '';
      this._counterEl.textContent = query ? 'No results' : '';
    } else {
      this._counterEl.textContent = `${this._currentIndex + 1} / ${total}`;
    }
  }
}
