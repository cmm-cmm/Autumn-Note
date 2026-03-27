function de(e, t, i) {
  return Math.min(Math.max(e, t), i);
}
function dt(e, t) {
  let i;
  return function(...n) {
    clearTimeout(i), i = setTimeout(() => e.apply(this, n), t);
  };
}
function ue(e, t) {
  let i = 0;
  return function(...n) {
    const s = Date.now();
    if (s - i >= t)
      return i = s, e.apply(this, n);
  };
}
function pe(...e) {
  return (t) => e.reduceRight((i, n) => n(i), t);
}
function fe(e) {
  return e;
}
function me(e) {
  return e == null;
}
function ge(e) {
  return typeof e == "string";
}
function ye(e) {
  return typeof e == "function";
}
function F(e, t) {
  const i = Object.assign({}, e);
  if (H(e) && H(t))
    for (const n of Object.keys(t))
      H(t[n]) && n in e ? i[n] = F(e[n], t[n]) : i[n] = t[n];
  return i;
}
function H(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function xe(e) {
  return e ? {
    top: Math.round(e.top),
    left: Math.round(e.left),
    width: Math.round(e.width),
    height: Math.round(e.height),
    bottom: Math.round(e.bottom),
    right: Math.round(e.right)
  } : null;
}
const ut = 1, pt = 3, w = (e) => e && e.nodeType === ut, O = (e) => e && e.nodeType === pt, ft = (e) => w(e) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(e.nodeName), mt = (e) => w(e) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(e.nodeName), gt = (e) => w(e) && /^(li)$/i.test(e.nodeName), be = (e) => w(e) && /^(ul|ol)$/i.test(e.nodeName), ve = (e) => w(e) && e.nodeName.toUpperCase() === "TABLE", _e = (e) => w(e) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(e.nodeName), yt = (e) => w(e) && e.isContentEditable, we = (e) => w(e) && e.nodeName.toUpperCase() === "A", Ce = (e) => w(e) && e.nodeName.toUpperCase() === "IMG";
function B(e, t, i) {
  let n = e;
  for (; n && n !== i; ) {
    if (t(n)) return n;
    n = n.parentNode;
  }
  return null;
}
function N(e, t) {
  return B(e, mt, t);
}
function ke(e, t) {
  const i = [];
  let n = e.parentNode;
  for (; n && n !== t; )
    i.push(n), n = n.parentNode;
  return i;
}
function Ae(e) {
  return Array.from(e.childNodes);
}
function Ee(e) {
  let t = e.previousSibling;
  for (; t && !w(t); )
    t = t.previousSibling;
  return t;
}
function Me(e) {
  let t = e.nextSibling;
  for (; t && !w(t); )
    t = t.nextSibling;
  return t;
}
function l(e, t = {}, i = []) {
  const n = document.createElement(e);
  for (const [s, o] of Object.entries(t))
    n.setAttribute(s, o);
  for (const s of i)
    typeof s == "string" ? n.appendChild(document.createTextNode(s)) : n.appendChild(s);
  return n;
}
function Ie(e) {
  e && e.parentNode && e.parentNode.removeChild(e);
}
function Le(e) {
  const t = e.parentNode;
  if (t) {
    for (; e.firstChild; )
      t.insertBefore(e.firstChild, e);
    t.removeChild(e);
  }
}
function Te(e, t) {
  return e.parentNode.insertBefore(t, e), t.appendChild(e), t;
}
function Se(e, t) {
  t.nextSibling ? t.parentNode.insertBefore(e, t.nextSibling) : t.parentNode.appendChild(e);
}
function He(e) {
  return O(e) ? e.nodeValue : e.textContent || "";
}
function Re(e) {
  return O(e) ? !e.nodeValue : ft(e) ? !1 : !e.textContent.trim() && !e.querySelector("img, video, hr, table");
}
function Be(e) {
  return e.outerHTML;
}
function ze(e) {
  const t = document.createRange();
  t.selectNodeContents(e), t.collapse(!1);
  const i = window.getSelection();
  i && (i.removeAllRanges(), i.addRange(t));
}
function Ne(e) {
  return !!B(e, yt);
}
function h(e, t, i, n) {
  return e.addEventListener(t, i, n), () => e.removeEventListener(t, i, n);
}
class z {
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
    return w(i) ? i : i.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return B(this.sc, (i) => w(i) && i !== t, t);
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
function U(e) {
  return new z(
    e.startContainer,
    e.startOffset,
    e.endContainer,
    e.endOffset
  );
}
function P(e) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const i = t.getRangeAt(0);
  return e && !e.contains(i.commonAncestorContainer) ? null : U(i);
}
function Pe(e) {
  return new z(e, 0, e, e.childNodes.length);
}
function je(e, t = 0) {
  return new z(e, t, e, t);
}
function Fe(e) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : e.contains(t.getRangeAt(0).commonAncestorContainer);
}
function D(e) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    e(null);
    return;
  }
  const i = t.getRangeAt(0).cloneRange();
  e(U(i)), t.removeAllRanges(), t.addRange(i);
}
function Oe(e, t) {
  const i = e.splitText(t);
  return [e, i];
}
function d(e, t = null) {
  return document.execCommand(e, !1, t);
}
const $ = () => d("bold"), q = () => d("italic"), W = () => d("underline"), K = () => d("strikeThrough"), V = () => d("superscript"), Y = () => d("subscript"), xt = (e) => d("foreColor", e), bt = (e) => d("hiliteColor", e), X = (e) => d("fontName", e);
function vt(e) {
  d("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const i = document.createElement("span");
    for (i.style.fontSize = e, t.parentNode.insertBefore(i, t); t.firstChild; ) i.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const _t = (e) => d("formatBlock", `<${e}>`), G = () => d("justifyLeft"), J = () => d("justifyCenter"), Z = () => d("justifyRight"), Q = () => d("justifyFull"), tt = () => d("indent"), et = () => d("outdent"), it = () => d("insertUnorderedList"), nt = () => d("insertOrderedList");
function wt(e, t) {
  const i = document.createElement("table");
  i.style.borderCollapse = "collapse", i.style.width = "100%";
  const n = document.createElement("tbody");
  for (let s = 0; s < e; s++) {
    const o = document.createElement("tr");
    for (let r = 0; r < t; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.style.minWidth = "40px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    n.appendChild(o);
  }
  i.appendChild(n), d("insertHTML", i.outerHTML);
}
function p(e, t, i, n, s) {
  return { name: e, icon: t, tooltip: i, action: n, isActive: s };
}
const Ct = p("bold", "bold", "Bold (Ctrl+B)", () => $(), () => document.queryCommandState("bold")), kt = p("italic", "italic", "Italic (Ctrl+I)", () => q(), () => document.queryCommandState("italic")), At = p("underline", "underline", "Underline (Ctrl+U)", () => W(), () => document.queryCommandState("underline")), Et = p("strikethrough", "strikethrough", "Strikethrough", () => K(), () => document.queryCommandState("strikeThrough")), Mt = p("superscript", "superscript", "Superscript", () => V(), () => document.queryCommandState("superscript")), It = p("subscript", "subscript", "Subscript", () => Y(), () => document.queryCommandState("subscript")), Lt = p("alignLeft", "align-left", "Align Left", () => G()), Tt = p("alignCenter", "align-center", "Align Center", () => J()), St = p("alignRight", "align-right", "Align Right", () => Z()), Ht = p("alignJustify", "align-justify", "Justify", () => Q()), Rt = p("ul", "list-ul", "Unordered List", () => it()), Bt = p("ol", "list-ol", "Ordered List", () => nt()), zt = p("indent", "indent", "Indent", () => tt()), Nt = p("outdent", "outdent", "Outdent", () => et()), Pt = p("undo", "undo", "Undo (Ctrl+Z)", (e) => e.invoke("editor.undo")), jt = p("redo", "redo", "Redo (Ctrl+Y)", (e) => e.invoke("editor.redo")), Ft = p("hr", "minus", "Horizontal Rule", () => d("insertHorizontalRule")), Ot = p("link", "link", "Insert Link", (e) => e.invoke("linkDialog.show")), Ut = p("image", "image", "Insert Image", (e) => e.invoke("imageDialog.show")), Dt = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (e, t, i) => {
    wt(t, i), e.invoke("editor.afterCommand");
  }
}, $t = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (e, t) => X(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, qt = p("codeview", "code", "HTML Code View", (e) => e.invoke("codeview.toggle"), (e) => e.invoke("codeview.isActive")), Wt = p("fullscreen", "expand", "Fullscreen", (e) => e.invoke("fullscreen.toggle"), (e) => e.invoke("fullscreen.isActive")), Kt = [
  [$t],
  [Pt, jt],
  [Ct, kt, At, Et],
  [Mt, It],
  [Lt, Tt, St, Ht],
  [Rt, Bt, zt, Nt],
  [Ft, Ot, Ut, Dt],
  [qt, Wt]
], st = {
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
function Vt(e, t) {
  const i = l("div", { class: "asn-container" }), n = l("div", {
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
function Gt(e, t) {
  const i = l("table", { class: "asn-table" }), n = l("tbody");
  i.appendChild(n);
  for (let s = 0; s < t; s++) {
    const o = l("tr");
    for (let r = 0; r < e; r++) {
      const a = l("td", {}, [" "]);
      o.appendChild(a);
    }
    n.appendChild(o);
  }
  return i;
}
function Jt(e, t) {
  const i = Gt(e, t);
  d("insertHTML", i.outerHTML);
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
function T(e, t) {
  return e.key === t || e.key === t.toUpperCase();
}
function M(e, t) {
  return (e.ctrlKey || e.metaKey) && T(e, t);
}
function Zt(e, t, i = {}) {
  if (T(e, R.TAB)) {
    const n = P(t);
    if (!n) return !1;
    const s = N(n.sc, t);
    if (s && gt(s))
      return e.preventDefault(), e.shiftKey ? d("outdent") : d("indent"), !0;
    if (s && s.nodeName.toUpperCase() === "PRE")
      return e.preventDefault(), d("insertText", "    "), !0;
    if (i.tabSize)
      return e.preventDefault(), d("insertText", " ".repeat(i.tabSize)), !0;
  }
  if (T(e, R.ENTER) && !e.shiftKey) {
    const n = P(t);
    if (!n) return !1;
    const s = N(n.sc, t);
    if (s && s.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = n.toNativeRange();
      if (o.setStart(s, s.childNodes.length), o.toString() === "" && n.isCollapsed())
        return e.preventDefault(), d("formatBlock", "<p>"), !0;
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
    const i = (o) => this._onKeydown(o), n = () => this.afterCommand(), s = () => this.context.invoke("toolbar.refresh");
    this._disposers.push(
      h(t, "keydown", i),
      h(t, "keyup", n),
      h(document, "selectionchange", s)
    );
  }
  _onKeydown(t) {
    const i = this.context.layoutInfo.editable;
    if (!Zt(t, i, this.options)) {
      if (M(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (M(t, "z") && t.shiftKey || M(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (M(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (M(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (M(t, "u")) {
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
    K(), this.afterCommand();
  }
  superscript() {
    V(), this.afterCommand();
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
    nt(), this.afterCommand();
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
    bt(t), this.afterCommand();
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
    vt(t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    d("insertHorizontalRule"), this.afterCommand();
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
      d("insertHTML", `<a href="${o}"${n ? ' target="_blank" rel="noopener noreferrer"' : ""}>${i || o}</a>`);
    else if (d("createLink", o), n) {
      const a = this._getClosestAnchor();
      a && (a.setAttribute("target", "_blank"), a.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    d("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, i = "") {
    const n = this._sanitiseUrl(t);
    n && (d("insertHTML", `<img src="${n}" alt="${i}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, i) {
    Jt(t, i), this.afterCommand();
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
    (this.options.toolbar || []).forEach((i) => {
      const n = l("div", { class: "asn-btn-group" });
      i.forEach((s) => {
        let o;
        s.type === "select" ? o = this._createSelect(s) : s.type === "grid" ? o = this._createGridPicker(s) : o = this._createButton(s), n.appendChild(o);
      }), this.el.appendChild(n);
    });
  }
  /**
   * Creates a table-grid picker button with a hoverable row/col selector popup.
   * @param {import('./Buttons.js').ButtonDef} def
   * @returns {HTMLDivElement}
   */
  _createGridPicker(t) {
    const s = l("div", { class: "asn-table-picker-wrap" }), r = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", a = l("button", {
      type: "button",
      class: r,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((m) => m.href).join(" ")))) {
      const m = this.options.fontAwesomeClass || "fas";
      a.innerHTML = `<i class="${m} fa-table" aria-hidden="true"></i>`;
    } else {
      const m = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${m} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const c = l("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), f = l("div", { class: "asn-table-grid" }), _ = l("div", { class: "asn-table-label" });
    _.textContent = "Insert Table";
    const x = [];
    for (let m = 1; m <= 10; m++)
      for (let b = 1; b <= 10; b++) {
        const A = l("div", {
          class: "asn-table-cell",
          "data-row": String(m),
          "data-col": String(b)
        });
        x.push(A), f.appendChild(A);
      }
    c.appendChild(f), c.appendChild(_);
    let C = !1;
    const k = (m, b) => {
      x.forEach((A) => {
        const S = +A.getAttribute("data-row"), ht = +A.getAttribute("data-col");
        A.classList.toggle("active", S <= m && ht <= b);
      }), _.textContent = m && b ? `${m} × ${b}` : "Insert Table";
    }, v = () => {
      C = !0, c.style.display = "block", a.setAttribute("aria-expanded", "true");
    }, L = () => {
      C = !1, c.style.display = "none", a.setAttribute("aria-expanded", "false"), k(0, 0);
    }, ot = h(a, "click", (m) => {
      m.stopPropagation(), C ? L() : v();
    }), rt = h(f, "mouseover", (m) => {
      const b = m.target.closest(".asn-table-cell");
      b && k(+b.getAttribute("data-row"), +b.getAttribute("data-col"));
    }), at = h(f, "mouseleave", () => k(0, 0)), lt = h(f, "click", (m) => {
      const b = m.target.closest(".asn-table-cell");
      if (!b) return;
      const A = +b.getAttribute("data-row"), S = +b.getAttribute("data-col");
      L(), this.context.invoke("editor.focus"), t.action(this.context, A, S);
    }), ct = h(document, "click", () => {
      C && L();
    });
    return this._disposers.push(ot, rt, at, lt, ct), s.appendChild(a), s.appendChild(c), s;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const i = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], n = l("select", {
      class: "asn-select",
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), s = l("option", { value: "" }, ["Font"]);
    n.appendChild(s), i.forEach((r) => {
      const a = l("option", { value: r }, [r]);
      a.style.fontFamily = r, n.appendChild(a);
    });
    const o = h(n, "change", (r) => {
      const a = r.target.value;
      a && (this.context.invoke("editor.focus"), t.action(this.context, a), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(o), n;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const n = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", s = t.className ? ` ${t.className}` : "", o = `${n}${s}`, r = l("button", {
      type: "button",
      class: o,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), a = !!this.options.useFontAwesome, u = () => {
      if (!a) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const v = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((L) => L.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(v);
    }, y = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', c = (v) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${y} style="display:block">${v}</svg>`, f = /* @__PURE__ */ new Map([
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
      ["table", c('<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>')],
      // View
      ["code", c('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", c('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')]
    ]), _ = this.options.fontAwesomeClass || "fas", x = /* @__PURE__ */ new Map([
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
    if (u()) {
      const v = x.get(t.icon) || x.get(t.name) || null;
      v ? r.innerHTML = `<i class="${_} ${v}" aria-hidden="true"></i>` : f.has(t.icon) ? r.innerHTML = f.get(t.icon) : r.textContent = t.icon || t.name;
    } else
      f.has(t.icon) ? r.innerHTML = f.get(t.icon) : f.has(t.name) ? r.innerHTML = f.get(t.name) : r.textContent = t.icon || t.name;
    const k = h(r, "click", (v) => {
      v.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(k), r;
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
      const r = Array.from(n.options).find(
        (a) => a.value && a.value.toLowerCase() === o.toLowerCase()
      );
      n.value = r ? r.value : "";
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
      const i = l("div", {
        class: "asn-resize-handle",
        title: "Resize editor",
        "aria-hidden": "true"
      });
      this._bindResize(i), this.el.appendChild(i);
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
    let i = 0, n = 0;
    const s = this.context.layoutInfo.editable, o = (y) => {
      const c = Math.max(100, n + y.clientY - i);
      s.style.height = `${c}px`;
    }, r = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r);
    }, u = h(t, "mousedown", (y) => {
      i = y.clientY, n = s.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", r), y.preventDefault();
    });
    this._disposers.push(u);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, i = dt(() => this.update(), 200), n = h(t, "input", i);
    this._disposers.push(n);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const i = this.context.layoutInfo.editable.innerText || "", n = i.trim() ? i.trim().split(/\s+/).length : 0, s = i.length;
    this._wordCountEl.textContent = `Words: ${n}`, this._charCountEl.textContent = `Chars: ${s}`;
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
    const t = this.context.layoutInfo.editable, i = h(t, "paste", (n) => this._onPaste(n));
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
      n = this._sanitiseHTML(s), d("insertHTML", n);
    } else {
      n = i.getData("text/plain");
      const s = n.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      d("insertHTML", s);
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
      n.querySelectorAll(o).forEach((r) => r.parentNode.removeChild(r));
    }), n.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((r) => {
        r.name.startsWith("on") && o.removeAttribute(r.name);
      }), ["href", "src", "action"].forEach((r) => {
        const a = o.getAttribute(r);
        a && /^\s*javascript:/i.test(a) && o.removeAttribute(r);
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
class ne {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, i = this.options.placeholder || "";
    i && (t.dataset.placeholder = i);
    const n = () => this._update(), s = h(t, "input", n), o = h(t, "focus", n), r = h(t, "blur", n);
    return this._disposers.push(s, o, r), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  _update() {
    const t = this.context.layoutInfo.editable, i = !t.textContent.trim() && !t.querySelector("img, table, hr");
    t.classList.toggle("asn-placeholder", i);
  }
}
class se {
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
    this._textarea = l("textarea", {
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
class oe {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = h(document, "keydown", (i) => {
      this._active && T(i, R.ESCAPE) && this.deactivate();
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
    D((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = l("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), i = l("div", { class: "asn-dialog-box" }), n = l("h3", { class: "asn-dialog-title" });
    n.textContent = "Insert Link";
    const s = l("label", { class: "asn-label" });
    s.textContent = "URL";
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
    const u = l("label", { class: "asn-label asn-label-inline" }), y = l("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = y, u.appendChild(y), u.appendChild(document.createTextNode(" Open in new tab"));
    const c = l("div", { class: "asn-dialog-actions" }), f = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    f.textContent = "Insert";
    const _ = l("button", { type: "button", class: "asn-btn" });
    _.textContent = "Cancel", c.appendChild(f), c.appendChild(_), i.append(n, s, o, r, a, u, c), t.appendChild(i);
    const x = h(f, "click", () => this._onInsert()), C = h(_, "click", () => this._close()), k = h(t, "click", (v) => {
      v.target === t && this._close();
    });
    return this._disposers.push(x, C, k), t;
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
    D((t) => {
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
    }), i = l("div", { class: "asn-dialog-box" }), n = l("h3", { class: "asn-dialog-title" });
    n.textContent = "Insert Image";
    const s = l("label", { class: "asn-label" });
    s.textContent = "Image URL";
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
      const C = l("label", { class: "asn-label" });
      C.textContent = "Or upload a file";
      const k = l("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = k;
      const v = h(k, "change", () => this._onFileChange());
      this._disposers.push(v), i.append(C, k);
    }
    const u = l("div", { class: "asn-dialog-actions" }), y = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    y.textContent = "Insert";
    const c = l("button", { type: "button", class: "asn-btn" });
    c.textContent = "Cancel", u.appendChild(y), u.appendChild(c), i.append(n, s, o, r, a, u), t.appendChild(i);
    const f = h(y, "click", () => this._onInsert()), _ = h(c, "click", () => this._close()), x = h(t, "click", (C) => {
      C.target === t && this._close();
    });
    return this._disposers.push(f, _, x), t;
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
const g = {
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
  rowHeight: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/></svg>'
}, le = [
  { name: "undo", label: "Undo", icon: g.undo, action: (e) => e.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: g.redo, action: (e) => e.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: g.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: g.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: g.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: g.bold, action: (e) => e.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: g.italic, action: (e) => e.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: g.underline, action: (e) => e.invoke("editor.underline") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: g.link, action: (e) => e.invoke("linkDialog.open") },
  { name: "image", label: "Insert Image", icon: g.image, action: (e) => e.invoke("imageDialog.open") }
];
class ce {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || le, this.el = null, this._disposers = [], this._menuDisposers = [], this._targetCell = null, this._sizePopover = null, this._lastX = 0, this._lastY = 0;
  }
  initialize() {
    this.el = l("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover), this._renderItems(this._items);
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    return t && this._disposers.push(h(t, "contextmenu", (i) => this._onContextMenu(i))), this._disposers.push(h(document, "click", (i) => this._maybeHide(i))), this._disposers.push(h(document, "keydown", (i) => {
      i.key === "Escape" && this.hide();
    })), this._disposers.push(h(window, "scroll", () => this.hide(), { passive: !0 })), this;
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
    this._menuDisposers.forEach((i) => i()), this._menuDisposers = [], this.el && (this.el.innerHTML = "", t.forEach((i) => {
      if (i.separator || i.sep) {
        const r = l("div", { class: "asn-context-sep" });
        this.el.appendChild(r);
        return;
      }
      const n = l("button", { type: "button", class: "asn-context-item", "data-name": i.name || "" });
      if (i.icon) {
        const r = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
        r.innerHTML = i.icon, n.appendChild(r);
      }
      const s = l("span", { class: "asn-context-label" }, [i.label || i.name]);
      n.appendChild(s);
      const o = h(n, "click", (r) => {
        r.stopPropagation(), this.hide();
        try {
          i.action(this.context);
        } catch (a) {
          console.error(a);
        }
      });
      this._menuDisposers.push(o), this.el.appendChild(n);
    }));
  }
  _onContextMenu(t) {
    const i = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!i || !i.contains(t.target)) return;
    t.preventDefault(), this._lastX = t.clientX, this._lastY = t.clientY;
    const n = t.target.closest("td, th");
    this._targetCell = n || null;
    const s = n ? this._buildTableItems(n) : this._items;
    this._renderItems(s), this.showAt(t.clientX, t.clientY);
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
  // ---------------------------------------------------------------------------
  // Table context menu items
  // ---------------------------------------------------------------------------
  _buildTableItems(t) {
    return [
      { name: "addRowAbove", label: "Add Row Above", icon: g.rowAbove, action: () => this._addRow(t, "above") },
      { name: "addRowBelow", label: "Add Row Below", icon: g.rowBelow, action: () => this._addRow(t, "below") },
      { separator: !0 },
      { name: "addColLeft", label: "Add Column Left", icon: g.colLeft, action: () => this._addColumn(t, "left") },
      { name: "addColRight", label: "Add Column Right", icon: g.colRight, action: () => this._addColumn(t, "right") },
      { separator: !0 },
      { name: "deleteRow", label: "Delete Row", icon: g.deleteRow, action: () => this._deleteRow(t) },
      { name: "deleteCol", label: "Delete Column", icon: g.deleteCol, action: () => this._deleteColumn(t) },
      { separator: !0 },
      { name: "mergeCells", label: "Merge Cells", icon: g.mergeCells, action: () => this._mergeCells(t) },
      { separator: !0 },
      { name: "colWidth", label: "Column Width…", icon: g.colWidth, action: () => this._openSizePopover("col", t) },
      { name: "rowHeight", label: "Row Height…", icon: g.rowHeight, action: () => this._openSizePopover("row", t) }
    ];
  }
  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------
  _addRow(t, i) {
    const n = t.closest("tr");
    if (!n) return;
    const s = Array.from(n.cells).reduce((r, a) => r + (a.colSpan || 1), 0), o = document.createElement("tr");
    for (let r = 0; r < s; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    i === "above" ? n.parentElement.insertBefore(o, n) : n.insertAdjacentElement("afterend", o), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t, i) {
    const n = t.closest("tr"), s = t.closest("table");
    if (!n || !s) return;
    const o = Array.from(n.cells).indexOf(t);
    Array.from(s.querySelectorAll("tr")).forEach((r) => {
      const a = Array.from(r.cells), u = document.createElement("td");
      u.style.border = "1px solid #dee2e6", u.style.padding = "6px 12px", u.innerHTML = "&#8203;";
      const y = i === "left" ? a[o] : a[o + 1] || null;
      r.insertBefore(u, y);
    }), this.context.invoke("editor.afterCommand");
  }
  _deleteRow(t) {
    const i = t.closest("tr"), n = t.closest("table");
    !i || !n || n.querySelectorAll("tr").length <= 1 || (i.parentElement.removeChild(i), this.context.invoke("editor.afterCommand"));
  }
  _deleteColumn(t) {
    const i = t.closest("tr"), n = t.closest("table");
    if (!i || !n || i.cells.length <= 1) return;
    const s = Array.from(i.cells).indexOf(t);
    Array.from(n.querySelectorAll("tr")).forEach((o) => {
      const r = o.cells[s];
      r && o.removeChild(r);
    }), this.context.invoke("editor.afterCommand");
  }
  _mergeCells(t) {
    const i = t.closest("tr");
    if (!i) return;
    const n = window.getSelection();
    if (!n || n.rangeCount === 0) return;
    const s = n.getRangeAt(0), o = Array.from(i.cells).filter((a) => {
      try {
        return s.intersectsNode(a);
      } catch {
        return !1;
      }
    });
    if (o.length < 2) return;
    const r = o[0];
    r.colSpan = o.reduce((a, u) => a + (u.colSpan || 1), 0), r.innerHTML = o.map((a) => a.innerHTML).join(""), o.slice(1).forEach((a) => i.removeChild(a)), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------
  _buildSizePopover() {
    const t = l("div", { class: "asn-size-popover" });
    t.style.display = "none";
    const i = l("div", { class: "asn-size-popover-title" }), n = l("div", { class: "asn-size-popover-body" }), s = l("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), o = l("span", { class: "asn-size-unit" }, ["px"]);
    n.appendChild(s), n.appendChild(o);
    const r = l("div", { class: "asn-size-popover-actions" }), a = l("button", { type: "button", class: "asn-btn" });
    a.textContent = "Cancel";
    const u = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    u.textContent = "Apply", r.appendChild(a), r.appendChild(u), t.appendChild(i), t.appendChild(n), t.appendChild(r), this._sizeTitleEl = i, this._sizeInputEl = s, this._sizeApply = null;
    const y = h(u, "click", () => {
      const x = parseInt(this._sizeInputEl.value, 10);
      x > 0 && typeof this._sizeApply == "function" && this._sizeApply(x), this._hideSizePopover();
    }), c = h(a, "click", () => this._hideSizePopover()), f = h(s, "keydown", (x) => {
      x.key === "Enter" && (x.preventDefault(), u.click()), x.key === "Escape" && this._hideSizePopover();
    }), _ = h(document, "click", (x) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(x.target) && this._hideSizePopover();
    });
    return this._disposers.push(y, c, f, _), t;
  }
  _openSizePopover(t, i) {
    if (!this._sizePopover) return;
    const n = t === "col";
    this._sizeTitleEl.textContent = n ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = n ? i.offsetWidth || 120 : i.closest("tr") && i.closest("tr").offsetHeight || 40, this._sizeApply = (s) => {
      if (n) {
        const o = i.closest("table"), r = Array.from(i.closest("tr").cells).indexOf(i);
        Array.from(o.querySelectorAll("tr")).forEach((a) => {
          const u = a.cells[r];
          u && (u.style.width = `${s}px`, u.style.minWidth = `${s}px`);
        });
      } else {
        const o = i.closest("tr");
        o && Array.from(o.cells).forEach((r) => {
          r.style.height = `${s}px`;
        });
      }
      this.context.invoke("editor.afterCommand");
    }, this._sizePopover.style.display = "block", requestAnimationFrame(() => {
      if (!this._sizePopover) return;
      const s = this._sizePopover.offsetWidth || 220, o = this._sizePopover.offsetHeight || 110;
      let r = this._lastX, a = this._lastY;
      r + s > window.innerWidth && (r = window.innerWidth - s - 8), a + o > window.innerHeight && (a = window.innerHeight - o - 8), this._sizePopover.style.left = `${r}px`, this._sizePopover.style.top = `${a}px`, this._sizeInputEl && (this._sizeInputEl.focus(), this._sizeInputEl.select());
    });
  }
  _hideSizePopover() {
    this._sizePopover && (this._sizePopover.style.display = "none"), this._sizeApply = null;
  }
}
class he {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, i = {}) {
    this.targetEl = t, this.options = F(st, i), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: i } = Vt(this.targetEl, this.options);
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
    t("editor", Qt), t("toolbar", te), t("statusbar", ee), t("clipboard", ie), t("contextMenu", ce), t("placeholder", ne), t("codeview", se), t("fullscreen", oe), t("linkDialog", re), t("imageDialog", ae);
  }
  _bindEditorEvents(t) {
    const i = h(t, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), n = h(t, "blur", () => {
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
function Ue(e) {
  return e[e.length - 1];
}
function De(e) {
  return e[0];
}
function $e(e, t = 1) {
  return e.slice(0, e.length - t);
}
function qe(e, t = 1) {
  return e.slice(t);
}
function We(e) {
  return e.reduce((t, i) => t.concat(i), []);
}
function Ke(e) {
  return [...new Set(e)];
}
function Ve(e, t) {
  const i = [];
  for (let n = 0; n < e.length; n += t)
    i.push(e.slice(n, n + t));
  return i;
}
function Ye(e, t) {
  return e.reduce((i, n) => {
    const s = t(n);
    return i[s] || (i[s] = []), i[s].push(n), i;
  }, {});
}
function Xe(e, t) {
  return e.every(t);
}
function Ge(e, t) {
  return e.some(t);
}
const E = navigator.userAgent, Je = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(E),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(E),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(E),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(E),
  /** True if running on macOS */
  isMac: /Macintosh/.test(E),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(E),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(E) ? "metaKey" : "ctrlKey"
}, I = /* @__PURE__ */ new WeakMap(), Ze = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(e, t = {}) {
    const n = j(e).map((s) => {
      if (I.has(s)) return I.get(s);
      const o = new he(s, t);
      return o.initialize(), I.set(s, o), o;
    });
    return n.length === 1 ? n[0] : n;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(e) {
    j(e).forEach((t) => {
      const i = I.get(t);
      i && (i.destroy(), I.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(e) {
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && I.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: st,
  /** Library version */
  version: "1.0.0"
};
function j(e) {
  return typeof e == "string" ? Array.from(document.querySelectorAll(e)) : e instanceof Element ? [e] : e instanceof NodeList || Array.isArray(e) ? Array.from(e) : [];
}
export {
  he as Context,
  ut as ELEMENT_NODE,
  pt as TEXT_NODE,
  z as WrappedRange,
  Xe as all,
  ke as ancestors,
  Ge as any,
  Ae as children,
  Ve as chunk,
  de as clamp,
  B as closest,
  N as closestPara,
  je as collapsedRange,
  pe as compose,
  l as createElement,
  P as currentRange,
  dt as debounce,
  Ze as default,
  st as defaultOptions,
  Je as env,
  De as first,
  We as flatten,
  U as fromNativeRange,
  Ye as groupBy,
  fe as identity,
  $e as initial,
  Se as insertAfter,
  we as isAnchor,
  yt as isEditable,
  w as isElement,
  Re as isEmpty,
  ye as isFunction,
  Ce as isImage,
  _e as isInline,
  Ne as isInsideEditable,
  T as isKey,
  gt as isLi,
  be as isList,
  M as isModifier,
  me as isNil,
  mt as isPara,
  H as isPlainObject,
  Fe as isSelectionInside,
  ge as isString,
  ve as isTable,
  O as isText,
  ft as isVoid,
  R as key,
  Ue as last,
  F as mergeDeep,
  Me as nextElement,
  He as nodeValue,
  h as on,
  Be as outerHtml,
  ze as placeCaret,
  Ee as prevElement,
  Pe as rangeFromElement,
  xe as rect2bnd,
  Ie as remove,
  Oe as splitText,
  qe as tail,
  ue as throttle,
  Ke as unique,
  Le as unwrap,
  D as withSavedRange,
  Te as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
