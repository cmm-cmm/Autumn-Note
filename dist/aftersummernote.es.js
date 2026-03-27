function de(i, t, e) {
  return Math.min(Math.max(i, t), e);
}
function dt(i, t) {
  let e;
  return function(...n) {
    clearTimeout(e), e = setTimeout(() => i.apply(this, n), t);
  };
}
function ue(i, t) {
  let e = 0;
  return function(...n) {
    const s = Date.now();
    if (s - e >= t)
      return e = s, i.apply(this, n);
  };
}
function pe(...i) {
  return (t) => i.reduceRight((e, n) => n(e), t);
}
function fe(i) {
  return i;
}
function me(i) {
  return i == null;
}
function ge(i) {
  return typeof i == "string";
}
function ye(i) {
  return typeof i == "function";
}
function F(i, t) {
  const e = Object.assign({}, i);
  if (B(i) && B(t))
    for (const n of Object.keys(t))
      B(t[n]) && n in i ? e[n] = F(i[n], t[n]) : e[n] = t[n];
  return e;
}
function B(i) {
  return i !== null && typeof i == "object" && !Array.isArray(i);
}
function xe(i) {
  return i ? {
    top: Math.round(i.top),
    left: Math.round(i.left),
    width: Math.round(i.width),
    height: Math.round(i.height),
    bottom: Math.round(i.bottom),
    right: Math.round(i.right)
  } : null;
}
const ut = 1, pt = 3, _ = (i) => i && i.nodeType === ut, O = (i) => i && i.nodeType === pt, ft = (i) => _(i) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(i.nodeName), mt = (i) => _(i) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(i.nodeName), gt = (i) => _(i) && /^(li)$/i.test(i.nodeName), be = (i) => _(i) && /^(ul|ol)$/i.test(i.nodeName), ve = (i) => _(i) && i.nodeName.toUpperCase() === "TABLE", we = (i) => _(i) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(i.nodeName), yt = (i) => _(i) && i.isContentEditable, _e = (i) => _(i) && i.nodeName.toUpperCase() === "A", Ce = (i) => _(i) && i.nodeName.toUpperCase() === "IMG";
function R(i, t, e) {
  let n = i;
  for (; n && n !== e; ) {
    if (t(n)) return n;
    n = n.parentNode;
  }
  return null;
}
function N(i, t) {
  return R(i, mt, t);
}
function ke(i, t) {
  const e = [];
  let n = i.parentNode;
  for (; n && n !== t; )
    e.push(n), n = n.parentNode;
  return e;
}
function Me(i) {
  return Array.from(i.childNodes);
}
function Ae(i) {
  let t = i.previousSibling;
  for (; t && !_(t); )
    t = t.previousSibling;
  return t;
}
function Ee(i) {
  let t = i.nextSibling;
  for (; t && !_(t); )
    t = t.nextSibling;
  return t;
}
function l(i, t = {}, e = []) {
  const n = document.createElement(i);
  for (const [s, o] of Object.entries(t))
    n.setAttribute(s, o);
  for (const s of e)
    typeof s == "string" ? n.appendChild(document.createTextNode(s)) : n.appendChild(s);
  return n;
}
function Ie(i) {
  i && i.parentNode && i.parentNode.removeChild(i);
}
function Te(i) {
  const t = i.parentNode;
  if (t) {
    for (; i.firstChild; )
      t.insertBefore(i.firstChild, i);
    t.removeChild(i);
  }
}
function Le(i, t) {
  return i.parentNode.insertBefore(t, i), t.appendChild(i), t;
}
function Se(i, t) {
  t.nextSibling ? t.parentNode.insertBefore(i, t.nextSibling) : t.parentNode.appendChild(i);
}
function Be(i) {
  return O(i) ? i.nodeValue : i.textContent || "";
}
function He(i) {
  return O(i) ? !i.nodeValue : ft(i) ? !1 : !i.textContent.trim() && !i.querySelector("img, video, hr, table");
}
function Re(i) {
  return i.outerHTML;
}
function ze(i) {
  const t = document.createRange();
  t.selectNodeContents(i), t.collapse(!1);
  const e = window.getSelection();
  e && (e.removeAllRanges(), e.addRange(t));
}
function Ne(i) {
  return !!R(i, yt);
}
function h(i, t, e, n) {
  return i.addEventListener(t, e, n), () => i.removeEventListener(t, e, n);
}
class z {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(t, e, n, s) {
    this.sc = t, this.so = e, this.ec = n, this.eo = s;
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
    return _(e) ? e : e.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return R(this.sc, (e) => _(e) && e !== t, t);
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
    const n = document.createRange().createContextualFragment(t);
    e.insertNode(n);
  }
}
function U(i) {
  return new z(
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
  return i && !i.contains(e.commonAncestorContainer) ? null : U(e);
}
function Pe(i) {
  return new z(i, 0, i, i.childNodes.length);
}
function je(i, t = 0) {
  return new z(i, t, i, t);
}
function Fe(i) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : i.contains(t.getRangeAt(0).commonAncestorContainer);
}
function D(i) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    i(null);
    return;
  }
  const e = t.getRangeAt(0).cloneRange();
  i(U(e)), t.removeAllRanges(), t.addRange(e);
}
function Oe(i, t) {
  const e = i.splitText(t);
  return [i, e];
}
function u(i, t = null) {
  return document.execCommand(i, !1, t);
}
const $ = () => u("bold"), q = () => u("italic"), W = () => u("underline"), K = () => u("strikeThrough"), V = () => u("superscript"), Y = () => u("subscript"), xt = (i) => u("foreColor", i), bt = (i) => u("hiliteColor", i), X = (i) => u("fontName", i);
function vt(i) {
  u("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const e = document.createElement("span");
    for (e.style.fontSize = i, t.parentNode.insertBefore(e, t); t.firstChild; ) e.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const wt = (i) => u("formatBlock", `<${i}>`), G = () => u("justifyLeft"), J = () => u("justifyCenter"), Z = () => u("justifyRight"), Q = () => u("justifyFull"), tt = () => u("indent"), et = () => u("outdent"), it = () => u("insertUnorderedList"), nt = () => u("insertOrderedList");
function _t(i, t) {
  const e = document.createElement("table");
  e.style.borderCollapse = "collapse", e.style.width = "100%";
  const n = document.createElement("tbody");
  for (let s = 0; s < i; s++) {
    const o = document.createElement("tr");
    for (let r = 0; r < t; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.style.minWidth = "40px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    n.appendChild(o);
  }
  e.appendChild(n), u("insertHTML", e.outerHTML);
}
function f(i, t, e, n, s) {
  return { name: i, icon: t, tooltip: e, action: n, isActive: s };
}
const Ct = f("bold", "bold", "Bold (Ctrl+B)", () => $(), () => document.queryCommandState("bold")), kt = f("italic", "italic", "Italic (Ctrl+I)", () => q(), () => document.queryCommandState("italic")), Mt = f("underline", "underline", "Underline (Ctrl+U)", () => W(), () => document.queryCommandState("underline")), At = f("strikethrough", "strikethrough", "Strikethrough", () => K(), () => document.queryCommandState("strikeThrough")), Et = f("superscript", "superscript", "Superscript", () => V(), () => document.queryCommandState("superscript")), It = f("subscript", "subscript", "Subscript", () => Y(), () => document.queryCommandState("subscript")), Tt = f("alignLeft", "align-left", "Align Left", () => G()), Lt = f("alignCenter", "align-center", "Align Center", () => J()), St = f("alignRight", "align-right", "Align Right", () => Z()), Bt = f("alignJustify", "align-justify", "Justify", () => Q()), Ht = f("ul", "list-ul", "Unordered List", () => it()), Rt = f("ol", "list-ol", "Ordered List", () => nt()), zt = f("indent", "indent", "Indent", () => tt()), Nt = f("outdent", "outdent", "Outdent", () => et()), Pt = f("undo", "undo", "Undo (Ctrl+Z)", (i) => i.invoke("editor.undo")), jt = f("redo", "redo", "Redo (Ctrl+Y)", (i) => i.invoke("editor.redo")), Ft = f("hr", "minus", "Horizontal Rule", () => u("insertHorizontalRule")), Ot = f("link", "link", "Insert Link", (i) => i.invoke("linkDialog.show")), Ut = f("image", "image", "Insert Image", (i) => i.invoke("imageDialog.show")), Dt = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (i, t, e) => {
    _t(t, e), i.invoke("editor.afterCommand");
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
}, qt = f("codeview", "code", "HTML Code View", (i) => i.invoke("codeview.toggle"), (i) => i.invoke("codeview.isActive")), Wt = f("fullscreen", "expand", "Fullscreen", (i) => i.invoke("fullscreen.toggle"), (i) => i.invoke("fullscreen.isActive")), Kt = [
  [$t],
  [Pt, jt],
  [Ct, kt, Mt, At],
  [Et, It],
  [Tt, Lt, St, Bt],
  [Ht, Rt, zt, Nt],
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
function Vt(i, t) {
  const e = l("div", { class: "asn-container" }), n = l("div", {
    class: "asn-editable",
    contenteditable: "true",
    spellcheck: "true",
    "aria-multiline": "true",
    "aria-label": "Rich text editor",
    role: "textbox"
  });
  i.tagName === "TEXTAREA" ? n.innerHTML = (i.value || "").trim() : n.innerHTML = (i.innerHTML || "").trim();
  const s = t.defaultFontFamily || t.fontFamilies && t.fontFamilies[0];
  return s && (n.style.fontFamily = s), t.height && (n.style.minHeight = `${t.height}px`), t.minHeight && (n.style.minHeight = `${t.minHeight}px`), t.maxHeight && (n.style.maxHeight = `${t.maxHeight}px`), e.appendChild(n), i.style.display = "none", i.insertAdjacentElement("afterend", e), { container: e, editable: n };
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
  const e = l("table", { class: "asn-table" }), n = l("tbody");
  e.appendChild(n);
  for (let s = 0; s < t; s++) {
    const o = l("tr");
    for (let r = 0; r < i; r++) {
      const a = l("td", {}, [" "]);
      o.appendChild(a);
    }
    n.appendChild(o);
  }
  return e;
}
function Jt(i, t) {
  const e = Gt(i, t);
  u("insertHTML", e.outerHTML);
}
const H = {
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
function L(i, t) {
  return i.key === t || i.key === t.toUpperCase();
}
function E(i, t) {
  return (i.ctrlKey || i.metaKey) && L(i, t);
}
function Zt(i, t, e = {}) {
  if (L(i, H.TAB)) {
    const n = P(t);
    if (!n) return !1;
    const s = N(n.sc, t);
    if (s && gt(s))
      return i.preventDefault(), i.shiftKey ? u("outdent") : u("indent"), !0;
    if (s && s.nodeName.toUpperCase() === "PRE")
      return i.preventDefault(), u("insertText", "    "), !0;
    if (e.tabSize)
      return i.preventDefault(), u("insertText", " ".repeat(e.tabSize)), !0;
  }
  if (L(i, H.ENTER) && !i.shiftKey) {
    const n = P(t);
    if (!n) return !1;
    const s = N(n.sc, t);
    if (s && s.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = n.toNativeRange();
      if (o.setStart(s, s.childNodes.length), o.toString() === "" && n.isCollapsed())
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
    const e = (o) => this._onKeydown(o), n = () => this.afterCommand(), s = () => this.context.invoke("toolbar.refresh");
    this._disposers.push(
      h(t, "keydown", e),
      h(t, "keyup", n),
      h(document, "selectionchange", s)
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
    wt(t), this.afterCommand();
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
    u("insertHorizontalRule"), this.afterCommand();
  }
  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(t, e, n = !1) {
    const s = window.getSelection();
    if (!s || s.rangeCount === 0) return;
    const o = this._sanitiseUrl(t);
    if (!o) return;
    if (!(s.toString().trim().length > 0))
      u("insertHTML", `<a href="${o}"${n ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e || o}</a>`);
    else if (u("createLink", o), n) {
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
    const n = this._sanitiseUrl(t);
    n && (u("insertHTML", `<img src="${n}" alt="${e}" class="asn-image">`), this.afterCommand());
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
    (this.options.toolbar || []).forEach((e) => {
      const n = l("div", { class: "asn-btn-group" });
      e.forEach((s) => {
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
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((g) => g.href).join(" ")))) {
      const g = this.options.fontAwesomeClass || "fas";
      a.innerHTML = `<i class="${g} fa-table" aria-hidden="true"></i>`;
    } else {
      const g = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${g} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const c = l("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), m = l("div", { class: "asn-table-grid" }), w = l("div", { class: "asn-table-label" });
    w.textContent = "Insert Table";
    const x = [];
    for (let g = 1; g <= 10; g++)
      for (let b = 1; b <= 10; b++) {
        const M = l("div", {
          class: "asn-table-cell",
          "data-row": String(g),
          "data-col": String(b)
        });
        x.push(M), m.appendChild(M);
      }
    c.appendChild(m), c.appendChild(w);
    let C = !1;
    const k = (g, b) => {
      x.forEach((M) => {
        const S = +M.getAttribute("data-row"), ht = +M.getAttribute("data-col");
        M.classList.toggle("active", S <= g && ht <= b);
      }), w.textContent = g && b ? `${g} × ${b}` : "Insert Table";
    }, v = () => {
      C = !0, c.style.display = "block", a.setAttribute("aria-expanded", "true");
    }, T = () => {
      C = !1, c.style.display = "none", a.setAttribute("aria-expanded", "false"), k(0, 0);
    }, ot = h(a, "click", (g) => {
      g.stopPropagation(), C ? T() : v();
    }), rt = h(m, "mouseover", (g) => {
      const b = g.target.closest(".asn-table-cell");
      b && k(+b.getAttribute("data-row"), +b.getAttribute("data-col"));
    }), at = h(m, "mouseleave", () => k(0, 0)), lt = h(m, "click", (g) => {
      const b = g.target.closest(".asn-table-cell");
      if (!b) return;
      const M = +b.getAttribute("data-row"), S = +b.getAttribute("data-col");
      T(), this.context.invoke("editor.focus"), t.action(this.context, M, S);
    }), ct = h(document, "click", () => {
      C && T();
    });
    return this._disposers.push(ot, rt, at, lt, ct), s.appendChild(a), s.appendChild(c), s;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const e = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], n = l("select", {
      class: "asn-select",
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), s = l("option", { value: "" }, ["Font"]);
    n.appendChild(s), e.forEach((r) => {
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
    }), a = !!this.options.useFontAwesome, d = () => {
      if (!a) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const v = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((T) => T.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(v);
    }, y = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', c = (v) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${y} style="display:block">${v}</svg>`, m = /* @__PURE__ */ new Map([
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
    ]), w = this.options.fontAwesomeClass || "fas", x = /* @__PURE__ */ new Map([
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
      const v = x.get(t.icon) || x.get(t.name) || null;
      v ? r.innerHTML = `<i class="${w} ${v}" aria-hidden="true"></i>` : m.has(t.icon) ? r.innerHTML = m.get(t.icon) : r.textContent = t.icon || t.name;
    } else
      m.has(t.icon) ? r.innerHTML = m.get(t.icon) : m.has(t.name) ? r.innerHTML = m.get(t.name) : r.textContent = t.icon || t.name;
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
    const t = this.options.toolbar || [], e = new Map(t.flat().map((n) => [n.name, n]));
    this.el.querySelectorAll("button[data-btn]").forEach((n) => {
      const s = e.get(n.getAttribute("data-btn"));
      s && typeof s.isActive == "function" && n.classList.toggle("active", !!s.isActive(this.context));
    }), this.el.querySelectorAll("select[data-btn]").forEach((n) => {
      const s = e.get(n.getAttribute("data-btn"));
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
    let e = 0, n = 0;
    const s = this.context.layoutInfo.editable, o = (y) => {
      const c = Math.max(100, n + y.clientY - e);
      s.style.height = `${c}px`;
    }, r = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r);
    }, d = h(t, "mousedown", (y) => {
      e = y.clientY, n = s.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", r), y.preventDefault();
    });
    this._disposers.push(d);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, e = dt(() => this.update(), 200), n = h(t, "input", e);
    this._disposers.push(n);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const e = this.context.layoutInfo.editable.innerText || "", n = e.trim() ? e.trim().split(/\s+/).length : 0, s = e.length;
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
    const t = this.context.layoutInfo.editable, e = h(t, "paste", (n) => this._onPaste(n));
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
    let n = "";
    if (e.types.includes("text/html") && this.options.pasteCleanHTML !== !1) {
      const s = e.getData("text/html");
      n = this._sanitiseHTML(s), u("insertHTML", n);
    } else {
      n = e.getData("text/plain");
      const s = n.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      u("insertHTML", s);
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
    const t = this.context.layoutInfo.editable, e = this.options.placeholder || "";
    e && (t.dataset.placeholder = e);
    const n = () => this._update(), s = h(t, "input", n), o = h(t, "focus", n), r = h(t, "blur", n);
    return this._disposers.push(s, o, r), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  _update() {
    const t = this.context.layoutInfo.editable, e = !t.textContent.trim() && !t.querySelector("img, table, hr");
    t.classList.toggle("asn-placeholder", e);
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
`).map((n) => {
      const s = n.trim();
      if (!s) return "";
      /^<\//.test(s) && (e = Math.max(0, e - 1));
      const o = "  ".repeat(e) + s;
      return /^<[^/][^>]*[^/]>/.test(s) && !/^<(br|hr|img|input|link|meta)/.test(s) && e++, o;
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
    const t = h(document, "keydown", (e) => {
      this._active && L(e, H.ESCAPE) && this.deactivate();
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
    D((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = l("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), e = l("div", { class: "asn-dialog-box" }), n = l("h3", { class: "asn-dialog-title" });
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
    const d = l("label", { class: "asn-label asn-label-inline" }), y = l("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = y, d.appendChild(y), d.appendChild(document.createTextNode(" Open in new tab"));
    const c = l("div", { class: "asn-dialog-actions" }), m = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    m.textContent = "Insert";
    const w = l("button", { type: "button", class: "asn-btn" });
    w.textContent = "Cancel", c.appendChild(m), c.appendChild(w), e.append(n, s, o, r, a, d, c), t.appendChild(e);
    const x = h(m, "click", () => this._onInsert()), C = h(w, "click", () => this._close()), k = h(t, "click", (v) => {
      v.target === t && this._close();
    });
    return this._disposers.push(x, C, k), t;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _prefill() {
    const t = window.getSelection();
    let e = null;
    if (t && t.rangeCount > 0) {
      let n = t.getRangeAt(0).startContainer;
      for (; n; ) {
        if (n.nodeName === "A") {
          e = n;
          break;
        }
        n = n.parentNode;
      }
    }
    e ? (this._urlInput.value = e.getAttribute("href") || "", this._textInput.value = e.textContent || "", this._tabCheckbox.checked = e.getAttribute("target") === "_blank") : (this._urlInput.value = "", this._textInput.value = t ? t.toString() : "", this._tabCheckbox.checked = !1);
  }
  _onInsert() {
    const t = this._urlInput.value.trim(), e = this._textInput.value.trim(), n = this._tabCheckbox.checked;
    if (!t) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertLink", t, e, n), this._close();
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
    }), e = l("div", { class: "asn-dialog-box" }), n = l("h3", { class: "asn-dialog-title" });
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
      this._disposers.push(v), e.append(C, k);
    }
    const d = l("div", { class: "asn-dialog-actions" }), y = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    y.textContent = "Insert";
    const c = l("button", { type: "button", class: "asn-btn" });
    c.textContent = "Cancel", d.appendChild(y), d.appendChild(c), e.append(n, s, o, r, a, d), t.appendChild(e);
    const m = h(y, "click", () => this._onInsert()), w = h(c, "click", () => this._close()), x = h(t, "click", (C) => {
      C.target === t && this._close();
    });
    return this._disposers.push(m, w, x), t;
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
    const n = new FileReader();
    n.onload = (s) => {
      this._urlInput.value = s.target.result;
    }, n.readAsDataURL(t);
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
  back: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
}, le = [
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
class ce {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || le, this.el = null, this._disposers = [], this._menuDisposers = [], this._targetCell = null, this._sizePopover = null, this._lastX = 0, this._lastY = 0;
  }
  initialize() {
    this.el = l("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover), this._renderItems(this._items);
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    return t && this._disposers.push(h(t, "contextmenu", (e) => this._onContextMenu(e))), this._disposers.push(h(document, "click", (e) => this._maybeHide(e))), this._disposers.push(h(document, "keydown", (e) => {
      e.key === "Escape" && this.hide();
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
    this._menuDisposers.forEach((e) => e()), this._menuDisposers = [], this.el && (this.el.innerHTML = "", t.forEach((e) => {
      if (e.separator || e.sep) {
        this.el.appendChild(l("div", { class: "asn-context-sep" }));
        return;
      }
      if (e.back) {
        const o = l("button", { type: "button", class: "asn-context-back" }), r = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
        r.innerHTML = p.back, o.appendChild(r), o.appendChild(l("span", { class: "asn-context-label" }, [e.label || "Back"]));
        const a = h(o, "click", (d) => {
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
        const a = h(o, "click", (d) => {
          d.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(a), this.el.appendChild(o);
        return;
      }
      const n = l("button", { type: "button", class: "asn-context-item", "data-name": e.name || "" });
      if (e.icon) {
        const o = l("span", { class: "asn-context-icon", "aria-hidden": "true" });
        o.innerHTML = e.icon, n.appendChild(o);
      }
      n.appendChild(l("span", { class: "asn-context-label" }, [e.label || e.name]));
      const s = h(n, "click", (o) => {
        o.stopPropagation(), this.hide();
        try {
          e.action(this.context);
        } catch (r) {
          console.error(r);
        }
      });
      this._menuDisposers.push(s), this.el.appendChild(n);
    }));
  }
  _onContextMenu(t) {
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!e || !e.contains(t.target)) return;
    t.preventDefault(), this._lastX = t.clientX, this._lastY = t.clientY;
    const n = t.target.closest("td, th");
    this._targetCell = n || null;
    const s = n ? this._buildCombinedItems(n) : this._items;
    this._renderItems(s), this.showAt(t.clientX, t.clientY);
  }
  _maybeHide(t) {
    this.el && (this.el.contains(t.target) || this.hide());
  }
  showAt(t, e) {
    this.el && (this.el.style.display = "block", this._reposition(t, e), this.el.setAttribute("aria-hidden", "false"));
  }
  _reposition(t, e) {
    if (!this.el) return;
    const n = t !== void 0 ? t : this._lastX, s = e !== void 0 ? e : this._lastY, o = this.el.getBoundingClientRect();
    let r = n, a = s;
    r + o.width > window.innerWidth && (r = window.innerWidth - o.width - 8), a + o.height > window.innerHeight && (a = window.innerHeight - o.height - 8), this.el.style.left = `${r}px`, this.el.style.top = `${a}px`;
  }
  hide() {
    this.el && (this.el.style.display = "none", this.el.setAttribute("aria-hidden", "true"));
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
    const n = t.closest("tr");
    if (!n) return;
    const s = Array.from(n.cells).reduce((r, a) => r + (a.colSpan || 1), 0), o = document.createElement("tr");
    for (let r = 0; r < s; r++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.innerHTML = "&#8203;", o.appendChild(a);
    }
    e === "above" ? n.parentElement.insertBefore(o, n) : n.insertAdjacentElement("afterend", o), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t, e) {
    const n = t.closest("tr"), s = t.closest("table");
    if (!n || !s) return;
    const o = Array.from(n.cells).indexOf(t);
    Array.from(s.querySelectorAll("tr")).forEach((r) => {
      const a = Array.from(r.cells), d = document.createElement("td");
      d.style.border = "1px solid #dee2e6", d.style.padding = "6px 12px", d.innerHTML = "&#8203;";
      const y = e === "left" ? a[o] : a[o + 1] || null;
      r.insertBefore(d, y);
    }), this.context.invoke("editor.afterCommand");
  }
  _deleteRow(t) {
    const e = t.closest("tr"), n = t.closest("table");
    !e || !n || n.querySelectorAll("tr").length <= 1 || (e.parentElement.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
  _deleteColumn(t) {
    const e = t.closest("tr"), n = t.closest("table");
    if (!e || !n || e.cells.length <= 1) return;
    const s = Array.from(e.cells).indexOf(t);
    Array.from(n.querySelectorAll("tr")).forEach((o) => {
      const r = o.cells[s];
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
    const n = window.getSelection();
    if (!n || n.rangeCount === 0) return;
    const s = n.getRangeAt(0), o = Array.from(e.cells).filter((a) => {
      try {
        return s.intersectsNode(a);
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
    const e = l("div", { class: "asn-size-popover-title" }), n = l("div", { class: "asn-size-popover-body" }), s = l("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), o = l("span", { class: "asn-size-unit" }, ["px"]);
    n.appendChild(s), n.appendChild(o);
    const r = l("div", { class: "asn-size-popover-actions" }), a = l("button", { type: "button", class: "asn-btn" });
    a.textContent = "Cancel";
    const d = l("button", { type: "button", class: "asn-btn asn-btn-primary" });
    d.textContent = "Apply", r.appendChild(a), r.appendChild(d), t.appendChild(e), t.appendChild(n), t.appendChild(r), this._sizeTitleEl = e, this._sizeInputEl = s, this._sizeApply = null;
    const y = h(d, "click", () => {
      const x = parseInt(this._sizeInputEl.value, 10);
      x > 0 && typeof this._sizeApply == "function" && this._sizeApply(x), this._hideSizePopover();
    }), c = h(a, "click", () => this._hideSizePopover()), m = h(s, "keydown", (x) => {
      x.key === "Enter" && (x.preventDefault(), d.click()), x.key === "Escape" && this._hideSizePopover();
    }), w = h(document, "click", (x) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(x.target) && this._hideSizePopover();
    });
    return this._disposers.push(y, c, m, w), t;
  }
  _openSizePopover(t, e) {
    if (!this._sizePopover) return;
    const n = t === "col";
    this._sizeTitleEl.textContent = n ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = n ? e.offsetWidth || 120 : e.closest("tr") && e.closest("tr").offsetHeight || 40, this._sizeApply = (s) => {
      if (n) {
        const o = e.closest("table"), r = Array.from(e.closest("tr").cells).indexOf(e);
        Array.from(o.querySelectorAll("tr")).forEach((a) => {
          const d = a.cells[r];
          d && (d.style.width = `${s}px`, d.style.minWidth = `${s}px`);
        });
      } else {
        const o = e.closest("tr");
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
  constructor(t, e = {}) {
    this.targetEl = t, this.options = F(st, e), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: e } = Vt(this.targetEl, this.options);
    this.layoutInfo.container = t, this.layoutInfo.editable = e, this._registerModules();
    const n = this._modules.get("toolbar");
    n && n.el && (t.insertBefore(n.el, e), this.layoutInfo.toolbar = n.el);
    const s = this._modules.get("statusbar");
    return s && s.el && (t.appendChild(s.el), this.layoutInfo.statusbar = s.el), this._bindEditorEvents(e), this.options.focus && e.focus(), this._alive = !0, this.invoke("toolbar.refresh"), this;
  }
  _registerModules() {
    const t = (e, n) => {
      const s = new n(this);
      s.initialize(), this._modules.set(e, s);
    };
    t("editor", Qt), t("toolbar", te), t("statusbar", ee), t("clipboard", ie), t("contextMenu", ce), t("placeholder", ne), t("codeview", se), t("fullscreen", oe), t("linkDialog", re), t("imageDialog", ae);
  }
  _bindEditorEvents(t) {
    const e = h(t, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), n = h(t, "blur", () => {
      this.layoutInfo.container.classList.remove("asn-focused"), this._syncToTarget(), typeof this.options.onBlur == "function" && this.options.onBlur(this);
    });
    this._disposers.push(e, n);
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
    const [n, s] = t.split("."), o = this._modules.get(n);
    if (o && typeof o[s] == "function")
      return o[s](...e);
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
    const n = this._listeners.get(t);
    if (!n) return;
    const s = n.indexOf(e);
    s !== -1 && n.splice(s, 1);
  }
  /**
   * Triggers an editor event.
   * @param {string} eventName
   * @param {...*} args
   */
  triggerEvent(t, ...e) {
    (this._listeners.get(t) || []).forEach((o) => o(...e));
    const s = "on" + t.charAt(0).toUpperCase() + t.slice(1);
    typeof this.options[s] == "function" && this.options[s](...e);
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
function Ue(i) {
  return i[i.length - 1];
}
function De(i) {
  return i[0];
}
function $e(i, t = 1) {
  return i.slice(0, i.length - t);
}
function qe(i, t = 1) {
  return i.slice(t);
}
function We(i) {
  return i.reduce((t, e) => t.concat(e), []);
}
function Ke(i) {
  return [...new Set(i)];
}
function Ve(i, t) {
  const e = [];
  for (let n = 0; n < i.length; n += t)
    e.push(i.slice(n, n + t));
  return e;
}
function Ye(i, t) {
  return i.reduce((e, n) => {
    const s = t(n);
    return e[s] || (e[s] = []), e[s].push(n), e;
  }, {});
}
function Xe(i, t) {
  return i.every(t);
}
function Ge(i, t) {
  return i.some(t);
}
const A = navigator.userAgent, Je = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(A),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(A),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(A),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(A),
  /** True if running on macOS */
  isMac: /Macintosh/.test(A),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(A),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(A) ? "metaKey" : "ctrlKey"
}, I = /* @__PURE__ */ new WeakMap(), Ze = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(i, t = {}) {
    const n = j(i).map((s) => {
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
  destroy(i) {
    j(i).forEach((t) => {
      const e = I.get(t);
      e && (e.destroy(), I.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(i) {
    const t = typeof i == "string" ? document.querySelector(i) : i;
    return t && I.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: st,
  /** Library version */
  version: "1.0.0"
};
function j(i) {
  return typeof i == "string" ? Array.from(document.querySelectorAll(i)) : i instanceof Element ? [i] : i instanceof NodeList || Array.isArray(i) ? Array.from(i) : [];
}
export {
  he as Context,
  ut as ELEMENT_NODE,
  pt as TEXT_NODE,
  z as WrappedRange,
  Xe as all,
  ke as ancestors,
  Ge as any,
  Me as children,
  Ve as chunk,
  de as clamp,
  R as closest,
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
  _e as isAnchor,
  yt as isEditable,
  _ as isElement,
  He as isEmpty,
  ye as isFunction,
  Ce as isImage,
  we as isInline,
  Ne as isInsideEditable,
  L as isKey,
  gt as isLi,
  be as isList,
  E as isModifier,
  me as isNil,
  mt as isPara,
  B as isPlainObject,
  Fe as isSelectionInside,
  ge as isString,
  ve as isTable,
  O as isText,
  ft as isVoid,
  H as key,
  Ue as last,
  F as mergeDeep,
  Ee as nextElement,
  Be as nodeValue,
  h as on,
  Re as outerHtml,
  ze as placeCaret,
  Ae as prevElement,
  Pe as rangeFromElement,
  xe as rect2bnd,
  Ie as remove,
  Oe as splitText,
  qe as tail,
  ue as throttle,
  Ke as unique,
  Te as unwrap,
  D as withSavedRange,
  Le as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
