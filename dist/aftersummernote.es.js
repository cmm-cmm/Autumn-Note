function be(s, t, e) {
  return Math.min(Math.max(s, t), e);
}
function ut(s, t) {
  let e;
  return function(...i) {
    clearTimeout(e), e = setTimeout(() => s.apply(this, i), t);
  };
}
function we(s, t) {
  let e = 0;
  return function(...i) {
    const n = Date.now();
    if (n - e >= t)
      return e = n, s.apply(this, i);
  };
}
function ke(...s) {
  return (t) => s.reduceRight((e, i) => i(e), t);
}
function Ce(s) {
  return s;
}
function Ie(s) {
  return s == null;
}
function Ee(s) {
  return typeof s == "string";
}
function Me(s) {
  return typeof s == "function";
}
function $(s, t) {
  const e = Object.assign({}, s);
  if (S(s) && S(t))
    for (const i of Object.keys(t))
      S(t[i]) && i in s ? e[i] = $(s[i], t[i]) : e[i] = t[i];
  return e;
}
function S(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function Le(s) {
  return s ? {
    top: Math.round(s.top),
    left: Math.round(s.left),
    width: Math.round(s.width),
    height: Math.round(s.height),
    bottom: Math.round(s.bottom),
    right: Math.round(s.right)
  } : null;
}
const pt = 1, ft = 3, I = (s) => s && s.nodeType === pt, D = (s) => s && s.nodeType === ft, mt = (s) => I(s) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(s.nodeName), gt = (s) => I(s) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(s.nodeName), yt = (s) => I(s) && /^(li)$/i.test(s.nodeName), Ae = (s) => I(s) && /^(ul|ol)$/i.test(s.nodeName), Te = (s) => I(s) && s.nodeName.toUpperCase() === "TABLE", ze = (s) => I(s) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(s.nodeName), vt = (s) => I(s) && s.isContentEditable, Re = (s) => I(s) && s.nodeName.toUpperCase() === "A", Se = (s) => I(s) && s.nodeName.toUpperCase() === "IMG";
function H(s, t, e) {
  let i = s;
  for (; i && i !== e; ) {
    if (t(i)) return i;
    i = i.parentNode;
  }
  return null;
}
function O(s, t) {
  return H(s, gt, t);
}
function Be(s, t) {
  const e = [];
  let i = s.parentNode;
  for (; i && i !== t; )
    e.push(i), i = i.parentNode;
  return e;
}
function He(s) {
  return Array.from(s.childNodes);
}
function Ne(s) {
  let t = s.previousSibling;
  for (; t && !I(t); )
    t = t.previousSibling;
  return t;
}
function Pe(s) {
  let t = s.nextSibling;
  for (; t && !I(t); )
    t = t.nextSibling;
  return t;
}
function l(s, t = {}, e = []) {
  const i = document.createElement(s);
  for (const [n, o] of Object.entries(t))
    i.setAttribute(n, o);
  for (const n of e)
    typeof n == "string" ? i.appendChild(document.createTextNode(n)) : i.appendChild(n);
  return i;
}
function Oe(s) {
  s && s.parentNode && s.parentNode.removeChild(s);
}
function Fe(s) {
  const t = s.parentNode;
  if (t) {
    for (; s.firstChild; )
      t.insertBefore(s.firstChild, s);
    t.removeChild(s);
  }
}
function je(s, t) {
  return s.parentNode.insertBefore(t, s), t.appendChild(s), t;
}
function $e(s, t) {
  t.nextSibling ? t.parentNode.insertBefore(s, t.nextSibling) : t.parentNode.appendChild(s);
}
function De(s) {
  return D(s) ? s.nodeValue : s.textContent || "";
}
function Ue(s) {
  return D(s) ? !s.nodeValue : mt(s) ? !1 : !s.textContent.trim() && !s.querySelector("img, video, hr, table");
}
function We(s) {
  return s.outerHTML;
}
function Ve(s) {
  const t = document.createRange();
  t.selectNodeContents(s), t.collapse(!1);
  const e = window.getSelection();
  e && (e.removeAllRanges(), e.addRange(t));
}
function qe(s) {
  return !!H(s, vt);
}
function c(s, t, e, i) {
  return s.addEventListener(t, e, i), () => s.removeEventListener(t, e, i);
}
class N {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(t, e, i, n) {
    this.sc = t, this.so = e, this.ec = i, this.eo = n;
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
    return I(e) ? e : e.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return H(this.sc, (e) => I(e) && e !== t, t);
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
    const i = document.createRange().createContextualFragment(t);
    e.insertNode(i);
  }
}
function U(s) {
  return new N(
    s.startContainer,
    s.startOffset,
    s.endContainer,
    s.endOffset
  );
}
function F(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const e = t.getRangeAt(0);
  return s && !s.contains(e.commonAncestorContainer) ? null : U(e);
}
function Ye(s) {
  return new N(s, 0, s, s.childNodes.length);
}
function Ke(s, t = 0) {
  return new N(s, t, s, t);
}
function Xe(s) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : s.contains(t.getRangeAt(0).commonAncestorContainer);
}
function P(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    s(null);
    return;
  }
  const e = t.getRangeAt(0).cloneRange();
  s(U(e)), t.removeAllRanges(), t.addRange(e);
}
function Ge(s, t) {
  const e = s.splitText(t);
  return [s, e];
}
function p(s, t = null) {
  return document.execCommand(s, !1, t);
}
const W = () => p("bold"), V = () => p("italic"), q = () => p("underline"), Y = () => p("strikeThrough"), K = () => p("superscript"), X = () => p("subscript"), _t = (s) => p("foreColor", s), xt = (s) => p("hiliteColor", s), G = (s) => p("fontName", s);
function bt(s) {
  p("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const e = document.createElement("span");
    for (e.style.fontSize = s, t.parentNode.insertBefore(e, t); t.firstChild; ) e.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const wt = (s) => p("formatBlock", `<${s}>`), Z = () => p("justifyLeft"), J = () => p("justifyCenter"), Q = () => p("justifyRight"), tt = () => p("justifyFull"), et = () => p("indent"), it = () => p("outdent"), st = () => p("insertUnorderedList"), nt = () => p("insertOrderedList");
function kt(s, t) {
  const e = document.createElement("table");
  e.style.borderCollapse = "collapse", e.style.width = "100%";
  const i = document.createElement("tbody");
  for (let n = 0; n < s; n++) {
    const o = document.createElement("tr");
    for (let r = 0; r < t; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.style.minWidth = "40px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    i.appendChild(o);
  }
  e.appendChild(i), p("insertHTML", e.outerHTML);
}
function x(s, t, e, i, n) {
  return { name: s, icon: t, tooltip: e, action: i, isActive: n };
}
const Ct = x("bold", "bold", "Bold (Ctrl+B)", () => W(), () => document.queryCommandState("bold")), It = x("italic", "italic", "Italic (Ctrl+I)", () => V(), () => document.queryCommandState("italic")), Et = x("underline", "underline", "Underline (Ctrl+U)", () => q(), () => document.queryCommandState("underline")), Mt = x("strikethrough", "strikethrough", "Strikethrough", () => Y(), () => document.queryCommandState("strikeThrough")), Lt = x("superscript", "superscript", "Superscript", () => K(), () => document.queryCommandState("superscript")), At = x("subscript", "subscript", "Subscript", () => X(), () => document.queryCommandState("subscript")), Tt = x("alignLeft", "align-left", "Align Left", () => Z()), zt = x("alignCenter", "align-center", "Align Center", () => J()), Rt = x("alignRight", "align-right", "Align Right", () => Q()), St = x("alignJustify", "align-justify", "Justify", () => tt()), Bt = x("ul", "list-ul", "Unordered List", () => st()), Ht = x("ol", "list-ol", "Ordered List", () => nt()), Nt = x("indent", "indent", "Indent", () => et()), Pt = x("outdent", "outdent", "Outdent", () => it()), Ot = x("undo", "undo", "Undo (Ctrl+Z)", (s) => s.invoke("editor.undo")), Ft = x("redo", "redo", "Redo (Ctrl+Y)", (s) => s.invoke("editor.redo")), jt = x("hr", "minus", "Horizontal Rule", () => p("insertHorizontalRule")), $t = x("link", "link", "Insert Link", (s) => s.invoke("linkDialog.show")), Dt = x("image", "image", "Insert Image", (s) => s.invoke("imageDialog.show")), Ut = x("video", "video", "Insert Video", (s) => s.invoke("videoDialog.show")), Wt = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (s, t, e) => {
    kt(t, e), s.invoke("editor.afterCommand");
  }
}, Vt = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (s, t) => G(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, qt = x("codeview", "code", "HTML Code View", (s) => s.invoke("codeview.toggle"), (s) => s.invoke("codeview.isActive")), Yt = x("fullscreen", "expand", "Fullscreen", (s) => s.invoke("fullscreen.toggle"), (s) => s.invoke("fullscreen.isActive")), Kt = [
  [Vt],
  [Ot, Ft],
  [Ct, It, Et, Mt],
  [Lt, At],
  [Tt, zt, Rt, St],
  [Bt, Ht, Nt, Pt],
  [jt, $t, Dt, Ut, Wt],
  [qt, Yt]
], ot = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: Kt,
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
function Xt(s, t) {
  const e = l("div", { class: "asn-container" }), i = l("div", {
    class: "asn-editable",
    contenteditable: "true",
    spellcheck: "true",
    "aria-multiline": "true",
    "aria-label": "Rich text editor",
    role: "textbox"
  });
  s.tagName === "TEXTAREA" ? i.innerHTML = (s.value || "").trim() : i.innerHTML = (s.innerHTML || "").trim();
  const n = t.defaultFontFamily || t.fontFamilies && t.fontFamilies[0];
  return n && (i.style.fontFamily = n), t.height && (i.style.minHeight = `${t.height}px`), t.minHeight && (i.style.minHeight = `${t.minHeight}px`), t.maxHeight && (i.style.maxHeight = `${t.maxHeight}px`), e.appendChild(i), s.style.display = "none", s.insertAdjacentElement("afterend", e), { container: e, editable: i };
}
const Gt = 100;
class Zt {
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
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1)), this.stack.push({ html: this._serialize() }), this.stack.length > Gt ? this.stack.shift() : this.stackOffset++;
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
function Jt(s, t) {
  const e = l("table", { class: "asn-table" }), i = l("tbody");
  e.appendChild(i);
  for (let n = 0; n < t; n++) {
    const o = l("tr");
    for (let r = 0; r < s; r++) {
      const a = l("td", {}, [" "]);
      o.appendChild(a);
    }
    i.appendChild(o);
  }
  return e;
}
function Qt(s, t) {
  const e = Jt(s, t);
  p("insertHTML", e.outerHTML);
}
const B = {
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
function z(s, t) {
  return s.key === t || s.key === t.toUpperCase();
}
function L(s, t) {
  return (s.ctrlKey || s.metaKey) && z(s, t);
}
function te(s, t, e = {}) {
  if (z(s, B.TAB)) {
    const i = F(t);
    if (!i) return !1;
    const n = O(i.sc, t);
    if (n && yt(n))
      return s.preventDefault(), s.shiftKey ? p("outdent") : p("indent"), !0;
    if (n && n.nodeName.toUpperCase() === "PRE")
      return s.preventDefault(), p("insertText", "    "), !0;
    if (e.tabSize)
      return s.preventDefault(), p("insertText", " ".repeat(e.tabSize)), !0;
  }
  if (z(s, B.ENTER) && !s.shiftKey) {
    const i = F(t);
    if (!i) return !1;
    const n = O(i.sc, t);
    if (n && n.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = i.toNativeRange();
      if (o.setStart(n, n.childNodes.length), o.toString() === "" && i.isCollapsed())
        return s.preventDefault(), p("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class ee {
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
    return this._history = new Zt(t), this._bindEvents(t), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._history = null;
  }
  // ---------------------------------------------------------------------------
  // Event binding
  // ---------------------------------------------------------------------------
  _bindEvents(t) {
    const e = (o) => this._onKeydown(o), i = () => this.afterCommand(), n = () => this.context.invoke("toolbar.refresh");
    this._disposers.push(
      c(t, "keydown", e),
      c(t, "keyup", i),
      c(document, "selectionchange", n)
    );
  }
  _onKeydown(t) {
    const e = this.context.layoutInfo.editable;
    if (!te(t, e, this.options)) {
      if (L(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (L(t, "z") && t.shiftKey || L(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (L(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (L(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (L(t, "u")) {
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
    W(), this.afterCommand();
  }
  italic() {
    V(), this.afterCommand();
  }
  underline() {
    q(), this.afterCommand();
  }
  strikethrough() {
    Y(), this.afterCommand();
  }
  superscript() {
    K(), this.afterCommand();
  }
  subscript() {
    X(), this.afterCommand();
  }
  justifyLeft() {
    Z(), this.afterCommand();
  }
  justifyCenter() {
    J(), this.afterCommand();
  }
  justifyRight() {
    Q(), this.afterCommand();
  }
  justifyFull() {
    tt(), this.afterCommand();
  }
  indent() {
    et(), this.afterCommand();
  }
  outdent() {
    it(), this.afterCommand();
  }
  insertUL() {
    st(), this.afterCommand();
  }
  insertOL() {
    nt(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(t) {
    wt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(t) {
    _t(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(t) {
    xt(t), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(t) {
    G(t), this.afterCommand();
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
    p("insertHorizontalRule"), this.afterCommand();
  }
  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(t, e, i = !1) {
    const n = window.getSelection();
    if (!n || n.rangeCount === 0) return;
    const o = this._sanitiseUrl(t);
    if (!o) return;
    if (!(n.toString().trim().length > 0))
      p("insertHTML", `<a href="${o}"${i ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e || o}</a>`);
    else if (p("createLink", o), i) {
      const a = this._getClosestAnchor();
      a && (a.setAttribute("target", "_blank"), a.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    p("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, e = "") {
    const i = this._sanitiseUrl(t);
    i && (p("insertHTML", `<img src="${i}" alt="${e}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a video embed (iframe or <video> element).
   * The html string is already validated/built by VideoDialog.
   * @param {string} html
   */
  insertVideo(t) {
    t && (p("insertHTML", t), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, e) {
    Qt(t, e), this.afterCommand();
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
    const i = new DOMParser().parseFromString(`<body>${t}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((n) => {
      i.querySelectorAll(n).forEach((o) => o.remove());
    }), i.querySelectorAll("*").forEach((n) => {
      Array.from(n.attributes).forEach((o) => {
        o.name.startsWith("on") && n.removeAttribute(o.name), ["href", "src"].includes(o.name) && /^\s*javascript:/i.test(o.value) && n.removeAttribute(o.name);
      });
    }), i.body.innerHTML;
  }
}
class ie {
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
      const i = l("div", { class: "asn-btn-group" });
      e.forEach((n) => {
        let o;
        n.type === "select" ? o = this._createSelect(n) : n.type === "grid" ? o = this._createGridPicker(n) : o = this._createButton(n), i.appendChild(o);
      }), this.el.appendChild(i);
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
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((k) => k.href).join(" ")))) {
      const k = this.options.fontAwesomeClass || "fas";
      a.innerHTML = `<i class="${k} fa-table" aria-hidden="true"></i>`;
    } else {
      const k = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${k} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const h = l("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), f = l("div", { class: "asn-table-grid" }), b = l("div", { class: "asn-table-label" });
    b.textContent = "Insert Table";
    const y = [];
    for (let k = 1; k <= 10; k++)
      for (let C = 1; C <= 10; C++) {
        const E = l("div", {
          class: "asn-table-cell",
          "data-row": String(k),
          "data-col": String(C)
        });
        y.push(E), f.appendChild(E);
      }
    h.appendChild(f), h.appendChild(b);
    let _ = !1;
    const v = (k, C) => {
      y.forEach((E) => {
        const R = +E.getAttribute("data-row"), dt = +E.getAttribute("data-col");
        E.classList.toggle("active", R <= k && dt <= C);
      }), b.textContent = k && C ? `${k} × ${C}` : "Insert Table";
    }, m = () => {
      _ = !0, h.style.display = "block", a.setAttribute("aria-expanded", "true");
    }, w = () => {
      _ = !1, h.style.display = "none", a.setAttribute("aria-expanded", "false"), v(0, 0);
    }, rt = c(a, "click", (k) => {
      k.stopPropagation(), _ ? w() : m();
    }), at = c(f, "mouseover", (k) => {
      const C = k.target.closest(".asn-table-cell");
      C && v(+C.getAttribute("data-row"), +C.getAttribute("data-col"));
    }), lt = c(f, "mouseleave", () => v(0, 0)), ct = c(f, "click", (k) => {
      const C = k.target.closest(".asn-table-cell");
      if (!C) return;
      const E = +C.getAttribute("data-row"), R = +C.getAttribute("data-col");
      w(), this.context.invoke("editor.focus"), t.action(this.context, E, R);
    }), ht = c(document, "click", () => {
      _ && w();
    });
    return this._disposers.push(rt, at, lt, ct, ht), n.appendChild(a), n.appendChild(h), n;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const e = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], i = l("select", {
      class: "asn-select",
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), n = l("option", { value: "" }, ["Font"]);
    i.appendChild(n), e.forEach((r) => {
      const a = l("option", { value: r }, [r]);
      a.style.fontFamily = r, i.appendChild(a);
    });
    const o = c(i, "change", (r) => {
      const a = r.target.value;
      a && (this.context.invoke("editor.focus"), t.action(this.context, a), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(o), i;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const i = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", n = t.className ? ` ${t.className}` : "", o = `${i}${n}`, r = l("button", {
      type: "button",
      class: o,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), a = !!this.options.useFontAwesome, d = () => {
      if (!a) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const m = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((w) => w.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(m);
    }, g = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', h = (m) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${g} style="display:block">${m}</svg>`, f = /* @__PURE__ */ new Map([
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
      ["video", h('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')],
      ["table", h('<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>')],
      // View
      ["code", h('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", h('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')]
    ]), b = this.options.fontAwesomeClass || "fas", y = /* @__PURE__ */ new Map([
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
      const m = y.get(t.icon) || y.get(t.name) || null;
      m ? r.innerHTML = `<i class="${b} ${m}" aria-hidden="true"></i>` : f.has(t.icon) ? r.innerHTML = f.get(t.icon) : r.textContent = t.icon || t.name;
    } else
      f.has(t.icon) ? r.innerHTML = f.get(t.icon) : f.has(t.name) ? r.innerHTML = f.get(t.name) : r.textContent = t.icon || t.name;
    const v = c(r, "click", (m) => {
      m.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(v), r;
  }
  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------
  refresh() {
    if (!this.el) return;
    const t = this.options.toolbar || [], e = new Map(t.flat().map((i) => [i.name, i]));
    this.el.querySelectorAll("button[data-btn]").forEach((i) => {
      const n = e.get(i.getAttribute("data-btn"));
      n && typeof n.isActive == "function" && i.classList.toggle("active", !!n.isActive(this.context));
    }), this.el.querySelectorAll("select[data-btn]").forEach((i) => {
      const n = e.get(i.getAttribute("data-btn"));
      if (!n || typeof n.getValue != "function") return;
      let o = (n.getValue(this.context) || "").replace(/["']/g, "").trim();
      o || (o = this.options.defaultFontFamily || this.options.fontFamilies && this.options.fontFamilies[0] || "");
      const r = Array.from(i.options).find(
        (a) => a.value && a.value.toLowerCase() === o.toLowerCase()
      );
      i.value = r ? r.value : "";
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
class se {
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
    let e = 0, i = 0;
    const n = this.context.layoutInfo.editable, o = (g) => {
      const h = Math.max(100, i + g.clientY - e);
      n.style.height = `${h}px`;
    }, r = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r);
    }, d = c(t, "mousedown", (g) => {
      e = g.clientY, i = n.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", r), g.preventDefault();
    });
    this._disposers.push(d);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, e = ut(() => this.update(), 200), i = c(t, "input", e);
    this._disposers.push(i);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const e = this.context.layoutInfo.editable.innerText || "", i = e.trim() ? e.trim().split(/\s+/).length : 0, n = e.length;
    this._wordCountEl.textContent = `Words: ${i}`, this._charCountEl.textContent = `Chars: ${n}`;
  }
}
class ne {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = c(t, "paste", (i) => this._onPaste(i));
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
    let i = "";
    if (e.types.includes("text/html") && this.options.pasteCleanHTML !== !1) {
      const n = e.getData("text/html");
      i = this._sanitiseHTML(n), p("insertHTML", i);
    } else {
      i = e.getData("text/plain");
      const n = i.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      p("insertHTML", n);
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
    const i = new DOMParser().parseFromString(t, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form", "input", "button"].forEach((o) => {
      i.querySelectorAll(o).forEach((r) => r.parentNode.removeChild(r));
    }), i.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((r) => {
        r.name.startsWith("on") && o.removeAttribute(r.name);
      }), ["href", "src", "action"].forEach((r) => {
        const a = o.getAttribute(r);
        a && /^\s*javascript:/i.test(a) && o.removeAttribute(r);
      });
    }), i.body.innerHTML;
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
class oe {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = this.options.placeholder || "";
    e && (t.dataset.placeholder = e);
    const i = () => this._update(), n = c(t, "input", i), o = c(t, "focus", i), r = c(t, "blur", i);
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
class re {
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
`).map((i) => {
      const n = i.trim();
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
    const i = new DOMParser().parseFromString(`<body>${t}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((n) => {
      i.querySelectorAll(n).forEach((o) => o.remove());
    }), i.querySelectorAll("*").forEach((n) => {
      Array.from(n.attributes).forEach((o) => {
        o.name.startsWith("on") && n.removeAttribute(o.name), ["href", "src"].includes(o.name) && /^\s*javascript:/i.test(o.value) && n.removeAttribute(o.name);
      });
    }), i.body.innerHTML;
  }
}
class ae {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = c(document, "keydown", (e) => {
      this._active && z(e, B.ESCAPE) && this.deactivate();
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
class le {
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
    P((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = l("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), e = l("div", { class: "asn-dialog-box" }), i = l("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Link";
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
    const d = l("label", { class: "asn-label asn-label-inline" }), g = l("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = g, d.appendChild(g), d.appendChild(document.createTextNode(" Open in new tab"));
    const h = l("div", { class: "asn-dialog-actions" }), f = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    f.textContent = "Insert";
    const b = l("button", { type: "button", class: "asn-btn" });
    b.textContent = "Cancel", h.appendChild(f), h.appendChild(b), e.append(i, n, o, r, a, d, h), t.appendChild(e);
    const y = c(f, "click", () => this._onInsert()), _ = c(b, "click", () => this._close()), v = c(t, "click", (m) => {
      m.target === t && this._close();
    });
    return this._disposers.push(y, _, v), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _prefill() {
    const t = window.getSelection();
    let e = null;
    if (t && t.rangeCount > 0) {
      let i = t.getRangeAt(0).startContainer;
      for (; i; ) {
        if (i.nodeName === "A") {
          e = i;
          break;
        }
        i = i.parentNode;
      }
    }
    e ? (this._urlInput.value = e.getAttribute("href") || "", this._textInput.value = e.textContent || "", this._tabCheckbox.checked = e.getAttribute("target") === "_blank") : (this._urlInput.value = "", this._textInput.value = t ? t.toString() : "", this._tabCheckbox.checked = !1);
  }
  _onInsert() {
    const t = this._urlInput.value.trim(), e = this._textInput.value.trim(), i = this._tabCheckbox.checked;
    if (!t) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertLink", t, e, i), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
class ce {
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
    P((t) => {
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
    }), e = l("div", { class: "asn-dialog-box" }), i = l("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Image";
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
      const _ = l("label", { class: "asn-label" });
      _.textContent = "Or upload a file";
      const v = l("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = v;
      const m = c(v, "change", () => this._onFileChange());
      this._disposers.push(m), e.append(_, v);
    }
    const d = l("div", { class: "asn-dialog-actions" }), g = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    g.textContent = "Insert";
    const h = l("button", { type: "button", class: "asn-btn" });
    h.textContent = "Cancel", d.appendChild(g), d.appendChild(h), e.append(i, n, o, r, a, d), t.appendChild(e);
    const f = c(g, "click", () => this._onInsert()), b = c(h, "click", () => this._close()), y = c(t, "click", (_) => {
      _.target === t && this._close();
    });
    return this._disposers.push(f, b, y), t;
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
    const i = new FileReader();
    i.onload = (n) => {
      this._urlInput.value = n.target.result;
    }, i.readAsDataURL(t);
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
class he {
  /** @param {import('../Context.js').Context} context */
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
    P((t) => {
      this._savedRange = t;
    }), this._urlInput.value = "", this._widthInput.value = "560", this._hintEl.textContent = "", this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = l("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert video"
    }), e = l("div", { class: "asn-dialog-box" }), i = l("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Video";
    const n = l("label", { class: "asn-label" });
    n.textContent = "Video URL";
    const o = l("input", {
      type: "url",
      class: "asn-input",
      placeholder: "YouTube, Vimeo, or direct .mp4 URL",
      autocomplete: "off"
    });
    this._urlInput = o;
    const r = l("p", { class: "asn-dialog-hint" });
    this._hintEl = r;
    const a = l("label", { class: "asn-label" });
    a.textContent = "Width (px)";
    const d = l("input", {
      type: "number",
      class: "asn-input",
      placeholder: "560",
      min: "80",
      max: "1920",
      value: "560"
    });
    this._widthInput = d;
    const g = l("div", { class: "asn-dialog-actions" }), h = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    h.textContent = "Insert";
    const f = l("button", { type: "button", class: "asn-btn" });
    f.textContent = "Cancel", g.appendChild(h), g.appendChild(f), e.append(i, n, o, r, a, d, g), t.appendChild(e);
    const b = c(o, "input", () => {
      const w = this._parseVideoUrl(o.value.trim());
      r.textContent = w ? `Detected: ${w.type}` : o.value ? "Unknown format — will try direct video embed" : "";
    }), y = c(h, "click", () => this._onInsert()), _ = c(f, "click", () => this._close()), v = c(t, "click", (w) => {
      w.target === t && this._close();
    }), m = c(o, "keydown", (w) => {
      w.key === "Enter" && (w.preventDefault(), this._onInsert());
    });
    return this._disposers.push(b, y, _, v, m), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _onInsert() {
    const t = this._urlInput.value.trim(), e = Math.max(80, parseInt(this._widthInput.value, 10) || 560);
    if (!t) {
      this._urlInput.focus();
      return;
    }
    const i = this._buildEmbedHtml(t, e);
    if (!i) {
      this._hintEl.textContent = "Invalid URL — please enter a valid video link.", this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertVideo", i), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
  // ---------------------------------------------------------------------------
  // URL parsing & HTML building
  // ---------------------------------------------------------------------------
  /**
   * Parses a video URL and returns { type, embedUrl } or null.
   * @param {string} url
   * @returns {{ type: string, embedUrl: string }|null}
   */
  _parseVideoUrl(t) {
    if (!t) return null;
    try {
      const r = new URL(t);
      if (/^javascript:/i.test(r.protocol)) return null;
    } catch {
      return null;
    }
    const e = t.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (e) return { type: "YouTube", embedUrl: `https://www.youtube.com/embed/${e[1]}` };
    const i = t.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (i) return { type: "YouTube", embedUrl: `https://www.youtube.com/embed/${i[1]}` };
    const n = t.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (n) return { type: "YouTube Shorts", embedUrl: `https://www.youtube.com/embed/${n[1]}` };
    const o = t.match(/vimeo\.com\/(\d+)/);
    return o ? { type: "Vimeo", embedUrl: `https://player.vimeo.com/video/${o[1]}` } : /\.(mp4|webm|ogg|ogv|mov)(#.*|\?.*)?$/i.test(t) ? { type: "Direct video", embedUrl: t } : null;
  }
  /**
   * Builds the HTML string to insert.
   * @param {string} url
   * @param {number} width
   * @returns {string|null}
   */
  _buildEmbedHtml(t, e) {
    const i = this._parseVideoUrl(t), n = Math.round(e * 9 / 16);
    if (i && (i.type === "YouTube" || i.type === "YouTube Shorts" || i.type === "Vimeo"))
      return `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><iframe src="${i.embedUrl}" width="${e}" height="${n}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="display:block;max-width:100%"></iframe><div class="asn-video-shield"></div></div>`;
    if (i && i.type === "Direct video")
      return `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${i.embedUrl}" width="${e}" height="${n}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>`;
    const o = (() => {
      try {
        const r = new URL(t);
        return /^javascript:/i.test(r.protocol) ? null : t;
      } catch {
        return null;
      }
    })();
    return o ? `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${o}" width="${e}" height="${n}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>` : null;
  }
}
const de = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class ue {
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
        const i = e.target.closest("img");
        i && this._select(i);
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
    return t.className = "asn-image-resizer", t.style.display = "none", de.forEach(({ pos: e }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${e}`, i.dataset.handle = e, this._disposers.push(
        c(i, "mousedown", (n) => {
          n.preventDefault(), n.stopPropagation(), this._startResize(n, e);
        })
      ), t.appendChild(i);
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
    const i = this._activeImg;
    if (!i) return;
    const n = t.clientX, o = t.clientY, r = i.offsetWidth || i.naturalWidth || 100, a = i.offsetHeight || i.naturalHeight || 100, d = r / a, g = e.length === 2, h = (b) => {
      const y = b.clientX - n, _ = b.clientY - o;
      let v = r, m = a;
      e.includes("e") && (v = Math.max(20, r + y)), e.includes("w") && (v = Math.max(20, r - y)), e.includes("s") && (m = Math.max(20, a + _)), e.includes("n") && (m = Math.max(20, a - _)), g && (Math.abs(y) >= Math.abs(_) ? m = Math.max(20, Math.round(v / d)) : v = Math.max(20, Math.round(m * d))), i.style.width = `${v}px`, i.style.height = `${m}px`, this._updateOverlayPosition();
    }, f = () => {
      document.removeEventListener("mousemove", h), document.removeEventListener("mouseup", f), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", h), document.addEventListener("mouseup", f);
  }
}
const pe = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class fe {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._activeWrapper = null, this._overlay = null, this._disposers = [];
  }
  initialize() {
    this._overlay = this._buildOverlay(), document.body.appendChild(this._overlay);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      c(t, "click", (e) => this._onEditorClick(e)),
      c(t, "contextmenu", (e) => {
        const i = this._findWrapper(e.target);
        i && this._select(i);
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
  // Public API
  // ---------------------------------------------------------------------------
  /** @returns {HTMLElement|null} */
  getActiveWrapper() {
    return this._activeWrapper;
  }
  updateOverlay() {
    this._updateOverlayPosition();
  }
  deselect() {
    this._deselect();
  }
  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------
  /**
   * Walk up the DOM from `el` to find the nearest .asn-video-wrapper,
   * or an iframe/video whose parent is .asn-video-wrapper.
   * @param {EventTarget} el
   * @returns {HTMLElement|null}
   */
  _findWrapper(t) {
    if (!t || !(t instanceof Element)) return null;
    if (t.classList && t.classList.contains("asn-video-wrapper")) return t;
    const e = t.closest(".asn-video-wrapper");
    return e || null;
  }
  _buildOverlay() {
    const t = document.createElement("div");
    return t.className = "asn-video-resizer", t.style.display = "none", pe.forEach(({ pos: e }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${e}`, i.dataset.handle = e, this._disposers.push(
        c(i, "mousedown", (n) => {
          n.preventDefault(), n.stopPropagation(), this._startResize(n, e);
        })
      ), t.appendChild(i);
    }), t;
  }
  _onEditorClick(t) {
    const e = this._findWrapper(t.target);
    e && (t.preventDefault(), this._select(e));
  }
  _onDocClick(t) {
    this._activeWrapper && (this._activeWrapper.contains(t.target) || this._overlay && this._overlay.contains(t.target) || t.target.closest(".asn-contextmenu") || this._deselect());
  }
  _select(t) {
    this._activeWrapper && this._activeWrapper !== t && this._activeWrapper.classList.remove("asn-video-selected"), this._activeWrapper = t, t.classList.add("asn-video-selected"), this._updateOverlayPosition(), this._overlay.style.display = "block";
  }
  _deselect() {
    this._activeWrapper && (this._activeWrapper.classList.remove("asn-video-selected"), this._activeWrapper = null), this._overlay && (this._overlay.style.display = "none");
  }
  _updateOverlayPosition() {
    if (!this._activeWrapper || !this._overlay) return;
    const t = this._activeWrapper.getBoundingClientRect();
    this._overlay.style.left = `${t.left}px`, this._overlay.style.top = `${t.top}px`, this._overlay.style.width = `${t.width}px`, this._overlay.style.height = `${t.height}px`;
  }
  _startResize(t, e) {
    const i = this._activeWrapper;
    if (!i) return;
    const n = i.querySelector("iframe, video"), o = t.clientX, r = t.clientY, a = i.offsetWidth || 560, d = i.offsetHeight || 315, g = a / d, h = e.length === 2, f = (y) => {
      const _ = y.clientX - o, v = y.clientY - r;
      let m = a, w = d;
      e.includes("e") && (m = Math.max(80, a + _)), e.includes("w") && (m = Math.max(80, a - _)), e.includes("s") && (w = Math.max(45, d + v)), e.includes("n") && (w = Math.max(45, d - v)), h && (Math.abs(_) >= Math.abs(v) ? w = Math.max(45, Math.round(m / g)) : m = Math.max(80, Math.round(w * g))), i.style.width = `${m}px`, i.style.height = `${w}px`, n && (n.width = m, n.height = w, n.style.width = `${m}px`, n.style.height = `${w}px`), this._updateOverlayPosition();
    }, b = () => {
      document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", b), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", f), document.addEventListener("mouseup", b);
  }
}
const T = {
  open: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  unlink: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
}, me = 120, ge = 200;
class ye {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeAnchor = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      // Detect when pointer enters a link
      c(t, "mouseover", (e) => {
        const i = e.target.closest("a[href]");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      // Detect when pointer leaves the editable area entirely
      c(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((t) => t()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const t = l("div", { class: "asn-link-tooltip", role: "toolbar", "aria-label": "Link actions" });
    return t.style.display = "none", this._urlLabel = l("span", { class: "asn-link-tooltip-url" }), t.appendChild(this._urlLabel), t.appendChild(l("div", { class: "asn-link-tooltip-sep" })), this._openBtn = this._makeBtn(T.open, "Open link", () => this._openLink()), this._copyBtn = this._makeBtn(T.copy, "Copy URL", () => this._copyLink()), this._editBtn = this._makeBtn(T.edit, "Edit link", () => this._editLink()), this._unlinkBtn = this._makeBtn(T.unlink, "Remove link", () => this._unlink()), t.appendChild(this._openBtn), t.appendChild(this._copyBtn), t.appendChild(this._editBtn), t.appendChild(this._unlinkBtn), this._disposers.push(
      c(t, "mouseenter", () => this._clearTimers()),
      c(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  _makeBtn(t, e, i) {
    const n = l("button", { type: "button", class: "asn-link-tooltip-btn", title: e });
    return n.innerHTML = t, this._disposers.push(c(n, "click", (o) => {
      o.preventDefault(), o.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide logic
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeAnchor === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeAnchor = t, this._show(t);
    }, me));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => {
      this._hide();
    }, ge));
  }
  _show(t) {
    const e = t.getAttribute("href") || "";
    this._urlLabel.textContent = this._truncateUrl(e), this._urlLabel.title = e, this._el.style.display = "flex", this._positionNear(t);
  }
  _hide() {
    this._el.style.display = "none", this._activeAnchor = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(t) {
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 260, n = this._el.offsetHeight || 34, o = 6;
    let r = e.bottom + o, a = e.left;
    r + n > window.innerHeight - o && (r = e.top - n - o), a + i > window.innerWidth - o && (a = window.innerWidth - i - o), a < o && (a = o), this._el.style.top = `${r}px`, this._el.style.left = `${a}px`;
  }
  _truncateUrl(t) {
    try {
      const e = new URL(t), i = e.host + (e.pathname !== "/" ? e.pathname : "");
      return i.length > 48 ? i.slice(0, 48) + "…" : i;
    } catch {
      return t.length > 48 ? t.slice(0, 48) + "…" : t;
    }
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _openLink() {
    const t = this._activeAnchor && this._activeAnchor.getAttribute("href");
    t && window.open(t, "_blank", "noopener,noreferrer"), this._hide();
  }
  _copyLink() {
    const t = this._activeAnchor && this._activeAnchor.getAttribute("href");
    t && navigator.clipboard.writeText(t).catch(() => {
      const e = document.createElement("textarea");
      e.value = t, e.style.position = "fixed", e.style.opacity = "0", document.body.appendChild(e), e.select(), document.execCommand("copy"), document.body.removeChild(e);
    }), this._copyBtn && (this._copyBtn.classList.add("asn-link-tooltip-btn--copied"), setTimeout(() => this._copyBtn && this._copyBtn.classList.remove("asn-link-tooltip-btn--copied"), 1e3));
  }
  _editLink() {
    const t = this._activeAnchor;
    if (!t) return;
    this._hide();
    const e = window.getSelection(), i = document.createRange();
    i.selectNodeContents(t), e.removeAllRanges(), e.addRange(i), this.context.invoke("linkDialog.show");
  }
  _unlink() {
    const t = this._activeAnchor;
    if (!t) return;
    this._hide();
    const e = window.getSelection(), i = document.createRange();
    i.selectNode(t), e.removeAllRanges(), e.addRange(i), document.execCommand("unlink"), this.context.invoke("editor.afterCommand");
  }
}
const u = {
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
  video: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
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
  deleteImg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  deleteVideo: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, ve = [
  { name: "undo", label: "Undo", icon: u.undo, action: (s) => s.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: u.redo, action: (s) => s.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: u.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: u.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: u.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: u.bold, action: (s) => s.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: u.italic, action: (s) => s.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: u.underline, action: (s) => s.invoke("editor.underline") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: u.link, action: (s) => s.invoke("linkDialog.show") },
  { name: "image", label: "Insert Image", icon: u.image, action: (s) => s.invoke("imageDialog.show") },
  { name: "video", label: "Insert Video", icon: u.video, action: (s) => s.invoke("videoDialog.show") }
];
class _e {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || ve, this.el = null, this._disposers = [], this._menuDisposers = [], this._targetCell = null, this._sizePopover = null, this._lastX = 0, this._lastY = 0;
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
        r.innerHTML = u.back, o.appendChild(r), o.appendChild(l("span", { class: "asn-context-label" }, [e.label || "Back"]));
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
      const i = l("button", { type: "button", class: "asn-context-item", "data-name": e.name || "" });
      if (e.icon) {
        const o = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
        o.innerHTML = e.icon, i.appendChild(o);
      }
      i.appendChild(l("span", { class: "asn-context-label" }, [e.label || e.name]));
      const n = c(i, "click", (o) => {
        o.stopPropagation(), this.hide();
        try {
          e.action(this.context);
        } catch (r) {
          console.error(r);
        }
      });
      this._menuDisposers.push(n), this.el.appendChild(i);
    }));
  }
  _onContextMenu(t) {
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!e || !e.contains(t.target)) return;
    t.preventDefault(), this._lastX = t.clientX, this._lastY = t.clientY;
    const i = t.target.closest("img"), n = !i && t.target.closest(".asn-video-wrapper"), o = !i && !n && t.target.closest("td, th");
    this._targetCell = o || null;
    const r = i ? this._buildCombinedImageItems(i) : n ? this._buildCombinedVideoItems(n) : o ? this._buildCombinedItems(o) : this._items;
    this._renderItems(r), this.showAt(t.clientX, t.clientY);
  }
  _maybeHide(t) {
    this.el && (this.el.contains(t.target) || this.hide());
  }
  showAt(t, e) {
    this.el && (this.el.style.display = "block", this._reposition(t, e), this.el.setAttribute("aria-hidden", "false"));
  }
  _reposition(t, e) {
    if (!this.el) return;
    const i = t !== void 0 ? t : this._lastX, n = e !== void 0 ? e : this._lastY, o = this.el.getBoundingClientRect();
    let r = i, a = n;
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
        icon: u.image,
        navigate: () => this._buildImageSubItems(t)
      }
    ];
  }
  /** Image sub-menu with ← Back at the top. */
  _buildImageSubItems(t) {
    return [
      { back: !0, label: "Image Format", navigate: () => this._buildCombinedImageItems(t) },
      { separator: !0 },
      { name: "floatLeft", label: "Float Left", icon: u.floatLeft, action: () => this._setImageFloat(t, "left") },
      { name: "floatRight", label: "Float Right", icon: u.floatRight, action: () => this._setImageFloat(t, "right") },
      { name: "floatNone", label: "Float None", icon: u.floatNone, action: () => this._setImageFloat(t, "") },
      { separator: !0 },
      { name: "originalSize", label: "Original Size", icon: u.originalSize, action: () => this._resetImageSize(t) },
      { separator: !0 },
      { name: "deleteImg", label: "Delete Image", icon: u.deleteImg, action: () => this._deleteImage(t) }
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
  // Video context menu items
  // ---------------------------------------------------------------------------
  /** Default items + "Video Format ▶" when right-clicking on a video wrapper. */
  _buildCombinedVideoItems(t) {
    return [
      ...this._items,
      { separator: !0 },
      {
        name: "videoFormat",
        label: "Video Format",
        icon: u.video,
        navigate: () => this._buildVideoSubItems(t)
      }
    ];
  }
  /** Video sub-menu with ← Back at the top. */
  _buildVideoSubItems(t) {
    return [
      { back: !0, label: "Video Format", navigate: () => this._buildCombinedVideoItems(t) },
      { separator: !0 },
      { name: "videoFloatLeft", label: "Float Left", icon: u.floatLeft, action: () => this._setVideoFloat(t, "left") },
      { name: "videoFloatRight", label: "Float Right", icon: u.floatRight, action: () => this._setVideoFloat(t, "right") },
      { name: "videoFloatNone", label: "Float None", icon: u.floatNone, action: () => this._setVideoFloat(t, "") },
      { separator: !0 },
      { name: "videoOriginal", label: "Original Size", icon: u.originalSize, action: () => this._resetVideoSize(t) },
      { separator: !0 },
      { name: "deleteVideo", label: "Delete Video", icon: u.deleteVideo, action: () => this._deleteVideo(t) }
    ];
  }
  // ---------------------------------------------------------------------------
  // Video operations
  // ---------------------------------------------------------------------------
  _setVideoFloat(t, e) {
    t.style.float = e, e === "left" ? (t.style.marginRight = "12px", t.style.marginLeft = "") : e === "right" ? (t.style.marginLeft = "12px", t.style.marginRight = "") : (t.style.marginLeft = "", t.style.marginRight = ""), this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay");
  }
  _resetVideoSize(t) {
    const e = t.querySelector("iframe, video");
    t.style.width = "", t.style.height = "", e && (e.removeAttribute("width"), e.removeAttribute("height"), e.style.width = "", e.style.height = ""), this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay");
  }
  _deleteVideo(t) {
    this.context.invoke("videoResizer.deselect"), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand");
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
        icon: u.table,
        navigate: () => this._buildTableSubItems(t)
      }
    ];
  }
  /** Table sub-menu with ← Back at the top. */
  _buildTableSubItems(t) {
    return [
      { back: !0, label: "Table Format", navigate: () => this._buildCombinedItems(t) },
      { separator: !0 },
      { name: "addRowAbove", label: "Add Row Above", icon: u.rowAbove, action: () => this._addRow(t, "above") },
      { name: "addRowBelow", label: "Add Row Below", icon: u.rowBelow, action: () => this._addRow(t, "below") },
      { separator: !0 },
      { name: "addColLeft", label: "Add Column Left", icon: u.colLeft, action: () => this._addColumn(t, "left") },
      { name: "addColRight", label: "Add Column Right", icon: u.colRight, action: () => this._addColumn(t, "right") },
      { separator: !0 },
      { name: "deleteRow", label: "Delete Row", icon: u.deleteRow, action: () => this._deleteRow(t) },
      { name: "deleteCol", label: "Delete Column", icon: u.deleteCol, action: () => this._deleteColumn(t) },
      { separator: !0 },
      { name: "mergeCells", label: "Merge Cells", icon: u.mergeCells, action: () => this._mergeCells(t) },
      { separator: !0 },
      { name: "colWidth", label: "Column Width…", icon: u.colWidth, action: () => this._openSizePopover("col", t) },
      { name: "rowHeight", label: "Row Height…", icon: u.rowHeight, action: () => this._openSizePopover("row", t) },
      { separator: !0 },
      { name: "deleteTable", label: "Delete Table", icon: u.deleteTable, action: () => this._deleteTable(t) }
    ];
  }
  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------
  _addRow(t, e) {
    const i = t.closest("tr");
    if (!i) return;
    const n = Array.from(i.cells).reduce((r, a) => r + (a.colSpan || 1), 0), o = document.createElement("tr");
    for (let r = 0; r < n; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    e === "above" ? i.parentElement.insertBefore(o, i) : i.insertAdjacentElement("afterend", o), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t, e) {
    const i = t.closest("tr"), n = t.closest("table");
    if (!i || !n) return;
    const o = Array.from(i.cells).indexOf(t);
    Array.from(n.querySelectorAll("tr")).forEach((r) => {
      const a = Array.from(r.cells), d = document.createElement("td");
      d.style.border = "1px solid #dee2e6", d.style.padding = "6px 12px", d.innerHTML = "&#8203;";
      const g = e === "left" ? a[o] : a[o + 1] || null;
      r.insertBefore(d, g);
    }), this.context.invoke("editor.afterCommand");
  }
  _deleteRow(t) {
    const e = t.closest("tr"), i = t.closest("table");
    !e || !i || i.querySelectorAll("tr").length <= 1 || (e.parentElement.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
  _deleteColumn(t) {
    const e = t.closest("tr"), i = t.closest("table");
    if (!e || !i || e.cells.length <= 1) return;
    const n = Array.from(e.cells).indexOf(t);
    Array.from(i.querySelectorAll("tr")).forEach((o) => {
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
    const i = window.getSelection();
    if (!i || i.rangeCount === 0) return;
    const n = i.getRangeAt(0), o = Array.from(e.cells).filter((a) => {
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
    const e = l("div", { class: "asn-size-popover-title" }), i = l("div", { class: "asn-size-popover-body" }), n = l("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), o = l("span", { class: "asn-size-unit" }, ["px"]);
    i.appendChild(n), i.appendChild(o);
    const r = l("div", { class: "asn-size-popover-actions" }), a = l("button", { type: "button", class: "asn-btn" });
    a.textContent = "Cancel";
    const d = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    d.textContent = "Apply", r.appendChild(a), r.appendChild(d), t.appendChild(e), t.appendChild(i), t.appendChild(r), this._sizeTitleEl = e, this._sizeInputEl = n, this._sizeApply = null;
    const g = c(d, "click", () => {
      const y = parseInt(this._sizeInputEl.value, 10);
      y > 0 && typeof this._sizeApply == "function" && this._sizeApply(y), this._hideSizePopover();
    }), h = c(a, "click", () => this._hideSizePopover()), f = c(n, "keydown", (y) => {
      y.key === "Enter" && (y.preventDefault(), d.click()), y.key === "Escape" && this._hideSizePopover();
    }), b = c(document, "click", (y) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(y.target) && this._hideSizePopover();
    });
    return this._disposers.push(g, h, f, b), t;
  }
  _openSizePopover(t, e) {
    if (!this._sizePopover) return;
    const i = t === "col";
    this._sizeTitleEl.textContent = i ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = i ? e.offsetWidth || 120 : e.closest("tr") && e.closest("tr").offsetHeight || 40, this._sizeApply = (n) => {
      if (i) {
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
class xe {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, e = {}) {
    this.targetEl = t, this.options = $(ot, e), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: e } = Xt(this.targetEl, this.options);
    this.layoutInfo.container = t, this.layoutInfo.editable = e, this._registerModules();
    const i = this._modules.get("toolbar");
    i && i.el && (t.insertBefore(i.el, e), this.layoutInfo.toolbar = i.el);
    const n = this._modules.get("statusbar");
    return n && n.el && (t.appendChild(n.el), this.layoutInfo.statusbar = n.el), this._bindEditorEvents(e), this.options.focus && e.focus(), this._alive = !0, this.invoke("toolbar.refresh"), this;
  }
  _registerModules() {
    const t = (e, i) => {
      const n = new i(this);
      n.initialize(), this._modules.set(e, n);
    };
    t("editor", ee), t("toolbar", ie), t("statusbar", se), t("clipboard", ne), t("contextMenu", _e), t("placeholder", oe), t("codeview", re), t("fullscreen", ae), t("linkDialog", le), t("imageDialog", ce), t("videoDialog", he), t("imageResizer", ue), t("videoResizer", fe), t("linkTooltip", ye);
  }
  _bindEditorEvents(t) {
    const e = c(t, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), i = c(t, "blur", () => {
      this.layoutInfo.container.classList.remove("asn-focused"), this._syncToTarget(), typeof this.options.onBlur == "function" && this.options.onBlur(this);
    });
    this._disposers.push(e, i);
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
    const [i, n] = t.split("."), o = this._modules.get(i);
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
    const i = this._listeners.get(t);
    if (!i) return;
    const n = i.indexOf(e);
    n !== -1 && i.splice(n, 1);
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
function Ze(s) {
  return s[s.length - 1];
}
function Je(s) {
  return s[0];
}
function Qe(s, t = 1) {
  return s.slice(0, s.length - t);
}
function ti(s, t = 1) {
  return s.slice(t);
}
function ei(s) {
  return s.reduce((t, e) => t.concat(e), []);
}
function ii(s) {
  return [...new Set(s)];
}
function si(s, t) {
  const e = [];
  for (let i = 0; i < s.length; i += t)
    e.push(s.slice(i, i + t));
  return e;
}
function ni(s, t) {
  return s.reduce((e, i) => {
    const n = t(i);
    return e[n] || (e[n] = []), e[n].push(i), e;
  }, {});
}
function oi(s, t) {
  return s.every(t);
}
function ri(s, t) {
  return s.some(t);
}
const M = navigator.userAgent, ai = {
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
}, A = /* @__PURE__ */ new WeakMap(), li = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(s, t = {}) {
    const i = j(s).map((n) => {
      if (A.has(n)) return A.get(n);
      const o = new xe(n, t);
      return o.initialize(), A.set(n, o), o;
    });
    return i.length === 1 ? i[0] : i;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(s) {
    j(s).forEach((t) => {
      const e = A.get(t);
      e && (e.destroy(), A.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(s) {
    const t = typeof s == "string" ? document.querySelector(s) : s;
    return t && A.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: ot,
  /** Library version */
  version: "1.0.0"
};
function j(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : s instanceof Element ? [s] : s instanceof NodeList || Array.isArray(s) ? Array.from(s) : [];
}
export {
  xe as Context,
  pt as ELEMENT_NODE,
  ft as TEXT_NODE,
  N as WrappedRange,
  oi as all,
  Be as ancestors,
  ri as any,
  He as children,
  si as chunk,
  be as clamp,
  H as closest,
  O as closestPara,
  Ke as collapsedRange,
  ke as compose,
  l as createElement,
  F as currentRange,
  ut as debounce,
  li as default,
  ot as defaultOptions,
  ai as env,
  Je as first,
  ei as flatten,
  U as fromNativeRange,
  ni as groupBy,
  Ce as identity,
  Qe as initial,
  $e as insertAfter,
  Re as isAnchor,
  vt as isEditable,
  I as isElement,
  Ue as isEmpty,
  Me as isFunction,
  Se as isImage,
  ze as isInline,
  qe as isInsideEditable,
  z as isKey,
  yt as isLi,
  Ae as isList,
  L as isModifier,
  Ie as isNil,
  gt as isPara,
  S as isPlainObject,
  Xe as isSelectionInside,
  Ee as isString,
  Te as isTable,
  D as isText,
  mt as isVoid,
  B as key,
  Ze as last,
  $ as mergeDeep,
  Pe as nextElement,
  De as nodeValue,
  c as on,
  We as outerHtml,
  Ve as placeCaret,
  Ne as prevElement,
  Ye as rangeFromElement,
  Le as rect2bnd,
  Oe as remove,
  Ge as splitText,
  ti as tail,
  we as throttle,
  ii as unique,
  Fe as unwrap,
  P as withSavedRange,
  je as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
