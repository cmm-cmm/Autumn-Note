function pe(i, t, e) {
  return Math.min(Math.max(i, t), e);
}
function dt(i, t) {
  let e;
  return function(...s) {
    clearTimeout(e), e = setTimeout(() => i.apply(this, s), t);
  };
}
function fe(i, t) {
  let e = 0;
  return function(...s) {
    const n = Date.now();
    if (n - e >= t)
      return e = n, i.apply(this, s);
  };
}
function me(...i) {
  return (t) => i.reduceRight((e, s) => s(e), t);
}
function ge(i) {
  return i;
}
function ye(i) {
  return i == null;
}
function xe(i) {
  return typeof i == "string";
}
function ve(i) {
  return typeof i == "function";
}
function F(i, t) {
  const e = Object.assign({}, i);
  if (z(i) && z(t))
    for (const s of Object.keys(t))
      z(t[s]) && s in i ? e[s] = F(i[s], t[s]) : e[s] = t[s];
  return e;
}
function z(i) {
  return i !== null && typeof i == "object" && !Array.isArray(i);
}
function be(i) {
  return i ? {
    top: Math.round(i.top),
    left: Math.round(i.left),
    width: Math.round(i.width),
    height: Math.round(i.height),
    bottom: Math.round(i.bottom),
    right: Math.round(i.right)
  } : null;
}
const ut = 1, pt = 3, k = (i) => i && i.nodeType === ut, O = (i) => i && i.nodeType === pt, ft = (i) => k(i) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(i.nodeName), mt = (i) => k(i) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(i.nodeName), gt = (i) => k(i) && /^(li)$/i.test(i.nodeName), _e = (i) => k(i) && /^(ul|ol)$/i.test(i.nodeName), we = (i) => k(i) && i.nodeName.toUpperCase() === "TABLE", Ce = (i) => k(i) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(i.nodeName), yt = (i) => k(i) && i.isContentEditable, ke = (i) => k(i) && i.nodeName.toUpperCase() === "A", Ie = (i) => k(i) && i.nodeName.toUpperCase() === "IMG";
function B(i, t, e) {
  let s = i;
  for (; s && s !== e; ) {
    if (t(s)) return s;
    s = s.parentNode;
  }
  return null;
}
function N(i, t) {
  return B(i, mt, t);
}
function Me(i, t) {
  const e = [];
  let s = i.parentNode;
  for (; s && s !== t; )
    e.push(s), s = s.parentNode;
  return e;
}
function Ee(i) {
  return Array.from(i.childNodes);
}
function Ae(i) {
  let t = i.previousSibling;
  for (; t && !k(t); )
    t = t.previousSibling;
  return t;
}
function Le(i) {
  let t = i.nextSibling;
  for (; t && !k(t); )
    t = t.nextSibling;
  return t;
}
function l(i, t = {}, e = []) {
  const s = document.createElement(i);
  for (const [n, o] of Object.entries(t))
    s.setAttribute(n, o);
  for (const n of e)
    typeof n == "string" ? s.appendChild(document.createTextNode(n)) : s.appendChild(n);
  return s;
}
function Te(i) {
  i && i.parentNode && i.parentNode.removeChild(i);
}
function Se(i) {
  const t = i.parentNode;
  if (t) {
    for (; i.firstChild; )
      t.insertBefore(i.firstChild, i);
    t.removeChild(i);
  }
}
function ze(i, t) {
  return i.parentNode.insertBefore(t, i), t.appendChild(i), t;
}
function Re(i, t) {
  t.nextSibling ? t.parentNode.insertBefore(i, t.nextSibling) : t.parentNode.appendChild(i);
}
function Be(i) {
  return O(i) ? i.nodeValue : i.textContent || "";
}
function He(i) {
  return O(i) ? !i.nodeValue : ft(i) ? !1 : !i.textContent.trim() && !i.querySelector("img, video, hr, table");
}
function Ne(i) {
  return i.outerHTML;
}
function Pe(i) {
  const t = document.createRange();
  t.selectNodeContents(i), t.collapse(!1);
  const e = window.getSelection();
  e && (e.removeAllRanges(), e.addRange(t));
}
function je(i) {
  return !!B(i, yt);
}
function c(i, t, e, s) {
  return i.addEventListener(t, e, s), () => i.removeEventListener(t, e, s);
}
class H {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(t, e, s, n) {
    this.sc = t, this.so = e, this.ec = s, this.eo = n;
  }
  /** @returns {boolean} */
  isCollapsed() {
    return this.sc === this.ec && this.so === this.eo;
  }
  /** @returns {Range} */
  toNativeRange() {
    const t = document.createRange();
    try {
      t.setStart(this.sc, this.so), t.setEnd(this.ec, this.eo);
    } catch {
    }
    return t;
  }
  /**
   * Select this wrapped range in the window.
   */
  select() {
    const t = window.getSelection();
    t && (t.removeAllRanges(), t.addRange(this.toNativeRange()));
  }
  /**
   * Returns the common ancestor element of this range.
   * @returns {Element|null}
   */
  commonAncestor() {
    const e = this.toNativeRange().commonAncestorContainer;
    return k(e) ? e : e.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return B(this.sc, (e) => k(e) && e !== t, t);
  }
  /**
   * Returns either the selected text string or empty string.
   * @returns {string}
   */
  toString() {
    return this.toNativeRange().toString();
  }
  /**
   * Returns the bounding DOMRect of the range (or null).
   * @returns {DOMRect|null}
   */
  getClientRects() {
    const t = this.toNativeRange().getClientRects();
    return t.length > 0 ? t[t.length - 1] : null;
  }
  /**
   * Inserts a node at the start of this range.
   * @param {Node} node
   */
  insertNode(t) {
    this.toNativeRange().insertNode(t);
  }
  /**
   * Replaces the range contents with the given HTML string.
   * @param {string} html
   */
  pasteHTML(t) {
    const e = this.toNativeRange();
    e.deleteContents();
    const s = document.createRange().createContextualFragment(t);
    e.insertNode(s);
  }
}
function D(i) {
  return new H(
    i.startContainer,
    i.startOffset,
    i.endContainer,
    i.endOffset
  );
}
function P(i) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const e = t.getRangeAt(0);
  return i && !i.contains(e.commonAncestorContainer) ? null : D(e);
}
function Fe(i) {
  return new H(i, 0, i, i.childNodes.length);
}
function Oe(i, t = 0) {
  return new H(i, t, i, t);
}
function De(i) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : i.contains(t.getRangeAt(0).commonAncestorContainer);
}
function U(i) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    i(null);
    return;
  }
  const e = t.getRangeAt(0).cloneRange();
  i(D(e)), t.removeAllRanges(), t.addRange(e);
}
function Ue(i, t) {
  const e = i.splitText(t);
  return [i, e];
}
function u(i, t = null) {
  return document.execCommand(i, !1, t);
}
const $ = () => u("bold"), q = () => u("italic"), W = () => u("underline"), V = () => u("strikeThrough"), K = () => u("superscript"), Y = () => u("subscript"), xt = (i) => u("foreColor", i), vt = (i) => u("hiliteColor", i), X = (i) => u("fontName", i);
function bt(i) {
  u("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const e = document.createElement("span");
    for (e.style.fontSize = i, t.parentNode.insertBefore(e, t); t.firstChild; ) e.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const _t = (i) => u("formatBlock", `<${i}>`), G = () => u("justifyLeft"), J = () => u("justifyCenter"), Z = () => u("justifyRight"), Q = () => u("justifyFull"), tt = () => u("indent"), et = () => u("outdent"), it = () => u("insertUnorderedList"), st = () => u("insertOrderedList");
function wt(i, t) {
  const e = document.createElement("table");
  e.style.borderCollapse = "collapse", e.style.width = "100%";
  const s = document.createElement("tbody");
  for (let n = 0; n < i; n++) {
    const o = document.createElement("tr");
    for (let r = 0; r < t; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.style.minWidth = "40px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    s.appendChild(o);
  }
  e.appendChild(s), u("insertHTML", e.outerHTML);
}
function g(i, t, e, s, n) {
  return { name: i, icon: t, tooltip: e, action: s, isActive: n };
}
const Ct = g("bold", "bold", "Bold (Ctrl+B)", () => $(), () => document.queryCommandState("bold")), kt = g("italic", "italic", "Italic (Ctrl+I)", () => q(), () => document.queryCommandState("italic")), It = g("underline", "underline", "Underline (Ctrl+U)", () => W(), () => document.queryCommandState("underline")), Mt = g("strikethrough", "strikethrough", "Strikethrough", () => V(), () => document.queryCommandState("strikeThrough")), Et = g("superscript", "superscript", "Superscript", () => K(), () => document.queryCommandState("superscript")), At = g("subscript", "subscript", "Subscript", () => Y(), () => document.queryCommandState("subscript")), Lt = g("alignLeft", "align-left", "Align Left", () => G()), Tt = g("alignCenter", "align-center", "Align Center", () => J()), St = g("alignRight", "align-right", "Align Right", () => Z()), zt = g("alignJustify", "align-justify", "Justify", () => Q()), Rt = g("ul", "list-ul", "Unordered List", () => it()), Bt = g("ol", "list-ol", "Ordered List", () => st()), Ht = g("indent", "indent", "Indent", () => tt()), Nt = g("outdent", "outdent", "Outdent", () => et()), Pt = g("undo", "undo", "Undo (Ctrl+Z)", (i) => i.invoke("editor.undo")), jt = g("redo", "redo", "Redo (Ctrl+Y)", (i) => i.invoke("editor.redo")), Ft = g("hr", "minus", "Horizontal Rule", () => u("insertHorizontalRule")), Ot = g("link", "link", "Insert Link", (i) => i.invoke("linkDialog.show")), Dt = g("image", "image", "Insert Image", (i) => i.invoke("imageDialog.show")), Ut = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (i, t, e) => {
    wt(t, e), i.invoke("editor.afterCommand");
  }
}, $t = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (i, t) => X(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, qt = g("codeview", "code", "HTML Code View", (i) => i.invoke("codeview.toggle"), (i) => i.invoke("codeview.isActive")), Wt = g("fullscreen", "expand", "Fullscreen", (i) => i.invoke("fullscreen.toggle"), (i) => i.invoke("fullscreen.isActive")), Vt = [
  [$t],
  [Pt, jt],
  [Ct, kt, It, Mt],
  [Et, At],
  [Lt, Tt, St, zt],
  [Rt, Bt, Ht, Nt],
  [Ft, Ot, Dt, Ut],
  [qt, Wt]
], nt = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: Vt,
  // UI integration options
  // If `useBootstrap` is true, toolbar buttons will use the Bootstrap button classes
  // (set `toolbarButtonClass` to customize). Works with Bootstrap 4 and 5.
  useBootstrap: !1,
  bootstrapVersion: 5,
  toolbarButtonClass: "btn btn-sm btn-light",
  // Icon options — uses Font Awesome by default. Consumers must include Font Awesome CSS.
  useFontAwesome: !0,
  // Default FontAwesome prefix — 'fas' for FA5, 'fa-solid' for FA6. Change if needed.
  fontAwesomeClass: "fas",
  pasteAsPlainText: !1,
  pasteCleanHTML: !0,
  allowImageUpload: !0,
  maxImageSize: 5,
  tabSize: 0,
  onChange: null,
  onFocus: null,
  onBlur: null,
  onImageUpload: null,
  // Default font family applied to the editor and shown in the dropdown when no explicit font is set
  defaultFontFamily: "Arial",
  // Font families shown in the toolbar font-family dropdown
  fontFamilies: [
    "Arial",
    "Arial Black",
    "Comic Sans MS",
    "Courier New",
    "Georgia",
    "Impact",
    "Tahoma",
    "Times New Roman",
    "Trebuchet MS",
    "Verdana"
  ]
};
function Kt(i, t) {
  const e = l("div", { class: "asn-container" }), s = l("div", {
    class: "asn-editable",
    contenteditable: "true",
    spellcheck: "true",
    "aria-multiline": "true",
    "aria-label": "Rich text editor",
    role: "textbox"
  });
  i.tagName === "TEXTAREA" ? s.innerHTML = (i.value || "").trim() : s.innerHTML = (i.innerHTML || "").trim();
  const n = t.defaultFontFamily || t.fontFamilies && t.fontFamilies[0];
  return n && (s.style.fontFamily = n), t.height && (s.style.minHeight = `${t.height}px`), t.minHeight && (s.style.minHeight = `${t.minHeight}px`), t.maxHeight && (s.style.maxHeight = `${t.maxHeight}px`), e.appendChild(s), i.style.display = "none", i.insertAdjacentElement("afterend", e), { container: e, editable: s };
}
const Yt = 100;
class Xt {
  /**
   * @param {HTMLElement} editable - the contenteditable element
   */
  constructor(t) {
    this.editable = t, this.stack = [], this.stackOffset = -1, this._savePoint();
  }
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  _serialize() {
    return this.editable.innerHTML;
  }
  _savePoint() {
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1)), this.stack.push({ html: this._serialize() }), this.stack.length > Yt ? this.stack.shift() : this.stackOffset++;
  }
  _restore(t) {
    t && (this.editable.innerHTML = t.html);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /**
   * Records the current editor state as a history checkpoint.
   */
  recordUndo() {
    const t = this._serialize(), e = this.stack[this.stackOffset];
    e && e.html === t || this._savePoint();
  }
  /**
   * Undo to the previous state.
   */
  undo() {
    this.stackOffset <= 0 || (this.stackOffset--, this._restore(this.stack[this.stackOffset]));
  }
  /**
   * Redo to the next state.
   */
  redo() {
    this.stackOffset >= this.stack.length - 1 || (this.stackOffset++, this._restore(this.stack[this.stackOffset]));
  }
  /**
   * Resets the history stack (e.g. on editor destroy or full content replace).
   */
  reset() {
    this.stack = [], this.stackOffset = -1, this._savePoint();
  }
  /** @returns {boolean} */
  canUndo() {
    return this.stackOffset > 0;
  }
  /** @returns {boolean} */
  canRedo() {
    return this.stackOffset < this.stack.length - 1;
  }
}
function Gt(i, t) {
  const e = l("table", { class: "asn-table" }), s = l("tbody");
  e.appendChild(s);
  for (let n = 0; n < t; n++) {
    const o = l("tr");
    for (let r = 0; r < i; r++) {
      const a = l("td", {}, [" "]);
      o.appendChild(a);
    }
    s.appendChild(o);
  }
  return e;
}
function Jt(i, t) {
  const e = Gt(i, t);
  u("insertHTML", e.outerHTML);
}
const R = {
  BACKSPACE: "Backspace",
  TAB: "Tab",
  ENTER: "Enter",
  ESCAPE: "Escape",
  SPACE: " ",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
  END: "End",
  HOME: "Home",
  LEFT: "ArrowLeft",
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown",
  DELETE: "Delete",
  // Numbers
  NUM0: "0",
  NUM1: "1",
  NUM2: "2",
  NUM3: "3",
  NUM4: "4",
  NUM5: "5",
  NUM6: "6",
  NUM7: "7",
  NUM8: "8",
  // Letters
  B: "b",
  E: "e",
  I: "i",
  J: "j",
  K: "k",
  L: "l",
  R: "r",
  S: "s",
  U: "u",
  V: "v",
  Y: "y",
  Z: "z",
  SLASH: "/",
  PERIOD: "."
};
function T(i, t) {
  return i.key === t || i.key === t.toUpperCase();
}
function E(i, t) {
  return (i.ctrlKey || i.metaKey) && T(i, t);
}
function Zt(i, t, e = {}) {
  if (T(i, R.TAB)) {
    const s = P(t);
    if (!s) return !1;
    const n = N(s.sc, t);
    if (n && gt(n))
      return i.preventDefault(), i.shiftKey ? u("outdent") : u("indent"), !0;
    if (n && n.nodeName.toUpperCase() === "PRE")
      return i.preventDefault(), u("insertText", "    "), !0;
    if (e.tabSize)
      return i.preventDefault(), u("insertText", " ".repeat(e.tabSize)), !0;
  }
  if (T(i, R.ENTER) && !i.shiftKey) {
    const s = P(t);
    if (!s) return !1;
    const n = N(s.sc, t);
    if (n && n.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = s.toNativeRange();
      if (o.setStart(n, n.childNodes.length), o.toString() === "" && s.isCollapsed())
        return i.preventDefault(), u("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class Qt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._history = null, this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    const t = this.context.layoutInfo.editable;
    return this._history = new Xt(t), this._bindEvents(t), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._history = null;
  }
  // ---------------------------------------------------------------------------
  // Event binding
  // ---------------------------------------------------------------------------
  _bindEvents(t) {
    const e = (o) => this._onKeydown(o), s = () => this.afterCommand(), n = () => this.context.invoke("toolbar.refresh");
    this._disposers.push(
      c(t, "keydown", e),
      c(t, "keyup", s),
      c(document, "selectionchange", n)
    );
  }
  _onKeydown(t) {
    const e = this.context.layoutInfo.editable;
    if (!Zt(t, e, this.options)) {
      if (E(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (E(t, "z") && t.shiftKey || E(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (E(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (E(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (E(t, "u")) {
        t.preventDefault(), this.underline();
        return;
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Post-command hook — records undo, fires change event
  // ---------------------------------------------------------------------------
  afterCommand() {
    this._history && this._history.recordUndo(), this.context.triggerEvent("change", this.getHTML()), this.context.invoke("toolbar.refresh"), this.context.invoke("statusbar.update");
  }
  // ---------------------------------------------------------------------------
  // Focus management
  // ---------------------------------------------------------------------------
  focus() {
    this.context.layoutInfo.editable.focus();
  }
  // ---------------------------------------------------------------------------
  // Content API
  // ---------------------------------------------------------------------------
  /**
   * Returns the editor HTML content.
   * @returns {string}
   */
  getHTML() {
    return this.context.layoutInfo.editable.innerHTML;
  }
  /**
   * Sets the editor HTML content.
   * @param {string} html - HTML string (will be sanitised)
   */
  setHTML(t) {
    this.context.layoutInfo.editable.innerHTML = this._sanitise(t), this._history && this._history.reset(), this.afterCommand();
  }
  /**
   * Returns the editor plain text content.
   * @returns {string}
   */
  getText() {
    return this.context.layoutInfo.editable.innerText || "";
  }
  /**
   * Sets the editor content as plain text.
   * @param {string} text
   */
  setText(t) {
    this.context.layoutInfo.editable.textContent = t, this._history && this._history.reset(), this.afterCommand();
  }
  /**
   * Clears the editor content.
   */
  clear() {
    this.setHTML("");
  }
  // ---------------------------------------------------------------------------
  // Undo / redo
  // ---------------------------------------------------------------------------
  undo() {
    this._history && (this._history.undo(), this.context.triggerEvent("change", this.getHTML()));
  }
  redo() {
    this._history && (this._history.redo(), this.context.triggerEvent("change", this.getHTML()));
  }
  // ---------------------------------------------------------------------------
  // Style commands (delegated to Style module)
  // ---------------------------------------------------------------------------
  bold() {
    $(), this.afterCommand();
  }
  italic() {
    q(), this.afterCommand();
  }
  underline() {
    W(), this.afterCommand();
  }
  strikethrough() {
    V(), this.afterCommand();
  }
  superscript() {
    K(), this.afterCommand();
  }
  subscript() {
    Y(), this.afterCommand();
  }
  justifyLeft() {
    G(), this.afterCommand();
  }
  justifyCenter() {
    J(), this.afterCommand();
  }
  justifyRight() {
    Z(), this.afterCommand();
  }
  justifyFull() {
    Q(), this.afterCommand();
  }
  indent() {
    tt(), this.afterCommand();
  }
  outdent() {
    et(), this.afterCommand();
  }
  insertUL() {
    it(), this.afterCommand();
  }
  insertOL() {
    st(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(t) {
    _t(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(t) {
    xt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(t) {
    vt(t), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(t) {
    X(t), this.afterCommand();
  }
  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(t) {
    bt(t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    u("insertHorizontalRule"), this.afterCommand();
  }
  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(t, e, s = !1) {
    const n = window.getSelection();
    if (!n || n.rangeCount === 0) return;
    const o = this._sanitiseUrl(t);
    if (!o) return;
    if (!(n.toString().trim().length > 0))
      u("insertHTML", `<a href="${o}"${s ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e || o}</a>`);
    else if (u("createLink", o), s) {
      const a = this._getClosestAnchor();
      a && (a.setAttribute("target", "_blank"), a.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    u("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, e = "") {
    const s = this._sanitiseUrl(t);
    s && (u("insertHTML", `<img src="${s}" alt="${e}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, e) {
    Jt(t, e), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _getClosestAnchor() {
    const t = window.getSelection();
    if (!t || t.rangeCount === 0) return null;
    let e = t.getRangeAt(0).startContainer;
    for (; e; ) {
      if (e.nodeName === "A") return e;
      e = e.parentNode;
    }
    return null;
  }
  /**
   * Sanitises a URL, disallowing javascript: protocol.
   * @param {string} url
   * @returns {string|null}
   */
  _sanitiseUrl(t) {
    try {
      const e = new URL(t, window.location.href);
      return /^javascript:/i.test(e.protocol) ? null : t;
    } catch {
      return null;
    }
  }
  /**
   * Basic HTML sanitiser to prevent XSS on setHTML.
   * @param {string} html
   * @returns {string}
   */
  _sanitise(t) {
    const s = new DOMParser().parseFromString(`<body>${t}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((n) => {
      s.querySelectorAll(n).forEach((o) => o.remove());
    }), s.querySelectorAll("*").forEach((n) => {
      Array.from(n.attributes).forEach((o) => {
        o.name.startsWith("on") && n.removeAttribute(o.name), ["href", "src"].includes(o.name) && /^\s*javascript:/i.test(o.value) && n.removeAttribute(o.name);
      });
    }), s.body.innerHTML;
  }
}
class te {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this.el = null, this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this.el = l("div", { class: "asn-toolbar" }), this._buildButtons(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildButtons() {
    (this.options.toolbar || []).forEach((e) => {
      const s = l("div", { class: "asn-btn-group" });
      e.forEach((n) => {
        let o;
        n.type === "select" ? o = this._createSelect(n) : n.type === "grid" ? o = this._createGridPicker(n) : o = this._createButton(n), s.appendChild(o);
      }), this.el.appendChild(s);
    });
  }
  /**
   * Creates a table-grid picker button with a hoverable row/col selector popup.
   * @param {import('./Buttons.js').ButtonDef} def
   * @returns {HTMLDivElement}
   */
  _createGridPicker(t) {
    const n = l("div", { class: "asn-table-picker-wrap" }), r = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", a = l("button", {
      type: "button",
      class: r,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((v) => v.href).join(" ")))) {
      const v = this.options.fontAwesomeClass || "fas";
      a.innerHTML = `<i class="${v} fa-table" aria-hidden="true"></i>`;
    } else {
      const v = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${v} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const h = l("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), f = l("div", { class: "asn-table-grid" }), _ = l("div", { class: "asn-table-label" });
    _.textContent = "Insert Table";
    const m = [];
    for (let v = 1; v <= 10; v++)
      for (let C = 1; C <= 10; C++) {
        const I = l("div", {
          class: "asn-table-cell",
          "data-row": String(v),
          "data-col": String(C)
        });
        m.push(I), f.appendChild(I);
      }
    h.appendChild(f), h.appendChild(_);
    let w = !1;
    const b = (v, C) => {
      m.forEach((I) => {
        const S = +I.getAttribute("data-row"), ht = +I.getAttribute("data-col");
        I.classList.toggle("active", S <= v && ht <= C);
      }), _.textContent = v && C ? `${v} × ${C}` : "Insert Table";
    }, x = () => {
      w = !0, h.style.display = "block", a.setAttribute("aria-expanded", "true");
    }, L = () => {
      w = !1, h.style.display = "none", a.setAttribute("aria-expanded", "false"), b(0, 0);
    }, ot = c(a, "click", (v) => {
      v.stopPropagation(), w ? L() : x();
    }), rt = c(f, "mouseover", (v) => {
      const C = v.target.closest(".asn-table-cell");
      C && b(+C.getAttribute("data-row"), +C.getAttribute("data-col"));
    }), at = c(f, "mouseleave", () => b(0, 0)), lt = c(f, "click", (v) => {
      const C = v.target.closest(".asn-table-cell");
      if (!C) return;
      const I = +C.getAttribute("data-row"), S = +C.getAttribute("data-col");
      L(), this.context.invoke("editor.focus"), t.action(this.context, I, S);
    }), ct = c(document, "click", () => {
      w && L();
    });
    return this._disposers.push(ot, rt, at, lt, ct), n.appendChild(a), n.appendChild(h), n;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const e = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], s = l("select", {
      class: "asn-select",
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), n = l("option", { value: "" }, ["Font"]);
    s.appendChild(n), e.forEach((r) => {
      const a = l("option", { value: r }, [r]);
      a.style.fontFamily = r, s.appendChild(a);
    });
    const o = c(s, "change", (r) => {
      const a = r.target.value;
      a && (this.context.invoke("editor.focus"), t.action(this.context, a), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(o), s;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const s = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", n = t.className ? ` ${t.className}` : "", o = `${s}${n}`, r = l("button", {
      type: "button",
      class: o,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), a = !!this.options.useFontAwesome, d = () => {
      if (!a) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const x = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((L) => L.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(x);
    }, y = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', h = (x) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${y} style="display:block">${x}</svg>`, f = /* @__PURE__ */ new Map([
      // Format
      ["bold", h('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>')],
      ["italic", h('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>')],
      ["underline", h('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>')],
      ["strikethrough", h('<path d="M17.3 12H6.7"/><path d="M10 6.5C10 5.1 11.1 4 12.5 4c1.4 0 2.5 1.1 2.5 2.5 0 .8-.4 1.5-1 2"/><path d="M14 17.5C14 19 12.9 20 11.5 20 10.1 20 9 18.9 9 17.5c0-.8.4-1.5 1-2"/>')],
      ["superscript", h('<path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7.25C20 6 19 5 17.5 5S15 6 15 7"/>')],
      ["subscript", h('<path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 21h-4c0-1.5.44-2 1.5-2.5S20 17.33 20 16.25C20 15 19 14 17.5 14S15 15 15 16"/>')],
      // Alignment
      ["align-left", h('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>')],
      ["align-center", h('<line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      ["align-right", h('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>')],
      ["align-justify", h('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      // Lists
      ["list-ul", h('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>')],
      ["list-ol", h('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1V3"/><path d="M4 10h2l-2 2h2"/><path d="M4 16.5A1.5 1.5 0 0 1 5.5 15a1.5 1.5 0 0 1 0 3H4"/>')],
      ["indent", h('<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      ["outdent", h('<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      // History
      ["undo", h('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>')],
      ["redo", h('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>')],
      // Insert
      ["minus", h('<line x1="5" y1="12" x2="19" y2="12"/>')],
      ["link", h('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>')],
      ["image", h('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>')],
      ["table", h('<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>')],
      // View
      ["code", h('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", h('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')]
    ]), _ = this.options.fontAwesomeClass || "fas", m = /* @__PURE__ */ new Map([
      ["bold", "fa-bold"],
      ["italic", "fa-italic"],
      ["underline", "fa-underline"],
      ["strikethrough", "fa-strikethrough"],
      ["superscript", "fa-superscript"],
      ["subscript", "fa-subscript"],
      ["align-left", "fa-align-left"],
      ["align-center", "fa-align-center"],
      ["align-right", "fa-align-right"],
      ["align-justify", "fa-align-justify"],
      ["list-ul", "fa-list-ul"],
      ["list-ol", "fa-list-ol"],
      ["indent", "fa-indent"],
      ["outdent", "fa-outdent"],
      ["undo", "fa-rotate-left"],
      ["redo", "fa-rotate-right"],
      ["minus", "fa-minus"],
      ["link", "fa-link"],
      ["image", "fa-image"],
      ["code", "fa-code"],
      ["expand", "fa-expand"]
    ]);
    if (d()) {
      const x = m.get(t.icon) || m.get(t.name) || null;
      x ? r.innerHTML = `<i class="${_} ${x}" aria-hidden="true"></i>` : f.has(t.icon) ? r.innerHTML = f.get(t.icon) : r.textContent = t.icon || t.name;
    } else
      f.has(t.icon) ? r.innerHTML = f.get(t.icon) : f.has(t.name) ? r.innerHTML = f.get(t.name) : r.textContent = t.icon || t.name;
    const b = c(r, "click", (x) => {
      x.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(b), r;
  }
  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------
  refresh() {
    if (!this.el) return;
    const t = this.options.toolbar || [], e = new Map(t.flat().map((s) => [s.name, s]));
    this.el.querySelectorAll("button[data-btn]").forEach((s) => {
      const n = e.get(s.getAttribute("data-btn"));
      n && typeof n.isActive == "function" && s.classList.toggle("active", !!n.isActive(this.context));
    }), this.el.querySelectorAll("select[data-btn]").forEach((s) => {
      const n = e.get(s.getAttribute("data-btn"));
      if (!n || typeof n.getValue != "function") return;
      let o = (n.getValue(this.context) || "").replace(/["']/g, "").trim();
      o || (o = this.options.defaultFontFamily || this.options.fontFamilies && this.options.fontFamilies[0] || "");
      const r = Array.from(s.options).find(
        (a) => a.value && a.value.toLowerCase() === o.toLowerCase()
      );
      s.value = r ? r.value : "";
    });
  }
  /**
   * Shows the toolbar.
   */
  show() {
    this.el && (this.el.style.display = "");
  }
  /**
   * Hides the toolbar.
   */
  hide() {
    this.el && (this.el.style.display = "none");
  }
}
class ee {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this.el = null, this._disposers = [], this._wordCountEl = null, this._charCountEl = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    if (this.el = l("div", { class: "asn-statusbar" }), this.options.resizeable !== !1) {
      const e = l("div", {
        class: "asn-resize-handle",
        title: "Resize editor",
        "aria-hidden": "true"
      });
      this._bindResize(e), this.el.appendChild(e);
    }
    this._wordCountEl = l("span", { class: "asn-word-count" }), this._charCountEl = l("span", { class: "asn-char-count" });
    const t = l("div", { class: "asn-status-info" });
    return t.appendChild(this._wordCountEl), t.appendChild(this._charCountEl), this.el.appendChild(t), this._bindContentEvents(), this.update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Resize logic
  // ---------------------------------------------------------------------------
  _bindResize(t) {
    let e = 0, s = 0;
    const n = this.context.layoutInfo.editable, o = (y) => {
      const h = Math.max(100, s + y.clientY - e);
      n.style.height = `${h}px`;
    }, r = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r);
    }, d = c(t, "mousedown", (y) => {
      e = y.clientY, s = n.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", r), y.preventDefault();
    });
    this._disposers.push(d);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, e = dt(() => this.update(), 200), s = c(t, "input", e);
    this._disposers.push(s);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const e = this.context.layoutInfo.editable.innerText || "", s = e.trim() ? e.trim().split(/\s+/).length : 0, n = e.length;
    this._wordCountEl.textContent = `Words: ${s}`, this._charCountEl.textContent = `Chars: ${n}`;
  }
}
class ie {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = c(t, "paste", (s) => this._onPaste(s));
    return this._disposers.push(e), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Paste handler
  // ---------------------------------------------------------------------------
  _onPaste(t) {
    const e = t.clipboardData || window.clipboardData;
    if (!e || this.options.pasteAsPlainText === !1) return;
    t.preventDefault();
    let s = "";
    if (e.types.includes("text/html") && this.options.pasteCleanHTML !== !1) {
      const n = e.getData("text/html");
      s = this._sanitiseHTML(n), u("insertHTML", s);
    } else {
      s = e.getData("text/plain");
      const n = s.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      u("insertHTML", n);
    }
    this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  /**
   * Removes dangerous elements and attributes from an HTML string.
   * NOTE: This is a basic sanitiser. For production use, consider a dedicated
   * library such as DOMPurify.
   * @param {string} html
   * @returns {string}
   */
  _sanitiseHTML(t) {
    const s = new DOMParser().parseFromString(t, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form", "input", "button"].forEach((o) => {
      s.querySelectorAll(o).forEach((r) => r.parentNode.removeChild(r));
    }), s.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((r) => {
        r.name.startsWith("on") && o.removeAttribute(r.name);
      }), ["href", "src", "action"].forEach((r) => {
        const a = o.getAttribute(r);
        a && /^\s*javascript:/i.test(a) && o.removeAttribute(r);
      });
    }), s.body.innerHTML;
  }
  /**
   * Escapes HTML special characters.
   * @param {string} str
   * @returns {string}
   */
  _escapeHTML(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
class se {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = this.options.placeholder || "";
    e && (t.dataset.placeholder = e);
    const s = () => this._update(), n = c(t, "input", s), o = c(t, "focus", s), r = c(t, "blur", s);
    return this._disposers.push(n, o, r), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  _update() {
    const t = this.context.layoutInfo.editable, e = !t.textContent.trim() && !t.querySelector("img, table, hr");
    t.classList.toggle("asn-placeholder", e);
  }
}
class ne {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._active = !1, this._textarea = null, this._disposers = [];
  }
  initialize() {
    return this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._textarea && this._textarea.parentNode && this._textarea.parentNode.removeChild(this._textarea), this._textarea = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  toggle() {
    this._active ? this.deactivate() : this.activate();
  }
  isActive() {
    return this._active;
  }
  activate() {
    if (this._active) return;
    const { editable: t } = this.context.layoutInfo, e = t.innerHTML;
    this._textarea = l("textarea", {
      class: "asn-codeview",
      spellcheck: "false",
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off"
    }), this._textarea.value = this._prettyPrint(e), t.style.display = "none", t.parentNode.insertBefore(this._textarea, t.nextSibling), this._active = !0, this.context.invoke("toolbar.refresh");
  }
  deactivate() {
    if (!this._active || !this._textarea) return;
    const { editable: t } = this.context.layoutInfo;
    t.innerHTML = this._sanitise(this._textarea.value), this._textarea.parentNode.removeChild(this._textarea), this._textarea = null, t.style.display = "", this._active = !1, this.context.invoke("toolbar.refresh"), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  /**
   * Very simple HTML pretty-printer (indent nested tags).
   * @param {string} html
   * @returns {string}
   */
  _prettyPrint(t) {
    let e = 0;
    return t.replace(/>\s*</g, `>
<`).split(`
`).map((s) => {
      const n = s.trim();
      if (!n) return "";
      /^<\//.test(n) && (e = Math.max(0, e - 1));
      const o = "  ".repeat(e) + n;
      return /^<[^/][^>]*[^/]>/.test(n) && !/^<(br|hr|img|input|link|meta)/.test(n) && e++, o;
    }).filter(Boolean).join(`
`);
  }
  /**
   * Basic HTML sanitiser — removes script/dangerous elements.
   * @param {string} html
   * @returns {string}
   */
  _sanitise(t) {
    const s = new DOMParser().parseFromString(`<body>${t}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((n) => {
      s.querySelectorAll(n).forEach((o) => o.remove());
    }), s.querySelectorAll("*").forEach((n) => {
      Array.from(n.attributes).forEach((o) => {
        o.name.startsWith("on") && n.removeAttribute(o.name), ["href", "src"].includes(o.name) && /^\s*javascript:/i.test(o.value) && n.removeAttribute(o.name);
      });
    }), s.body.innerHTML;
  }
}
class oe {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = c(document, "keydown", (e) => {
      this._active && T(e, R.ESCAPE) && this.deactivate();
    });
    return this._disposers.push(t), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._active && this.deactivate();
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  toggle() {
    this._active ? this.deactivate() : this.activate();
  }
  isActive() {
    return this._active;
  }
  activate() {
    if (this._active) return;
    const t = this.context.layoutInfo.container, e = this.context.layoutInfo.editable;
    this._prevHeight = e.style.height, t.classList.add("asn-fullscreen"), e.style.height = "", document.body.style.overflow = "hidden", this._active = !0, this.context.invoke("toolbar.refresh");
  }
  deactivate() {
    if (!this._active) return;
    const t = this.context.layoutInfo.container, e = this.context.layoutInfo.editable;
    t.classList.remove("asn-fullscreen"), e.style.height = this._prevHeight, document.body.style.overflow = "", this._active = !1, this.context.invoke("toolbar.refresh");
  }
}
class re {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._dialog = null, this._disposers = [], this._savedRange = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /**
   * Opens the link dialog.
   * Pre-fills with the currently selected link if present.
   */
  show() {
    U((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = l("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), e = l("div", { class: "asn-dialog-box" }), s = l("h3", { class: "asn-dialog-title" });
    s.textContent = "Insert Link";
    const n = l("label", { class: "asn-label" });
    n.textContent = "URL";
    const o = l("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://",
      id: "asn-link-url",
      name: "url",
      autocomplete: "off"
    });
    this._urlInput = o;
    const r = l("label", { class: "asn-label" });
    r.textContent = "Display Text";
    const a = l("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Link text",
      id: "asn-link-text",
      name: "linkText",
      autocomplete: "off"
    });
    this._textInput = a;
    const d = l("label", { class: "asn-label asn-label-inline" }), y = l("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = y, d.appendChild(y), d.appendChild(document.createTextNode(" Open in new tab"));
    const h = l("div", { class: "asn-dialog-actions" }), f = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    f.textContent = "Insert";
    const _ = l("button", { type: "button", class: "asn-btn" });
    _.textContent = "Cancel", h.appendChild(f), h.appendChild(_), e.append(s, n, o, r, a, d, h), t.appendChild(e);
    const m = c(f, "click", () => this._onInsert()), w = c(_, "click", () => this._close()), b = c(t, "click", (x) => {
      x.target === t && this._close();
    });
    return this._disposers.push(m, w, b), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _prefill() {
    const t = window.getSelection();
    let e = null;
    if (t && t.rangeCount > 0) {
      let s = t.getRangeAt(0).startContainer;
      for (; s; ) {
        if (s.nodeName === "A") {
          e = s;
          break;
        }
        s = s.parentNode;
      }
    }
    e ? (this._urlInput.value = e.getAttribute("href") || "", this._textInput.value = e.textContent || "", this._tabCheckbox.checked = e.getAttribute("target") === "_blank") : (this._urlInput.value = "", this._textInput.value = t ? t.toString() : "", this._tabCheckbox.checked = !1);
  }
  _onInsert() {
    const t = this._urlInput.value.trim(), e = this._textInput.value.trim(), s = this._tabCheckbox.checked;
    if (!t) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertLink", t, e, s), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
class ae {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._dialog = null, this._disposers = [], this._savedRange = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  show() {
    U((t) => {
      this._savedRange = t;
    }), this._urlInput.value = "", this._altInput.value = "", this._fileInput && (this._fileInput.value = ""), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = l("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert image"
    }), e = l("div", { class: "asn-dialog-box" }), s = l("h3", { class: "asn-dialog-title" });
    s.textContent = "Insert Image";
    const n = l("label", { class: "asn-label" });
    n.textContent = "Image URL";
    const o = l("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://example.com/image.png",
      autocomplete: "off"
    });
    this._urlInput = o;
    const r = l("label", { class: "asn-label" });
    r.textContent = "Alt Text";
    const a = l("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Describe the image",
      autocomplete: "off"
    });
    if (this._altInput = a, this.options.allowImageUpload !== !1) {
      const w = l("label", { class: "asn-label" });
      w.textContent = "Or upload a file";
      const b = l("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = b;
      const x = c(b, "change", () => this._onFileChange());
      this._disposers.push(x), e.append(w, b);
    }
    const d = l("div", { class: "asn-dialog-actions" }), y = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    y.textContent = "Insert";
    const h = l("button", { type: "button", class: "asn-btn" });
    h.textContent = "Cancel", d.appendChild(y), d.appendChild(h), e.append(s, n, o, r, a, d), t.appendChild(e);
    const f = c(y, "click", () => this._onInsert()), _ = c(h, "click", () => this._close()), m = c(t, "click", (w) => {
      w.target === t && this._close();
    });
    return this._disposers.push(f, _, m), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _onFileChange() {
    const t = this._fileInput && this._fileInput.files && this._fileInput.files[0];
    if (!t || !t.type.startsWith("image/")) return;
    const e = (this.options.maxImageSize || 5) * 1024 * 1024;
    if (t.size > e) {
      alert(`Image file is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`), this._fileInput.value = "";
      return;
    }
    const s = new FileReader();
    s.onload = (n) => {
      this._urlInput.value = n.target.result;
    }, s.readAsDataURL(t);
  }
  _onInsert() {
    const t = this._urlInput.value.trim(), e = this._altInput.value.trim();
    if (!t) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertImage", t, e), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
const le = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class ce {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._activeImg = null, this._overlay = null, this._disposers = [];
  }
  initialize() {
    this._overlay = this._buildOverlay(), document.body.appendChild(this._overlay);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      c(t, "click", (e) => this._onEditorClick(e)),
      // Also select on right-click so the highlight shows before the context menu
      c(t, "contextmenu", (e) => {
        const s = e.target.closest("img");
        s && this._select(s);
      }),
      c(document, "click", (e) => this._onDocClick(e)),
      c(window, "scroll", () => this._updateOverlayPosition(), { passive: !0 }),
      c(window, "resize", () => this._updateOverlayPosition()),
      c(t, "scroll", () => this._updateOverlayPosition(), { passive: !0 })
    ), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._deselect(), this._overlay && this._overlay.parentNode && this._overlay.parentNode.removeChild(this._overlay), this._overlay = null;
  }
  // ---------------------------------------------------------------------------
  // Public API used by other modules
  // ---------------------------------------------------------------------------
  /** @returns {HTMLImageElement|null} */
  getActiveImage() {
    return this._activeImg;
  }
  /** Re-sync overlay position (call after external size changes). */
  updateOverlay() {
    this._updateOverlayPosition();
  }
  /** Programmatically clear the current image selection. */
  deselect() {
    this._deselect();
  }
  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------
  _buildOverlay() {
    const t = document.createElement("div");
    return t.className = "asn-image-resizer", t.style.display = "none", le.forEach(({ pos: e }) => {
      const s = document.createElement("div");
      s.className = `asn-resize-handle asn-resize-${e}`, s.dataset.handle = e, this._disposers.push(
        c(s, "mousedown", (n) => {
          n.preventDefault(), n.stopPropagation(), this._startResize(n, e);
        })
      ), t.appendChild(s);
    }), t;
  }
  _onEditorClick(t) {
    const e = t.target.closest("img");
    e && (t.preventDefault(), this._select(e));
  }
  _onDocClick(t) {
    this._activeImg && t.target !== this._activeImg && (this._overlay && this._overlay.contains(t.target) || t.target.closest(".asn-contextmenu") || this._deselect());
  }
  _select(t) {
    this._activeImg && this._activeImg !== t && this._activeImg.classList.remove("asn-image-selected"), this._activeImg = t, t.classList.add("asn-image-selected"), this._updateOverlayPosition(), this._overlay.style.display = "block";
  }
  _deselect() {
    this._activeImg && (this._activeImg.classList.remove("asn-image-selected"), this._activeImg = null), this._overlay && (this._overlay.style.display = "none");
  }
  _updateOverlayPosition() {
    if (!this._activeImg || !this._overlay) return;
    const t = this._activeImg.getBoundingClientRect();
    this._overlay.style.left = `${t.left}px`, this._overlay.style.top = `${t.top}px`, this._overlay.style.width = `${t.width}px`, this._overlay.style.height = `${t.height}px`;
  }
  _startResize(t, e) {
    const s = this._activeImg;
    if (!s) return;
    const n = t.clientX, o = t.clientY, r = s.offsetWidth || s.naturalWidth || 100, a = s.offsetHeight || s.naturalHeight || 100, d = r / a, y = e.length === 2, h = (_) => {
      const m = _.clientX - n, w = _.clientY - o;
      let b = r, x = a;
      e.includes("e") && (b = Math.max(20, r + m)), e.includes("w") && (b = Math.max(20, r - m)), e.includes("s") && (x = Math.max(20, a + w)), e.includes("n") && (x = Math.max(20, a - w)), y && (Math.abs(m) >= Math.abs(w) ? x = Math.max(20, Math.round(b / d)) : b = Math.max(20, Math.round(x * d))), s.style.width = `${b}px`, s.style.height = `${x}px`, this._updateOverlayPosition();
    }, f = () => {
      document.removeEventListener("mousemove", h), document.removeEventListener("mouseup", f), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", h), document.addEventListener("mouseup", f);
  }
}
const p = {
  undo: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
  redo: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>',
  cut: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="20" r="3"/><circle cx="6" cy="4" r="3"/><line x1="19" y1="5" x2="6" y2="19"/><line x1="19" y1="19" x2="13.5" y2="13.5"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  paste: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
  bold: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
  italic: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
  underline: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  image: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  // Table operations
  rowAbove: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v7"/><path d="M9 7l3-4 3 4"/></svg>',
  rowBelow: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 12v7"/><path d="M9 17l3 4 3-4"/></svg>',
  colLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 12h7"/><path d="M7 8l-4 4 4 4"/></svg>',
  colRight: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 12h9"/><path d="M17 8l4 4-4 4"/></svg>',
  deleteRow: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/></svg>',
  deleteCol: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="21" y2="12"/><line x1="21" y1="6" x2="15" y2="12"/></svg>',
  mergeCells: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="8" height="10" rx="1"/><rect x="14" y="7" width="8" height="10" rx="1"/><path d="M10 12h4"/><path d="M12 10l2 2-2 2"/></svg>',
  colWidth: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="7" y1="12" x2="17" y2="12"/><path d="M10 9l-3 3 3 3"/><path d="M14 9l3 3-3 3"/></svg>',
  rowHeight: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/></svg>',
  table: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  deleteTable: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444"/><line x1="22" y1="16" x2="16" y2="22" stroke="#ef4444"/></svg>',
  back: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  // Image format operations
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteImg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, he = [
  { name: "undo", label: "Undo", icon: p.undo, action: (i) => i.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: p.redo, action: (i) => i.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: p.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: p.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: p.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: p.bold, action: (i) => i.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: p.italic, action: (i) => i.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: p.underline, action: (i) => i.invoke("editor.underline") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: p.link, action: (i) => i.invoke("linkDialog.show") },
  { name: "image", label: "Insert Image", icon: p.image, action: (i) => i.invoke("imageDialog.show") }
];
class de {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || he, this.el = null, this._disposers = [], this._menuDisposers = [], this._targetCell = null, this._sizePopover = null, this._lastX = 0, this._lastY = 0;
  }
  initialize() {
    this.el = l("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover), this._renderItems(this._items);
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    return t && this._disposers.push(c(t, "contextmenu", (e) => this._onContextMenu(e))), this._disposers.push(c(document, "click", (e) => this._maybeHide(e))), this._disposers.push(c(document, "keydown", (e) => {
      e.key === "Escape" && this.hide();
    })), this._disposers.push(c(window, "scroll", () => this.hide(), { passive: !0 })), this;
  }
  destroy() {
    this._menuDisposers.forEach((t) => {
      try {
        t();
      } catch {
      }
    }), this._menuDisposers = [], this._disposers.forEach((t) => {
      try {
        t();
      } catch {
      }
    }), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null, this._sizePopover && this._sizePopover.parentNode && this._sizePopover.parentNode.removeChild(this._sizePopover), this._sizePopover = null;
  }
  _renderItems(t) {
    this._menuDisposers.forEach((e) => e()), this._menuDisposers = [], this.el && (this.el.innerHTML = "", t.forEach((e) => {
      if (e.separator || e.sep) {
        this.el.appendChild(l("div", { class: "asn-context-sep" }));
        return;
      }
      if (e.back) {
        const o = l("button", { type: "button", class: "asn-context-back" }), r = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
        r.innerHTML = p.back, o.appendChild(r), o.appendChild(l("span", { class: "asn-context-label" }, [e.label || "Back"]));
        const a = c(o, "click", (d) => {
          d.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(a), this.el.appendChild(o);
        return;
      }
      if (e.navigate) {
        const o = l("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": e.name || "" });
        if (e.icon) {
          const d = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
          d.innerHTML = e.icon, o.appendChild(d);
        }
        o.appendChild(l("span", { class: "asn-context-label" }, [e.label || e.name]));
        const r = l("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        r.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', o.appendChild(r);
        const a = c(o, "click", (d) => {
          d.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(a), this.el.appendChild(o);
        return;
      }
      const s = l("button", { type: "button", class: "asn-context-item", "data-name": e.name || "" });
      if (e.icon) {
        const o = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
        o.innerHTML = e.icon, s.appendChild(o);
      }
      s.appendChild(l("span", { class: "asn-context-label" }, [e.label || e.name]));
      const n = c(s, "click", (o) => {
        o.stopPropagation(), this.hide();
        try {
          e.action(this.context);
        } catch (r) {
          console.error(r);
        }
      });
      this._menuDisposers.push(n), this.el.appendChild(s);
    }));
  }
  _onContextMenu(t) {
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!e || !e.contains(t.target)) return;
    t.preventDefault(), this._lastX = t.clientX, this._lastY = t.clientY;
    const s = t.target.closest("img"), n = !s && t.target.closest("td, th");
    this._targetCell = n || null;
    const o = s ? this._buildCombinedImageItems(s) : n ? this._buildCombinedItems(n) : this._items;
    this._renderItems(o), this.showAt(t.clientX, t.clientY);
  }
  _maybeHide(t) {
    this.el && (this.el.contains(t.target) || this.hide());
  }
  showAt(t, e) {
    this.el && (this.el.style.display = "block", this._reposition(t, e), this.el.setAttribute("aria-hidden", "false"));
  }
  _reposition(t, e) {
    if (!this.el) return;
    const s = t !== void 0 ? t : this._lastX, n = e !== void 0 ? e : this._lastY, o = this.el.getBoundingClientRect();
    let r = s, a = n;
    r + o.width > window.innerWidth && (r = window.innerWidth - o.width - 8), a + o.height > window.innerHeight && (a = window.innerHeight - o.height - 8), this.el.style.left = `${r}px`, this.el.style.top = `${a}px`;
  }
  hide() {
    this.el && (this.el.style.display = "none", this.el.setAttribute("aria-hidden", "true"));
  }
  // ---------------------------------------------------------------------------
  // Image context menu items
  // ---------------------------------------------------------------------------
  /** Default items + "Image Format ▶" when right-clicking on an image. */
  _buildCombinedImageItems(t) {
    return [
      ...this._items,
      { separator: !0 },
      {
        name: "imageFormat",
        label: "Image Format",
        icon: p.image,
        navigate: () => this._buildImageSubItems(t)
      }
    ];
  }
  /** Image sub-menu with ← Back at the top. */
  _buildImageSubItems(t) {
    return [
      { back: !0, label: "Image Format", navigate: () => this._buildCombinedImageItems(t) },
      { separator: !0 },
      { name: "floatLeft", label: "Float Left", icon: p.floatLeft, action: () => this._setImageFloat(t, "left") },
      { name: "floatRight", label: "Float Right", icon: p.floatRight, action: () => this._setImageFloat(t, "right") },
      { name: "floatNone", label: "Float None", icon: p.floatNone, action: () => this._setImageFloat(t, "") },
      { separator: !0 },
      { name: "originalSize", label: "Original Size", icon: p.originalSize, action: () => this._resetImageSize(t) },
      { separator: !0 },
      { name: "deleteImg", label: "Delete Image", icon: p.deleteImg, action: () => this._deleteImage(t) }
    ];
  }
  // ---------------------------------------------------------------------------
  // Image operations
  // ---------------------------------------------------------------------------
  _setImageFloat(t, e) {
    t.style.float = e, e === "left" ? (t.style.marginRight = "12px", t.style.marginLeft = "") : e === "right" ? (t.style.marginLeft = "12px", t.style.marginRight = "") : (t.style.marginLeft = "", t.style.marginRight = ""), this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay");
  }
  _resetImageSize(t) {
    t.style.width = "", t.style.height = "", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay");
  }
  _deleteImage(t) {
    this.context.invoke("imageResizer.deselect"), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Table context menu items
  // ---------------------------------------------------------------------------
  /** Default items + "Table Format ▶" entry when right-clicking inside a cell. */
  _buildCombinedItems(t) {
    return [
      ...this._items,
      { separator: !0 },
      {
        name: "tableFormat",
        label: "Table Format",
        icon: p.table,
        navigate: () => this._buildTableSubItems(t)
      }
    ];
  }
  /** Table sub-menu with ← Back at the top. */
  _buildTableSubItems(t) {
    return [
      { back: !0, label: "Table Format", navigate: () => this._buildCombinedItems(t) },
      { separator: !0 },
      { name: "addRowAbove", label: "Add Row Above", icon: p.rowAbove, action: () => this._addRow(t, "above") },
      { name: "addRowBelow", label: "Add Row Below", icon: p.rowBelow, action: () => this._addRow(t, "below") },
      { separator: !0 },
      { name: "addColLeft", label: "Add Column Left", icon: p.colLeft, action: () => this._addColumn(t, "left") },
      { name: "addColRight", label: "Add Column Right", icon: p.colRight, action: () => this._addColumn(t, "right") },
      { separator: !0 },
      { name: "deleteRow", label: "Delete Row", icon: p.deleteRow, action: () => this._deleteRow(t) },
      { name: "deleteCol", label: "Delete Column", icon: p.deleteCol, action: () => this._deleteColumn(t) },
      { separator: !0 },
      { name: "mergeCells", label: "Merge Cells", icon: p.mergeCells, action: () => this._mergeCells(t) },
      { separator: !0 },
      { name: "colWidth", label: "Column Width…", icon: p.colWidth, action: () => this._openSizePopover("col", t) },
      { name: "rowHeight", label: "Row Height…", icon: p.rowHeight, action: () => this._openSizePopover("row", t) },
      { separator: !0 },
      { name: "deleteTable", label: "Delete Table", icon: p.deleteTable, action: () => this._deleteTable(t) }
    ];
  }
  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------
  _addRow(t, e) {
    const s = t.closest("tr");
    if (!s) return;
    const n = Array.from(s.cells).reduce((r, a) => r + (a.colSpan || 1), 0), o = document.createElement("tr");
    for (let r = 0; r < n; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    e === "above" ? s.parentElement.insertBefore(o, s) : s.insertAdjacentElement("afterend", o), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t, e) {
    const s = t.closest("tr"), n = t.closest("table");
    if (!s || !n) return;
    const o = Array.from(s.cells).indexOf(t);
    Array.from(n.querySelectorAll("tr")).forEach((r) => {
      const a = Array.from(r.cells), d = document.createElement("td");
      d.style.border = "1px solid #dee2e6", d.style.padding = "6px 12px", d.innerHTML = "&#8203;";
      const y = e === "left" ? a[o] : a[o + 1] || null;
      r.insertBefore(d, y);
    }), this.context.invoke("editor.afterCommand");
  }
  _deleteRow(t) {
    const e = t.closest("tr"), s = t.closest("table");
    !e || !s || s.querySelectorAll("tr").length <= 1 || (e.parentElement.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
  _deleteColumn(t) {
    const e = t.closest("tr"), s = t.closest("table");
    if (!e || !s || e.cells.length <= 1) return;
    const n = Array.from(e.cells).indexOf(t);
    Array.from(s.querySelectorAll("tr")).forEach((o) => {
      const r = o.cells[n];
      r && o.removeChild(r);
    }), this.context.invoke("editor.afterCommand");
  }
  _deleteTable(t) {
    const e = t.closest("table");
    e && (e.parentNode.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
  _mergeCells(t) {
    const e = t.closest("tr");
    if (!e) return;
    const s = window.getSelection();
    if (!s || s.rangeCount === 0) return;
    const n = s.getRangeAt(0), o = Array.from(e.cells).filter((a) => {
      try {
        return n.intersectsNode(a);
      } catch {
        return !1;
      }
    });
    if (o.length < 2) return;
    const r = o[0];
    r.colSpan = o.reduce((a, d) => a + (d.colSpan || 1), 0), r.innerHTML = o.map((a) => a.innerHTML).join(""), o.slice(1).forEach((a) => e.removeChild(a)), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------
  _buildSizePopover() {
    const t = l("div", { class: "asn-size-popover" });
    t.style.display = "none";
    const e = l("div", { class: "asn-size-popover-title" }), s = l("div", { class: "asn-size-popover-body" }), n = l("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), o = l("span", { class: "asn-size-unit" }, ["px"]);
    s.appendChild(n), s.appendChild(o);
    const r = l("div", { class: "asn-size-popover-actions" }), a = l("button", { type: "button", class: "asn-btn" });
    a.textContent = "Cancel";
    const d = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    d.textContent = "Apply", r.appendChild(a), r.appendChild(d), t.appendChild(e), t.appendChild(s), t.appendChild(r), this._sizeTitleEl = e, this._sizeInputEl = n, this._sizeApply = null;
    const y = c(d, "click", () => {
      const m = parseInt(this._sizeInputEl.value, 10);
      m > 0 && typeof this._sizeApply == "function" && this._sizeApply(m), this._hideSizePopover();
    }), h = c(a, "click", () => this._hideSizePopover()), f = c(n, "keydown", (m) => {
      m.key === "Enter" && (m.preventDefault(), d.click()), m.key === "Escape" && this._hideSizePopover();
    }), _ = c(document, "click", (m) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(m.target) && this._hideSizePopover();
    });
    return this._disposers.push(y, h, f, _), t;
  }
  _openSizePopover(t, e) {
    if (!this._sizePopover) return;
    const s = t === "col";
    this._sizeTitleEl.textContent = s ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = s ? e.offsetWidth || 120 : e.closest("tr") && e.closest("tr").offsetHeight || 40, this._sizeApply = (n) => {
      if (s) {
        const o = e.closest("table"), r = Array.from(e.closest("tr").cells).indexOf(e);
        Array.from(o.querySelectorAll("tr")).forEach((a) => {
          const d = a.cells[r];
          d && (d.style.width = `${n}px`, d.style.minWidth = `${n}px`);
        });
      } else {
        const o = e.closest("tr");
        o && Array.from(o.cells).forEach((r) => {
          r.style.height = `${n}px`;
        });
      }
      this.context.invoke("editor.afterCommand");
    }, this._sizePopover.style.display = "block", requestAnimationFrame(() => {
      if (!this._sizePopover) return;
      const n = this._sizePopover.offsetWidth || 220, o = this._sizePopover.offsetHeight || 110;
      let r = this._lastX, a = this._lastY;
      r + n > window.innerWidth && (r = window.innerWidth - n - 8), a + o > window.innerHeight && (a = window.innerHeight - o - 8), this._sizePopover.style.left = `${r}px`, this._sizePopover.style.top = `${a}px`, this._sizeInputEl && (this._sizeInputEl.focus(), this._sizeInputEl.select());
    });
  }
  _hideSizePopover() {
    this._sizePopover && (this._sizePopover.style.display = "none"), this._sizeApply = null;
  }
}
class ue {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, e = {}) {
    this.targetEl = t, this.options = F(nt, e), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: e } = Kt(this.targetEl, this.options);
    this.layoutInfo.container = t, this.layoutInfo.editable = e, this._registerModules();
    const s = this._modules.get("toolbar");
    s && s.el && (t.insertBefore(s.el, e), this.layoutInfo.toolbar = s.el);
    const n = this._modules.get("statusbar");
    return n && n.el && (t.appendChild(n.el), this.layoutInfo.statusbar = n.el), this._bindEditorEvents(e), this.options.focus && e.focus(), this._alive = !0, this.invoke("toolbar.refresh"), this;
  }
  _registerModules() {
    const t = (e, s) => {
      const n = new s(this);
      n.initialize(), this._modules.set(e, n);
    };
    t("editor", Qt), t("toolbar", te), t("statusbar", ee), t("clipboard", ie), t("contextMenu", de), t("placeholder", se), t("codeview", ne), t("fullscreen", oe), t("linkDialog", re), t("imageDialog", ae), t("imageResizer", ce);
  }
  _bindEditorEvents(t) {
    const e = c(t, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), s = c(t, "blur", () => {
      this.layoutInfo.container.classList.remove("asn-focused"), this._syncToTarget(), typeof this.options.onBlur == "function" && this.options.onBlur(this);
    });
    this._disposers.push(e, s);
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
  invoke(t, ...e) {
    const [s, n] = t.split("."), o = this._modules.get(s);
    if (o && typeof o[n] == "function")
      return o[n](...e);
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
  on(t, e) {
    return this._listeners.has(t) || this._listeners.set(t, []), this._listeners.get(t).push(e), () => this.off(t, e);
  }
  /**
   * Unsubscribes from an editor event.
   * @param {string} eventName
   * @param {Function} handler
   */
  off(t, e) {
    const s = this._listeners.get(t);
    if (!s) return;
    const n = s.indexOf(e);
    n !== -1 && s.splice(n, 1);
  }
  /**
   * Triggers an editor event.
   * @param {string} eventName
   * @param {...*} args
   */
  triggerEvent(t, ...e) {
    (this._listeners.get(t) || []).forEach((o) => o(...e));
    const n = "on" + t.charAt(0).toUpperCase() + t.slice(1);
    typeof this.options[n] == "function" && this.options[n](...e);
  }
  // ---------------------------------------------------------------------------
  // Public editor API
  // ---------------------------------------------------------------------------
  /**
   * Returns the current HTML content of the editor.
   * @returns {string}
   */
  getHTML() {
    return this.invoke("editor.getHTML");
  }
  /**
   * Sets the HTML content of the editor.
   * @param {string} html
   */
  setHTML(t) {
    this.invoke("editor.setHTML", t);
  }
  /**
   * Returns the plain text content of the editor.
   * @returns {string}
   */
  getText() {
    return this.invoke("editor.getText");
  }
  /**
   * Clears the editor content.
   */
  clear() {
    this.invoke("editor.clear");
  }
  /**
   * Sets whether the editor is disabled (readonly).
   * @param {boolean} disabled
   */
  setDisabled(t) {
    const e = this.layoutInfo.editable;
    t ? (e.setAttribute("contenteditable", "false"), this.layoutInfo.container.classList.add("asn-disabled")) : (e.setAttribute("contenteditable", "true"), this.layoutInfo.container.classList.remove("asn-disabled"));
  }
  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------
  /**
   * Completely removes the editor and restores the original element.
   */
  destroy() {
    if (!this._alive) return;
    this._modules.forEach((e) => {
      typeof e.destroy == "function" && e.destroy();
    }), this._modules.clear(), this._disposers.forEach((e) => e()), this._disposers = [];
    const t = this.layoutInfo.container;
    t && t.parentNode && (this.targetEl.style.display = "", t.parentNode.removeChild(t)), this._alive = !1, this._listeners.clear();
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  /**
   * Syncs editor HTML back into the original textarea/input for form submission.
   */
  _syncToTarget() {
    (this.targetEl.tagName === "TEXTAREA" || this.targetEl.tagName === "INPUT") && (this.targetEl.value = this.getHTML());
  }
}
function $e(i) {
  return i[i.length - 1];
}
function qe(i) {
  return i[0];
}
function We(i, t = 1) {
  return i.slice(0, i.length - t);
}
function Ve(i, t = 1) {
  return i.slice(t);
}
function Ke(i) {
  return i.reduce((t, e) => t.concat(e), []);
}
function Ye(i) {
  return [...new Set(i)];
}
function Xe(i, t) {
  const e = [];
  for (let s = 0; s < i.length; s += t)
    e.push(i.slice(s, s + t));
  return e;
}
function Ge(i, t) {
  return i.reduce((e, s) => {
    const n = t(s);
    return e[n] || (e[n] = []), e[n].push(s), e;
  }, {});
}
function Je(i, t) {
  return i.every(t);
}
function Ze(i, t) {
  return i.some(t);
}
const M = navigator.userAgent, Qe = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(M),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(M),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(M),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(M),
  /** True if running on macOS */
  isMac: /Macintosh/.test(M),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(M),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(M) ? "metaKey" : "ctrlKey"
}, A = /* @__PURE__ */ new WeakMap(), ti = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(i, t = {}) {
    const s = j(i).map((n) => {
      if (A.has(n)) return A.get(n);
      const o = new ue(n, t);
      return o.initialize(), A.set(n, o), o;
    });
    return s.length === 1 ? s[0] : s;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(i) {
    j(i).forEach((t) => {
      const e = A.get(t);
      e && (e.destroy(), A.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(i) {
    const t = typeof i == "string" ? document.querySelector(i) : i;
    return t && A.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: nt,
  /** Library version */
  version: "1.0.0"
};
function j(i) {
  return typeof i == "string" ? Array.from(document.querySelectorAll(i)) : i instanceof Element ? [i] : i instanceof NodeList || Array.isArray(i) ? Array.from(i) : [];
}
export {
  ue as Context,
  ut as ELEMENT_NODE,
  pt as TEXT_NODE,
  H as WrappedRange,
  Je as all,
  Me as ancestors,
  Ze as any,
  Ee as children,
  Xe as chunk,
  pe as clamp,
  B as closest,
  N as closestPara,
  Oe as collapsedRange,
  me as compose,
  l as createElement,
  P as currentRange,
  dt as debounce,
  ti as default,
  nt as defaultOptions,
  Qe as env,
  qe as first,
  Ke as flatten,
  D as fromNativeRange,
  Ge as groupBy,
  ge as identity,
  We as initial,
  Re as insertAfter,
  ke as isAnchor,
  yt as isEditable,
  k as isElement,
  He as isEmpty,
  ve as isFunction,
  Ie as isImage,
  Ce as isInline,
  je as isInsideEditable,
  T as isKey,
  gt as isLi,
  _e as isList,
  E as isModifier,
  ye as isNil,
  mt as isPara,
  z as isPlainObject,
  De as isSelectionInside,
  xe as isString,
  we as isTable,
  O as isText,
  ft as isVoid,
  R as key,
  $e as last,
  F as mergeDeep,
  Le as nextElement,
  Be as nodeValue,
  c as on,
  Ne as outerHtml,
  Pe as placeCaret,
  Ae as prevElement,
  Fe as rangeFromElement,
  be as rect2bnd,
  Te as remove,
  Ue as splitText,
  Ve as tail,
  fe as throttle,
  Ye as unique,
  Se as unwrap,
  U as withSavedRange,
  ze as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
