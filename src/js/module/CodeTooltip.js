// CodeTooltip.js - Hover tooltip for <pre> code blocks inside the editor
// Shows a horizontal action bar above (or below) the hovered code block,
// consistent in appearance and interaction with ImageTooltip / TableTooltip.
import { createElement, on } from '../core/dom.js';

const SHOW_DELAY = 100;
const HIDE_DELAY = 180;

// Cached regex for extracting language class — defined once at module level.
const _LANG_CLASS_RE = /language-(\S+)/;

const ICONS = {
  copy:       `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  wrapOn:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 0 1 0 6H3"/><polyline points="6 15 3 18 6 21"/></svg>`,
  toParagraph:`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M9 4h8a4 4 0 0 1 0 8H9V4z"/></svg>`,
  deleteCode: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
};

export class CodeTooltip {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this._el = null;
    this._activePre = null;
    this._showTimer = null;
    this._hideTimer = null;
    this._disposers = [];
    this._copyBtn = null;
    this._langSelect = null;
    this._prismScript = null; // script element while Prism is loading
  }

  initialize() {
    this._el = this._buildTooltip();
    document.body.appendChild(this._el);
    this._ensurePrism();

    const editable = this.context.layoutInfo.editable;

    this._disposers.push(
      on(editable, 'mouseover', (e) => {
        if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
        const pre = e.target.closest('pre');
        if (pre && editable.contains(pre)) {
          this._scheduleShow(pre);
        }
      }),
      on(editable, 'mouseout', (e) => {
        const to = e.relatedTarget;
        if (!to || (!editable.contains(to) && !this._el.contains(to))) {
          this._scheduleHide();
        }
      }),
      on(document, 'click', (e) => {
        if (this._activePre &&
          !this._activePre.contains(e.target) &&
          !this._el.contains(e.target)) {
          this._hide();
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
    const el = createElement('div', {
      class: 'an-link-tooltip an-code-tooltip',
      role: 'toolbar',
      'aria-label': 'Code block actions',
    });
    el.style.display = 'none';

    // Label
    this._label = createElement('span', { class: 'an-link-tooltip-url' });
    this._label.textContent = 'Code';
    el.appendChild(this._label);

    el.appendChild(this._sep());

    // Language selector
    this._langSelect = createElement('select', {
      class: 'an-code-lang-select',
      title: 'Syntax Language',
      'aria-label': 'Syntax language',
    });
    const LANGUAGES = [
      ['', 'Plain text'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
      ['python', 'Python'], ['html', 'HTML'], ['css', 'CSS'], ['json', 'JSON'],
      ['xml', 'XML'], ['bash', 'Bash / Shell'], ['sql', 'SQL'],
      ['java', 'Java'], ['csharp', 'C#'], ['php', 'PHP'], ['ruby', 'Ruby'],
      ['go', 'Go'], ['rust', 'Rust'], ['cpp', 'C++'], ['c', 'C'],
      ['kotlin', 'Kotlin'], ['swift', 'Swift'],
    ];
    LANGUAGES.forEach(([value, label]) => {
      const opt = createElement('option', { value });
      opt.textContent = label;
      this._langSelect.appendChild(opt);
    });
    this._disposers.push(on(this._langSelect, 'change', () => this._onLangChange()));
    el.appendChild(this._langSelect);

    el.appendChild(this._sep());

    // Copy code
    this._copyBtn = this._makeBtn(ICONS.copy, 'Copy Code', () => this._copyCode());

    el.appendChild(this._copyBtn);

    el.appendChild(this._sep());

    // Toggle word-wrap
    this._wrapBtn = this._makeBtn(ICONS.wrapOn, 'Toggle Word Wrap', () => this._toggleWrap());
    el.appendChild(this._wrapBtn);

    el.appendChild(this._sep());

    // Convert to normal paragraph
    el.appendChild(this._makeBtn(ICONS.toParagraph, 'Convert to Paragraph', () => this._toParagraph()));

    el.appendChild(this._sep());

    // Delete block
    el.appendChild(this._makeBtn(ICONS.deleteCode, 'Delete Code Block', () => this._delete(), true));

    // Keep tooltip alive while hovering it
    this._disposers.push(
      on(el, 'mouseenter', () => this._clearTimers()),
      on(el, 'mouseleave', () => this._scheduleHide()),
    );

    return el;
  }

  _sep() {
    return createElement('div', { class: 'an-link-tooltip-sep' });
  }

  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(icon, title, handler, isDanger = false) {
    const btn = createElement('button', {
      type: 'button',
      class: isDanger ? 'an-link-tooltip-btn an-link-tooltip-btn--danger' : 'an-link-tooltip-btn',
      title,
    });
    btn.innerHTML = icon;
    this._disposers.push(on(btn, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handler();
    }));
    return btn;
  }

  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------

  _scheduleShow(pre) {
    if (this._activePre === pre && this._el.style.display !== 'none') return;
    clearTimeout(this._hideTimer);
    this._hideTimer = null;
    clearTimeout(this._showTimer);
    this._showTimer = setTimeout(() => {
      this._activePre = pre;
      this._syncWrapBtn();
      this._syncLangSelect();
      this._show(pre);
    }, SHOW_DELAY);
  }

  _scheduleHide() {
    clearTimeout(this._showTimer);
    this._showTimer = null;
    // Always reset the hide timer so rapid mouseout→mouseover sequences
    // don't leave a stale timer that hides the tooltip prematurely.
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this._hide(), HIDE_DELAY);
  }

  _show(pre) {
    this._el.style.display = 'flex';
    this._positionNear(pre);
  }

  _hide() {
    this._el.style.display = 'none';
    this._activePre = null;
    this._clearTimers();
  }

  _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = null;
    this._hideTimer = null;
  }

  _positionNear(pre) {
    const rect   = pre.getBoundingClientRect();
    const tipW   = this._el.offsetWidth  || 260;
    const tipH   = this._el.offsetHeight || 32;
    const margin = 6;

    // Prefer above the block; fall back to below
    let top  = rect.top - tipH - margin;
    let left = rect.left + (rect.width - tipW) / 2;

    if (top < margin) top = rect.bottom + margin;
    if (left + tipW > window.innerWidth  - margin) left = window.innerWidth  - tipW - margin;
    if (left < margin) left = margin;

    // Tooltip uses position:fixed, so viewport coordinates are used directly.
    this._el.style.top  = `${top}px`;
    this._el.style.left = `${left}px`;
  }

  // ---------------------------------------------------------------------------
  // Sync wrap-button active state
  // ---------------------------------------------------------------------------

  _syncWrapBtn() {
    if (!this._activePre || !this._wrapBtn) return;
    const wrapped = (this._activePre.style.whiteSpace || '').includes('pre-wrap')
      || window.getComputedStyle(this._activePre).whiteSpace === 'pre-wrap';
    this._wrapBtn.classList.toggle('active', wrapped);
    this._wrapBtn.title = wrapped ? 'Disable Word Wrap' : 'Enable Word Wrap';
  }

  _syncLangSelect() {
    if (!this._activePre || !this._langSelect) return;
    const codeEl = this._activePre.querySelector('code');
    const fromAttr = this._activePre.getAttribute('data-language') || '';
    const fromClass = codeEl ? (_LANG_CLASS_RE.exec(codeEl.className) || [])[1] || '' : '';
    this._langSelect.value = fromAttr || fromClass || '';
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _copyCode() {
    const pre = this._activePre;
    if (!pre) return;
    const text = pre.textContent || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => this._flashCopied()).catch(() => {});
    } else {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); this._flashCopied(); } catch (_) {}
      document.body.removeChild(ta);
    }
  }

  _flashCopied() {
    if (!this._copyBtn) return;
    const original = this._copyBtn.innerHTML;
    this._copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    this._copyBtn.classList.add('an-link-tooltip-btn--copied');
    setTimeout(() => {
      if (this._copyBtn) {
        this._copyBtn.innerHTML = original;
        this._copyBtn.classList.remove('an-link-tooltip-btn--copied');
      }
    }, 1400);
  }

  _toggleWrap() {
    const pre = this._activePre;
    if (!pre) return;
    const isWrapped = pre.style.whiteSpace === 'pre-wrap';
    pre.style.whiteSpace = isWrapped ? 'pre' : 'pre-wrap';
    this._syncWrapBtn();
    this.context.invoke('editor.afterCommand');
    this._positionNear(pre);
  }

  _onLangChange() {
    const pre = this._activePre;
    if (!pre) return;
    const lang = this._langSelect.value;

    // Ensure a <code> child exists (Prism targets <pre><code class="language-xxx">)
    let codeEl = pre.querySelector('code');
    if (!codeEl) {
      codeEl = document.createElement('code');
      codeEl.innerHTML = pre.innerHTML;
      pre.innerHTML = '';
      pre.appendChild(codeEl);
    }

    codeEl.className = lang ? `language-${lang}` : '';
    // Mirror language class on <pre> so Prism CSS theme targets it (pre[class*='language-'])
    pre.className = lang ? `language-${lang}` : '';
    if (lang) {
      pre.setAttribute('data-language', lang);
    } else {
      pre.removeAttribute('data-language');
    }

    // Trigger Prism if available.
    // contenteditable stores line breaks as <br> elements; Prism reads textContent
    // which drops <br> entirely, collapsing all lines into one. Convert first.
    const applyPrism = () => {
      codeEl.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      window.Prism.highlightElement(codeEl);
      this.context.invoke('editor.afterCommand');
    };

    if (lang) {
      if (typeof window.Prism !== 'undefined') {
        // Grammar already loaded — highlight immediately
        if (window.Prism.languages[lang]) {
          applyPrism();
          return;
        }
        // Grammar not in core bundle — load the component script first
        this._loadPrismComponent(lang, applyPrism);
        return;
      } else if (this._prismScript) {
        // Prism core is still loading — highlight once it arrives, then load grammar if needed
        this._prismScript.addEventListener('load', () => {
          if (window.Prism.languages[lang]) {
            applyPrism();
          } else {
            this._loadPrismComponent(lang, applyPrism);
          }
        }, { once: true });
        return;
      }
    }

    this.context.invoke('editor.afterCommand');
  }

  /**
   * Loads Prism.js + CSS from CDN when options.codeHighlight is true.
   * Called once at initialize time. Fire-and-forget; errors are silent.
   */
  _ensurePrism() {
    if (!this.context.options.codeHighlight || window.Prism) return;
    const cdn = this.context.options.codeHighlightCDN;
    const themeHref = `${cdn}/themes/prism-tomorrow.min.css`;
    const scriptSrc = `${cdn}/prism.min.js`;

    if (!document.querySelector(`link[href="${themeHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = themeHref;
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      this._prismScript = window.Prism ? null : existingScript;
      return;
    }

    const script = document.createElement('script');
    script.dataset.manual = ''; // prevent auto-highlight on load
    script.src = scriptSrc;
    this._prismScript = script;
    script.addEventListener('load', () => { this._prismScript = null; }, { once: true });
    document.head.appendChild(script);
  }

  /**
   * Dynamically loads a Prism language component script if not already available.
   * Prism core only bundles: markup, css, clike, javascript.
   * All other grammars (bash, python, etc.) need a component file.
   * @param {string} lang  – Prism language slug (e.g. 'bash', 'python')
   * @param {Function} cb  – called once the grammar is ready
   */
  _loadPrismComponent(lang, cb) {
    const cdn = this.context.options.codeHighlightCDN;
    const src = `${cdn}/components/prism-${lang}.min.js`;
    // Avoid loading the same component twice
    if (document.querySelector(`script[src="${src}"]`)) {
      // Already in DOM — might still be loading; poll briefly then call cb
      const poll = setInterval(() => {
        if (window.Prism && window.Prism.languages[lang]) {
          clearInterval(poll);
          cb();
        }
      }, 50);
      setTimeout(() => clearInterval(poll), 3000); // give up after 3s
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.addEventListener('load', cb, { once: true });
    document.head.appendChild(s);
  }

  _toParagraph() {
    const pre = this._activePre;
    if (!pre) return;
    const editable = this.context.layoutInfo.editable;
    if (!editable) return;

    // Replace <pre> with <p> preserving lines as <br>
    const lines = (pre.textContent || '').split('\n');
    const p = document.createElement('p');
    lines.forEach((line, i) => {
      if (i > 0) p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(line));
    });

    pre.parentNode.replaceChild(p, pre);
    this._hide();
    this.context.invoke('editor.afterCommand');
  }

  _delete() {
    const pre = this._activePre;
    if (!pre) return;
    this._hide();
    if (pre.parentNode) pre.parentNode.removeChild(pre);
    this.context.invoke('editor.afterCommand');
  }
}
