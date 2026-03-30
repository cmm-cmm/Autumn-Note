function je(s, t, e) {
  return Math.min(Math.max(s, t), e);
}
function wt(s, t) {
  let e;
  return function(...i) {
    clearTimeout(e), e = setTimeout(() => s.apply(this, i), t);
  };
}
function Ue(s, t) {
  let e = 0;
  return function(...i) {
    const n = Date.now();
    if (n - e >= t)
      return e = n, s.apply(this, i);
  };
}
function Ve(...s) {
  return (t) => s.reduceRight((e, i) => i(e), t);
}
function qe(s) {
  return s;
}
function Ye(s) {
  return s == null;
}
function Ke(s) {
  return typeof s == "string";
}
function Xe(s) {
  return typeof s == "function";
}
function J(s, t) {
  const e = Object.assign({}, s);
  if (U(s) && U(t))
    for (const i of Object.keys(t))
      U(t[i]) && i in s ? e[i] = J(s[i], t[i]) : e[i] = t[i];
  return e;
}
function U(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function Ge(s) {
  return s ? {
    top: Math.round(s.top),
    left: Math.round(s.left),
    width: Math.round(s.width),
    height: Math.round(s.height),
    bottom: Math.round(s.bottom),
    right: Math.round(s.right)
  } : null;
}
const xt = 1, bt = 3, M = (s) => s && s.nodeType === xt, Q = (s) => s && s.nodeType === bt, Ct = (s) => M(s) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(s.nodeName), kt = (s) => M(s) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(s.nodeName), Tt = (s) => M(s) && /^(li)$/i.test(s.nodeName), Ze = (s) => M(s) && /^(ul|ol)$/i.test(s.nodeName), Je = (s) => M(s) && s.nodeName.toUpperCase() === "TABLE", Qe = (s) => M(s) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(s.nodeName), Bt = (s) => M(s) && s.isContentEditable, ti = (s) => M(s) && s.nodeName.toUpperCase() === "A", ei = (s) => M(s) && s.nodeName.toUpperCase() === "IMG";
function q(s, t, e) {
  let i = s;
  for (; i && i !== e; ) {
    if (t(i)) return i;
    i = i.parentNode;
  }
  return null;
}
function X(s, t) {
  return q(s, kt, t);
}
function ii(s, t) {
  const e = [];
  let i = s.parentNode;
  for (; i && i !== t; )
    e.push(i), i = i.parentNode;
  return e;
}
function si(s) {
  return Array.from(s.childNodes);
}
function ni(s) {
  let t = s.previousSibling;
  for (; t && !M(t); )
    t = t.previousSibling;
  return t;
}
function oi(s) {
  let t = s.nextSibling;
  for (; t && !M(t); )
    t = t.nextSibling;
  return t;
}
function a(s, t = {}, e = []) {
  const i = document.createElement(s);
  for (const [n, o] of Object.entries(t))
    i.setAttribute(n, o);
  for (const n of e)
    typeof n == "string" ? i.appendChild(document.createTextNode(n)) : i.appendChild(n);
  return i;
}
function li(s) {
  s && s.parentNode && s.parentNode.removeChild(s);
}
function ri(s) {
  const t = s.parentNode;
  if (t) {
    for (; s.firstChild; )
      t.insertBefore(s.firstChild, s);
    t.removeChild(s);
  }
}
function ai(s, t) {
  return s.parentNode.insertBefore(t, s), t.appendChild(s), t;
}
function hi(s, t) {
  t.nextSibling ? t.parentNode.insertBefore(s, t.nextSibling) : t.parentNode.appendChild(s);
}
function ci(s) {
  return Q(s) ? s.nodeValue : s.textContent || "";
}
function di(s) {
  return Q(s) ? !s.nodeValue : Ct(s) ? !1 : !s.textContent.trim() && !s.querySelector("img, video, hr, table");
}
function pi(s) {
  return s.outerHTML;
}
function ui(s) {
  const t = document.createRange();
  t.selectNodeContents(s), t.collapse(!1);
  const e = window.getSelection();
  e && (e.removeAllRanges(), e.addRange(t));
}
function fi(s) {
  return !!q(s, Bt);
}
function h(s, t, e, i) {
  return s.addEventListener(t, e, i), () => s.removeEventListener(t, e, i);
}
class Y {
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
    return M(e) ? e : e.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return q(this.sc, (e) => M(e) && e !== t, t);
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
function tt(s) {
  return new Y(
    s.startContainer,
    s.startOffset,
    s.endContainer,
    s.endOffset
  );
}
function G(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const e = t.getRangeAt(0);
  return s && !s.contains(e.commonAncestorContainer) ? null : tt(e);
}
function mi(s) {
  return new Y(s, 0, s, s.childNodes.length);
}
function _i(s, t = 0) {
  return new Y(s, t, s, t);
}
function gi(s) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : s.contains(t.getRangeAt(0).commonAncestorContainer);
}
function K(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    s(null);
    return;
  }
  const e = t.getRangeAt(0).cloneRange();
  s(tt(e)), t.removeAllRanges(), t.addRange(e);
}
function yi(s, t) {
  const e = s.splitText(t);
  return [s, e];
}
function m(s, t = null) {
  return document.execCommand(s, !1, t);
}
const et = () => m("bold"), it = () => m("italic"), st = () => m("underline"), nt = () => m("strikeThrough"), ot = () => m("superscript"), lt = () => m("subscript"), rt = (s) => m("foreColor", s), at = (s) => m("hiliteColor", s), ht = (s) => m("fontName", s);
function Et(s) {
  m("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const e = document.createElement("span");
    for (e.style.fontSize = s, t.parentNode.insertBefore(e, t); t.firstChild; ) e.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const ct = (s) => m("formatBlock", `<${s}>`), dt = () => m("justifyLeft"), pt = () => m("justifyCenter"), ut = () => m("justifyRight"), ft = () => m("justifyFull"), mt = () => m("indent"), _t = () => m("outdent"), gt = () => m("insertUnorderedList"), yt = () => m("insertOrderedList");
function Lt(s, t) {
  const e = document.createElement("table");
  e.style.borderCollapse = "collapse", e.style.width = "100%";
  const i = document.createElement("tbody");
  for (let n = 0; n < s; n++) {
    const o = document.createElement("tr");
    for (let l = 0; l < t; l++) {
      const r = document.createElement("td");
      r.style.border = "1px solid #dee2e6", r.style.padding = "6px 12px", r.style.minWidth = "40px", r.innerHTML = "&#8203;", o.appendChild(r);
    }
    i.appendChild(o);
  }
  e.appendChild(i), m("insertHTML", e.outerHTML);
}
function It(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return;
  const e = t.getRangeAt(0), i = /* @__PURE__ */ new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "TD", "TH"]), n = (c) => {
    let u = c instanceof Element ? c : c.parentElement;
    for (; u; ) {
      if (i.has(u.tagName)) return u;
      u = u.parentElement;
    }
    return null;
  };
  if (e.collapsed) {
    const c = n(e.startContainer);
    c && (c.style.lineHeight = s);
    return;
  }
  const o = /* @__PURE__ */ new Set(), l = document.createNodeIterator(e.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
  let r;
  for (; r = l.nextNode(); )
    if (e.intersectsNode(r)) {
      const c = n(r);
      c && o.add(c);
    }
  if (o.size === 0) {
    const c = n(e.commonAncestorContainer);
    c && o.add(c);
  }
  o.forEach((c) => {
    c.style.lineHeight = s;
  });
}
function C(s, t, e, i, n) {
  return { name: s, icon: t, tooltip: e, action: i, isActive: n };
}
const Mt = C("bold", "bold", "Bold (Ctrl+B)", () => et(), () => document.queryCommandState("bold")), St = C("italic", "italic", "Italic (Ctrl+I)", () => it(), () => document.queryCommandState("italic")), At = C("underline", "underline", "Underline (Ctrl+U)", () => st(), () => document.queryCommandState("underline")), Ht = C("strikethrough", "strikethrough", "Strikethrough", () => nt(), () => document.queryCommandState("strikeThrough")), Rt = C("superscript", "superscript", "Superscript", () => ot(), () => document.queryCommandState("superscript")), zt = C("subscript", "subscript", "Subscript", () => lt(), () => document.queryCommandState("subscript")), Nt = C("alignLeft", "align-left", "Align Left", () => dt()), Pt = C("alignCenter", "align-center", "Align Center", () => pt()), Ot = C("alignRight", "align-right", "Align Right", () => ut()), Ft = C("alignJustify", "align-justify", "Justify", () => ft()), Dt = C("ul", "list-ul", "Unordered List", () => gt()), $t = C("ol", "list-ol", "Ordered List", () => yt()), Wt = C("indent", "indent", "Indent", () => mt()), jt = C("outdent", "outdent", "Outdent", () => _t()), Ut = C("undo", "undo", "Undo (Ctrl+Z)", (s) => s.invoke("editor.undo")), Vt = C("redo", "redo", "Redo (Ctrl+Y)", (s) => s.invoke("editor.redo")), qt = C("hr", "minus", "Horizontal Rule", () => m("insertHorizontalRule")), Yt = C("link", "link", "Insert Link", (s) => s.invoke("linkDialog.show")), Kt = C("image", "image", "Insert Image", (s) => s.invoke("imageDialog.show")), Xt = C("video", "video", "Insert Video", (s) => s.invoke("videoDialog.show")), Gt = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (s, t, e) => {
    Lt(t, e), s.invoke("editor.afterCommand");
  }
}, Zt = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (s, t) => ht(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, Jt = {
  name: "paragraphStyle",
  type: "select",
  tooltip: "Paragraph Style",
  placeholder: "Style",
  selectClass: "asn-select-style",
  items: [
    { value: "p", label: "Normal" },
    { value: "h1", label: "H1" },
    { value: "h2", label: "H2" },
    { value: "h3", label: "H3" },
    { value: "h4", label: "H4" },
    { value: "h5", label: "H5" },
    { value: "h6", label: "H6" },
    { value: "blockquote", label: "Quote" },
    { value: "pre", label: "Code" }
  ],
  action: (s, t) => ct(t),
  getValue: () => {
    try {
      const s = document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
      return s === "div" ? "p" : s || "p";
    } catch {
      return "";
    }
  }
}, Qt = {
  name: "lineHeight",
  type: "select",
  tooltip: "Line Height",
  placeholder: "↕ Line",
  selectClass: "asn-select-narrow",
  items: ["1.0", "1.15", "1.5", "1.75", "2.0", "2.5", "3.0"],
  action: (s, t) => It(t),
  getValue: () => {
    try {
      const s = window.getSelection();
      if (!s || !s.rangeCount) return "";
      const t = /* @__PURE__ */ new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "TD", "TH"]);
      let e = s.getRangeAt(0).startContainer;
      for (e.nodeType === 3 && (e = e.parentElement); e && !t.has(e.tagName); ) e = e.parentElement;
      return e && e.style.lineHeight || "";
    } catch {
      return "";
    }
  }
}, te = C("codeview", "code", "HTML Code View", (s) => s.invoke("codeview.toggle"), (s) => s.invoke("codeview.isActive")), ee = C("fullscreen", "expand", "Fullscreen", (s) => s.invoke("fullscreen.toggle"), (s) => s.invoke("fullscreen.isActive")), ie = {
  name: "foreColor",
  type: "colorpicker",
  icon: "foreColor",
  tooltip: "Text Color",
  defaultColor: "#e11d48",
  action: (s, t) => rt(t)
}, se = {
  name: "backColor",
  type: "colorpicker",
  icon: "backColor",
  tooltip: "Highlight Color",
  defaultColor: "#fbbf24",
  action: (s, t) => at(t)
}, ne = [
  [Jt, Zt, Qt],
  [Ut, Vt],
  [Mt, St, At, Ht],
  [Rt, zt],
  [ie, se],
  [Nt, Pt, Ot, Ft],
  [Dt, $t, Wt, jt],
  [qt, Yt, Kt, Xt, Gt],
  [te, ee]
], vt = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: ne,
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
function oe(s, t) {
  const e = a("div", { class: "asn-container" }), i = a("div", {
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
const le = 100;
class re {
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
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1)), this.stack.push({ html: this._serialize() }), this.stack.length > le ? this.stack.shift() : this.stackOffset++;
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
function ae(s, t) {
  const e = a("table", { class: "asn-table" }), i = a("tbody");
  e.appendChild(i);
  for (let n = 0; n < t; n++) {
    const o = a("tr");
    for (let l = 0; l < s; l++) {
      const r = a("td", {}, [" "]);
      o.appendChild(r);
    }
    i.appendChild(o);
  }
  return e;
}
function he(s, t) {
  const e = ae(s, t);
  m("insertHTML", e.outerHTML);
}
const V = {
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
function j(s, t) {
  return s.key === t || s.key === t.toUpperCase();
}
function R(s, t) {
  return (s.ctrlKey || s.metaKey) && j(s, t);
}
function ce(s, t, e = {}) {
  if (j(s, V.TAB)) {
    const i = G(t);
    if (!i) return !1;
    const n = X(i.sc, t);
    if (n && Tt(n))
      return s.preventDefault(), s.shiftKey ? m("outdent") : m("indent"), !0;
    if (n && n.nodeName.toUpperCase() === "PRE")
      return s.preventDefault(), m("insertText", "    "), !0;
    if (e.tabSize)
      return s.preventDefault(), m("insertText", " ".repeat(e.tabSize)), !0;
  }
  if (j(s, V.ENTER) && !s.shiftKey) {
    const i = G(t);
    if (!i) return !1;
    const n = X(i.sc, t);
    if (n && n.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = i.toNativeRange();
      if (o.setStart(n, n.childNodes.length), o.toString() === "" && i.isCollapsed())
        return s.preventDefault(), m("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class de {
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
    return this._history = new re(t), this._bindEvents(t), this;
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
      h(t, "keydown", e),
      h(t, "keyup", i),
      h(document, "selectionchange", n)
    );
  }
  _onKeydown(t) {
    const e = this.context.layoutInfo.editable;
    if (!ce(t, e, this.options)) {
      if (R(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (R(t, "z") && t.shiftKey || R(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (R(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (R(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (R(t, "u")) {
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
    et(), this.afterCommand();
  }
  italic() {
    it(), this.afterCommand();
  }
  underline() {
    st(), this.afterCommand();
  }
  strikethrough() {
    nt(), this.afterCommand();
  }
  superscript() {
    ot(), this.afterCommand();
  }
  subscript() {
    lt(), this.afterCommand();
  }
  justifyLeft() {
    dt(), this.afterCommand();
  }
  justifyCenter() {
    pt(), this.afterCommand();
  }
  justifyRight() {
    ut(), this.afterCommand();
  }
  justifyFull() {
    ft(), this.afterCommand();
  }
  indent() {
    mt(), this.afterCommand();
  }
  outdent() {
    _t(), this.afterCommand();
  }
  insertUL() {
    gt(), this.afterCommand();
  }
  insertOL() {
    yt(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(t) {
    ct(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(t) {
    rt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(t) {
    at(t), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(t) {
    ht(t), this.afterCommand();
  }
  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(t) {
    Et(t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    m("insertHorizontalRule"), this.afterCommand();
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
      m("insertHTML", `<a href="${o}"${i ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e || o}</a>`);
    else if (m("createLink", o), i) {
      const r = this._getClosestAnchor();
      r && (r.setAttribute("target", "_blank"), r.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    m("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, e = "") {
    const i = this._sanitiseUrl(t);
    i && (m("insertHTML", `<img src="${i}" alt="${e}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a video embed (iframe or <video> element).
   * The html string is already validated/built by VideoDialog.
   * @param {string} html
   */
  insertVideo(t) {
    t && (m("insertHTML", t), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, e) {
    he(t, e), this.afterCommand();
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
class pe {
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
    return this.el = a("div", { class: "asn-toolbar" }), this._buildButtons(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildButtons() {
    (this.options.toolbar || []).forEach((e) => {
      const i = a("div", { class: "asn-btn-group" });
      e.forEach((n) => {
        let o;
        n.type === "select" ? o = this._createSelect(n) : n.type === "grid" ? o = this._createGridPicker(n) : n.type === "colorpicker" ? o = this._createColorPicker(n) : o = this._createButton(n), i.appendChild(o);
      }), this.el.appendChild(i);
    });
  }
  /**
   * Creates a table-grid picker button with a hoverable row/col selector popup.
   * @param {import('./Buttons.js').ButtonDef} def
   * @returns {HTMLDivElement}
   */
  _createGridPicker(t) {
    const n = a("div", { class: "asn-table-picker-wrap" }), l = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", r = a("button", {
      type: "button",
      class: l,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((x) => x.href).join(" ")))) {
      const x = this.options.fontAwesomeClass || "fas";
      r.innerHTML = `<i class="${x} fa-table" aria-hidden="true"></i>`;
    } else {
      const x = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      r.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${x} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const d = a("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), p = a("div", { class: "asn-table-grid" }), g = a("div", { class: "asn-table-label" });
    g.textContent = "Insert Table";
    const f = [];
    for (let x = 1; x <= 10; x++)
      for (let T = 1; T <= 10; T++) {
        const I = a("div", {
          class: "asn-table-cell",
          "data-row": String(x),
          "data-col": String(T)
        });
        f.push(I), p.appendChild(I);
      }
    d.appendChild(p), d.appendChild(g);
    let v = !1;
    const y = (x, T) => {
      f.forEach((I) => {
        const F = +I.getAttribute("data-row"), b = +I.getAttribute("data-col");
        I.classList.toggle("active", F <= x && b <= T);
      }), g.textContent = x && T ? `${x} × ${T}` : "Insert Table";
    }, _ = () => {
      v = !0, d.style.display = "block", r.setAttribute("aria-expanded", "true");
    }, w = () => {
      v = !1, d.style.display = "none", r.setAttribute("aria-expanded", "false"), y(0, 0);
    }, O = h(r, "click", (x) => {
      x.stopPropagation(), v ? w() : _();
    }), A = h(p, "mouseover", (x) => {
      const T = x.target.closest(".asn-table-cell");
      T && y(+T.getAttribute("data-row"), +T.getAttribute("data-col"));
    }), k = h(p, "mouseleave", () => y(0, 0)), B = h(p, "click", (x) => {
      const T = x.target.closest(".asn-table-cell");
      if (!T) return;
      const I = +T.getAttribute("data-row"), F = +T.getAttribute("data-col");
      w(), this.context.invoke("editor.focus"), t.action(this.context, I, F);
    }), L = h(document, "click", () => {
      v && w();
    });
    return this._disposers.push(O, A, k, B, L), n.appendChild(r), n.appendChild(d), n;
  }
  /**
   * Creates a split color-picker widget:
   *   [icon + strip | ▾] — left applies current color, right opens swatch popup.
   * @param {{ name: string, type: 'colorpicker', tooltip: string, defaultColor: string, action: Function }} def
   * @returns {HTMLDivElement}
   */
  _createColorPicker(t) {
    const e = [
      // Grayscale
      "#000000",
      "#434343",
      "#666666",
      "#999999",
      "#b7b7b7",
      "#cccccc",
      "#efefef",
      "#ffffff",
      // Saturated
      "#ff0000",
      "#ff9900",
      "#ffff00",
      "#00ff00",
      "#00ffff",
      "#4a86e8",
      "#9900ff",
      "#ff00ff",
      // Pastel
      "#f4cccc",
      "#fce5cd",
      "#fff2cc",
      "#d9ead3",
      "#d0e0e3",
      "#c9daf8",
      "#d9d2e9",
      "#ead1dc"
    ];
    let i = t.defaultColor || "#000000";
    const n = a("div", { class: "asn-color-picker-wrap" }), l = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", r = a("button", {
      type: "button",
      class: `${l} asn-color-btn`,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), c = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', u = t.name === "foreColor" ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${c} style="display:block"><path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${c} style="display:block"><path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/></svg>`;
    r.innerHTML = u;
    const d = a("span", { class: "asn-color-strip" });
    d.style.background = i, r.appendChild(d);
    const p = a("button", {
      type: "button",
      class: `${l} asn-color-arrow`,
      title: `Choose ${t.name === "foreColor" ? "text" : "highlight"} color`,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    p.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:block"><path d="M7 10l5 5 5-5H7z"/></svg>';
    const g = a("div", { class: "asn-color-popup" });
    g.style.display = "none";
    const f = a("div", { class: "asn-color-swatches" });
    e.forEach((b) => {
      const D = a("div", { class: "asn-color-swatch", title: b, "data-color": b });
      D.style.background = b, f.appendChild(D);
    });
    const v = a("div", { class: "asn-color-custom" }), y = a("input", { type: "color", value: i, title: "Custom color" }), _ = a("span", {}, ["Custom color"]);
    v.appendChild(y), v.appendChild(_), g.appendChild(f), g.appendChild(v);
    let w = !1;
    const O = () => {
      w = !0, g.style.display = "block", p.setAttribute("aria-expanded", "true");
    }, A = () => {
      w = !1, g.style.display = "none", p.setAttribute("aria-expanded", "false");
    }, k = (b) => {
      i = b, d.style.background = b, y.value = b, this.context.invoke("editor.focus"), t.action(this.context, b), this.context.invoke("editor.afterCommand"), A();
    }, B = h(r, "click", (b) => {
      b.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context, i), this.context.invoke("editor.afterCommand");
    }), L = h(p, "click", (b) => {
      b.stopPropagation(), w ? A() : O();
    }), x = h(f, "click", (b) => {
      const D = b.target.closest(".asn-color-swatch");
      D && k(D.dataset.color);
    }), T = h(y, "change", (b) => {
      k(b.target.value);
    }), I = h(document, "click", (b) => {
      w && !n.contains(b.target) && A();
    }), F = h(g, "click", (b) => b.stopPropagation());
    return this._disposers.push(B, L, x, T, I, F), n.appendChild(r), n.appendChild(p), n.appendChild(g), n;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const e = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], i = t.selectClass ? `asn-select ${t.selectClass}` : "asn-select", n = a("select", {
      class: i,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), o = t.placeholder || "Font", l = a("option", { value: "" }, [o]);
    n.appendChild(l), e.forEach((c) => {
      const u = typeof c == "object" ? c.value : c, d = typeof c == "object" ? c.label : c, p = a("option", { value: u }, [d]);
      t.name === "fontFamily" && (p.style.fontFamily = u), n.appendChild(p);
    });
    const r = h(n, "change", (c) => {
      const u = c.target.value;
      u && (this.context.invoke("editor.focus"), t.action(this.context, u), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(r), n;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const i = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", n = t.className ? ` ${t.className}` : "", o = `${i}${n}`, l = a("button", {
      type: "button",
      class: o,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), r = !!this.options.useFontAwesome, c = () => {
      if (!r) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const _ = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((w) => w.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(_);
    }, u = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', d = (_) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${u} style="display:block">${_}</svg>`, p = /* @__PURE__ */ new Map([
      // Format
      ["bold", d('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>')],
      ["italic", d('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>')],
      ["underline", d('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>')],
      ["strikethrough", d('<path d="M17.3 12H6.7"/><path d="M10 6.5C10 5.1 11.1 4 12.5 4c1.4 0 2.5 1.1 2.5 2.5 0 .8-.4 1.5-1 2"/><path d="M14 17.5C14 19 12.9 20 11.5 20 10.1 20 9 18.9 9 17.5c0-.8.4-1.5 1-2"/>')],
      ["superscript", d('<path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7.25C20 6 19 5 17.5 5S15 6 15 7"/>')],
      ["subscript", d('<path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 21h-4c0-1.5.44-2 1.5-2.5S20 17.33 20 16.25C20 15 19 14 17.5 14S15 15 15 16"/>')],
      // Alignment
      ["align-left", d('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>')],
      ["align-center", d('<line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      ["align-right", d('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>')],
      ["align-justify", d('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      // Lists
      ["list-ul", d('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>')],
      ["list-ol", d('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1V3"/><path d="M4 10h2l-2 2h2"/><path d="M4 16.5A1.5 1.5 0 0 1 5.5 15a1.5 1.5 0 0 1 0 3H4"/>')],
      ["indent", d('<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      ["outdent", d('<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      // History
      ["undo", d('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>')],
      ["redo", d('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>')],
      // Insert
      ["minus", d('<line x1="5" y1="12" x2="19" y2="12"/>')],
      ["link", d('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>')],
      ["image", d('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>')],
      ["video", d('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')],
      ["table", d('<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>')],
      // View
      ["code", d('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", d('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')],
      // Color pickers
      ["foreColor", d('<path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/>')],
      ["backColor", d('<path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/>')]
    ]), g = this.options.fontAwesomeClass || "fas", f = /* @__PURE__ */ new Map([
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
      ["expand", "fa-expand"],
      ["foreColor", "fa-font"],
      ["backColor", "fa-highlighter"]
    ]);
    if (c()) {
      const _ = f.get(t.icon) || f.get(t.name) || null;
      _ ? l.innerHTML = `<i class="${g} ${_}" aria-hidden="true"></i>` : p.has(t.icon) ? l.innerHTML = p.get(t.icon) : l.textContent = t.icon || t.name;
    } else
      p.has(t.icon) ? l.innerHTML = p.get(t.icon) : p.has(t.name) ? l.innerHTML = p.get(t.name) : l.textContent = t.icon || t.name;
    const y = h(l, "click", (_) => {
      _.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(y), l;
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
      const l = Array.from(i.options).find(
        (r) => r.value && r.value.toLowerCase() === o.toLowerCase()
      );
      i.value = l ? l.value : "";
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
class ue {
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
    if (this.el = a("div", { class: "asn-statusbar" }), this.options.resizeable !== !1) {
      const e = a("div", {
        class: "asn-resize-handle",
        title: "Resize editor",
        "aria-hidden": "true"
      });
      this._bindResize(e), this.el.appendChild(e);
    }
    this._wordCountEl = a("span", { class: "asn-word-count" }), this._charCountEl = a("span", { class: "asn-char-count" });
    const t = a("div", { class: "asn-status-info" });
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
    const n = this.context.layoutInfo.editable, o = (u) => {
      const d = Math.max(100, i + u.clientY - e);
      n.style.height = `${d}px`;
    }, l = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", l);
    }, c = h(t, "mousedown", (u) => {
      e = u.clientY, i = n.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", l), u.preventDefault();
    });
    this._disposers.push(c);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, e = wt(() => this.update(), 200), i = h(t, "input", e);
    this._disposers.push(i);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const e = this.context.layoutInfo.editable.innerText || "", i = e.trim() ? e.trim().split(/\s+/).length : 0, n = e.length;
    this._wordCountEl.textContent = `Words: ${i}`, this._charCountEl.textContent = `Chars: ${n}`;
  }
}
class fe {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = h(t, "paste", (i) => this._onPaste(i));
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
      i = this._sanitiseHTML(n), m("insertHTML", i);
    } else {
      i = e.getData("text/plain");
      const n = i.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      m("insertHTML", n);
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
      i.querySelectorAll(o).forEach((l) => l.parentNode.removeChild(l));
    }), i.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((l) => {
        l.name.startsWith("on") && o.removeAttribute(l.name);
      }), ["href", "src", "action"].forEach((l) => {
        const r = o.getAttribute(l);
        r && /^\s*javascript:/i.test(r) && o.removeAttribute(l);
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
class me {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = this.options.placeholder || "";
    e && (t.dataset.placeholder = e);
    const i = () => this._update(), n = h(t, "input", i), o = h(t, "focus", i), l = h(t, "blur", i);
    return this._disposers.push(n, o, l), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  _update() {
    const t = this.context.layoutInfo.editable, e = !t.textContent.trim() && !t.querySelector("img, table, hr");
    t.classList.toggle("asn-placeholder", e);
  }
}
class _e {
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
    this._textarea = a("textarea", {
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
class ge {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = h(document, "keydown", (e) => {
      this._active && j(e, V.ESCAPE) && this.deactivate();
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
class ye {
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
    K((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = a("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), e = a("div", { class: "asn-dialog-box" }), i = a("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Link";
    const n = a("label", { class: "asn-label" });
    n.textContent = "URL";
    const o = a("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://",
      id: "asn-link-url",
      name: "url",
      autocomplete: "off"
    });
    this._urlInput = o;
    const l = a("label", { class: "asn-label" });
    l.textContent = "Display Text";
    const r = a("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Link text",
      id: "asn-link-text",
      name: "linkText",
      autocomplete: "off"
    });
    this._textInput = r;
    const c = a("label", { class: "asn-label asn-label-inline" }), u = a("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = u, c.appendChild(u), c.appendChild(document.createTextNode(" Open in new tab"));
    const d = a("div", { class: "asn-dialog-actions" }), p = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    p.textContent = "Insert";
    const g = a("button", { type: "button", class: "asn-btn" });
    g.textContent = "Cancel", d.appendChild(p), d.appendChild(g), e.append(i, n, o, l, r, c, d), t.appendChild(e);
    const f = h(p, "click", () => this._onInsert()), v = h(g, "click", () => this._close()), y = h(t, "click", (_) => {
      _.target === t && this._close();
    });
    return this._disposers.push(f, v, y), t;
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
class ve {
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
    K((t) => {
      this._savedRange = t;
    }), this._urlInput.value = "", this._altInput.value = "", this._fileInput && (this._fileInput.value = ""), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = a("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert image"
    }), e = a("div", { class: "asn-dialog-box" }), i = a("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Image";
    const n = a("label", { class: "asn-label" });
    n.textContent = "Image URL";
    const o = a("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://example.com/image.png",
      autocomplete: "off"
    });
    this._urlInput = o;
    const l = a("label", { class: "asn-label" });
    l.textContent = "Alt Text";
    const r = a("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Describe the image",
      autocomplete: "off"
    });
    if (this._altInput = r, this.options.allowImageUpload !== !1) {
      const v = a("label", { class: "asn-label" });
      v.textContent = "Or upload a file";
      const y = a("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = y;
      const _ = h(y, "change", () => this._onFileChange());
      this._disposers.push(_), e.append(v, y);
    }
    const c = a("div", { class: "asn-dialog-actions" }), u = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    u.textContent = "Insert";
    const d = a("button", { type: "button", class: "asn-btn" });
    d.textContent = "Cancel", c.appendChild(u), c.appendChild(d), e.append(i, n, o, l, r, c), t.appendChild(e);
    const p = h(u, "click", () => this._onInsert()), g = h(d, "click", () => this._close()), f = h(t, "click", (v) => {
      v.target === t && this._close();
    });
    return this._disposers.push(p, g, f), t;
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
class we {
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
    K((t) => {
      this._savedRange = t;
    }), this._urlInput.value = "", this._widthInput.value = "560", this._hintEl.textContent = "", this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = a("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert video"
    }), e = a("div", { class: "asn-dialog-box" }), i = a("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Video";
    const n = a("label", { class: "asn-label" });
    n.textContent = "Video URL";
    const o = a("input", {
      type: "url",
      class: "asn-input",
      placeholder: "YouTube, Vimeo, or direct .mp4 URL",
      autocomplete: "off"
    });
    this._urlInput = o;
    const l = a("p", { class: "asn-dialog-hint" });
    this._hintEl = l;
    const r = a("label", { class: "asn-label" });
    r.textContent = "Width (px)";
    const c = a("input", {
      type: "number",
      class: "asn-input",
      placeholder: "560",
      min: "80",
      max: "1920",
      value: "560"
    });
    this._widthInput = c;
    const u = a("div", { class: "asn-dialog-actions" }), d = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    d.textContent = "Insert";
    const p = a("button", { type: "button", class: "asn-btn" });
    p.textContent = "Cancel", u.appendChild(d), u.appendChild(p), e.append(i, n, o, l, r, c, u), t.appendChild(e);
    const g = h(o, "input", () => {
      const w = this._parseVideoUrl(o.value.trim());
      l.textContent = w ? `Detected: ${w.type}` : o.value ? "Unknown format — will try direct video embed" : "";
    }), f = h(d, "click", () => this._onInsert()), v = h(p, "click", () => this._close()), y = h(t, "click", (w) => {
      w.target === t && this._close();
    }), _ = h(o, "keydown", (w) => {
      w.key === "Enter" && (w.preventDefault(), this._onInsert());
    });
    return this._disposers.push(g, f, v, y, _), t;
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
      const l = new URL(t);
      if (/^javascript:/i.test(l.protocol)) return null;
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
        const l = new URL(t);
        return /^javascript:/i.test(l.protocol) ? null : t;
      } catch {
        return null;
      }
    })();
    return o ? `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${o}" width="${e}" height="${n}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>` : null;
  }
}
const xe = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class be {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._activeImg = null, this._overlay = null, this._disposers = [];
  }
  initialize() {
    this._overlay = this._buildOverlay(), document.body.appendChild(this._overlay);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(t, "click", (e) => this._onEditorClick(e)),
      // Also select on right-click so the highlight shows before the context menu
      h(t, "contextmenu", (e) => {
        const i = e.target.closest("img");
        i && this._select(i);
      }),
      h(document, "click", (e) => this._onDocClick(e)),
      h(window, "scroll", () => this._updateOverlayPosition(), { passive: !0 }),
      h(window, "resize", () => this._updateOverlayPosition()),
      h(t, "scroll", () => this._updateOverlayPosition(), { passive: !0 })
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
    return t.className = "asn-image-resizer", t.style.display = "none", xe.forEach(({ pos: e }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${e}`, i.dataset.handle = e, this._disposers.push(
        h(i, "mousedown", (n) => {
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
    const n = t.clientX, o = t.clientY, l = i.offsetWidth || i.naturalWidth || 100, r = i.offsetHeight || i.naturalHeight || 100, c = l / r, u = e.length === 2, d = (g) => {
      const f = g.clientX - n, v = g.clientY - o;
      let y = l, _ = r;
      e.includes("e") && (y = Math.max(20, l + f)), e.includes("w") && (y = Math.max(20, l - f)), e.includes("s") && (_ = Math.max(20, r + v)), e.includes("n") && (_ = Math.max(20, r - v)), u && (Math.abs(f) >= Math.abs(v) ? _ = Math.max(20, Math.round(y / c)) : y = Math.max(20, Math.round(_ * c))), i.style.width = `${y}px`, i.style.height = `${_}px`, this._updateOverlayPosition();
    }, p = () => {
      document.removeEventListener("mousemove", d), document.removeEventListener("mouseup", p), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", d), document.addEventListener("mouseup", p);
  }
}
const Ce = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class ke {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._activeWrapper = null, this._overlay = null, this._disposers = [];
  }
  initialize() {
    this._overlay = this._buildOverlay(), document.body.appendChild(this._overlay);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(t, "click", (e) => this._onEditorClick(e)),
      h(t, "contextmenu", (e) => {
        const i = this._findWrapper(e.target);
        i && this._select(i);
      }),
      h(document, "click", (e) => this._onDocClick(e)),
      h(window, "scroll", () => this._updateOverlayPosition(), { passive: !0 }),
      h(window, "resize", () => this._updateOverlayPosition()),
      h(t, "scroll", () => this._updateOverlayPosition(), { passive: !0 })
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
    return t.className = "asn-video-resizer", t.style.display = "none", Ce.forEach(({ pos: e }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${e}`, i.dataset.handle = e, this._disposers.push(
        h(i, "mousedown", (n) => {
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
    const n = i.querySelector("iframe, video"), o = t.clientX, l = t.clientY, r = i.offsetWidth || 560, c = i.offsetHeight || 315, u = r / c, d = e.length === 2, p = (f) => {
      const v = f.clientX - o, y = f.clientY - l;
      let _ = r, w = c;
      e.includes("e") && (_ = Math.max(80, r + v)), e.includes("w") && (_ = Math.max(80, r - v)), e.includes("s") && (w = Math.max(45, c + y)), e.includes("n") && (w = Math.max(45, c - y)), d && (Math.abs(v) >= Math.abs(y) ? w = Math.max(45, Math.round(_ / u)) : _ = Math.max(80, Math.round(w * u))), i.style.width = `${_}px`, i.style.height = `${w}px`, n && (n.width = _, n.height = w, n.style.width = `${_}px`, n.style.height = `${w}px`), this._updateOverlayPosition();
    }, g = () => {
      document.removeEventListener("mousemove", p), document.removeEventListener("mouseup", g), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", p), document.addEventListener("mouseup", g);
  }
}
const $ = {
  open: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  unlink: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
}, Te = 120, Be = 200;
class Ee {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeAnchor = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      // Detect when pointer enters a link
      h(t, "mouseover", (e) => {
        const i = e.target.closest("a[href]");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      // Detect when pointer leaves the editable area entirely
      h(t, "mouseout", (e) => {
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
    const t = a("div", { class: "asn-link-tooltip", role: "toolbar", "aria-label": "Link actions" });
    return t.style.display = "none", this._urlLabel = a("span", { class: "asn-link-tooltip-url" }), t.appendChild(this._urlLabel), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._openBtn = this._makeBtn($.open, "Open link", () => this._openLink()), this._copyBtn = this._makeBtn($.copy, "Copy URL", () => this._copyLink()), this._editBtn = this._makeBtn($.edit, "Edit link", () => this._editLink()), this._unlinkBtn = this._makeBtn($.unlink, "Remove link", () => this._unlink()), t.appendChild(this._openBtn), t.appendChild(this._copyBtn), t.appendChild(this._editBtn), t.appendChild(this._unlinkBtn), this._disposers.push(
      h(t, "mouseenter", () => this._clearTimers()),
      h(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  _makeBtn(t, e, i) {
    const n = a("button", { type: "button", class: "asn-link-tooltip-btn", title: e });
    return n.innerHTML = t, this._disposers.push(h(n, "click", (o) => {
      o.preventDefault(), o.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide logic
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeAnchor === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeAnchor = t, this._show(t);
    }, Te));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => {
      this._hide();
    }, Be));
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
    let l = e.bottom + o, r = e.left;
    l + n > window.innerHeight - o && (l = e.top - n - o), r + i > window.innerWidth - o && (r = window.innerWidth - i - o), r < o && (r = o), this._el.style.top = `${l}px`, this._el.style.left = `${r}px`;
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
const z = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteImg: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Le = 100, Ie = 180;
class Me {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeImg = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(t, "mouseover", (e) => {
        const i = e.target.closest("img");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      h(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      // Hide when image is deselected by clicking elsewhere
      h(document, "click", (e) => {
        this._activeImg && !this._activeImg.contains(e.target) && !this._el.contains(e.target) && this._hide();
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
    const t = a("div", {
      class: "asn-link-tooltip asn-image-tooltip",
      role: "toolbar",
      "aria-label": "Image actions"
    });
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Image", t.appendChild(this._label), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(z.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(z.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(z.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(z.floatRight, "Float Right", () => this._setFloat("right")), t.appendChild(this._floatLeftBtn), t.appendChild(this._floatNoneBtn), t.appendChild(this._alignCenterBtn), t.appendChild(this._floatRightBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(z.originalSize, "Original Size", () => this._resetSize()), t.appendChild(this._originalBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(z.deleteImg, "Delete Image", () => this._delete(), !0), t.appendChild(this._deleteBtn), this._disposers.push(
      h(t, "mouseenter", () => this._clearTimers()),
      h(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(t, e, i, n = !1) {
    const o = a("button", {
      type: "button",
      class: n ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return o.innerHTML = t, this._disposers.push(h(o, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeImg === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeImg = t, this._show(t);
    }, Le));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Ie));
  }
  _show(t) {
    this._el.style.display = "flex", this._positionNear(t);
  }
  _hide() {
    this._el.style.display = "none", this._activeImg = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(t) {
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 220, n = this._el.offsetHeight || 32, o = 6;
    let l = e.bottom + o, r = e.left + (e.width - i) / 2;
    l + n > window.innerHeight - o && (l = e.top - n - o), r + i > window.innerWidth - o && (r = window.innerWidth - i - o), r < o && (r = o), this._el.style.top = `${l}px`, this._el.style.left = `${r}px`;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _setFloat(t) {
    const e = this._activeImg;
    e && (e.style.float = t, e.style.display = "", e.style.marginLeft = t === "right" ? "12px" : "", e.style.marginRight = t === "left" ? "12px" : "", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay"), this._positionNear(e));
  }
  _setCenter() {
    const t = this._activeImg;
    t && (t.style.float = "", t.style.display = "block", t.style.marginLeft = "auto", t.style.marginRight = "auto", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay"), this._positionNear(t));
  }
  _resetSize() {
    const t = this._activeImg;
    t && (t.style.width = "", t.style.height = "", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay"), this._positionNear(t));
  }
  _delete() {
    const t = this._activeImg;
    t && (this._hide(), this.context.invoke("imageResizer.deselect"), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand"));
  }
}
const N = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteVideo: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Se = 100, Ae = 180;
class He {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeWrapper = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(t, "mouseover", (e) => {
        const i = e.target.closest(".asn-video-wrapper");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      h(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      h(document, "click", (e) => {
        this._activeWrapper && !this._activeWrapper.contains(e.target) && !this._el.contains(e.target) && this._hide();
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
    const t = a("div", {
      class: "asn-link-tooltip asn-video-tooltip",
      role: "toolbar",
      "aria-label": "Video actions"
    });
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Video", t.appendChild(this._label), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(N.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(N.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(N.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(N.floatRight, "Float Right", () => this._setFloat("right")), t.appendChild(this._floatLeftBtn), t.appendChild(this._floatNoneBtn), t.appendChild(this._alignCenterBtn), t.appendChild(this._floatRightBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(N.originalSize, "Original Size", () => this._resetSize()), t.appendChild(this._originalBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(N.deleteVideo, "Delete Video", () => this._delete(), !0), t.appendChild(this._deleteBtn), this._disposers.push(
      h(t, "mouseenter", () => this._clearTimers()),
      h(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(t, e, i, n = !1) {
    const o = a("button", {
      type: "button",
      class: n ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return o.innerHTML = t, this._disposers.push(h(o, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeWrapper === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeWrapper = t, this._show(t);
    }, Se));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Ae));
  }
  _show(t) {
    this._el.style.display = "flex", this._positionNear(t);
  }
  _hide() {
    this._el.style.display = "none", this._activeWrapper = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(t) {
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 220, n = this._el.offsetHeight || 32, o = 6;
    let l = e.bottom + o, r = e.left + (e.width - i) / 2;
    l + n > window.innerHeight - o && (l = e.top - n - o), r + i > window.innerWidth - o && (r = window.innerWidth - i - o), r < o && (r = o), this._el.style.top = `${l}px`, this._el.style.left = `${r}px`;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _setFloat(t) {
    const e = this._activeWrapper;
    e && (e.style.float = t, e.style.display = "inline-block", e.style.marginLeft = t === "right" ? "12px" : "", e.style.marginRight = t === "left" ? "12px" : "", this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay"), this._positionNear(e));
  }
  _setCenter() {
    const t = this._activeWrapper;
    t && (t.style.float = "", t.style.display = "block", t.style.marginLeft = "auto", t.style.marginRight = "auto", this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay"), this._positionNear(t));
  }
  _resetSize() {
    const t = this._activeWrapper;
    if (!t) return;
    const e = t.querySelector("iframe, video");
    t.style.width = "", t.style.height = "", e && (e.removeAttribute("width"), e.removeAttribute("height"), e.style.width = "", e.style.height = ""), this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay"), this._positionNear(t);
  }
  _delete() {
    const t = this._activeWrapper;
    t && (this._hide(), this.context.invoke("videoResizer.deselect"), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand"));
  }
}
const Re = 120, ze = 200, S = {
  rowAbove: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v7"/><path d="M9 7l3-4 3 4"/></svg>',
  rowBelow: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 12v7"/><path d="M9 17l3 4 3-4"/></svg>',
  deleteRow: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/></svg>',
  colLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 12h7"/><path d="M7 8l-4 4 4 4"/></svg>',
  colRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 12h9"/><path d="M17 8l4 4-4 4"/></svg>',
  deleteCol: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="21" y2="12"/><line x1="21" y1="6" x2="15" y2="12"/></svg>',
  mergeCells: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="8" height="10" rx="1"/><rect x="14" y="7" width="8" height="10" rx="1"/><path d="M10 12h4"/><path d="M12 10l2 2-2 2"/></svg>',
  colWidth: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="7" y1="12" x2="17" y2="12"/><path d="M10 9l-3 3 3 3"/><path d="M14 9l3 3-3 3"/></svg>',
  rowHeight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/></svg>',
  deleteTable: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444"/><line x1="22" y1="16" x2="16" y2="22" stroke="#ef4444"/></svg>'
};
class Ne {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeTable = null, this._activeCell = null, this._showTimer = null, this._hideTimer = null, this._disposers = [], this._sizePopover = null, this._sizeApply = null, this._sizeTitleEl = null, this._sizeInputEl = null;
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(t, "mouseover", (e) => {
        const i = e.target.closest("table");
        if (i && t.contains(i)) {
          const n = e.target.closest("td, th");
          n && (this._activeCell = n), this._scheduleShow(i);
        }
      }),
      h(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i) && !(this._sizePopover && this._sizePopover.contains(i))) && this._scheduleHide();
      }),
      h(document, "click", (e) => {
        this._activeTable && !this._activeTable.contains(e.target) && !this._el.contains(e.target) && !(this._sizePopover && this._sizePopover.contains(e.target)) && this._hide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((t) => t()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null, this._sizePopover && this._sizePopover.parentNode && this._sizePopover.parentNode.removeChild(this._sizePopover), this._sizePopover = null;
  }
  // ---------------------------------------------------------------------------
  // Build tooltip bar
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const t = a("div", {
      class: "asn-link-tooltip asn-table-tooltip",
      role: "toolbar",
      "aria-label": "Table actions"
    });
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Table", t.appendChild(this._label), t.appendChild(this._sep()), t.appendChild(this._makeBtn(S.rowAbove, "Add Row Above", () => this._addRow("above"))), t.appendChild(this._makeBtn(S.rowBelow, "Add Row Below", () => this._addRow("below"))), t.appendChild(this._makeBtn(S.deleteRow, "Delete Row", () => this._deleteRow())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(S.colLeft, "Add Column Left", () => this._addColumn("left"))), t.appendChild(this._makeBtn(S.colRight, "Add Column Right", () => this._addColumn("right"))), t.appendChild(this._makeBtn(S.deleteCol, "Delete Column", () => this._deleteColumn())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(S.mergeCells, "Merge Cells", () => this._mergeCells())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(S.colWidth, "Column Width", () => this._openSizePopover("col"))), t.appendChild(this._makeBtn(S.rowHeight, "Row Height", () => this._openSizePopover("row"))), t.appendChild(this._sep()), t.appendChild(this._makeBtn(S.deleteTable, "Delete Table", () => this._deleteTable(), !0)), this._disposers.push(
      h(t, "mouseenter", () => this._clearTimers()),
      h(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  _sep() {
    return a("div", { class: "asn-link-tooltip-sep" });
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(t, e, i, n = !1) {
    const o = a("button", {
      type: "button",
      class: n ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return o.innerHTML = t, this._disposers.push(h(o, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeTable === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeTable = t, this._show();
    }, Re));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), ze));
  }
  _show() {
    this._activeTable && (this._el.style.display = "flex", this._positionNear(this._activeTable));
  }
  _hide() {
    this._el.style.display = "none", this._activeTable = null, this._activeCell = null, this._clearTimers(), this._hideSizePopover();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(t) {
    if (!t) return;
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 400, n = this._el.offsetHeight || 30, o = 6;
    let l = e.left + (e.width - i) / 2, r = e.top - n - o;
    r < o && (r = e.bottom + o), l + i > window.innerWidth - o && (l = window.innerWidth - i - o), l < o && (l = o), this._el.style.left = `${l}px`, this._el.style.top = `${r}px`;
  }
  // ---------------------------------------------------------------------------
  // Helper: get active cell (fallback to first td/th in table)
  // ---------------------------------------------------------------------------
  _getCell() {
    return this._activeCell || this._activeTable && this._activeTable.querySelector("td, th");
  }
  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------
  _addRow(t) {
    const e = this._getCell();
    if (!e) return;
    const i = e.closest("tr");
    if (!i) return;
    const n = Array.from(i.cells).reduce((l, r) => l + (r.colSpan || 1), 0), o = document.createElement("tr");
    for (let l = 0; l < n; l++) {
      const r = document.createElement("td");
      r.style.border = "1px solid #dee2e6", r.style.padding = "6px 12px", r.innerHTML = "&#8203;", o.appendChild(r);
    }
    t === "above" ? i.parentElement.insertBefore(o, i) : i.insertAdjacentElement("afterend", o), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t) {
    const e = this._getCell();
    if (!e) return;
    const i = e.closest("tr"), n = e.closest("table");
    if (!i || !n) return;
    const o = Array.from(i.cells).indexOf(e);
    Array.from(n.querySelectorAll("tr")).forEach((l) => {
      const r = Array.from(l.cells), c = document.createElement("td");
      c.style.border = "1px solid #dee2e6", c.style.padding = "6px 12px", c.innerHTML = "&#8203;";
      const u = t === "left" ? r[o] : r[o + 1] || null;
      l.insertBefore(c, u);
    }), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _deleteRow() {
    const t = this._getCell();
    if (!t) return;
    const e = t.closest("tr"), i = t.closest("table");
    !e || !i || i.querySelectorAll("tr").length <= 1 || (this._activeCell = null, e.parentElement.removeChild(e), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand"));
  }
  _deleteColumn() {
    const t = this._getCell();
    if (!t) return;
    const e = t.closest("tr"), i = t.closest("table");
    if (!e || !i || e.cells.length <= 1) return;
    const n = Array.from(e.cells).indexOf(t);
    this._activeCell = null, Array.from(i.querySelectorAll("tr")).forEach((o) => {
      const l = o.cells[n];
      l && o.removeChild(l);
    }), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _mergeCells() {
    const t = this._getCell();
    if (!t) return;
    const e = t.closest("tr");
    if (!e) return;
    const i = window.getSelection();
    if (!i || i.rangeCount === 0) return;
    const n = i.getRangeAt(0), o = Array.from(e.cells).filter((r) => {
      try {
        return n.intersectsNode(r);
      } catch {
        return !1;
      }
    });
    if (o.length < 2) return;
    const l = o[0];
    l.colSpan = o.reduce((r, c) => r + (c.colSpan || 1), 0), l.innerHTML = o.map((r) => r.innerHTML).join(""), o.slice(1).forEach((r) => e.removeChild(r)), this.context.invoke("editor.afterCommand");
  }
  _deleteTable() {
    const t = this._activeTable;
    t && (this._hide(), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand"));
  }
  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------
  _buildSizePopover() {
    const t = a("div", { class: "asn-size-popover" });
    t.style.display = "none";
    const e = a("div", { class: "asn-size-popover-title" }), i = a("div", { class: "asn-size-popover-body" }), n = a("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), o = a("span", { class: "asn-size-unit" }, ["px"]);
    i.appendChild(n), i.appendChild(o);
    const l = a("div", { class: "asn-size-popover-actions" }), r = a("button", { type: "button", class: "asn-btn" });
    r.textContent = "Cancel";
    const c = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    c.textContent = "Apply", l.appendChild(r), l.appendChild(c), t.appendChild(e), t.appendChild(i), t.appendChild(l), this._sizeTitleEl = e, this._sizeInputEl = n, this._sizeApply = null;
    const u = h(c, "click", () => {
      const f = parseInt(this._sizeInputEl.value, 10);
      f > 0 && typeof this._sizeApply == "function" && this._sizeApply(f), this._hideSizePopover();
    }), d = h(r, "click", () => this._hideSizePopover()), p = h(n, "keydown", (f) => {
      f.key === "Enter" && (f.preventDefault(), c.click()), f.key === "Escape" && this._hideSizePopover();
    }), g = h(document, "click", (f) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(f.target) && !this._el.contains(f.target) && this._hideSizePopover();
    });
    return this._disposers.push(u, d, p, g), t;
  }
  _openSizePopover(t) {
    const e = this._getCell();
    if (!e || !this._sizePopover) return;
    const i = t === "col";
    this._sizeTitleEl.textContent = i ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = i ? e.offsetWidth || 120 : e.closest("tr") && e.closest("tr").offsetHeight || 40, this._sizeApply = (n) => {
      if (i) {
        const o = e.closest("table"), l = Array.from(e.closest("tr").cells).indexOf(e);
        Array.from(o.querySelectorAll("tr")).forEach((r) => {
          const c = r.cells[l];
          c && (c.style.width = `${n}px`, c.style.minWidth = `${n}px`);
        });
      } else {
        const o = e.closest("tr");
        o && Array.from(o.cells).forEach((l) => {
          l.style.height = `${n}px`;
        });
      }
      this.context.invoke("editor.afterCommand");
    }, this._sizePopover.style.display = "block", requestAnimationFrame(() => {
      if (!this._sizePopover || !this._el) return;
      const n = this._el.getBoundingClientRect(), o = this._sizePopover.offsetWidth || 220, l = this._sizePopover.offsetHeight || 110;
      let r = n.left, c = n.bottom + 6;
      r + o > window.innerWidth - 8 && (r = window.innerWidth - o - 8), c + l > window.innerHeight - 8 && (c = n.top - l - 6), this._sizePopover.style.left = `${r}px`, this._sizePopover.style.top = `${c}px`, this._sizeInputEl && (this._sizeInputEl.focus(), this._sizeInputEl.select());
    });
  }
  _hideSizePopover() {
    this._sizePopover && (this._sizePopover.style.display = "none"), this._sizeApply = null;
  }
}
const Pe = 100, Oe = 180, W = {
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  wrapOn: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 0 1 0 6H3"/><polyline points="6 15 3 18 6 21"/></svg>',
  toParagraph: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M9 4h8a4 4 0 0 1 0 8H9V4z"/></svg>',
  deleteCode: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
};
class Fe {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activePre = null, this._showTimer = null, this._hideTimer = null, this._disposers = [], this._copyBtn = null;
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(t, "mouseover", (e) => {
        const i = e.target.closest("pre");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      h(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      h(document, "click", (e) => {
        this._activePre && !this._activePre.contains(e.target) && !this._el.contains(e.target) && this._hide();
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
    const t = a("div", {
      class: "asn-link-tooltip asn-code-tooltip",
      role: "toolbar",
      "aria-label": "Code block actions"
    });
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Code", t.appendChild(this._label), t.appendChild(this._sep()), this._copyBtn = this._makeBtn(W.copy, "Copy Code", () => this._copyCode()), t.appendChild(this._copyBtn), t.appendChild(this._sep()), this._wrapBtn = this._makeBtn(W.wrapOn, "Toggle Word Wrap", () => this._toggleWrap()), t.appendChild(this._wrapBtn), t.appendChild(this._sep()), t.appendChild(this._makeBtn(W.toParagraph, "Convert to Paragraph", () => this._toParagraph())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(W.deleteCode, "Delete Code Block", () => this._delete(), !0)), this._disposers.push(
      h(t, "mouseenter", () => this._clearTimers()),
      h(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  _sep() {
    return a("div", { class: "asn-link-tooltip-sep" });
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(t, e, i, n = !1) {
    const o = a("button", {
      type: "button",
      class: n ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return o.innerHTML = t, this._disposers.push(h(o, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activePre === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activePre = t, this._syncWrapBtn(), this._show(t);
    }, Pe));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Oe));
  }
  _show(t) {
    this._el.style.display = "flex", this._positionNear(t);
  }
  _hide() {
    this._el.style.display = "none", this._activePre = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(t) {
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 260, n = this._el.offsetHeight || 32, o = 6;
    let l = e.top - n - o, r = e.left + (e.width - i) / 2;
    l < o && (l = e.bottom + o), r + i > window.innerWidth - o && (r = window.innerWidth - i - o), r < o && (r = o), this._el.style.top = `${l + window.scrollY}px`, this._el.style.left = `${r + window.scrollX}px`;
  }
  // ---------------------------------------------------------------------------
  // Sync wrap-button active state
  // ---------------------------------------------------------------------------
  _syncWrapBtn() {
    if (!this._activePre || !this._wrapBtn) return;
    const t = (this._activePre.style.whiteSpace || "").includes("pre-wrap") || window.getComputedStyle(this._activePre).whiteSpace === "pre-wrap";
    this._wrapBtn.classList.toggle("active", t), this._wrapBtn.title = t ? "Disable Word Wrap" : "Enable Word Wrap";
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _copyCode() {
    const t = this._activePre;
    if (!t) return;
    const e = t.textContent || "";
    if (navigator.clipboard)
      navigator.clipboard.writeText(e).then(() => this._flashCopied()).catch(() => {
      });
    else {
      const i = document.createElement("textarea");
      i.value = e, i.style.cssText = "position:fixed;opacity:0;top:0;left:0", document.body.appendChild(i), i.select();
      try {
        document.execCommand("copy"), this._flashCopied();
      } catch {
      }
      document.body.removeChild(i);
    }
  }
  _flashCopied() {
    if (!this._copyBtn) return;
    const t = this._copyBtn.innerHTML;
    this._copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', this._copyBtn.classList.add("asn-link-tooltip-btn--copied"), setTimeout(() => {
      this._copyBtn && (this._copyBtn.innerHTML = t, this._copyBtn.classList.remove("asn-link-tooltip-btn--copied"));
    }, 1400);
  }
  _toggleWrap() {
    const t = this._activePre;
    if (!t) return;
    const e = t.style.whiteSpace === "pre-wrap";
    t.style.whiteSpace = e ? "pre" : "pre-wrap", this._syncWrapBtn(), this.context.invoke("editor.afterCommand"), this._positionNear(t);
  }
  _toParagraph() {
    const t = this._activePre;
    if (!t || !this.context.layoutInfo.editable) return;
    const i = (t.textContent || "").split(`
`), n = document.createElement("p");
    i.forEach((o, l) => {
      l > 0 && n.appendChild(document.createElement("br")), n.appendChild(document.createTextNode(o));
    }), t.parentNode.replaceChild(n, t), this._hide(), this.context.invoke("editor.afterCommand");
  }
  _delete() {
    const t = this._activePre;
    t && (this._hide(), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand"));
  }
}
const E = {
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
  // Format painter operations
  copyFormat: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  pasteFormat: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>',
  removeFormat: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>',
  // Table
  table: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>'
}, De = [
  { name: "undo", label: "Undo", icon: E.undo, action: (s) => s.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: E.redo, action: (s) => s.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: E.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: E.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: E.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: E.bold, action: (s) => s.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: E.italic, action: (s) => s.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: E.underline, action: (s) => s.invoke("editor.underline") },
  { separator: !0 },
  { name: "copyFormat", label: "Copy Format", icon: E.copyFormat, action: (s) => s.invoke("contextMenu.copyFormat") },
  { name: "pasteFormat", label: "Paste Format", icon: E.pasteFormat, action: (s) => s.invoke("contextMenu.pasteFormat"), disabled: (s) => !s.invoke("contextMenu.hasCopiedFormat") },
  { name: "removeFormat", label: "Remove Format", icon: E.removeFormat, action: (s) => s.invoke("contextMenu.removeFormat") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: E.link, action: (s) => s.invoke("linkDialog.show") },
  { name: "image", label: "Insert Image", icon: E.image, action: (s) => s.invoke("imageDialog.show") },
  { name: "video", label: "Insert Video", icon: E.video, action: (s) => s.invoke("videoDialog.show") },
  { name: "table", label: "Insert Table", icon: E.table, tableGrid: !0 }
];
class $e {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || De, this.el = null, this._disposers = [], this._menuDisposers = [], this._lastX = 0, this._lastY = 0, this._copiedFormat = null, this._savedRange = null;
  }
  initialize() {
    this.el = a("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._renderItems(this._items);
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
    }), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  _renderItems(t) {
    this._menuDisposers.forEach((e) => e()), this._menuDisposers = [], this.el && (this.el.innerHTML = "", t.forEach((e) => {
      if (e.separator || e.sep) {
        this.el.appendChild(a("div", { class: "asn-context-sep" }));
        return;
      }
      if (e.back) {
        const o = a("button", { type: "button", class: "asn-context-back" }), l = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
        l.innerHTML = E.back, o.appendChild(l), o.appendChild(a("span", { class: "asn-context-label" }, [e.label || "Back"]));
        const r = h(o, "click", (c) => {
          c.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(r), this.el.appendChild(o);
        return;
      }
      if (e.navigate) {
        const o = a("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": e.name || "" });
        if (e.icon) {
          const c = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
          c.innerHTML = e.icon, o.appendChild(c);
        }
        o.appendChild(a("span", { class: "asn-context-label" }, [e.label || e.name]));
        const l = a("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        l.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', o.appendChild(l);
        const r = h(o, "click", (c) => {
          c.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(r), this.el.appendChild(o);
        return;
      }
      if (e.tableGrid) {
        const r = a("div", { class: "asn-context-table-wrap" }), c = a("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": e.name || "table" });
        if (e.icon) {
          const k = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
          k.innerHTML = e.icon, c.appendChild(k);
        }
        c.appendChild(a("span", { class: "asn-context-label" }, [e.label || "Insert Table"]));
        const u = a("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        u.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', c.appendChild(u);
        const d = a("div", { class: "asn-context-table-grid-panel" });
        d.style.display = "none";
        const p = a("div", { class: "asn-table-grid" });
        p.style.gridTemplateColumns = "repeat(8, 16px)";
        const g = a("div", { class: "asn-table-label" });
        g.textContent = "Insert Table";
        const f = [];
        for (let k = 1; k <= 8; k++)
          for (let B = 1; B <= 8; B++) {
            const L = a("div", { class: "asn-table-cell", "data-row": String(k), "data-col": String(B) });
            L.style.width = "16px", L.style.height = "16px", f.push(L), p.appendChild(L);
          }
        const v = (k, B) => {
          f.forEach((L) => {
            L.classList.toggle("active", +L.dataset.row <= k && +L.dataset.col <= B);
          }), g.textContent = k && B ? `${B} × ${k}` : "Insert Table";
        };
        d.appendChild(p), d.appendChild(g);
        let y = !1;
        const _ = h(c, "click", (k) => {
          k.stopPropagation(), y = !y, d.style.display = y ? "" : "none", u.style.transform = y ? "rotate(90deg)" : "", this._reposition();
        });
        this._menuDisposers.push(_);
        const w = h(p, "mousemove", (k) => {
          const B = k.target.closest("[data-row]");
          B && v(+B.dataset.row, +B.dataset.col);
        }), O = h(p, "mouseleave", () => v(0, 0)), A = h(p, "click", (k) => {
          const B = k.target.closest("[data-row]");
          if (!B) return;
          const L = +B.dataset.row, x = +B.dataset.col, T = this.context.layoutInfo && this.context.layoutInfo.editable;
          if (T && this._savedRange) {
            T.focus();
            const I = window.getSelection();
            I.removeAllRanges(), I.addRange(this._savedRange.cloneRange());
          }
          this.hide(), this.context.invoke("editor.insertTable", x, L);
        });
        this._menuDisposers.push(w, O, A), r.appendChild(c), r.appendChild(d), this.el.appendChild(r);
        return;
      }
      const i = a("button", { type: "button", class: "asn-context-item", "data-name": e.name || "" });
      if ((typeof e.disabled == "function" ? e.disabled(this.context) : e.disabled) && (i.disabled = !0), e.icon) {
        const o = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
        o.innerHTML = e.icon, i.appendChild(o);
      }
      i.appendChild(a("span", { class: "asn-context-label" }, [e.label || e.name]));
      const n = h(i, "click", (o) => {
        o.stopPropagation(), this.hide();
        try {
          e.action(this.context);
        } catch (l) {
          console.error(l);
        }
      });
      this._menuDisposers.push(n), this.el.appendChild(i);
    }));
  }
  _onContextMenu(t) {
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!e || !e.contains(t.target)) return;
    t.preventDefault(), this._lastX = t.clientX, this._lastY = t.clientY;
    const i = window.getSelection();
    this._savedRange = i && i.rangeCount > 0 ? i.getRangeAt(0).cloneRange() : null, this._renderItems(this._items), this.showAt(t.clientX, t.clientY);
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
    let l = i, r = n;
    l + o.width > window.innerWidth && (l = window.innerWidth - o.width - 8), r + o.height > window.innerHeight && (r = window.innerHeight - o.height - 8), this.el.style.left = `${l}px`, this.el.style.top = `${r}px`;
  }
  hide() {
    this.el && (this.el.style.display = "none", this.el.setAttribute("aria-hidden", "true"));
  }
  // ---------------------------------------------------------------------------
  // Format operations (Copy Format / Paste Format / Remove Format)
  // ---------------------------------------------------------------------------
  /** Returns true if a format has been copied — used to disable Paste Format. */
  hasCopiedFormat() {
    return !!this._copiedFormat;
  }
  /** Snapshot inline styles at the selection anchor node. */
  copyFormat() {
    const t = this._savedRange;
    if (!t) return;
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    let i = t.startContainer;
    if (i.nodeType === Node.TEXT_NODE && (i = i.parentElement), !i || !e || !e.contains(i)) return;
    const n = window.getComputedStyle(i), o = this._findExplicitStyle(i, e, "fontFamily"), l = this._findExplicitStyle(i, e, "fontSize");
    this._copiedFormat = {
      bold: parseInt(n.fontWeight, 10) >= 700,
      italic: n.fontStyle === "italic" || n.fontStyle === "oblique",
      underline: (n.textDecorationLine || "").includes("underline"),
      strikethrough: (n.textDecorationLine || "").includes("line-through"),
      fontFamily: o,
      fontSize: l,
      color: this._isDefaultColor(n.color) ? null : n.color,
      backgroundColor: n.backgroundColor
    };
  }
  /** Walk up the tree looking for a property explicitly set in inline style. Returns null if only inherited. */
  _findExplicitStyle(t, e, i) {
    let n = t;
    for (; n && n !== e && n !== document.body; ) {
      if (n.style && n.style[i]) return n.style[i];
      if (n.nodeName === "FONT") {
        if (i === "fontFamily" && n.getAttribute("face")) return n.getAttribute("face");
        if (i === "fontSize" && n.getAttribute("size"))
          return null;
      }
      n = n.parentElement;
    }
    return null;
  }
  /** Checks if a computed color looks like the default browser text color (black). */
  _isDefaultColor(t) {
    return !t || t === "rgb(0, 0, 0)" || t === "rgba(0, 0, 0, 0)" || t === "transparent";
  }
  /** Apply the most-recently copied format to the saved selection. */
  pasteFormat() {
    if (!this._copiedFormat || !this._savedRange) return;
    const t = this._copiedFormat, e = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!e) return;
    e.focus();
    const i = window.getSelection();
    if (i.removeAllRanges(), i.addRange(this._savedRange.cloneRange()), document.execCommand("removeFormat"), t.bold && document.execCommand("bold"), t.italic && document.execCommand("italic"), t.underline && document.execCommand("underline"), t.strikethrough && document.execCommand("strikeThrough"), t.color && document.execCommand("foreColor", !1, t.color), ((o) => !o || o === "rgba(0, 0, 0, 0)" || o === "transparent")(t.backgroundColor) || document.execCommand("hiliteColor", !1, t.backgroundColor), t.fontSize) {
      const o = `fs-${Date.now()}`;
      document.execCommand("fontSize", !1, "7"), e.querySelectorAll('font[size="7"]').forEach((l) => l.setAttribute("data-asn-tmp", o)), e.querySelectorAll(`[data-asn-tmp="${o}"]`).forEach((l) => {
        const r = document.createElement("span");
        for (r.style.fontSize = t.fontSize, l.parentNode.insertBefore(r, l); l.firstChild; ) r.appendChild(l.firstChild);
        l.parentNode.removeChild(l);
      });
    }
    t.fontFamily && document.execCommand("fontName", !1, t.fontFamily), this.context.invoke("editor.afterCommand");
  }
  /** Strip all inline formatting from the saved selection. */
  removeFormat() {
    if (!this._savedRange) return;
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!t) return;
    const e = window.getSelection();
    e.removeAllRanges(), e.addRange(this._savedRange.cloneRange()), t.focus(), document.execCommand("removeFormat");
    const i = e.getRangeAt(0), n = i.commonAncestorContainer, o = n.nodeType === Node.TEXT_NODE ? n.parentElement : n, l = document.createNodeIterator(o, NodeFilter.SHOW_ELEMENT);
    let r;
    for (; r = l.nextNode(); )
      if (!(!t.contains(r) || r === t))
        try {
          i.intersectsNode(r) && r.removeAttribute("style");
        } catch {
        }
    this.context.invoke("editor.afterCommand");
  }
}
class We {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, e = {}) {
    this.targetEl = t, this.options = J(vt, e), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: e } = oe(this.targetEl, this.options);
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
    t("editor", de), t("toolbar", pe), t("statusbar", ue), t("clipboard", fe), t("contextMenu", $e), t("placeholder", me), t("codeview", _e), t("fullscreen", ge), t("linkDialog", ye), t("imageDialog", ve), t("videoDialog", we), t("imageResizer", be), t("videoResizer", ke), t("linkTooltip", Ee), t("imageTooltip", Me), t("videoTooltip", He), t("tableTooltip", Ne), t("codeTooltip", Fe);
  }
  _bindEditorEvents(t) {
    const e = h(t, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), i = h(t, "blur", () => {
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
function vi(s) {
  return s[s.length - 1];
}
function wi(s) {
  return s[0];
}
function xi(s, t = 1) {
  return s.slice(0, s.length - t);
}
function bi(s, t = 1) {
  return s.slice(t);
}
function Ci(s) {
  return s.reduce((t, e) => t.concat(e), []);
}
function ki(s) {
  return [...new Set(s)];
}
function Ti(s, t) {
  const e = [];
  for (let i = 0; i < s.length; i += t)
    e.push(s.slice(i, i + t));
  return e;
}
function Bi(s, t) {
  return s.reduce((e, i) => {
    const n = t(i);
    return e[n] || (e[n] = []), e[n].push(i), e;
  }, {});
}
function Ei(s, t) {
  return s.every(t);
}
function Li(s, t) {
  return s.some(t);
}
const H = navigator.userAgent, Ii = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(H),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(H),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(H),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(H),
  /** True if running on macOS */
  isMac: /Macintosh/.test(H),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(H),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(H) ? "metaKey" : "ctrlKey"
}, P = /* @__PURE__ */ new WeakMap(), Mi = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(s, t = {}) {
    const i = Z(s).map((n) => {
      if (P.has(n)) return P.get(n);
      const o = new We(n, t);
      return o.initialize(), P.set(n, o), o;
    });
    return i.length === 1 ? i[0] : i;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(s) {
    Z(s).forEach((t) => {
      const e = P.get(t);
      e && (e.destroy(), P.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(s) {
    const t = typeof s == "string" ? document.querySelector(s) : s;
    return t && P.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: vt,
  /** Library version */
  version: "1.0.0"
};
function Z(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : s instanceof Element ? [s] : s instanceof NodeList || Array.isArray(s) ? Array.from(s) : [];
}
export {
  We as Context,
  xt as ELEMENT_NODE,
  bt as TEXT_NODE,
  Y as WrappedRange,
  Ei as all,
  ii as ancestors,
  Li as any,
  si as children,
  Ti as chunk,
  je as clamp,
  q as closest,
  X as closestPara,
  _i as collapsedRange,
  Ve as compose,
  a as createElement,
  G as currentRange,
  wt as debounce,
  Mi as default,
  vt as defaultOptions,
  Ii as env,
  wi as first,
  Ci as flatten,
  tt as fromNativeRange,
  Bi as groupBy,
  qe as identity,
  xi as initial,
  hi as insertAfter,
  ti as isAnchor,
  Bt as isEditable,
  M as isElement,
  di as isEmpty,
  Xe as isFunction,
  ei as isImage,
  Qe as isInline,
  fi as isInsideEditable,
  j as isKey,
  Tt as isLi,
  Ze as isList,
  R as isModifier,
  Ye as isNil,
  kt as isPara,
  U as isPlainObject,
  gi as isSelectionInside,
  Ke as isString,
  Je as isTable,
  Q as isText,
  Ct as isVoid,
  V as key,
  vi as last,
  J as mergeDeep,
  oi as nextElement,
  ci as nodeValue,
  h as on,
  pi as outerHtml,
  ui as placeCaret,
  ni as prevElement,
  mi as rangeFromElement,
  Ge as rect2bnd,
  li as remove,
  yi as splitText,
  bi as tail,
  Ue as throttle,
  ki as unique,
  ri as unwrap,
  K as withSavedRange,
  ai as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
