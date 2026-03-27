function Re(s, t, e) {
  return Math.min(Math.max(s, t), e);
}
function yt(s, t) {
  let e;
  return function(...i) {
    clearTimeout(e), e = setTimeout(() => s.apply(this, i), t);
  };
}
function ze(s, t) {
  let e = 0;
  return function(...i) {
    const n = Date.now();
    if (n - e >= t)
      return e = n, s.apply(this, i);
  };
}
function Ne(...s) {
  return (t) => s.reduceRight((e, i) => i(e), t);
}
function Pe(s) {
  return s;
}
function Oe(s) {
  return s == null;
}
function $e(s) {
  return typeof s == "string";
}
function je(s) {
  return typeof s == "function";
}
function G(s, t) {
  const e = Object.assign({}, s);
  if (W(s) && W(t))
    for (const i of Object.keys(t))
      W(t[i]) && i in s ? e[i] = G(s[i], t[i]) : e[i] = t[i];
  return e;
}
function W(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function De(s) {
  return s ? {
    top: Math.round(s.top),
    left: Math.round(s.left),
    width: Math.round(s.width),
    height: Math.round(s.height),
    bottom: Math.round(s.bottom),
    right: Math.round(s.right)
  } : null;
}
const _t = 1, vt = 3, E = (s) => s && s.nodeType === _t, Z = (s) => s && s.nodeType === vt, xt = (s) => E(s) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(s.nodeName), wt = (s) => E(s) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(s.nodeName), bt = (s) => E(s) && /^(li)$/i.test(s.nodeName), We = (s) => E(s) && /^(ul|ol)$/i.test(s.nodeName), Fe = (s) => E(s) && s.nodeName.toUpperCase() === "TABLE", Ue = (s) => E(s) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(s.nodeName), kt = (s) => E(s) && s.isContentEditable, Ve = (s) => E(s) && s.nodeName.toUpperCase() === "A", qe = (s) => E(s) && s.nodeName.toUpperCase() === "IMG";
function U(s, t, e) {
  let i = s;
  for (; i && i !== e; ) {
    if (t(i)) return i;
    i = i.parentNode;
  }
  return null;
}
function Y(s, t) {
  return U(s, wt, t);
}
function Ye(s, t) {
  const e = [];
  let i = s.parentNode;
  for (; i && i !== t; )
    e.push(i), i = i.parentNode;
  return e;
}
function Ke(s) {
  return Array.from(s.childNodes);
}
function Xe(s) {
  let t = s.previousSibling;
  for (; t && !E(t); )
    t = t.previousSibling;
  return t;
}
function Ge(s) {
  let t = s.nextSibling;
  for (; t && !E(t); )
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
function Ze(s) {
  s && s.parentNode && s.parentNode.removeChild(s);
}
function Je(s) {
  const t = s.parentNode;
  if (t) {
    for (; s.firstChild; )
      t.insertBefore(s.firstChild, s);
    t.removeChild(s);
  }
}
function Qe(s, t) {
  return s.parentNode.insertBefore(t, s), t.appendChild(s), t;
}
function ti(s, t) {
  t.nextSibling ? t.parentNode.insertBefore(s, t.nextSibling) : t.parentNode.appendChild(s);
}
function ei(s) {
  return Z(s) ? s.nodeValue : s.textContent || "";
}
function ii(s) {
  return Z(s) ? !s.nodeValue : xt(s) ? !1 : !s.textContent.trim() && !s.querySelector("img, video, hr, table");
}
function si(s) {
  return s.outerHTML;
}
function ni(s) {
  const t = document.createRange();
  t.selectNodeContents(s), t.collapse(!1);
  const e = window.getSelection();
  e && (e.removeAllRanges(), e.addRange(t));
}
function oi(s) {
  return !!U(s, kt);
}
function h(s, t, e, i) {
  return s.addEventListener(t, e, i), () => s.removeEventListener(t, e, i);
}
class V {
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
    return E(e) ? e : e.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return U(this.sc, (e) => E(e) && e !== t, t);
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
function J(s) {
  return new V(
    s.startContainer,
    s.startOffset,
    s.endContainer,
    s.endOffset
  );
}
function K(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const e = t.getRangeAt(0);
  return s && !s.contains(e.commonAncestorContainer) ? null : J(e);
}
function ri(s) {
  return new V(s, 0, s, s.childNodes.length);
}
function li(s, t = 0) {
  return new V(s, t, s, t);
}
function ai(s) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : s.contains(t.getRangeAt(0).commonAncestorContainer);
}
function q(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    s(null);
    return;
  }
  const e = t.getRangeAt(0).cloneRange();
  s(J(e)), t.removeAllRanges(), t.addRange(e);
}
function hi(s, t) {
  const e = s.splitText(t);
  return [s, e];
}
function f(s, t = null) {
  return document.execCommand(s, !1, t);
}
const Q = () => f("bold"), tt = () => f("italic"), et = () => f("underline"), it = () => f("strikeThrough"), st = () => f("superscript"), nt = () => f("subscript"), ot = (s) => f("foreColor", s), rt = (s) => f("hiliteColor", s), lt = (s) => f("fontName", s);
function Ct(s) {
  f("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const e = document.createElement("span");
    for (e.style.fontSize = s, t.parentNode.insertBefore(e, t); t.firstChild; ) e.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const Tt = (s) => f("formatBlock", `<${s}>`), at = () => f("justifyLeft"), ht = () => f("justifyCenter"), ct = () => f("justifyRight"), dt = () => f("justifyFull"), ut = () => f("indent"), pt = () => f("outdent"), ft = () => f("insertUnorderedList"), mt = () => f("insertOrderedList");
function Et(s, t) {
  const e = document.createElement("table");
  e.style.borderCollapse = "collapse", e.style.width = "100%";
  const i = document.createElement("tbody");
  for (let n = 0; n < s; n++) {
    const o = document.createElement("tr");
    for (let r = 0; r < t; r++) {
      const l = document.createElement("td");
      l.style.border = "1px solid #dee2e6", l.style.padding = "6px 12px", l.style.minWidth = "40px", l.innerHTML = "&#8203;", o.appendChild(l);
    }
    i.appendChild(o);
  }
  e.appendChild(i), f("insertHTML", e.outerHTML);
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
  const o = /* @__PURE__ */ new Set(), r = document.createNodeIterator(e.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
  let l;
  for (; l = r.nextNode(); )
    if (e.intersectsNode(l)) {
      const c = n(l);
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
function k(s, t, e, i, n) {
  return { name: s, icon: t, tooltip: e, action: i, isActive: n };
}
const Lt = k("bold", "bold", "Bold (Ctrl+B)", () => Q(), () => document.queryCommandState("bold")), Bt = k("italic", "italic", "Italic (Ctrl+I)", () => tt(), () => document.queryCommandState("italic")), Mt = k("underline", "underline", "Underline (Ctrl+U)", () => et(), () => document.queryCommandState("underline")), At = k("strikethrough", "strikethrough", "Strikethrough", () => it(), () => document.queryCommandState("strikeThrough")), Ht = k("superscript", "superscript", "Superscript", () => st(), () => document.queryCommandState("superscript")), St = k("subscript", "subscript", "Subscript", () => nt(), () => document.queryCommandState("subscript")), Rt = k("alignLeft", "align-left", "Align Left", () => at()), zt = k("alignCenter", "align-center", "Align Center", () => ht()), Nt = k("alignRight", "align-right", "Align Right", () => ct()), Pt = k("alignJustify", "align-justify", "Justify", () => dt()), Ot = k("ul", "list-ul", "Unordered List", () => ft()), $t = k("ol", "list-ol", "Ordered List", () => mt()), jt = k("indent", "indent", "Indent", () => ut()), Dt = k("outdent", "outdent", "Outdent", () => pt()), Wt = k("undo", "undo", "Undo (Ctrl+Z)", (s) => s.invoke("editor.undo")), Ft = k("redo", "redo", "Redo (Ctrl+Y)", (s) => s.invoke("editor.redo")), Ut = k("hr", "minus", "Horizontal Rule", () => f("insertHorizontalRule")), Vt = k("link", "link", "Insert Link", (s) => s.invoke("linkDialog.show")), qt = k("image", "image", "Insert Image", (s) => s.invoke("imageDialog.show")), Yt = k("video", "video", "Insert Video", (s) => s.invoke("videoDialog.show")), Kt = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (s, t, e) => {
    Et(t, e), s.invoke("editor.afterCommand");
  }
}, Xt = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (s, t) => lt(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, Gt = {
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
}, Zt = k("codeview", "code", "HTML Code View", (s) => s.invoke("codeview.toggle"), (s) => s.invoke("codeview.isActive")), Jt = k("fullscreen", "expand", "Fullscreen", (s) => s.invoke("fullscreen.toggle"), (s) => s.invoke("fullscreen.isActive")), Qt = {
  name: "foreColor",
  type: "colorpicker",
  icon: "foreColor",
  tooltip: "Text Color",
  defaultColor: "#e11d48",
  action: (s, t) => ot(t)
}, te = {
  name: "backColor",
  type: "colorpicker",
  icon: "backColor",
  tooltip: "Highlight Color",
  defaultColor: "#fbbf24",
  action: (s, t) => rt(t)
}, ee = [
  [Xt, Gt],
  [Wt, Ft],
  [Lt, Bt, Mt, At],
  [Ht, St],
  [Qt, te],
  [Rt, zt, Nt, Pt],
  [Ot, $t, jt, Dt],
  [Ut, Vt, qt, Yt, Kt],
  [Zt, Jt]
], gt = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: ee,
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
function ie(s, t) {
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
const se = 100;
class ne {
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
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1)), this.stack.push({ html: this._serialize() }), this.stack.length > se ? this.stack.shift() : this.stackOffset++;
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
function oe(s, t) {
  const e = a("table", { class: "asn-table" }), i = a("tbody");
  e.appendChild(i);
  for (let n = 0; n < t; n++) {
    const o = a("tr");
    for (let r = 0; r < s; r++) {
      const l = a("td", {}, [" "]);
      o.appendChild(l);
    }
    i.appendChild(o);
  }
  return e;
}
function re(s, t) {
  const e = oe(s, t);
  f("insertHTML", e.outerHTML);
}
const F = {
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
function O(s, t) {
  return s.key === t || s.key === t.toUpperCase();
}
function B(s, t) {
  return (s.ctrlKey || s.metaKey) && O(s, t);
}
function le(s, t, e = {}) {
  if (O(s, F.TAB)) {
    const i = K(t);
    if (!i) return !1;
    const n = Y(i.sc, t);
    if (n && bt(n))
      return s.preventDefault(), s.shiftKey ? f("outdent") : f("indent"), !0;
    if (n && n.nodeName.toUpperCase() === "PRE")
      return s.preventDefault(), f("insertText", "    "), !0;
    if (e.tabSize)
      return s.preventDefault(), f("insertText", " ".repeat(e.tabSize)), !0;
  }
  if (O(s, F.ENTER) && !s.shiftKey) {
    const i = K(t);
    if (!i) return !1;
    const n = Y(i.sc, t);
    if (n && n.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const o = i.toNativeRange();
      if (o.setStart(n, n.childNodes.length), o.toString() === "" && i.isCollapsed())
        return s.preventDefault(), f("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class ae {
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
    return this._history = new ne(t), this._bindEvents(t), this;
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
    if (!le(t, e, this.options)) {
      if (B(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (B(t, "z") && t.shiftKey || B(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (B(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (B(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (B(t, "u")) {
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
    Q(), this.afterCommand();
  }
  italic() {
    tt(), this.afterCommand();
  }
  underline() {
    et(), this.afterCommand();
  }
  strikethrough() {
    it(), this.afterCommand();
  }
  superscript() {
    st(), this.afterCommand();
  }
  subscript() {
    nt(), this.afterCommand();
  }
  justifyLeft() {
    at(), this.afterCommand();
  }
  justifyCenter() {
    ht(), this.afterCommand();
  }
  justifyRight() {
    ct(), this.afterCommand();
  }
  justifyFull() {
    dt(), this.afterCommand();
  }
  indent() {
    ut(), this.afterCommand();
  }
  outdent() {
    pt(), this.afterCommand();
  }
  insertUL() {
    ft(), this.afterCommand();
  }
  insertOL() {
    mt(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(t) {
    Tt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(t) {
    ot(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(t) {
    rt(t), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(t) {
    lt(t), this.afterCommand();
  }
  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(t) {
    Ct(t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    f("insertHorizontalRule"), this.afterCommand();
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
      f("insertHTML", `<a href="${o}"${i ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e || o}</a>`);
    else if (f("createLink", o), i) {
      const l = this._getClosestAnchor();
      l && (l.setAttribute("target", "_blank"), l.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    f("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, e = "") {
    const i = this._sanitiseUrl(t);
    i && (f("insertHTML", `<img src="${i}" alt="${e}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a video embed (iframe or <video> element).
   * The html string is already validated/built by VideoDialog.
   * @param {string} html
   */
  insertVideo(t) {
    t && (f("insertHTML", t), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, e) {
    re(t, e), this.afterCommand();
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
class he {
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
    const n = a("div", { class: "asn-table-picker-wrap" }), r = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", l = a("button", {
      type: "button",
      class: r,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((C) => C.href).join(" ")))) {
      const C = this.options.fontAwesomeClass || "fas";
      l.innerHTML = `<i class="${C} fa-table" aria-hidden="true"></i>`;
    } else {
      const C = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      l.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${C} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const d = a("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), p = a("div", { class: "asn-table-grid" }), y = a("div", { class: "asn-table-label" });
    y.textContent = "Insert Table";
    const g = [];
    for (let C = 1; C <= 10; C++)
      for (let T = 1; T <= 10; T++) {
        const I = a("div", {
          class: "asn-table-cell",
          "data-row": String(C),
          "data-col": String(T)
        });
        g.push(I), p.appendChild(I);
      }
    d.appendChild(p), d.appendChild(y);
    let v = !1;
    const _ = (C, T) => {
      g.forEach((I) => {
        const R = +I.getAttribute("data-row"), b = +I.getAttribute("data-col");
        I.classList.toggle("active", R <= C && b <= T);
      }), y.textContent = C && T ? `${C} × ${T}` : "Insert Table";
    }, m = () => {
      v = !0, d.style.display = "block", l.setAttribute("aria-expanded", "true");
    }, x = () => {
      v = !1, d.style.display = "none", l.setAttribute("aria-expanded", "false"), _(0, 0);
    }, $ = h(l, "click", (C) => {
      C.stopPropagation(), v ? x() : m();
    }), S = h(p, "mouseover", (C) => {
      const T = C.target.closest(".asn-table-cell");
      T && _(+T.getAttribute("data-row"), +T.getAttribute("data-col"));
    }), N = h(p, "mouseleave", () => _(0, 0)), j = h(p, "click", (C) => {
      const T = C.target.closest(".asn-table-cell");
      if (!T) return;
      const I = +T.getAttribute("data-row"), R = +T.getAttribute("data-col");
      x(), this.context.invoke("editor.focus"), t.action(this.context, I, R);
    }), D = h(document, "click", () => {
      v && x();
    });
    return this._disposers.push($, S, N, j, D), n.appendChild(l), n.appendChild(d), n;
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
    const n = a("div", { class: "asn-color-picker-wrap" }), r = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", l = a("button", {
      type: "button",
      class: `${r} asn-color-btn`,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), c = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', u = t.name === "foreColor" ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${c} style="display:block"><path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${c} style="display:block"><path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/></svg>`;
    l.innerHTML = u;
    const d = a("span", { class: "asn-color-strip" });
    d.style.background = i, l.appendChild(d);
    const p = a("button", {
      type: "button",
      class: `${r} asn-color-arrow`,
      title: `Choose ${t.name === "foreColor" ? "text" : "highlight"} color`,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    p.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:block"><path d="M7 10l5 5 5-5H7z"/></svg>';
    const y = a("div", { class: "asn-color-popup" });
    y.style.display = "none";
    const g = a("div", { class: "asn-color-swatches" });
    e.forEach((b) => {
      const z = a("div", { class: "asn-color-swatch", title: b, "data-color": b });
      z.style.background = b, g.appendChild(z);
    });
    const v = a("div", { class: "asn-color-custom" }), _ = a("input", { type: "color", value: i, title: "Custom color" }), m = a("span", {}, ["Custom color"]);
    v.appendChild(_), v.appendChild(m), y.appendChild(g), y.appendChild(v);
    let x = !1;
    const $ = () => {
      x = !0, y.style.display = "block", p.setAttribute("aria-expanded", "true");
    }, S = () => {
      x = !1, y.style.display = "none", p.setAttribute("aria-expanded", "false");
    }, N = (b) => {
      i = b, d.style.background = b, _.value = b, this.context.invoke("editor.focus"), t.action(this.context, b), this.context.invoke("editor.afterCommand"), S();
    }, j = h(l, "click", (b) => {
      b.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context, i), this.context.invoke("editor.afterCommand");
    }), D = h(p, "click", (b) => {
      b.stopPropagation(), x ? S() : $();
    }), C = h(g, "click", (b) => {
      const z = b.target.closest(".asn-color-swatch");
      z && N(z.dataset.color);
    }), T = h(_, "change", (b) => {
      N(b.target.value);
    }), I = h(document, "click", (b) => {
      x && !n.contains(b.target) && S();
    }), R = h(y, "click", (b) => b.stopPropagation());
    return this._disposers.push(j, D, C, T, I, R), n.appendChild(l), n.appendChild(p), n.appendChild(y), n;
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
    }), o = t.placeholder || "Font", r = a("option", { value: "" }, [o]);
    n.appendChild(r), e.forEach((c) => {
      const u = a("option", { value: c }, [c]);
      t.name === "fontFamily" && (u.style.fontFamily = c), n.appendChild(u);
    });
    const l = h(n, "change", (c) => {
      const u = c.target.value;
      u && (this.context.invoke("editor.focus"), t.action(this.context, u), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(l), n;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const i = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", n = t.className ? ` ${t.className}` : "", o = `${i}${n}`, r = a("button", {
      type: "button",
      class: o,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), l = !!this.options.useFontAwesome, c = () => {
      if (!l) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const m = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((x) => x.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(m);
    }, u = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', d = (m) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${u} style="display:block">${m}</svg>`, p = /* @__PURE__ */ new Map([
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
    ]), y = this.options.fontAwesomeClass || "fas", g = /* @__PURE__ */ new Map([
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
      const m = g.get(t.icon) || g.get(t.name) || null;
      m ? r.innerHTML = `<i class="${y} ${m}" aria-hidden="true"></i>` : p.has(t.icon) ? r.innerHTML = p.get(t.icon) : r.textContent = t.icon || t.name;
    } else
      p.has(t.icon) ? r.innerHTML = p.get(t.icon) : p.has(t.name) ? r.innerHTML = p.get(t.name) : r.textContent = t.icon || t.name;
    const _ = h(r, "click", (m) => {
      m.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(_), r;
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
        (l) => l.value && l.value.toLowerCase() === o.toLowerCase()
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
class ce {
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
    }, r = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r);
    }, c = h(t, "mousedown", (u) => {
      e = u.clientY, i = n.offsetHeight, document.addEventListener("mousemove", o), document.addEventListener("mouseup", r), u.preventDefault();
    });
    this._disposers.push(c);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, e = yt(() => this.update(), 200), i = h(t, "input", e);
    this._disposers.push(i);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const e = this.context.layoutInfo.editable.innerText || "", i = e.trim() ? e.trim().split(/\s+/).length : 0, n = e.length;
    this._wordCountEl.textContent = `Words: ${i}`, this._charCountEl.textContent = `Chars: ${n}`;
  }
}
class de {
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
      i = this._sanitiseHTML(n), f("insertHTML", i);
    } else {
      i = e.getData("text/plain");
      const n = i.split(/\r?\n/).map((o) => `<p>${this._escapeHTML(o) || "<br>"}</p>`).join("");
      f("insertHTML", n);
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
        const l = o.getAttribute(r);
        l && /^\s*javascript:/i.test(l) && o.removeAttribute(r);
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
class ue {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = this.options.placeholder || "";
    e && (t.dataset.placeholder = e);
    const i = () => this._update(), n = h(t, "input", i), o = h(t, "focus", i), r = h(t, "blur", i);
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
class pe {
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
class fe {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = h(document, "keydown", (e) => {
      this._active && O(e, F.ESCAPE) && this.deactivate();
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
class me {
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
    q((t) => {
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
    const r = a("label", { class: "asn-label" });
    r.textContent = "Display Text";
    const l = a("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Link text",
      id: "asn-link-text",
      name: "linkText",
      autocomplete: "off"
    });
    this._textInput = l;
    const c = a("label", { class: "asn-label asn-label-inline" }), u = a("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = u, c.appendChild(u), c.appendChild(document.createTextNode(" Open in new tab"));
    const d = a("div", { class: "asn-dialog-actions" }), p = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    p.textContent = "Insert";
    const y = a("button", { type: "button", class: "asn-btn" });
    y.textContent = "Cancel", d.appendChild(p), d.appendChild(y), e.append(i, n, o, r, l, c, d), t.appendChild(e);
    const g = h(p, "click", () => this._onInsert()), v = h(y, "click", () => this._close()), _ = h(t, "click", (m) => {
      m.target === t && this._close();
    });
    return this._disposers.push(g, v, _), t;
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
class ge {
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
    q((t) => {
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
    const r = a("label", { class: "asn-label" });
    r.textContent = "Alt Text";
    const l = a("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Describe the image",
      autocomplete: "off"
    });
    if (this._altInput = l, this.options.allowImageUpload !== !1) {
      const v = a("label", { class: "asn-label" });
      v.textContent = "Or upload a file";
      const _ = a("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = _;
      const m = h(_, "change", () => this._onFileChange());
      this._disposers.push(m), e.append(v, _);
    }
    const c = a("div", { class: "asn-dialog-actions" }), u = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    u.textContent = "Insert";
    const d = a("button", { type: "button", class: "asn-btn" });
    d.textContent = "Cancel", c.appendChild(u), c.appendChild(d), e.append(i, n, o, r, l, c), t.appendChild(e);
    const p = h(u, "click", () => this._onInsert()), y = h(d, "click", () => this._close()), g = h(t, "click", (v) => {
      v.target === t && this._close();
    });
    return this._disposers.push(p, y, g), t;
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
class ye {
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
    q((t) => {
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
    const r = a("p", { class: "asn-dialog-hint" });
    this._hintEl = r;
    const l = a("label", { class: "asn-label" });
    l.textContent = "Width (px)";
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
    p.textContent = "Cancel", u.appendChild(d), u.appendChild(p), e.append(i, n, o, r, l, c, u), t.appendChild(e);
    const y = h(o, "input", () => {
      const x = this._parseVideoUrl(o.value.trim());
      r.textContent = x ? `Detected: ${x.type}` : o.value ? "Unknown format — will try direct video embed" : "";
    }), g = h(d, "click", () => this._onInsert()), v = h(p, "click", () => this._close()), _ = h(t, "click", (x) => {
      x.target === t && this._close();
    }), m = h(o, "keydown", (x) => {
      x.key === "Enter" && (x.preventDefault(), this._onInsert());
    });
    return this._disposers.push(y, g, v, _, m), t;
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
const _e = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class ve {
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
    return t.className = "asn-image-resizer", t.style.display = "none", _e.forEach(({ pos: e }) => {
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
    const n = t.clientX, o = t.clientY, r = i.offsetWidth || i.naturalWidth || 100, l = i.offsetHeight || i.naturalHeight || 100, c = r / l, u = e.length === 2, d = (y) => {
      const g = y.clientX - n, v = y.clientY - o;
      let _ = r, m = l;
      e.includes("e") && (_ = Math.max(20, r + g)), e.includes("w") && (_ = Math.max(20, r - g)), e.includes("s") && (m = Math.max(20, l + v)), e.includes("n") && (m = Math.max(20, l - v)), u && (Math.abs(g) >= Math.abs(v) ? m = Math.max(20, Math.round(_ / c)) : _ = Math.max(20, Math.round(m * c))), i.style.width = `${_}px`, i.style.height = `${m}px`, this._updateOverlayPosition();
    }, p = () => {
      document.removeEventListener("mousemove", d), document.removeEventListener("mouseup", p), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", d), document.addEventListener("mouseup", p);
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
class we {
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
    return t.className = "asn-video-resizer", t.style.display = "none", xe.forEach(({ pos: e }) => {
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
    const n = i.querySelector("iframe, video"), o = t.clientX, r = t.clientY, l = i.offsetWidth || 560, c = i.offsetHeight || 315, u = l / c, d = e.length === 2, p = (g) => {
      const v = g.clientX - o, _ = g.clientY - r;
      let m = l, x = c;
      e.includes("e") && (m = Math.max(80, l + v)), e.includes("w") && (m = Math.max(80, l - v)), e.includes("s") && (x = Math.max(45, c + _)), e.includes("n") && (x = Math.max(45, c - _)), d && (Math.abs(v) >= Math.abs(_) ? x = Math.max(45, Math.round(m / u)) : m = Math.max(80, Math.round(x * u))), i.style.width = `${m}px`, i.style.height = `${x}px`, n && (n.width = m, n.height = x, n.style.width = `${m}px`, n.style.height = `${x}px`), this._updateOverlayPosition();
    }, y = () => {
      document.removeEventListener("mousemove", p), document.removeEventListener("mouseup", y), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", p), document.addEventListener("mouseup", y);
  }
}
const P = {
  open: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  unlink: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
}, be = 120, ke = 200;
class Ce {
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
    return t.style.display = "none", this._urlLabel = a("span", { class: "asn-link-tooltip-url" }), t.appendChild(this._urlLabel), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._openBtn = this._makeBtn(P.open, "Open link", () => this._openLink()), this._copyBtn = this._makeBtn(P.copy, "Copy URL", () => this._copyLink()), this._editBtn = this._makeBtn(P.edit, "Edit link", () => this._editLink()), this._unlinkBtn = this._makeBtn(P.unlink, "Remove link", () => this._unlink()), t.appendChild(this._openBtn), t.appendChild(this._copyBtn), t.appendChild(this._editBtn), t.appendChild(this._unlinkBtn), this._disposers.push(
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
    }, be));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => {
      this._hide();
    }, ke));
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
    let r = e.bottom + o, l = e.left;
    r + n > window.innerHeight - o && (r = e.top - n - o), l + i > window.innerWidth - o && (l = window.innerWidth - i - o), l < o && (l = o), this._el.style.top = `${r}px`, this._el.style.left = `${l}px`;
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
const M = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteImg: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Te = 100, Ee = 180;
class Ie {
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
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Image", t.appendChild(this._label), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(M.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(M.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(M.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(M.floatRight, "Float Right", () => this._setFloat("right")), t.appendChild(this._floatLeftBtn), t.appendChild(this._floatNoneBtn), t.appendChild(this._alignCenterBtn), t.appendChild(this._floatRightBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(M.originalSize, "Original Size", () => this._resetSize()), t.appendChild(this._originalBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(M.deleteImg, "Delete Image", () => this._delete(), !0), t.appendChild(this._deleteBtn), this._disposers.push(
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
    return o.innerHTML = t, this._disposers.push(h(o, "click", (r) => {
      r.preventDefault(), r.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeImg === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeImg = t, this._show(t);
    }, Te));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Ee));
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
    let r = e.bottom + o, l = e.left + (e.width - i) / 2;
    r + n > window.innerHeight - o && (r = e.top - n - o), l + i > window.innerWidth - o && (l = window.innerWidth - i - o), l < o && (l = o), this._el.style.top = `${r}px`, this._el.style.left = `${l}px`;
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
const A = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteVideo: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Le = 100, Be = 180;
class Me {
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
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Video", t.appendChild(this._label), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(A.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(A.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(A.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(A.floatRight, "Float Right", () => this._setFloat("right")), t.appendChild(this._floatLeftBtn), t.appendChild(this._floatNoneBtn), t.appendChild(this._alignCenterBtn), t.appendChild(this._floatRightBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(A.originalSize, "Original Size", () => this._resetSize()), t.appendChild(this._originalBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(A.deleteVideo, "Delete Video", () => this._delete(), !0), t.appendChild(this._deleteBtn), this._disposers.push(
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
    return o.innerHTML = t, this._disposers.push(h(o, "click", (r) => {
      r.preventDefault(), r.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeWrapper === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeWrapper = t, this._show(t);
    }, Le));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Be));
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
    let r = e.bottom + o, l = e.left + (e.width - i) / 2;
    r + n > window.innerHeight - o && (r = e.top - n - o), l + i > window.innerWidth - o && (l = window.innerWidth - i - o), l < o && (l = o), this._el.style.top = `${r}px`, this._el.style.left = `${l}px`;
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
const w = {
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
  back: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
}, Ae = [
  { name: "undo", label: "Undo", icon: w.undo, action: (s) => s.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: w.redo, action: (s) => s.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: w.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: w.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: w.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: w.bold, action: (s) => s.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: w.italic, action: (s) => s.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: w.underline, action: (s) => s.invoke("editor.underline") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: w.link, action: (s) => s.invoke("linkDialog.show") },
  { name: "image", label: "Insert Image", icon: w.image, action: (s) => s.invoke("imageDialog.show") },
  { name: "video", label: "Insert Video", icon: w.video, action: (s) => s.invoke("videoDialog.show") }
];
class He {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || Ae, this.el = null, this._disposers = [], this._menuDisposers = [], this._targetCell = null, this._sizePopover = null, this._lastX = 0, this._lastY = 0;
  }
  initialize() {
    this.el = a("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover), this._renderItems(this._items);
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
        this.el.appendChild(a("div", { class: "asn-context-sep" }));
        return;
      }
      if (e.back) {
        const o = a("button", { type: "button", class: "asn-context-back" }), r = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
        r.innerHTML = w.back, o.appendChild(r), o.appendChild(a("span", { class: "asn-context-label" }, [e.label || "Back"]));
        const l = h(o, "click", (c) => {
          c.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(l), this.el.appendChild(o);
        return;
      }
      if (e.navigate) {
        const o = a("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": e.name || "" });
        if (e.icon) {
          const c = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
          c.innerHTML = e.icon, o.appendChild(c);
        }
        o.appendChild(a("span", { class: "asn-context-label" }, [e.label || e.name]));
        const r = a("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        r.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', o.appendChild(r);
        const l = h(o, "click", (c) => {
          c.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(l), this.el.appendChild(o);
        return;
      }
      const i = a("button", { type: "button", class: "asn-context-item", "data-name": e.name || "" });
      if (e.icon) {
        const o = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
        o.innerHTML = e.icon, i.appendChild(o);
      }
      i.appendChild(a("span", { class: "asn-context-label" }, [e.label || e.name]));
      const n = h(i, "click", (o) => {
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
    t.preventDefault(), this._lastX = t.clientX, this._lastY = t.clientY, !t.target.closest("img") && t.target.closest(".asn-video-wrapper");
    const n = t.target.closest("td, th");
    this._targetCell = n || null;
    const o = n ? this._buildCombinedItems(n) : this._items;
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
    const i = t !== void 0 ? t : this._lastX, n = e !== void 0 ? e : this._lastY, o = this.el.getBoundingClientRect();
    let r = i, l = n;
    r + o.width > window.innerWidth && (r = window.innerWidth - o.width - 8), l + o.height > window.innerHeight && (l = window.innerHeight - o.height - 8), this.el.style.left = `${r}px`, this.el.style.top = `${l}px`;
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
        icon: w.table,
        navigate: () => this._buildTableSubItems(t)
      }
    ];
  }
  /** Table sub-menu with ← Back at the top. */
  _buildTableSubItems(t) {
    return [
      { back: !0, label: "Table Format", navigate: () => this._buildCombinedItems(t) },
      { separator: !0 },
      { name: "addRowAbove", label: "Add Row Above", icon: w.rowAbove, action: () => this._addRow(t, "above") },
      { name: "addRowBelow", label: "Add Row Below", icon: w.rowBelow, action: () => this._addRow(t, "below") },
      { separator: !0 },
      { name: "addColLeft", label: "Add Column Left", icon: w.colLeft, action: () => this._addColumn(t, "left") },
      { name: "addColRight", label: "Add Column Right", icon: w.colRight, action: () => this._addColumn(t, "right") },
      { separator: !0 },
      { name: "deleteRow", label: "Delete Row", icon: w.deleteRow, action: () => this._deleteRow(t) },
      { name: "deleteCol", label: "Delete Column", icon: w.deleteCol, action: () => this._deleteColumn(t) },
      { separator: !0 },
      { name: "mergeCells", label: "Merge Cells", icon: w.mergeCells, action: () => this._mergeCells(t) },
      { separator: !0 },
      { name: "colWidth", label: "Column Width…", icon: w.colWidth, action: () => this._openSizePopover("col", t) },
      { name: "rowHeight", label: "Row Height…", icon: w.rowHeight, action: () => this._openSizePopover("row", t) },
      { separator: !0 },
      { name: "deleteTable", label: "Delete Table", icon: w.deleteTable, action: () => this._deleteTable(t) }
    ];
  }
  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------
  _addRow(t, e) {
    const i = t.closest("tr");
    if (!i) return;
    const n = Array.from(i.cells).reduce((r, l) => r + (l.colSpan || 1), 0), o = document.createElement("tr");
    for (let r = 0; r < n; r++) {
      const l = document.createElement("td");
      l.style.border = "1px solid #dee2e6", l.style.padding = "6px 12px", l.innerHTML = "&#8203;", o.appendChild(l);
    }
    e === "above" ? i.parentElement.insertBefore(o, i) : i.insertAdjacentElement("afterend", o), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t, e) {
    const i = t.closest("tr"), n = t.closest("table");
    if (!i || !n) return;
    const o = Array.from(i.cells).indexOf(t);
    Array.from(n.querySelectorAll("tr")).forEach((r) => {
      const l = Array.from(r.cells), c = document.createElement("td");
      c.style.border = "1px solid #dee2e6", c.style.padding = "6px 12px", c.innerHTML = "&#8203;";
      const u = e === "left" ? l[o] : l[o + 1] || null;
      r.insertBefore(c, u);
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
    const n = i.getRangeAt(0), o = Array.from(e.cells).filter((l) => {
      try {
        return n.intersectsNode(l);
      } catch {
        return !1;
      }
    });
    if (o.length < 2) return;
    const r = o[0];
    r.colSpan = o.reduce((l, c) => l + (c.colSpan || 1), 0), r.innerHTML = o.map((l) => l.innerHTML).join(""), o.slice(1).forEach((l) => e.removeChild(l)), this.context.invoke("editor.afterCommand");
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
    const r = a("div", { class: "asn-size-popover-actions" }), l = a("button", { type: "button", class: "asn-btn" });
    l.textContent = "Cancel";
    const c = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    c.textContent = "Apply", r.appendChild(l), r.appendChild(c), t.appendChild(e), t.appendChild(i), t.appendChild(r), this._sizeTitleEl = e, this._sizeInputEl = n, this._sizeApply = null;
    const u = h(c, "click", () => {
      const g = parseInt(this._sizeInputEl.value, 10);
      g > 0 && typeof this._sizeApply == "function" && this._sizeApply(g), this._hideSizePopover();
    }), d = h(l, "click", () => this._hideSizePopover()), p = h(n, "keydown", (g) => {
      g.key === "Enter" && (g.preventDefault(), c.click()), g.key === "Escape" && this._hideSizePopover();
    }), y = h(document, "click", (g) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(g.target) && this._hideSizePopover();
    });
    return this._disposers.push(u, d, p, y), t;
  }
  _openSizePopover(t, e) {
    if (!this._sizePopover) return;
    const i = t === "col";
    this._sizeTitleEl.textContent = i ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = i ? e.offsetWidth || 120 : e.closest("tr") && e.closest("tr").offsetHeight || 40, this._sizeApply = (n) => {
      if (i) {
        const o = e.closest("table"), r = Array.from(e.closest("tr").cells).indexOf(e);
        Array.from(o.querySelectorAll("tr")).forEach((l) => {
          const c = l.cells[r];
          c && (c.style.width = `${n}px`, c.style.minWidth = `${n}px`);
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
      let r = this._lastX, l = this._lastY;
      r + n > window.innerWidth && (r = window.innerWidth - n - 8), l + o > window.innerHeight && (l = window.innerHeight - o - 8), this._sizePopover.style.left = `${r}px`, this._sizePopover.style.top = `${l}px`, this._sizeInputEl && (this._sizeInputEl.focus(), this._sizeInputEl.select());
    });
  }
  _hideSizePopover() {
    this._sizePopover && (this._sizePopover.style.display = "none"), this._sizeApply = null;
  }
}
class Se {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, e = {}) {
    this.targetEl = t, this.options = G(gt, e), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: e } = ie(this.targetEl, this.options);
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
    t("editor", ae), t("toolbar", he), t("statusbar", ce), t("clipboard", de), t("contextMenu", He), t("placeholder", ue), t("codeview", pe), t("fullscreen", fe), t("linkDialog", me), t("imageDialog", ge), t("videoDialog", ye), t("imageResizer", ve), t("videoResizer", we), t("linkTooltip", Ce), t("imageTooltip", Ie), t("videoTooltip", Me);
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
function ci(s) {
  return s[s.length - 1];
}
function di(s) {
  return s[0];
}
function ui(s, t = 1) {
  return s.slice(0, s.length - t);
}
function pi(s, t = 1) {
  return s.slice(t);
}
function fi(s) {
  return s.reduce((t, e) => t.concat(e), []);
}
function mi(s) {
  return [...new Set(s)];
}
function gi(s, t) {
  const e = [];
  for (let i = 0; i < s.length; i += t)
    e.push(s.slice(i, i + t));
  return e;
}
function yi(s, t) {
  return s.reduce((e, i) => {
    const n = t(i);
    return e[n] || (e[n] = []), e[n].push(i), e;
  }, {});
}
function _i(s, t) {
  return s.every(t);
}
function vi(s, t) {
  return s.some(t);
}
const L = navigator.userAgent, xi = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(L),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(L),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(L),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(L),
  /** True if running on macOS */
  isMac: /Macintosh/.test(L),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(L),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(L) ? "metaKey" : "ctrlKey"
}, H = /* @__PURE__ */ new WeakMap(), wi = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(s, t = {}) {
    const i = X(s).map((n) => {
      if (H.has(n)) return H.get(n);
      const o = new Se(n, t);
      return o.initialize(), H.set(n, o), o;
    });
    return i.length === 1 ? i[0] : i;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(s) {
    X(s).forEach((t) => {
      const e = H.get(t);
      e && (e.destroy(), H.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(s) {
    const t = typeof s == "string" ? document.querySelector(s) : s;
    return t && H.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: gt,
  /** Library version */
  version: "1.0.0"
};
function X(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : s instanceof Element ? [s] : s instanceof NodeList || Array.isArray(s) ? Array.from(s) : [];
}
export {
  Se as Context,
  _t as ELEMENT_NODE,
  vt as TEXT_NODE,
  V as WrappedRange,
  _i as all,
  Ye as ancestors,
  vi as any,
  Ke as children,
  gi as chunk,
  Re as clamp,
  U as closest,
  Y as closestPara,
  li as collapsedRange,
  Ne as compose,
  a as createElement,
  K as currentRange,
  yt as debounce,
  wi as default,
  gt as defaultOptions,
  xi as env,
  di as first,
  fi as flatten,
  J as fromNativeRange,
  yi as groupBy,
  Pe as identity,
  ui as initial,
  ti as insertAfter,
  Ve as isAnchor,
  kt as isEditable,
  E as isElement,
  ii as isEmpty,
  je as isFunction,
  qe as isImage,
  Ue as isInline,
  oi as isInsideEditable,
  O as isKey,
  bt as isLi,
  We as isList,
  B as isModifier,
  Oe as isNil,
  wt as isPara,
  W as isPlainObject,
  ai as isSelectionInside,
  $e as isString,
  Fe as isTable,
  Z as isText,
  xt as isVoid,
  F as key,
  ci as last,
  G as mergeDeep,
  Ge as nextElement,
  ei as nodeValue,
  h as on,
  si as outerHtml,
  ni as placeCaret,
  Xe as prevElement,
  ri as rangeFromElement,
  De as rect2bnd,
  Ze as remove,
  hi as splitText,
  pi as tail,
  ze as throttle,
  mi as unique,
  Je as unwrap,
  q as withSavedRange,
  Qe as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
