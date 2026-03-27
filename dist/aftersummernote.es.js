function Qt(e, t, i) {
  return Math.min(Math.max(e, t), i);
}
function et(e, t) {
  let i;
  return function(...n) {
    clearTimeout(i), i = setTimeout(() => e.apply(this, n), t);
  };
}
function te(e, t) {
  let i = 0;
  return function(...n) {
    const s = Date.now();
    if (s - i >= t)
      return i = s, e.apply(this, n);
  };
}
function ee(...e) {
  return (t) => e.reduceRight((i, n) => n(i), t);
}
function ie(e) {
  return e;
}
function ne(e) {
  return e == null;
}
function se(e) {
  return typeof e == "string";
}
function oe(e) {
  return typeof e == "function";
}
function B(e, t) {
  const i = Object.assign({}, e);
  if (I(e) && I(t))
    for (const n of Object.keys(t))
      I(t[n]) && n in e ? i[n] = B(e[n], t[n]) : i[n] = t[n];
  return i;
}
function I(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function re(e) {
  return e ? {
    top: Math.round(e.top),
    left: Math.round(e.left),
    width: Math.round(e.width),
    height: Math.round(e.height),
    bottom: Math.round(e.bottom),
    right: Math.round(e.right)
  } : null;
}
const it = 1, nt = 3, f = (e) => e && e.nodeType === it, R = (e) => e && e.nodeType === nt, st = (e) => f(e) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(e.nodeName), ot = (e) => f(e) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(e.nodeName), rt = (e) => f(e) && /^(li)$/i.test(e.nodeName), ae = (e) => f(e) && /^(ul|ol)$/i.test(e.nodeName), le = (e) => f(e) && e.nodeName.toUpperCase() === "TABLE", ce = (e) => f(e) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(e.nodeName), at = (e) => f(e) && e.isContentEditable, he = (e) => f(e) && e.nodeName.toUpperCase() === "A", ue = (e) => f(e) && e.nodeName.toUpperCase() === "IMG";
function L(e, t, i) {
  let n = e;
  for (; n && n !== i; ) {
    if (t(n)) return n;
    n = n.parentNode;
  }
  return null;
}
function S(e, t) {
  return L(e, ot, t);
}
function de(e, t) {
  const i = [];
  let n = e.parentNode;
  for (; n && n !== t; )
    i.push(n), n = n.parentNode;
  return i;
}
function pe(e) {
  return Array.from(e.childNodes);
}
function fe(e) {
  let t = e.previousSibling;
  for (; t && !f(t); )
    t = t.previousSibling;
  return t;
}
function me(e) {
  let t = e.nextSibling;
  for (; t && !f(t); )
    t = t.nextSibling;
  return t;
}
function r(e, t = {}, i = []) {
  const n = document.createElement(e);
  for (const [s, o] of Object.entries(t))
    n.setAttribute(s, o);
  for (const s of i)
    typeof s == "string" ? n.appendChild(document.createTextNode(s)) : n.appendChild(s);
  return n;
}
function ge(e) {
  e && e.parentNode && e.parentNode.removeChild(e);
}
function ye(e) {
  const t = e.parentNode;
  if (t) {
    for (; e.firstChild; )
      t.insertBefore(e.firstChild, e);
    t.removeChild(e);
  }
}
function be(e, t) {
  return e.parentNode.insertBefore(t, e), t.appendChild(e), t;
}
function xe(e, t) {
  t.nextSibling ? t.parentNode.insertBefore(e, t.nextSibling) : t.parentNode.appendChild(e);
}
function _e(e) {
  return R(e) ? e.nodeValue : e.textContent || "";
}
function ve(e) {
  return R(e) ? !e.nodeValue : st(e) ? !1 : !e.textContent.trim() && !e.querySelector("img, video, hr, table");
}
function Ce(e) {
  return e.outerHTML;
}
function we(e) {
  const t = document.createRange();
  t.selectNodeContents(e), t.collapse(!1);
  const i = window.getSelection();
  i && (i.removeAllRanges(), i.addRange(t));
}
function ke(e) {
  return !!L(e, at);
}
function u(e, t, i, n) {
  return e.addEventListener(t, i, n), () => e.removeEventListener(t, i, n);
}
class T {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(t, i, n, s) {
    this.sc = t, this.so = i, this.ec = n, this.eo = s;
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
    const i = this.toNativeRange().commonAncestorContainer;
    return f(i) ? i : i.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return L(this.sc, (i) => f(i) && i !== t, t);
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
    const i = this.toNativeRange();
    i.deleteContents();
    const n = document.createRange().createContextualFragment(t);
    i.insertNode(n);
  }
}
function F(e) {
  return new T(
    e.startContainer,
    e.startOffset,
    e.endContainer,
    e.endOffset
  );
}
function N(e) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const i = t.getRangeAt(0);
  return e && !e.contains(i.commonAncestorContainer) ? null : F(i);
}
function Me(e) {
  return new T(e, 0, e, e.childNodes.length);
}
function Ee(e, t = 0) {
  return new T(e, t, e, t);
}
function Ie(e) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : e.contains(t.getRangeAt(0).commonAncestorContainer);
}
function z(e) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    e(null);
    return;
  }
  const i = t.getRangeAt(0).cloneRange();
  e(F(i)), t.removeAllRanges(), t.addRange(i);
}
function Ae(e, t) {
  const i = e.splitText(t);
  return [e, i];
}
function l(e, t = null) {
  return document.execCommand(e, !1, t);
}
const U = () => l("bold"), j = () => l("italic"), O = () => l("underline"), P = () => l("strikeThrough"), D = () => l("superscript"), $ = () => l("subscript"), lt = (e) => l("foreColor", e), ct = (e) => l("hiliteColor", e), q = (e) => l("fontName", e);
function ht(e) {
  l("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const i = document.createElement("span");
    for (i.style.fontSize = e, t.parentNode.insertBefore(i, t); t.firstChild; ) i.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const ut = (e) => l("formatBlock", `<${e}>`), K = () => l("justifyLeft"), V = () => l("justifyCenter"), W = () => l("justifyRight"), Y = () => l("justifyFull"), G = () => l("indent"), X = () => l("outdent"), J = () => l("insertUnorderedList"), Z = () => l("insertOrderedList");
function d(e, t, i, n, s) {
  return { name: e, icon: t, tooltip: i, action: n, isActive: s };
}
const dt = d("bold", "bold", "Bold (Ctrl+B)", () => U(), () => document.queryCommandState("bold")), pt = d("italic", "italic", "Italic (Ctrl+I)", () => j(), () => document.queryCommandState("italic")), ft = d("underline", "underline", "Underline (Ctrl+U)", () => O(), () => document.queryCommandState("underline")), mt = d("strikethrough", "strikethrough", "Strikethrough", () => P(), () => document.queryCommandState("strikeThrough")), gt = d("superscript", "superscript", "Superscript", () => D(), () => document.queryCommandState("superscript")), yt = d("subscript", "subscript", "Subscript", () => $(), () => document.queryCommandState("subscript")), bt = d("alignLeft", "align-left", "Align Left", () => K()), xt = d("alignCenter", "align-center", "Align Center", () => V()), _t = d("alignRight", "align-right", "Align Right", () => W()), vt = d("alignJustify", "align-justify", "Justify", () => Y()), Ct = d("ul", "list-ul", "Unordered List", () => J()), wt = d("ol", "list-ol", "Ordered List", () => Z()), kt = d("indent", "indent", "Indent", () => G()), Mt = d("outdent", "outdent", "Outdent", () => X()), Et = d("undo", "undo", "Undo (Ctrl+Z)", (e) => e.invoke("editor.undo")), It = d("redo", "redo", "Redo (Ctrl+Y)", (e) => e.invoke("editor.redo")), At = d("hr", "minus", "Horizontal Rule", () => l("insertHorizontalRule")), Lt = d("link", "link", "Insert Link", (e) => e.invoke("linkDialog.show")), Tt = d("image", "image", "Insert Image", (e) => e.invoke("imageDialog.show")), St = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (e, t) => q(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, Nt = d("codeview", "code", "HTML Code View", (e) => e.invoke("codeview.toggle"), (e) => e.invoke("codeview.isActive")), Ht = d("fullscreen", "expand", "Fullscreen", (e) => e.invoke("fullscreen.toggle"), (e) => e.invoke("fullscreen.isActive")), Bt = [
  [St],
  [Et, It],
  [dt, pt, ft, mt],
  [gt, yt],
  [bt, xt, _t, vt],
  [Ct, wt, kt, Mt],
  [At, Lt, Tt],
  [Nt, Ht]
], Q = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: Bt,
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
function Rt(e, t) {
  const i = r("div", { class: "asn-container" }), n = r("div", {
    class: "asn-editable",
    contenteditable: "true",
    spellcheck: "true",
    "aria-multiline": "true",
    "aria-label": "Rich text editor",
    role: "textbox"
  });
  e.tagName === "TEXTAREA" ? n.innerHTML = (e.value || "").trim() : n.innerHTML = (e.innerHTML || "").trim();
  const s = t.defaultFontFamily || t.fontFamilies && t.fontFamilies[0];
  return s && (n.style.fontFamily = s), t.height && (n.style.minHeight = `${t.height}px`), t.minHeight && (n.style.minHeight = `${t.minHeight}px`), t.maxHeight && (n.style.maxHeight = `${t.maxHeight}px`), i.appendChild(n), e.style.display = "none", e.insertAdjacentElement("afterend", i), { container: i, editable: n };
}
const Ft = 100;
class zt {
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
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1)), this.stack.push({ html: this._serialize() }), this.stack.length > Ft ? this.stack.shift() : this.stackOffset++;
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
    const t = this._serialize(), i = this.stack[this.stackOffset];
    i && i.html === t || this._savePoint();
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
function Ut(e, t) {
  const i = r("table", { class: "asn-table" }), n = r("tbody");
  i.appendChild(n);
  for (let s = 0; s < t; s++) {
    const o = r("tr");
    for (let a = 0; a < e; a++) {
      const h = r("td", {}, [" "]);
      o.appendChild(h);
    }
    n.appendChild(o);
  }
  return i;
}
function jt(e, t) {
  const i = Ut(e, t);
  l("insertHTML", i.outerHTML);
}
const A = {
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
function E(e, t) {
  return e.key === t || e.key === t.toUpperCase();
}
function k(e, t) {
  return (e.ctrlKey || e.metaKey) && E(e, t);
}
function Ot(e, t, i = {}) {
  if (E(e, A.TAB)) {
    const n = N(t);
    if (!n) return !1;
    const s = S(n.sc, t);
    if (s && rt(s))
      return e.preventDefault(), e.shiftKey ? l("outdent") : l("indent"), !0;
    if (s && s.nodeName.toUpperCase() === "PRE")
      return e.preventDefault(), l("insertText", "    "), !0;
    if (i.tabSize)
      return e.preventDefault(), l("insertText", " ".repeat(i.tabSize)), !0;
  }
  if (E(e, A.ENTER) && !e.shiftKey) {
    const n = N(t);
    if (!n) return !1;
    const s = S(n.sc, t);
    if (s && s.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = n.toNativeRange();
      if (o.setStart(s, s.childNodes.length), o.toString() === "" && n.isCollapsed())
        return e.preventDefault(), l("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class Pt {
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
    return this._history = new zt(t), this._bindEvents(t), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._history = null;
  }
  // ---------------------------------------------------------------------------
  // Event binding
  // ---------------------------------------------------------------------------
  _bindEvents(t) {
    const i = (o) => this._onKeydown(o), n = () => this.afterCommand(), s = () => this.context.invoke("toolbar.refresh");
    this._disposers.push(
      u(t, "keydown", i),
      u(t, "keyup", n),
      u(document, "selectionchange", s)
    );
  }
  _onKeydown(t) {
    const i = this.context.layoutInfo.editable;
    if (!Ot(t, i, this.options)) {
      if (k(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (k(t, "z") && t.shiftKey || k(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (k(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (k(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (k(t, "u")) {
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
    U(), this.afterCommand();
  }
  italic() {
    j(), this.afterCommand();
  }
  underline() {
    O(), this.afterCommand();
  }
  strikethrough() {
    P(), this.afterCommand();
  }
  superscript() {
    D(), this.afterCommand();
  }
  subscript() {
    $(), this.afterCommand();
  }
  justifyLeft() {
    K(), this.afterCommand();
  }
  justifyCenter() {
    V(), this.afterCommand();
  }
  justifyRight() {
    W(), this.afterCommand();
  }
  justifyFull() {
    Y(), this.afterCommand();
  }
  indent() {
    G(), this.afterCommand();
  }
  outdent() {
    X(), this.afterCommand();
  }
  insertUL() {
    J(), this.afterCommand();
  }
  insertOL() {
    Z(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(t) {
    ut(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(t) {
    lt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(t) {
    ct(t), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(t) {
    q(t), this.afterCommand();
  }
  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(t) {
    ht(t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    l("insertHorizontalRule"), this.afterCommand();
  }
  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(t, i, n = !1) {
    const s = window.getSelection();
    if (!s || s.rangeCount === 0) return;
    const o = this._sanitiseUrl(t);
    if (!o) return;
    if (!(s.toString().trim().length > 0))
      l("insertHTML", `<a href="${o}"${n ? ' target="_blank" rel="noopener noreferrer"' : ""}>${i || o}</a>`);
    else if (l("createLink", o), n) {
      const h = this._getClosestAnchor();
      h && (h.setAttribute("target", "_blank"), h.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    l("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, i = "") {
    const n = this._sanitiseUrl(t);
    n && (l("insertHTML", `<img src="${n}" alt="${i}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, i) {
    jt(t, i), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _getClosestAnchor() {
    const t = window.getSelection();
    if (!t || t.rangeCount === 0) return null;
    let i = t.getRangeAt(0).startContainer;
    for (; i; ) {
      if (i.nodeName === "A") return i;
      i = i.parentNode;
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
      const i = new URL(t, window.location.href);
      return /^javascript:/i.test(i.protocol) ? null : t;
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
    const n = new DOMParser().parseFromString(`<body>${t}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((s) => {
      n.querySelectorAll(s).forEach((o) => o.remove());
    }), n.querySelectorAll("*").forEach((s) => {
      Array.from(s.attributes).forEach((o) => {
        o.name.startsWith("on") && s.removeAttribute(o.name), ["href", "src"].includes(o.name) && /^\s*javascript:/i.test(o.value) && s.removeAttribute(o.name);
      });
    }), n.body.innerHTML;
  }
}
class Dt {
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
    return this.el = r("div", { class: "asn-toolbar" }), this._buildButtons(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildButtons() {
    (this.options.toolbar || []).forEach((i) => {
      const n = r("div", { class: "asn-btn-group" });
      i.forEach((s) => {
        const o = s.type === "select" ? this._createSelect(s) : this._createButton(s);
        n.appendChild(o);
      }), this.el.appendChild(n);
    });
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const i = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], n = r("select", {
      class: "asn-select",
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), s = r("option", { value: "" }, ["Font"]);
    n.appendChild(s), i.forEach((a) => {
      const h = r("option", { value: a }, [a]);
      h.style.fontFamily = a, n.appendChild(h);
    });
    const o = u(n, "change", (a) => {
      const h = a.target.value;
      h && (this.context.invoke("editor.focus"), t.action(this.context, h), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(o), n;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const n = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", s = t.className ? ` ${t.className}` : "", o = `${n}${s}`, a = r("button", {
      type: "button",
      class: o,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), h = !!this.options.useFontAwesome, y = () => {
      if (!h) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const g = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((tt) => tt.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(g);
    }, p = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', c = (g) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${p} style="display:block">${g}</svg>`, m = /* @__PURE__ */ new Map([
      // Format
      ["bold", c('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>')],
      ["italic", c('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>')],
      ["underline", c('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>')],
      ["strikethrough", c('<path d="M17.3 12H6.7"/><path d="M10 6.5C10 5.1 11.1 4 12.5 4c1.4 0 2.5 1.1 2.5 2.5 0 .8-.4 1.5-1 2"/><path d="M14 17.5C14 19 12.9 20 11.5 20 10.1 20 9 18.9 9 17.5c0-.8.4-1.5 1-2"/>')],
      ["superscript", c('<path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7.25C20 6 19 5 17.5 5S15 6 15 7"/>')],
      ["subscript", c('<path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 21h-4c0-1.5.44-2 1.5-2.5S20 17.33 20 16.25C20 15 19 14 17.5 14S15 15 15 16"/>')],
      // Alignment
      ["align-left", c('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>')],
      ["align-center", c('<line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      ["align-right", c('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>')],
      ["align-justify", c('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      // Lists
      ["list-ul", c('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>')],
      ["list-ol", c('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1V3"/><path d="M4 10h2l-2 2h2"/><path d="M4 16.5A1.5 1.5 0 0 1 5.5 15a1.5 1.5 0 0 1 0 3H4"/>')],
      ["indent", c('<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      ["outdent", c('<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      // History
      ["undo", c('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>')],
      ["redo", c('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>')],
      // Insert
      ["minus", c('<line x1="5" y1="12" x2="19" y2="12"/>')],
      ["link", c('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>')],
      ["image", c('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>')],
      // View
      ["code", c('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", c('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')]
    ]), x = this.options.fontAwesomeClass || "fas", w = /* @__PURE__ */ new Map([
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
    if (y()) {
      const g = w.get(t.icon) || w.get(t.name) || null;
      g ? a.innerHTML = `<i class="${x} ${g}" aria-hidden="true"></i>` : m.has(t.icon) ? a.innerHTML = m.get(t.icon) : a.textContent = t.icon || t.name;
    } else
      m.has(t.icon) ? a.innerHTML = m.get(t.icon) : m.has(t.name) ? a.innerHTML = m.get(t.name) : a.textContent = t.icon || t.name;
    const v = u(a, "click", (g) => {
      g.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(v), a;
  }
  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------
  refresh() {
    if (!this.el) return;
    const t = this.options.toolbar || [], i = new Map(t.flat().map((n) => [n.name, n]));
    this.el.querySelectorAll("button[data-btn]").forEach((n) => {
      const s = i.get(n.getAttribute("data-btn"));
      s && typeof s.isActive == "function" && n.classList.toggle("active", !!s.isActive(this.context));
    }), this.el.querySelectorAll("select[data-btn]").forEach((n) => {
      const s = i.get(n.getAttribute("data-btn"));
      if (!s || typeof s.getValue != "function") return;
      let o = (s.getValue(this.context) || "").replace(/["']/g, "").trim();
      o || (o = this.options.defaultFontFamily || this.options.fontFamilies && this.options.fontFamilies[0] || "");
      const a = Array.from(n.options).find(
        (h) => h.value && h.value.toLowerCase() === o.toLowerCase()
      );
      n.value = a ? a.value : "";
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
class $t {
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
    if (this.el = r("div", { class: "asn-statusbar" }), this.options.resizeable !== !1) {
      const i = r("div", {
        class: "asn-resize-handle",
        title: "Resize editor",
        "aria-hidden": "true"
      });
      this._bindResize(i), this.el.appendChild(i);
    }
    this._wordCountEl = r("span", { class: "asn-word-count" }), this._charCountEl = r("span", { class: "asn-char-count" });
    const t = r("div", { class: "asn-status-info" });
    return t.appendChild(this._wordCountEl), t.appendChild(this._charCountEl), this.el.appendChild(t), this._bindContentEvents(), this.update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Resize logic
  // ---------------------------------------------------------------------------
  _bindResize(t) {
    let i = 0, n = 0;
    const s = this.context.layoutInfo.editable, o = (p) => {
      const c = Math.max(100, n + p.clientY - i);
      s.style.height = `${c}px`;
    }, a = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a);
    }, y = u(t, "mousedown", (p) => {
      i = p.clientY, n = s.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", a), p.preventDefault();
    });
    this._disposers.push(y);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, i = et(() => this.update(), 200), n = u(t, "input", i);
    this._disposers.push(n);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const i = this.context.layoutInfo.editable.innerText || "", n = i.trim() ? i.trim().split(/\s+/).length : 0, s = i.length;
    this._wordCountEl.textContent = `Words: ${n}`, this._charCountEl.textContent = `Chars: ${s}`;
  }
}
class qt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, i = u(t, "paste", (n) => this._onPaste(n));
    return this._disposers.push(i), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Paste handler
  // ---------------------------------------------------------------------------
  _onPaste(t) {
    const i = t.clipboardData || window.clipboardData;
    if (!i || this.options.pasteAsPlainText === !1) return;
    t.preventDefault();
    let n = "";
    if (i.types.includes("text/html") && this.options.pasteCleanHTML !== !1) {
      const s = i.getData("text/html");
      n = this._sanitiseHTML(s), l("insertHTML", n);
    } else {
      n = i.getData("text/plain");
      const s = n.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      l("insertHTML", s);
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
    const n = new DOMParser().parseFromString(t, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form", "input", "button"].forEach((o) => {
      n.querySelectorAll(o).forEach((a) => a.parentNode.removeChild(a));
    }), n.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((a) => {
        a.name.startsWith("on") && o.removeAttribute(a.name);
      }), ["href", "src", "action"].forEach((a) => {
        const h = o.getAttribute(a);
        h && /^\s*javascript:/i.test(h) && o.removeAttribute(a);
      });
    }), n.body.innerHTML;
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
class Kt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, i = this.options.placeholder || "";
    i && (t.dataset.placeholder = i);
    const n = () => this._update(), s = u(t, "input", n), o = u(t, "focus", n), a = u(t, "blur", n);
    return this._disposers.push(s, o, a), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  _update() {
    const t = this.context.layoutInfo.editable, i = !t.textContent.trim() && !t.querySelector("img, table, hr");
    t.classList.toggle("asn-placeholder", i);
  }
}
class Vt {
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
    const { editable: t } = this.context.layoutInfo, i = t.innerHTML;
    this._textarea = r("textarea", {
      class: "asn-codeview",
      spellcheck: "false",
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off"
    }), this._textarea.value = this._prettyPrint(i), t.style.display = "none", t.parentNode.insertBefore(this._textarea, t.nextSibling), this._active = !0, this.context.invoke("toolbar.refresh");
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
    let i = 0;
    return t.replace(/>\s*</g, `>
<`).split(`
`).map((n) => {
      const s = n.trim();
      if (!s) return "";
      /^<\//.test(s) && (i = Math.max(0, i - 1));
      const o = "  ".repeat(i) + s;
      return /^<[^/][^>]*[^/]>/.test(s) && !/^<(br|hr|img|input|link|meta)/.test(s) && i++, o;
    }).filter(Boolean).join(`
`);
  }
  /**
   * Basic HTML sanitiser — removes script/dangerous elements.
   * @param {string} html
   * @returns {string}
   */
  _sanitise(t) {
    const n = new DOMParser().parseFromString(`<body>${t}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((s) => {
      n.querySelectorAll(s).forEach((o) => o.remove());
    }), n.querySelectorAll("*").forEach((s) => {
      Array.from(s.attributes).forEach((o) => {
        o.name.startsWith("on") && s.removeAttribute(o.name), ["href", "src"].includes(o.name) && /^\s*javascript:/i.test(o.value) && s.removeAttribute(o.name);
      });
    }), n.body.innerHTML;
  }
}
class Wt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = u(document, "keydown", (i) => {
      this._active && E(i, A.ESCAPE) && this.deactivate();
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
    const t = this.context.layoutInfo.container, i = this.context.layoutInfo.editable;
    this._prevHeight = i.style.height, t.classList.add("asn-fullscreen"), i.style.height = "", document.body.style.overflow = "hidden", this._active = !0, this.context.invoke("toolbar.refresh");
  }
  deactivate() {
    if (!this._active) return;
    const t = this.context.layoutInfo.container, i = this.context.layoutInfo.editable;
    t.classList.remove("asn-fullscreen"), i.style.height = this._prevHeight, document.body.style.overflow = "", this._active = !1, this.context.invoke("toolbar.refresh");
  }
}
class Yt {
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
    z((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = r("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), i = r("div", { class: "asn-dialog-box" }), n = r("h3", { class: "asn-dialog-title" });
    n.textContent = "Insert Link";
    const s = r("label", { class: "asn-label" });
    s.textContent = "URL";
    const o = r("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://",
      id: "asn-link-url",
      name: "url",
      autocomplete: "off"
    });
    this._urlInput = o;
    const a = r("label", { class: "asn-label" });
    a.textContent = "Display Text";
    const h = r("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Link text",
      id: "asn-link-text",
      name: "linkText",
      autocomplete: "off"
    });
    this._textInput = h;
    const y = r("label", { class: "asn-label asn-label-inline" }), p = r("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = p, y.appendChild(p), y.appendChild(document.createTextNode(" Open in new tab"));
    const c = r("div", { class: "asn-dialog-actions" }), m = r("button", { type: "button", class: "asn-btn asn-btn-primary" });
    m.textContent = "Insert";
    const x = r("button", { type: "button", class: "asn-btn" });
    x.textContent = "Cancel", c.appendChild(m), c.appendChild(x), i.append(n, s, o, a, h, y, c), t.appendChild(i);
    const w = u(m, "click", () => this._onInsert()), _ = u(x, "click", () => this._close()), v = u(t, "click", (g) => {
      g.target === t && this._close();
    });
    return this._disposers.push(w, _, v), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _prefill() {
    const t = window.getSelection();
    let i = null;
    if (t && t.rangeCount > 0) {
      let n = t.getRangeAt(0).startContainer;
      for (; n; ) {
        if (n.nodeName === "A") {
          i = n;
          break;
        }
        n = n.parentNode;
      }
    }
    i ? (this._urlInput.value = i.getAttribute("href") || "", this._textInput.value = i.textContent || "", this._tabCheckbox.checked = i.getAttribute("target") === "_blank") : (this._urlInput.value = "", this._textInput.value = t ? t.toString() : "", this._tabCheckbox.checked = !1);
  }
  _onInsert() {
    const t = this._urlInput.value.trim(), i = this._textInput.value.trim(), n = this._tabCheckbox.checked;
    if (!t) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertLink", t, i, n), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
class Gt {
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
    z((t) => {
      this._savedRange = t;
    }), this._urlInput.value = "", this._altInput.value = "", this._fileInput && (this._fileInput.value = ""), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = r("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert image"
    }), i = r("div", { class: "asn-dialog-box" }), n = r("h3", { class: "asn-dialog-title" });
    n.textContent = "Insert Image";
    const s = r("label", { class: "asn-label" });
    s.textContent = "Image URL";
    const o = r("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://example.com/image.png",
      autocomplete: "off"
    });
    this._urlInput = o;
    const a = r("label", { class: "asn-label" });
    a.textContent = "Alt Text";
    const h = r("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Describe the image",
      autocomplete: "off"
    });
    if (this._altInput = h, this.options.allowImageUpload !== !1) {
      const _ = r("label", { class: "asn-label" });
      _.textContent = "Or upload a file";
      const v = r("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = v;
      const g = u(v, "change", () => this._onFileChange());
      this._disposers.push(g), i.append(_, v);
    }
    const y = r("div", { class: "asn-dialog-actions" }), p = r("button", { type: "button", class: "asn-btn asn-btn-primary" });
    p.textContent = "Insert";
    const c = r("button", { type: "button", class: "asn-btn" });
    c.textContent = "Cancel", y.appendChild(p), y.appendChild(c), i.append(n, s, o, a, h, y), t.appendChild(i);
    const m = u(p, "click", () => this._onInsert()), x = u(c, "click", () => this._close()), w = u(t, "click", (_) => {
      _.target === t && this._close();
    });
    return this._disposers.push(m, x, w), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _onFileChange() {
    const t = this._fileInput && this._fileInput.files && this._fileInput.files[0];
    if (!t || !t.type.startsWith("image/")) return;
    const i = (this.options.maxImageSize || 5) * 1024 * 1024;
    if (t.size > i) {
      alert(`Image file is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`), this._fileInput.value = "";
      return;
    }
    const n = new FileReader();
    n.onload = (s) => {
      this._urlInput.value = s.target.result;
    }, n.readAsDataURL(t);
  }
  _onInsert() {
    const t = this._urlInput.value.trim(), i = this._altInput.value.trim();
    if (!t) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertImage", t, i), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
const b = {
  undo: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
  redo: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>',
  cut: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="20" r="3"/><circle cx="6" cy="4" r="3"/><line x1="19" y1="5" x2="6" y2="19"/><line x1="19" y1="19" x2="13.5" y2="13.5"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  paste: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
  bold: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
  italic: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
  underline: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  image: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
}, Xt = [
  { name: "undo", label: "Undo", icon: b.undo, action: (e) => e.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: b.redo, action: (e) => e.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: b.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: b.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: b.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: b.bold, action: (e) => e.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: b.italic, action: (e) => e.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: b.underline, action: (e) => e.invoke("editor.underline") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: b.link, action: (e) => e.invoke("linkDialog.open") },
  { name: "image", label: "Insert Image", icon: b.image, action: (e) => e.invoke("imageDialog.open") }
];
class Jt {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || Xt, this.el = null, this._disposers = [];
  }
  initialize() {
    this.el = r("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._renderItems();
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    return t && this._disposers.push(u(t, "contextmenu", (i) => this._onContextMenu(i))), this._disposers.push(u(document, "click", (i) => this._maybeHide(i))), this._disposers.push(u(document, "keydown", (i) => {
      i.key === "Escape" && this.hide();
    })), this._disposers.push(u(window, "scroll", () => this.hide(), { passive: !0 })), this;
  }
  destroy() {
    this._disposers.forEach((t) => {
      try {
        t();
      } catch {
      }
    }), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  _renderItems() {
    this.el && (this.el.innerHTML = "", this._items.forEach((t) => {
      if (t.separator || t.sep) {
        const o = r("div", { class: "asn-context-sep" });
        this.el.appendChild(o);
        return;
      }
      const i = r("button", { type: "button", class: "asn-context-item", "data-name": t.name || "" });
      if (t.icon) {
        const o = r("span", { class: "asn-context-icon", "aria-hidden": "true" });
        o.innerHTML = t.icon, i.appendChild(o);
      }
      const n = r("span", { class: "asn-context-label" }, [t.label || t.name]);
      i.appendChild(n);
      const s = u(i, "click", (o) => {
        o.stopPropagation(), this.hide();
        try {
          t.action(this.context);
        } catch (a) {
          console.error(a);
        }
      });
      this._disposers.push(s), this.el.appendChild(i);
    }));
  }
  _onContextMenu(t) {
    const i = this.context.layoutInfo && this.context.layoutInfo.editable;
    i && i.contains(t.target) && (t.preventDefault(), this._renderItems(), this.showAt(t.clientX, t.clientY));
  }
  _maybeHide(t) {
    this.el && (this.el.contains(t.target) || this.hide());
  }
  showAt(t, i) {
    if (!this.el) return;
    this.el.style.display = "block";
    const n = this.el.getBoundingClientRect();
    let s = t, o = i;
    s + n.width > window.innerWidth && (s = window.innerWidth - n.width - 8), o + n.height > window.innerHeight && (o = window.innerHeight - n.height - 8), this.el.style.left = s + "px", this.el.style.top = o + "px", this.el.setAttribute("aria-hidden", "false");
  }
  hide() {
    this.el && (this.el.style.display = "none", this.el.setAttribute("aria-hidden", "true"));
  }
}
class Zt {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, i = {}) {
    this.targetEl = t, this.options = B(Q, i), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: i } = Rt(this.targetEl, this.options);
    this.layoutInfo.container = t, this.layoutInfo.editable = i, this._registerModules();
    const n = this._modules.get("toolbar");
    n && n.el && (t.insertBefore(n.el, i), this.layoutInfo.toolbar = n.el);
    const s = this._modules.get("statusbar");
    return s && s.el && (t.appendChild(s.el), this.layoutInfo.statusbar = s.el), this._bindEditorEvents(i), this.options.focus && i.focus(), this._alive = !0, this.invoke("toolbar.refresh"), this;
  }
  _registerModules() {
    const t = (i, n) => {
      const s = new n(this);
      s.initialize(), this._modules.set(i, s);
    };
    t("editor", Pt), t("toolbar", Dt), t("statusbar", $t), t("clipboard", qt), t("contextMenu", Jt), t("placeholder", Kt), t("codeview", Vt), t("fullscreen", Wt), t("linkDialog", Yt), t("imageDialog", Gt);
  }
  _bindEditorEvents(t) {
    const i = u(t, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), n = u(t, "blur", () => {
      this.layoutInfo.container.classList.remove("asn-focused"), this._syncToTarget(), typeof this.options.onBlur == "function" && this.options.onBlur(this);
    });
    this._disposers.push(i, n);
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
  invoke(t, ...i) {
    const [n, s] = t.split("."), o = this._modules.get(n);
    if (o && typeof o[s] == "function")
      return o[s](...i);
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
  on(t, i) {
    return this._listeners.has(t) || this._listeners.set(t, []), this._listeners.get(t).push(i), () => this.off(t, i);
  }
  /**
   * Unsubscribes from an editor event.
   * @param {string} eventName
   * @param {Function} handler
   */
  off(t, i) {
    const n = this._listeners.get(t);
    if (!n) return;
    const s = n.indexOf(i);
    s !== -1 && n.splice(s, 1);
  }
  /**
   * Triggers an editor event.
   * @param {string} eventName
   * @param {...*} args
   */
  triggerEvent(t, ...i) {
    (this._listeners.get(t) || []).forEach((o) => o(...i));
    const s = "on" + t.charAt(0).toUpperCase() + t.slice(1);
    typeof this.options[s] == "function" && this.options[s](...i);
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
    const i = this.layoutInfo.editable;
    t ? (i.setAttribute("contenteditable", "false"), this.layoutInfo.container.classList.add("asn-disabled")) : (i.setAttribute("contenteditable", "true"), this.layoutInfo.container.classList.remove("asn-disabled"));
  }
  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------
  /**
   * Completely removes the editor and restores the original element.
   */
  destroy() {
    if (!this._alive) return;
    this._modules.forEach((i) => {
      typeof i.destroy == "function" && i.destroy();
    }), this._modules.clear(), this._disposers.forEach((i) => i()), this._disposers = [];
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
function Le(e) {
  return e[e.length - 1];
}
function Te(e) {
  return e[0];
}
function Se(e, t = 1) {
  return e.slice(0, e.length - t);
}
function Ne(e, t = 1) {
  return e.slice(t);
}
function He(e) {
  return e.reduce((t, i) => t.concat(i), []);
}
function Be(e) {
  return [...new Set(e)];
}
function Re(e, t) {
  const i = [];
  for (let n = 0; n < e.length; n += t)
    i.push(e.slice(n, n + t));
  return i;
}
function Fe(e, t) {
  return e.reduce((i, n) => {
    const s = t(n);
    return i[s] || (i[s] = []), i[s].push(n), i;
  }, {});
}
function ze(e, t) {
  return e.every(t);
}
function Ue(e, t) {
  return e.some(t);
}
const C = navigator.userAgent, je = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(C),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(C),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(C),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(C),
  /** True if running on macOS */
  isMac: /Macintosh/.test(C),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(C),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(C) ? "metaKey" : "ctrlKey"
}, M = /* @__PURE__ */ new WeakMap(), Oe = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(e, t = {}) {
    const n = H(e).map((s) => {
      if (M.has(s)) return M.get(s);
      const o = new Zt(s, t);
      return o.initialize(), M.set(s, o), o;
    });
    return n.length === 1 ? n[0] : n;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(e) {
    H(e).forEach((t) => {
      const i = M.get(t);
      i && (i.destroy(), M.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(e) {
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && M.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: Q,
  /** Library version */
  version: "1.0.0"
};
function H(e) {
  return typeof e == "string" ? Array.from(document.querySelectorAll(e)) : e instanceof Element ? [e] : e instanceof NodeList || Array.isArray(e) ? Array.from(e) : [];
}
export {
  Zt as Context,
  it as ELEMENT_NODE,
  nt as TEXT_NODE,
  T as WrappedRange,
  ze as all,
  de as ancestors,
  Ue as any,
  pe as children,
  Re as chunk,
  Qt as clamp,
  L as closest,
  S as closestPara,
  Ee as collapsedRange,
  ee as compose,
  r as createElement,
  N as currentRange,
  et as debounce,
  Oe as default,
  Q as defaultOptions,
  je as env,
  Te as first,
  He as flatten,
  F as fromNativeRange,
  Fe as groupBy,
  ie as identity,
  Se as initial,
  xe as insertAfter,
  he as isAnchor,
  at as isEditable,
  f as isElement,
  ve as isEmpty,
  oe as isFunction,
  ue as isImage,
  ce as isInline,
  ke as isInsideEditable,
  E as isKey,
  rt as isLi,
  ae as isList,
  k as isModifier,
  ne as isNil,
  ot as isPara,
  I as isPlainObject,
  Ie as isSelectionInside,
  se as isString,
  le as isTable,
  R as isText,
  st as isVoid,
  A as key,
  Le as last,
  B as mergeDeep,
  me as nextElement,
  _e as nodeValue,
  u as on,
  Ce as outerHtml,
  we as placeCaret,
  fe as prevElement,
  Me as rangeFromElement,
  re as rect2bnd,
  ge as remove,
  Ae as splitText,
  Ne as tail,
  te as throttle,
  Be as unique,
  ye as unwrap,
  z as withSavedRange,
  be as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
