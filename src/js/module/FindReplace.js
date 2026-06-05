/**
 * FindReplace.js - Find & Replace dialog
 *
 * Opens via Ctrl+F (find only) or Ctrl+H (find + replace).
 * Uses TreeWalker to locate text matches and wraps them with <mark> elements
 * for highlighting. Supports case-sensitive search, Prev/Next navigation and
 * single / replace-all replacement.
 */

import { createElement, on, trapFocus, makeDraggable } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

export class FindReplace extends BaseDialog {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    super(context);

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
    this._useRegex = false;
    this._wholeWord = false;
    /** @type {'find'|'replace'} */
    this._mode = 'find';

    /** Cached compiled regex — reused when query and case-sensitivity are unchanged */
    this._queryRegex = null;
    this._lastQuery = null;
    this._lastCaseSensitive = null;
    this._lastUseRegex = null;
    this._lastWholeWord = null;

    this._focusTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  destroy() {
    clearTimeout(this._focusTimer);
    this._focusTimer = null;
    this._clearHighlights();
    super.destroy();
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
    if (replaceRow) /** @type {HTMLElement} */ (replaceRow).style.display = isReplace ? '' : 'none';
    if (replaceActions) /** @type {HTMLElement} */ (replaceActions).style.display = isReplace ? '' : 'none';
    if (title) title.textContent = isReplace ? this.context.locale.findReplace.findReplaceTitle : this.context.locale.findReplace.findTitle;
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.findReplace;
    const overlay = createElement('div', {
      class: 'an-dialog-overlay an-fr-dialog',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': L.findReplaceTitle,
    });
    const box = createElement('div', { class: 'an-dialog-box an-fr-box' });

    // ---- Header: [icon][title]  [×] ----
    const header = createElement('div', { class: 'an-fr-header' });
    const titleGroup = createElement('div', { class: 'an-dialog-title-group' });
    const iconEl = createElement('span', { class: 'an-dialog-icon an-dialog-icon--sm' });
    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = L.findTitle;
    titleGroup.append(iconEl, title);
    const closeBtn = createElement('button', {
      type: 'button',
      class: 'an-icon-close',
      title: L.close,
      'aria-label': L.close,
    });
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    this._closeBtn = closeBtn;
    header.append(titleGroup, closeBtn);
    box.appendChild(header);

    // ---- Search bar: [input] [Aa] [↑] [↓]  counter ----
    const searchBar = createElement('div', { class: 'an-fr-search-bar' });
    const findInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'text',
      class: 'an-input an-fr-input',
      placeholder: L.findPlaceholder,
      'aria-label': L.searchAriaLabel,
    }));
    this._findInput = findInput;

    // Case-sensitive toggle (visual button; hidden checkbox kept for state)
    const caseCheckbox = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'checkbox',
      style: 'display:none',
      'aria-hidden': 'true',
    }));
    this._caseCheckbox = caseCheckbox;
    const caseBtn = createElement('button', {
      type: 'button',
      class: 'an-fr-icon-btn',
      title: 'Case sensitive',
      'aria-label': 'Case sensitive',
    });
    caseBtn.textContent = 'Aa';

    const regexBtn = createElement('button', {
      type: 'button',
      class: 'an-fr-icon-btn',
      title: L.useRegex,
      'aria-label': L.useRegex,
    });
    regexBtn.textContent = '.*';

    const wholeWordBtn = createElement('button', {
      type: 'button',
      class: 'an-fr-icon-btn',
      title: L.wholeWord,
      'aria-label': L.wholeWord,
    });
    wholeWordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="2"/><line x1="7" y1="21" x2="7" y2="17"/><line x1="17" y1="21" x2="17" y2="17"/></svg>`;

    const prevBtn = createElement('button', {
      type: 'button',
      class: 'an-fr-icon-btn',
      title: 'Previous (Shift+Enter)',
      'aria-label': 'Previous',
    });
    prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;

    const nextBtn = createElement('button', {
      type: 'button',
      class: 'an-fr-icon-btn',
      title: 'Next (Enter)',
      'aria-label': 'Next',
    });
    nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

    const counter = createElement('span', { class: 'an-fr-counter' });
    this._counterEl = counter;

    searchBar.append(findInput, caseCheckbox, caseBtn, regexBtn, wholeWordBtn, prevBtn, nextBtn, counter);
    box.appendChild(searchBar);

    // ---- Replace row: [input] [Replace] [All]  (hidden by default) ----
    const replaceRow = createElement('div', { class: 'an-fr-replace-row' });
    replaceRow.style.display = 'none';
    const replaceInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'text',
      class: 'an-input an-fr-input',
      placeholder: L.replacePlaceholder,
      'aria-label': L.replaceAriaLabel,
    }));
    this._replaceInput = replaceInput;
    const replaceBtn = createElement('button', { type: 'button', class: 'an-btn an-fr-replace-btn' });
    replaceBtn.textContent = L.replaceBtn;
    const replaceAllBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary an-fr-replace-btn' });
    replaceAllBtn.textContent = L.replaceAllBtn;
    replaceRow.append(replaceInput, replaceBtn, replaceAllBtn);
    box.appendChild(replaceRow);

    // Compat div — _updateMode toggles this; kept empty so existing logic works
    const replaceActions = createElement('div', { class: 'an-fr-replace-actions' });
    replaceActions.style.display = 'none';
    box.appendChild(replaceActions);

    overlay.appendChild(box);
    makeDraggable(header, box);

    // ---- Event bindings ----
    const d1 = on(closeBtn, 'click', () => this._close());
    const d2 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    const d3 = on(findInput, 'input', () => this._onSearch());
    const d4 = on(caseBtn, 'click', () => {
      this._caseSensitive = !this._caseSensitive;
      caseCheckbox.checked = this._caseSensitive;
      caseBtn.classList.toggle('an-fr-icon-btn--active', this._caseSensitive);
      this._onSearch();
    });
    // Hidden checkbox change handler keeps backward-compat with programmatic toggles
    const d5 = on(caseCheckbox, 'change', () => {
      this._caseSensitive = caseCheckbox.checked;
      caseBtn.classList.toggle('an-fr-icon-btn--active', this._caseSensitive);
      this._onSearch();
    });
    const d6 = on(nextBtn, 'click', () => this._next());
    const d7 = on(prevBtn, 'click', () => this._prev());
    const d8 = on(replaceBtn, 'click', () => this._replace());
    const d9 = on(replaceAllBtn, 'click', () => this._replaceAll());
    const d10 = on(findInput, 'keydown', (e) => {
      const ke = /** @type {KeyboardEvent} */ (e);
      if (ke.key === 'Enter') {
        e.preventDefault();
        ke.shiftKey ? this._prev() : this._next();
      }
    });
    const d11 = on(replaceInput, 'keydown', (e) => {
      if (/** @type {KeyboardEvent} */ (e).key === 'Enter') {
        e.preventDefault();
        this._replace();
      }
    });
    const dRegex = on(regexBtn, 'click', () => {
      this._useRegex = !this._useRegex;
      regexBtn.classList.toggle('an-fr-icon-btn--active', this._useRegex);
      this._queryRegex = null; // force recompile
      this._lastQuery = null;
      this._onSearch();
    });
    const dWholeWord = on(wholeWordBtn, 'click', () => {
      this._wholeWord = !this._wholeWord;
      wholeWordBtn.classList.toggle('an-fr-icon-btn--active', this._wholeWord);
      this._queryRegex = null;
      this._lastQuery = null;
      this._onSearch();
    });
    this._disposers.push(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, dRegex, dWholeWord);

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
        void _; // surroundContents fails when the range crosses element boundaries
        this._matches.push({ mark: null });
      }
    }
    this._matches.reverse(); // O(n) — restore forward document order

    // Drop entries where wrapping failed so the counter and navigation are accurate
    this._matches = this._matches.filter((m) => m.mark);
    this._currentIndex = 0;
    if (this._matches.length === 0) return;

    // Highlight the first (current) match
    if (this._matches[0]?.mark) {
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
    // Reuse compiled regex when query, case-sensitivity, regex mode, and whole-word haven't changed
    if (this._lastQuery !== query || this._lastCaseSensitive !== this._caseSensitive || this._lastUseRegex !== this._useRegex || this._lastWholeWord !== this._wholeWord) {
      const flags = this._caseSensitive ? 'g' : 'gi';
      try {
        let pattern = this._useRegex
          ? query
          : query.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
        if (this._wholeWord) pattern = `\\b${pattern}\\b`;
        this._queryRegex = new RegExp(pattern, flags);
      } catch (_) {
        this._queryRegex = null;
      }
      this._lastQuery = query;
      this._lastCaseSensitive = this._caseSensitive;
      this._lastUseRegex = this._useRegex;
      this._lastWholeWord = this._wholeWord;
    }
    if (!this._queryRegex) return results;
    const re = this._queryRegex;

    // Cap results to prevent blocking the main thread on very large documents
    const MAX_RESULTS = 500;
    const walker = document.createTreeWalker(root, 0x4 /* NodeFilter.SHOW_TEXT */);
    let node = walker.nextNode();
    while (node && results.length < MAX_RESULTS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(/** @type {Text} */ (node).textContent)) !== null && results.length < MAX_RESULTS) {
        results.push({ node: /** @type {Text} */ (node), start: m.index, end: m.index + m[0].length });
      }
      node = walker.nextNode();
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
    if (!match?.mark) return;
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
    if (!match?.mark?.parentNode) return;

    const replacement = this._replaceInput ? this._replaceInput.value : '';
    const parent = match.mark.parentNode;
    const textNode = document.createTextNode(replacement);
    parent.insertBefore(textNode, match.mark);
    match.mark.remove();
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
      if (!mark?.parentNode) return;
      const textNode = document.createTextNode(replacement);
      mark.parentNode.insertBefore(textNode, mark);
      mark.remove();
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
      mark.remove();
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
      this._counterEl.textContent = query ? this.context.locale.findReplace.noResults : '';
    } else {
      this._counterEl.textContent = `${this._currentIndex + 1} / ${total}`;
    }
  }
}
