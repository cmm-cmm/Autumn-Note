function li(s, t, e) {
  return Math.min(Math.max(s, t), e);
}
function Ht(s, t) {
  let e;
  return function(...i) {
    clearTimeout(e), e = setTimeout(() => s.apply(this, i), t);
  };
}
function ai(s, t) {
  let e = 0;
  return function(...i) {
    const o = Date.now();
    if (o - e >= t)
      return e = o, s.apply(this, i);
  };
}
function ri(...s) {
  return (t) => s.reduceRight((e, i) => i(e), t);
}
function ci(s) {
  return s;
}
function hi(s) {
  return s == null;
}
function di(s) {
  return typeof s == "string";
}
function pi(s) {
  return typeof s == "function";
}
function st(s, t) {
  const e = Object.assign({}, s);
  if (K(s) && K(t))
    for (const i of Object.keys(t))
      K(t[i]) && i in s ? e[i] = st(s[i], t[i]) : e[i] = t[i];
  return e;
}
function K(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function ui(s) {
  return s ? {
    top: Math.round(s.top),
    left: Math.round(s.left),
    width: Math.round(s.width),
    height: Math.round(s.height),
    bottom: Math.round(s.bottom),
    right: Math.round(s.right)
  } : null;
}
const Rt = 1, zt = 3, A = (s) => s && s.nodeType === Rt, ot = (s) => s && s.nodeType === zt, Nt = (s) => A(s) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(s.nodeName), jt = (s) => A(s) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(s.nodeName), Pt = (s) => A(s) && /^(li)$/i.test(s.nodeName), fi = (s) => A(s) && /^(ul|ol)$/i.test(s.nodeName), mi = (s) => A(s) && s.nodeName.toUpperCase() === "TABLE", gi = (s) => A(s) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(s.nodeName), $t = (s) => A(s) && s.isContentEditable, _i = (s) => A(s) && s.nodeName.toUpperCase() === "A", yi = (s) => A(s) && s.nodeName.toUpperCase() === "IMG";
function G(s, t, e) {
  let i = s;
  for (; i && i !== e; ) {
    if (t(i)) return i;
    i = i.parentNode;
  }
  return null;
}
function tt(s, t) {
  return G(s, jt, t);
}
function vi(s, t) {
  const e = [];
  let i = s.parentNode;
  for (; i && i !== t; )
    e.push(i), i = i.parentNode;
  return e;
}
function wi(s) {
  return Array.from(s.childNodes);
}
function bi(s) {
  let t = s.previousSibling;
  for (; t && !A(t); )
    t = t.previousSibling;
  return t;
}
function xi(s) {
  let t = s.nextSibling;
  for (; t && !A(t); )
    t = t.nextSibling;
  return t;
}
function a(s, t = {}, e = []) {
  const i = document.createElement(s);
  for (const [o, n] of Object.entries(t))
    i.setAttribute(o, n);
  for (const o of e)
    typeof o == "string" ? i.appendChild(document.createTextNode(o)) : i.appendChild(o);
  return i;
}
function Ci(s) {
  s && s.parentNode && s.parentNode.removeChild(s);
}
function ki(s) {
  const t = s.parentNode;
  if (t) {
    for (; s.firstChild; )
      t.insertBefore(s.firstChild, s);
    t.removeChild(s);
  }
}
function Ti(s, t) {
  return s.parentNode.insertBefore(t, s), t.appendChild(s), t;
}
function Ii(s, t) {
  t.nextSibling ? t.parentNode.insertBefore(s, t.nextSibling) : t.parentNode.appendChild(s);
}
function Ei(s) {
  return ot(s) ? s.nodeValue : s.textContent || "";
}
function Bi(s) {
  return ot(s) ? !s.nodeValue : Nt(s) ? !1 : !s.textContent.trim() && !s.querySelector("img, video, hr, table");
}
function Li(s) {
  return s.outerHTML;
}
function Si(s) {
  const t = document.createRange();
  t.selectNodeContents(s), t.collapse(!1);
  const e = window.getSelection();
  e && (e.removeAllRanges(), e.addRange(t));
}
function Mi(s) {
  return !!G(s, $t);
}
function c(s, t, e, i) {
  return s.addEventListener(t, e, i), () => s.removeEventListener(t, e, i);
}
class Q {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(t, e, i, o) {
    this.sc = t, this.so = e, this.ec = i, this.eo = o;
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
    return A(e) ? e : e.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(t) {
    return G(this.sc, (e) => A(e) && e !== t, t);
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
function nt(s) {
  return new Q(
    s.startContainer,
    s.startOffset,
    s.endContainer,
    s.endOffset
  );
}
function et(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return null;
  const e = t.getRangeAt(0);
  return s && !s.contains(e.commonAncestorContainer) ? null : nt(e);
}
function Ai(s) {
  return new Q(s, 0, s, s.childNodes.length);
}
function Hi(s, t = 0) {
  return new Q(s, t, s, t);
}
function Ri(s) {
  const t = window.getSelection();
  return !t || t.rangeCount === 0 ? !1 : s.contains(t.getRangeAt(0).commonAncestorContainer);
}
function Y(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) {
    s(null);
    return;
  }
  const e = t.getRangeAt(0).cloneRange();
  s(nt(e)), t.removeAllRanges(), t.addRange(e);
}
function zi(s, t) {
  const e = s.splitText(t);
  return [s, e];
}
function y(s, t = null) {
  return document.execCommand(s, !1, t);
}
const lt = () => y("bold"), at = () => y("italic"), rt = () => y("underline"), ct = () => y("strikeThrough"), ht = () => y("superscript"), dt = () => y("subscript"), pt = (s) => y("foreColor", s), ut = (s) => y("hiliteColor", s), ft = (s) => y("fontName", s);
function Ot(s) {
  y("fontSize", "7"), document.querySelectorAll('font[size="7"]').forEach((t) => {
    const e = document.createElement("span");
    for (e.style.fontSize = s, t.parentNode.insertBefore(e, t); t.firstChild; ) e.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const mt = (s) => y("formatBlock", `<${s}>`), gt = () => y("justifyLeft"), _t = () => y("justifyCenter"), yt = () => y("justifyRight"), vt = () => y("justifyFull"), wt = () => y("indent"), bt = () => y("outdent"), xt = () => y("insertUnorderedList"), Ct = () => y("insertOrderedList");
function Dt(s, t) {
  const e = document.createElement("table");
  e.style.borderCollapse = "collapse", e.style.width = "100%";
  const i = document.createElement("tbody");
  for (let o = 0; o < s; o++) {
    const n = document.createElement("tr");
    for (let l = 0; l < t; l++) {
      const r = document.createElement("td");
      r.style.border = "1px solid #dee2e6", r.style.padding = "6px 12px", r.style.minWidth = "40px", r.innerHTML = "&#8203;", n.appendChild(r);
    }
    i.appendChild(n);
  }
  e.appendChild(i), y("insertHTML", e.outerHTML);
}
function Ft(s) {
  const t = window.getSelection();
  if (!t || t.rangeCount === 0) return;
  const e = t.getRangeAt(0), i = /* @__PURE__ */ new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "TD", "TH"]), o = (h) => {
    let p = h instanceof Element ? h : h.parentElement;
    for (; p; ) {
      if (i.has(p.tagName)) return p;
      p = p.parentElement;
    }
    return null;
  };
  if (e.collapsed) {
    const h = o(e.startContainer);
    h && (h.style.lineHeight = s);
    return;
  }
  const n = /* @__PURE__ */ new Set(), l = document.createNodeIterator(e.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
  let r;
  for (; r = l.nextNode(); )
    if (e.intersectsNode(r)) {
      const h = o(r);
      h && n.add(h);
    }
  if (n.size === 0) {
    const h = o(e.commonAncestorContainer);
    h && n.add(h);
  }
  n.forEach((h) => {
    h.style.lineHeight = s;
  });
}
function k(s, t, e, i, o) {
  return { name: s, icon: t, tooltip: e, action: i, isActive: o };
}
const Wt = k("bold", "bold", "Bold (Ctrl+B)", () => lt(), () => document.queryCommandState("bold")), Ut = k("italic", "italic", "Italic (Ctrl+I)", () => at(), () => document.queryCommandState("italic")), Vt = k("underline", "underline", "Underline (Ctrl+U)", () => rt(), () => document.queryCommandState("underline")), qt = k("strikethrough", "strikethrough", "Strikethrough", () => ct(), () => document.queryCommandState("strikeThrough")), Yt = k("superscript", "superscript", "Superscript", () => ht(), () => document.queryCommandState("superscript")), Kt = k("subscript", "subscript", "Subscript", () => dt(), () => document.queryCommandState("subscript")), Xt = k("alignLeft", "align-left", "Align Left", () => gt()), Gt = k("alignCenter", "align-center", "Align Center", () => _t()), Qt = k("alignRight", "align-right", "Align Right", () => yt()), Zt = k("alignJustify", "align-justify", "Justify", () => vt()), Jt = k("ul", "list-ul", "Unordered List", () => xt()), te = k("ol", "list-ol", "Ordered List", () => Ct()), ee = k("indent", "indent", "Indent", () => wt()), ie = k("outdent", "outdent", "Outdent", () => bt()), se = k("undo", "undo", "Undo (Ctrl+Z)", (s) => s.invoke("editor.undo")), oe = k("redo", "redo", "Redo (Ctrl+Y)", (s) => s.invoke("editor.redo")), ne = k("hr", "minus", "Horizontal Rule", () => y("insertHorizontalRule")), le = k("link", "link", "Insert Link", (s) => s.invoke("linkDialog.show")), ae = k("image", "image", "Insert Image", (s) => s.invoke("imageDialog.show")), re = k("video", "video", "Insert Video", (s) => s.invoke("videoDialog.show")), ce = k("icon", "icon", "Insert Icon", (s) => s.invoke("iconDialog.show")), he = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (s, t, e) => {
    Dt(t, e), s.invoke("editor.afterCommand");
  }
}, de = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (s, t) => ft(t),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, pe = {
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
  action: (s, t) => mt(t),
  getValue: () => {
    try {
      const s = document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
      return s === "div" ? "p" : s || "p";
    } catch {
      return "";
    }
  }
}, ue = {
  name: "lineHeight",
  type: "select",
  tooltip: "Line Height",
  placeholder: "↕ Line",
  selectClass: "asn-select-narrow",
  items: ["1.0", "1.15", "1.5", "1.75", "2.0", "2.5", "3.0"],
  action: (s, t) => Ft(t),
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
}, fe = k("codeview", "code", "HTML Code View", (s) => s.invoke("codeview.toggle"), (s) => s.invoke("codeview.isActive")), me = k("fullscreen", "expand", "Fullscreen", (s) => s.invoke("fullscreen.toggle"), (s) => s.invoke("fullscreen.isActive")), ge = {
  name: "foreColor",
  type: "colorpicker",
  icon: "foreColor",
  tooltip: "Text Color",
  defaultColor: "#e11d48",
  action: (s, t) => pt(t)
}, _e = {
  name: "backColor",
  type: "colorpicker",
  icon: "backColor",
  tooltip: "Highlight Color",
  defaultColor: "#fbbf24",
  action: (s, t) => ut(t)
}, ye = [
  [pe, de, ue],
  [se, oe],
  [Wt, Ut, Vt, qt],
  [Yt, Kt],
  [ge, _e],
  [Xt, Gt, Qt, Zt],
  [Jt, te, ee, ie],
  [ne, le, ae, re, he, ce],
  [fe, me]
], kt = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: ye,
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
function ve(s, t) {
  const e = a("div", { class: "asn-container" }), i = a("div", {
    class: "asn-editable",
    contenteditable: "true",
    spellcheck: "true",
    "aria-multiline": "true",
    "aria-label": "Rich text editor",
    role: "textbox"
  });
  s.tagName === "TEXTAREA" ? i.innerHTML = (s.value || "").trim() : i.innerHTML = (s.innerHTML || "").trim();
  const o = t.defaultFontFamily || t.fontFamilies && t.fontFamilies[0];
  return o && (i.style.fontFamily = o), t.height && (i.style.minHeight = `${t.height}px`), t.minHeight && (i.style.minHeight = `${t.minHeight}px`), t.maxHeight && (i.style.maxHeight = `${t.maxHeight}px`), e.appendChild(i), s.style.display = "none", s.insertAdjacentElement("afterend", e), { container: e, editable: i };
}
const we = 100;
class be {
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
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1)), this.stack.push({ html: this._serialize() }), this.stack.length > we ? this.stack.shift() : this.stackOffset++;
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
function xe(s, t) {
  const e = a("table", { class: "asn-table" }), i = a("tbody");
  e.appendChild(i);
  for (let o = 0; o < t; o++) {
    const n = a("tr");
    for (let l = 0; l < s; l++) {
      const r = a("td", {}, [" "]);
      n.appendChild(r);
    }
    i.appendChild(n);
  }
  return e;
}
function Ce(s, t) {
  const e = xe(s, t);
  y("insertHTML", e.outerHTML);
}
const X = {
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
function q(s, t) {
  return s.key === t || s.key === t.toUpperCase();
}
function O(s, t) {
  return (s.ctrlKey || s.metaKey) && q(s, t);
}
function ke(s, t, e = {}) {
  if (q(s, X.TAB)) {
    const i = et(t);
    if (!i) return !1;
    const o = tt(i.sc, t);
    if (o && Pt(o))
      return s.preventDefault(), s.shiftKey ? y("outdent") : y("indent"), !0;
    if (o && o.nodeName.toUpperCase() === "PRE")
      return s.preventDefault(), y("insertText", "    "), !0;
    if (e.tabSize)
      return s.preventDefault(), y("insertText", " ".repeat(e.tabSize)), !0;
  }
  if (q(s, X.ENTER) && !s.shiftKey) {
    const i = et(t);
    if (!i) return !1;
    const o = tt(i.sc, t);
    if (o && o.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const n = i.toNativeRange();
      if (n.setStart(o, o.childNodes.length), n.toString() === "" && i.isCollapsed())
        return s.preventDefault(), y("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class Te {
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
    return this._history = new be(t), this._bindEvents(t), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._history = null;
  }
  // ---------------------------------------------------------------------------
  // Event binding
  // ---------------------------------------------------------------------------
  _bindEvents(t) {
    const e = (n) => this._onKeydown(n), i = () => this.afterCommand(), o = () => this.context.invoke("toolbar.refresh");
    this._disposers.push(
      c(t, "keydown", e),
      c(t, "keyup", i),
      c(document, "selectionchange", o)
    );
  }
  _onKeydown(t) {
    const e = this.context.layoutInfo.editable;
    if (!ke(t, e, this.options)) {
      if (O(t, "z") && !t.shiftKey) {
        t.preventDefault(), this.undo();
        return;
      }
      if (O(t, "z") && t.shiftKey || O(t, "y")) {
        t.preventDefault(), this.redo();
        return;
      }
      if (O(t, "b")) {
        t.preventDefault(), this.bold();
        return;
      }
      if (O(t, "i")) {
        t.preventDefault(), this.italic();
        return;
      }
      if (O(t, "u")) {
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
    return this.context.layoutInfo.editable.innerHTML.replace(/\u200B/g, "");
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
    lt(), this.afterCommand();
  }
  italic() {
    at(), this.afterCommand();
  }
  underline() {
    rt(), this.afterCommand();
  }
  strikethrough() {
    ct(), this.afterCommand();
  }
  superscript() {
    ht(), this.afterCommand();
  }
  subscript() {
    dt(), this.afterCommand();
  }
  justifyLeft() {
    gt(), this.afterCommand();
  }
  justifyCenter() {
    _t(), this.afterCommand();
  }
  justifyRight() {
    yt(), this.afterCommand();
  }
  justifyFull() {
    vt(), this.afterCommand();
  }
  indent() {
    wt(), this.afterCommand();
  }
  outdent() {
    bt(), this.afterCommand();
  }
  insertUL() {
    xt(), this.afterCommand();
  }
  insertOL() {
    Ct(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(t) {
    mt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(t) {
    pt(t), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(t) {
    ut(t), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(t) {
    ft(t), this.afterCommand();
  }
  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(t) {
    Ot(t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    y("insertHorizontalRule"), this.afterCommand();
  }
  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(t, e, i = !1) {
    const o = window.getSelection();
    if (!o || o.rangeCount === 0) return;
    const n = this._sanitiseUrl(t);
    if (!n) return;
    if (!(o.toString().trim().length > 0))
      y("insertHTML", `<a href="${n}"${i ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e || n}</a>`);
    else if (y("createLink", n), i) {
      const r = this._getClosestAnchor();
      r && (r.setAttribute("target", "_blank"), r.setAttribute("rel", "noopener noreferrer"));
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    y("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(t, e = "") {
    const i = this._sanitiseUrl(t);
    i && (y("insertHTML", `<img src="${i}" alt="${e}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a video embed (iframe or <video> element).
   * The html string is already validated/built by VideoDialog.
   * @param {string} html
   */
  insertVideo(t) {
    t && (y("insertHTML", t), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(t, e) {
    Ce(t, e), this.afterCommand();
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
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((o) => {
      i.querySelectorAll(o).forEach((n) => n.remove());
    }), i.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((n) => {
        n.name.startsWith("on") && o.removeAttribute(n.name), ["href", "src"].includes(n.name) && /^\s*javascript:/i.test(n.value) && o.removeAttribute(n.name);
      });
    }), i.body.innerHTML;
  }
}
class Ie {
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
      e.forEach((o) => {
        let n;
        o.type === "select" ? n = this._createSelect(o) : o.type === "grid" ? n = this._createGridPicker(o) : o.type === "colorpicker" ? n = this._createColorPicker(o) : n = this._createButton(o), i.appendChild(n);
      }), this.el.appendChild(i);
    });
  }
  /**
   * Creates a table-grid picker button with a hoverable row/col selector popup.
   * @param {import('./Buttons.js').ButtonDef} def
   * @returns {HTMLDivElement}
   */
  _createGridPicker(t) {
    const o = a("div", { class: "asn-table-picker-wrap" }), l = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", r = a("button", {
      type: "button",
      class: l,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    if (!!this.options.useFontAwesome && (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid") || /fontawesome|font-awesome/.test(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((b) => b.href).join(" ")))) {
      const b = this.options.fontAwesomeClass || "fas";
      r.innerHTML = `<i class="${b} fa-table" aria-hidden="true"></i>`;
    } else {
      const b = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      r.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${b} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const d = a("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), u = a("div", { class: "asn-table-grid" }), f = a("div", { class: "asn-table-label" });
    f.textContent = "Insert Table";
    const m = [];
    for (let b = 1; b <= 10; b++)
      for (let I = 1; I <= 10; I++) {
        const S = a("div", {
          class: "asn-table-cell",
          "data-row": String(b),
          "data-col": String(I)
        });
        m.push(S), u.appendChild(S);
      }
    d.appendChild(u), d.appendChild(f);
    let v = !1;
    const _ = (b, I) => {
      m.forEach((S) => {
        const j = +S.getAttribute("data-row"), C = +S.getAttribute("data-col");
        S.classList.toggle("active", j <= b && C <= I);
      }), f.textContent = b && I ? `${b} × ${I}` : "Insert Table";
    }, g = () => {
      v = !0, d.style.display = "block", r.setAttribute("aria-expanded", "true");
    }, w = () => {
      v = !1, d.style.display = "none", r.setAttribute("aria-expanded", "false"), _(0, 0);
    }, N = c(r, "click", (b) => {
      b.stopPropagation(), v ? w() : g();
    }), R = c(u, "mouseover", (b) => {
      const I = b.target.closest(".asn-table-cell");
      I && _(+I.getAttribute("data-row"), +I.getAttribute("data-col"));
    }), x = c(u, "mouseleave", () => _(0, 0)), T = c(u, "click", (b) => {
      const I = b.target.closest(".asn-table-cell");
      if (!I) return;
      const S = +I.getAttribute("data-row"), j = +I.getAttribute("data-col");
      w(), this.context.invoke("editor.focus"), t.action(this.context, S, j);
    }), E = c(document, "click", () => {
      v && w();
    });
    return this._disposers.push(N, R, x, T, E), o.appendChild(r), o.appendChild(d), o;
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
    const o = a("div", { class: "asn-color-picker-wrap" }), l = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", r = a("button", {
      type: "button",
      class: `${l} asn-color-btn`,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), h = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', p = t.name === "foreColor" ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${h} style="display:block"><path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${h} style="display:block"><path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/></svg>`;
    r.innerHTML = p;
    const d = a("span", { class: "asn-color-strip" });
    d.style.background = i, r.appendChild(d);
    const u = a("button", {
      type: "button",
      class: `${l} asn-color-arrow`,
      title: `Choose ${t.name === "foreColor" ? "text" : "highlight"} color`,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    u.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:block"><path d="M7 10l5 5 5-5H7z"/></svg>';
    const f = a("div", { class: "asn-color-popup" });
    f.style.display = "none";
    const m = a("div", { class: "asn-color-swatches" });
    e.forEach((C) => {
      const P = a("div", { class: "asn-color-swatch", title: C, "data-color": C });
      P.style.background = C, m.appendChild(P);
    });
    const v = a("div", { class: "asn-color-custom" }), _ = a("input", { type: "color", value: i, title: "Custom color" }), g = a("span", {}, ["Custom color"]);
    v.appendChild(_), v.appendChild(g), f.appendChild(m), f.appendChild(v);
    let w = !1;
    const N = () => {
      w = !0, f.style.display = "block", u.setAttribute("aria-expanded", "true");
    }, R = () => {
      w = !1, f.style.display = "none", u.setAttribute("aria-expanded", "false");
    }, x = (C) => {
      i = C, d.style.background = C, _.value = C, this.context.invoke("editor.focus"), t.action(this.context, C), this.context.invoke("editor.afterCommand"), R();
    }, T = c(r, "click", (C) => {
      C.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context, i), this.context.invoke("editor.afterCommand");
    }), E = c(u, "click", (C) => {
      C.stopPropagation(), w ? R() : N();
    }), b = c(m, "click", (C) => {
      const P = C.target.closest(".asn-color-swatch");
      P && x(P.dataset.color);
    }), I = c(_, "change", (C) => {
      x(C.target.value);
    }), S = c(document, "click", (C) => {
      w && !o.contains(C.target) && R();
    }), j = c(f, "click", (C) => C.stopPropagation());
    return this._disposers.push(T, E, b, I, S, j), o.appendChild(r), o.appendChild(u), o.appendChild(f), o;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(t) {
    const e = t.name === "fontFamily" ? this.options.fontFamilies || [] : t.items || [], i = t.selectClass ? `asn-select ${t.selectClass}` : "asn-select", o = a("select", {
      class: i,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), n = t.placeholder || "Font", l = a("option", { value: "" }, [n]);
    o.appendChild(l), e.forEach((h) => {
      const p = typeof h == "object" ? h.value : h, d = typeof h == "object" ? h.label : h, u = a("option", { value: p }, [d]);
      t.name === "fontFamily" && (u.style.fontFamily = p), o.appendChild(u);
    });
    const r = c(o, "change", (h) => {
      const p = h.target.value;
      p && (this.context.invoke("editor.focus"), t.action(this.context, p), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(r), o;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(t) {
    const i = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", o = t.className ? ` ${t.className}` : "", n = `${i}${o}`, l = a("button", {
      type: "button",
      class: n,
      title: t.tooltip || "",
      "data-btn": t.name,
      "aria-label": t.tooltip || t.name
    }), r = !!this.options.useFontAwesome, h = () => {
      if (!r) return !1;
      if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
      const g = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((w) => w.href || "").join(" ");
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(g);
    }, p = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', d = (g) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${p} style="display:block">${g}</svg>`, u = /* @__PURE__ */ new Map([
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
      ["icon", d('<circle cx="12" cy="12" r="10"/><path d="M8.5 14.5s1.5 2.5 3.5 2.5 3.5-2.5 3.5-2.5"/><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/>')],
      // View
      ["code", d('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", d('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')],
      // Color pickers
      ["foreColor", d('<path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/>')],
      ["backColor", d('<path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/>')]
    ]), f = this.options.fontAwesomeClass || "fas", m = /* @__PURE__ */ new Map([
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
      ["icon", "fa-icons"],
      ["foreColor", "fa-font"],
      ["backColor", "fa-highlighter"]
    ]);
    if (h()) {
      const g = m.get(t.icon) || m.get(t.name) || null;
      g ? l.innerHTML = `<i class="${f} ${g}" aria-hidden="true"></i>` : u.has(t.icon) ? l.innerHTML = u.get(t.icon) : l.textContent = t.icon || t.name;
    } else
      u.has(t.icon) ? l.innerHTML = u.get(t.icon) : u.has(t.name) ? l.innerHTML = u.get(t.name) : l.textContent = t.icon || t.name;
    const _ = c(l, "click", (g) => {
      g.preventDefault(), this.context.invoke("editor.focus"), t.action(this.context), this.refresh();
    });
    return this._disposers.push(_), l;
  }
  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------
  refresh() {
    if (!this.el) return;
    const t = this.options.toolbar || [], e = new Map(t.flat().map((i) => [i.name, i]));
    this.el.querySelectorAll("button[data-btn]").forEach((i) => {
      const o = e.get(i.getAttribute("data-btn"));
      o && typeof o.isActive == "function" && i.classList.toggle("active", !!o.isActive(this.context));
    }), this.el.querySelectorAll("select[data-btn]").forEach((i) => {
      const o = e.get(i.getAttribute("data-btn"));
      if (!o || typeof o.getValue != "function") return;
      let n = (o.getValue(this.context) || "").replace(/["']/g, "").trim();
      n || (n = this.options.defaultFontFamily || this.options.fontFamilies && this.options.fontFamilies[0] || "");
      const l = Array.from(i.options).find(
        (r) => r.value && r.value.toLowerCase() === n.toLowerCase()
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
class Ee {
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
    const o = this.context.layoutInfo.container, n = (p) => {
      const d = p.clientY - e, u = Math.max(120, i + d);
      o.style.height = `${u}px`;
    }, l = () => {
      document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", l);
    }, h = c(t, "mousedown", (p) => {
      e = p.clientY, i = o.offsetHeight, document.addEventListener("mousemove", n), document.addEventListener("mouseup", l), p.preventDefault();
    });
    this._disposers.push(h);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const t = this.context.layoutInfo.editable, e = Ht(() => this.update(), 200), i = c(t, "input", e);
    this._disposers.push(i);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const e = this.context.layoutInfo.editable.innerText || "", i = e.trim() ? e.trim().split(/\s+/).length : 0, o = e.length;
    this._wordCountEl.textContent = `Words: ${i}`, this._charCountEl.textContent = `Chars: ${o}`;
  }
}
class Be {
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
      const o = e.getData("text/html");
      i = this._sanitiseHTML(o), y("insertHTML", i);
    } else {
      i = e.getData("text/plain");
      const o = i.split(/\r?\n/).map((n) => `<p>${this._escapeHTML(n) || "<br>"}</p>`).join("");
      y("insertHTML", o);
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
    return ["script", "style", "iframe", "object", "embed", "form", "input", "button"].forEach((n) => {
      i.querySelectorAll(n).forEach((l) => l.parentNode.removeChild(l));
    }), i.querySelectorAll("*").forEach((n) => {
      Array.from(n.attributes).forEach((l) => {
        l.name.startsWith("on") && n.removeAttribute(l.name);
      }), ["href", "src", "action"].forEach((l) => {
        const r = n.getAttribute(l);
        r && /^\s*javascript:/i.test(r) && n.removeAttribute(l);
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
class Le {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this.options = t.options, this._disposers = [];
  }
  initialize() {
    const t = this.context.layoutInfo.editable, e = this.options.placeholder || "";
    e && (t.dataset.placeholder = e);
    const i = () => this._update(), o = c(t, "input", i), n = c(t, "focus", i), l = c(t, "blur", i);
    return this._disposers.push(o, n, l), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [];
  }
  _update() {
    const t = this.context.layoutInfo.editable, e = !t.textContent.trim() && !t.querySelector("img, table, hr");
    t.classList.toggle("asn-placeholder", e);
  }
}
class Se {
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
      const o = i.trim();
      if (!o) return "";
      /^<\//.test(o) && (e = Math.max(0, e - 1));
      const n = "  ".repeat(e) + o;
      return /^<[^/][^>]*[^/]>/.test(o) && !/^<(br|hr|img|input|link|meta)/.test(o) && e++, n;
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
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((o) => {
      i.querySelectorAll(o).forEach((n) => n.remove());
    }), i.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((n) => {
        n.name.startsWith("on") && o.removeAttribute(n.name), ["href", "src"].includes(n.name) && /^\s*javascript:/i.test(n.value) && o.removeAttribute(n.name);
      });
    }), i.body.innerHTML;
  }
}
class Me {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const t = c(document, "keydown", (e) => {
      this._active && q(e, X.ESCAPE) && this.deactivate();
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
    const t = this.context.layoutInfo.container;
    this._prevHeight = t.style.height, t.classList.add("asn-fullscreen"), t.style.height = "", document.body.style.overflow = "hidden", this._active = !0, this.context.invoke("toolbar.refresh");
  }
  deactivate() {
    if (!this._active) return;
    const t = this.context.layoutInfo.container;
    t.classList.remove("asn-fullscreen"), t.style.height = this._prevHeight, document.body.style.overflow = "", this._active = !1, this.context.invoke("toolbar.refresh");
  }
}
class Ae {
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
    Y((t) => {
      this._savedRange = t;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = a("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), e = a("div", { class: "asn-dialog-box" }), i = a("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Link";
    const o = a("label", { class: "asn-label" });
    o.textContent = "URL";
    const n = a("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://",
      id: "asn-link-url",
      name: "url",
      autocomplete: "off"
    });
    this._urlInput = n;
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
    const h = a("label", { class: "asn-label asn-label-inline" }), p = a("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = p, h.appendChild(p), h.appendChild(document.createTextNode(" Open in new tab"));
    const d = a("div", { class: "asn-dialog-actions" }), u = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    u.textContent = "Insert";
    const f = a("button", { type: "button", class: "asn-btn" });
    f.textContent = "Cancel", d.appendChild(u), d.appendChild(f), e.append(i, o, n, l, r, h, d), t.appendChild(e);
    const m = c(u, "click", () => this._onInsert()), v = c(f, "click", () => this._close()), _ = c(t, "click", (g) => {
      g.target === t && this._close();
    });
    return this._disposers.push(m, v, _), t;
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
class He {
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
    Y((t) => {
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
    const o = a("label", { class: "asn-label" });
    o.textContent = "Image URL";
    const n = a("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://example.com/image.png",
      autocomplete: "off"
    });
    this._urlInput = n;
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
      const _ = a("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = _;
      const g = c(_, "change", () => this._onFileChange());
      this._disposers.push(g), e.append(v, _);
    }
    const h = a("div", { class: "asn-dialog-actions" }), p = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    p.textContent = "Insert";
    const d = a("button", { type: "button", class: "asn-btn" });
    d.textContent = "Cancel", h.appendChild(p), h.appendChild(d), e.append(i, o, n, l, r, h), t.appendChild(e);
    const u = c(p, "click", () => this._onInsert()), f = c(d, "click", () => this._close()), m = c(t, "click", (v) => {
      v.target === t && this._close();
    });
    return this._disposers.push(u, f, m), t;
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
    i.onload = (o) => {
      this._urlInput.value = o.target.result;
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
class Re {
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
    Y((t) => {
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
    const o = a("label", { class: "asn-label" });
    o.textContent = "Video URL";
    const n = a("input", {
      type: "url",
      class: "asn-input",
      placeholder: "YouTube, Vimeo, or direct .mp4 URL",
      autocomplete: "off"
    });
    this._urlInput = n;
    const l = a("p", { class: "asn-dialog-hint" });
    this._hintEl = l;
    const r = a("label", { class: "asn-label" });
    r.textContent = "Width (px)";
    const h = a("input", {
      type: "number",
      class: "asn-input",
      placeholder: "560",
      min: "80",
      max: "1920",
      value: "560"
    });
    this._widthInput = h;
    const p = a("div", { class: "asn-dialog-actions" }), d = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    d.textContent = "Insert";
    const u = a("button", { type: "button", class: "asn-btn" });
    u.textContent = "Cancel", p.appendChild(d), p.appendChild(u), e.append(i, o, n, l, r, h, p), t.appendChild(e);
    const f = c(n, "input", () => {
      const w = this._parseVideoUrl(n.value.trim());
      l.textContent = w ? `Detected: ${w.type}` : n.value ? "Unknown format — will try direct video embed" : "";
    }), m = c(d, "click", () => this._onInsert()), v = c(u, "click", () => this._close()), _ = c(t, "click", (w) => {
      w.target === t && this._close();
    }), g = c(n, "keydown", (w) => {
      w.key === "Enter" && (w.preventDefault(), this._onInsert());
    });
    return this._disposers.push(f, m, v, _, g), t;
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
    const o = t.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (o) return { type: "YouTube Shorts", embedUrl: `https://www.youtube.com/embed/${o[1]}` };
    const n = t.match(/vimeo\.com\/(\d+)/);
    return n ? { type: "Vimeo", embedUrl: `https://player.vimeo.com/video/${n[1]}` } : /\.(mp4|webm|ogg|ogv|mov)(#.*|\?.*)?$/i.test(t) ? { type: "Direct video", embedUrl: t } : null;
  }
  /**
   * Builds the HTML string to insert.
   * @param {string} url
   * @param {number} width
   * @returns {string|null}
   */
  _buildEmbedHtml(t, e) {
    const i = this._parseVideoUrl(t), o = Math.round(e * 9 / 16);
    if (i && (i.type === "YouTube" || i.type === "YouTube Shorts" || i.type === "Vimeo"))
      return `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><iframe src="${i.embedUrl}" width="${e}" height="${o}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="display:block;max-width:100%"></iframe><div class="asn-video-shield"></div></div>`;
    if (i && i.type === "Direct video")
      return `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${i.embedUrl}" width="${e}" height="${o}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>`;
    const n = (() => {
      try {
        const l = new URL(t);
        return /^javascript:/i.test(l.protocol) ? null : t;
      } catch {
        return null;
      }
    })();
    return n ? `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${n}" width="${e}" height="${o}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>` : null;
  }
}
const ze = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class Ne {
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
    return t.className = "asn-image-resizer", t.style.display = "none", ze.forEach(({ pos: e }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${e}`, i.dataset.handle = e, this._disposers.push(
        c(i, "mousedown", (o) => {
          o.preventDefault(), o.stopPropagation(), this._startResize(o, e);
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
    const o = t.clientX, n = t.clientY, l = i.offsetWidth || i.naturalWidth || 100, r = i.offsetHeight || i.naturalHeight || 100, h = l / r, p = e.length === 2, d = (f) => {
      const m = f.clientX - o, v = f.clientY - n;
      let _ = l, g = r;
      e.includes("e") && (_ = Math.max(20, l + m)), e.includes("w") && (_ = Math.max(20, l - m)), e.includes("s") && (g = Math.max(20, r + v)), e.includes("n") && (g = Math.max(20, r - v)), p && (Math.abs(m) >= Math.abs(v) ? g = Math.max(20, Math.round(_ / h)) : _ = Math.max(20, Math.round(g * h))), i.style.width = `${_}px`, i.style.height = `${g}px`, this._updateOverlayPosition();
    }, u = () => {
      document.removeEventListener("mousemove", d), document.removeEventListener("mouseup", u), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", d), document.addEventListener("mouseup", u);
  }
}
const je = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class Pe {
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
    return t.className = "asn-video-resizer", t.style.display = "none", je.forEach(({ pos: e }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${e}`, i.dataset.handle = e, this._disposers.push(
        c(i, "mousedown", (o) => {
          o.preventDefault(), o.stopPropagation(), this._startResize(o, e);
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
    const o = i.querySelector("iframe, video"), n = t.clientX, l = t.clientY, r = i.offsetWidth || 560, h = i.offsetHeight || 315, p = r / h, d = e.length === 2, u = (m) => {
      const v = m.clientX - n, _ = m.clientY - l;
      let g = r, w = h;
      e.includes("e") && (g = Math.max(80, r + v)), e.includes("w") && (g = Math.max(80, r - v)), e.includes("s") && (w = Math.max(45, h + _)), e.includes("n") && (w = Math.max(45, h - _)), d && (Math.abs(v) >= Math.abs(_) ? w = Math.max(45, Math.round(g / p)) : g = Math.max(80, Math.round(w * p))), i.style.width = `${g}px`, i.style.height = `${w}px`, o && (o.width = g, o.height = w, o.style.width = `${g}px`, o.style.height = `${w}px`), this._updateOverlayPosition();
    }, f = () => {
      document.removeEventListener("mousemove", u), document.removeEventListener("mouseup", f), this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", u), document.addEventListener("mouseup", f);
  }
}
const U = {
  open: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  unlink: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
}, $e = 120, Oe = 200;
class De {
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
    const t = a("div", { class: "asn-link-tooltip", role: "toolbar", "aria-label": "Link actions" });
    return t.style.display = "none", this._urlLabel = a("span", { class: "asn-link-tooltip-url" }), t.appendChild(this._urlLabel), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._openBtn = this._makeBtn(U.open, "Open link", () => this._openLink()), this._copyBtn = this._makeBtn(U.copy, "Copy URL", () => this._copyLink()), this._editBtn = this._makeBtn(U.edit, "Edit link", () => this._editLink()), this._unlinkBtn = this._makeBtn(U.unlink, "Remove link", () => this._unlink()), t.appendChild(this._openBtn), t.appendChild(this._copyBtn), t.appendChild(this._editBtn), t.appendChild(this._unlinkBtn), this._disposers.push(
      c(t, "mouseenter", () => this._clearTimers()),
      c(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  _makeBtn(t, e, i) {
    const o = a("button", { type: "button", class: "asn-link-tooltip-btn", title: e });
    return o.innerHTML = t, this._disposers.push(c(o, "click", (n) => {
      n.preventDefault(), n.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide logic
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeAnchor === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeAnchor = t, this._show(t);
    }, $e));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => {
      this._hide();
    }, Oe));
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
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 260, o = this._el.offsetHeight || 34, n = 6;
    let l = e.bottom + n, r = e.left;
    l + o > window.innerHeight - n && (l = e.top - o - n), r + i > window.innerWidth - n && (r = window.innerWidth - i - n), r < n && (r = n), this._el.style.top = `${l}px`, this._el.style.left = `${r}px`;
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
const D = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteImg: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Fe = 100, We = 180;
class Ue {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeImg = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      c(t, "mouseover", (e) => {
        const i = e.target.closest("img");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      c(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      // Hide when image is deselected by clicking elsewhere
      c(document, "click", (e) => {
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
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Image", t.appendChild(this._label), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(D.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(D.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(D.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(D.floatRight, "Float Right", () => this._setFloat("right")), t.appendChild(this._floatLeftBtn), t.appendChild(this._floatNoneBtn), t.appendChild(this._alignCenterBtn), t.appendChild(this._floatRightBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(D.originalSize, "Original Size", () => this._resetSize()), t.appendChild(this._originalBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(D.deleteImg, "Delete Image", () => this._delete(), !0), t.appendChild(this._deleteBtn), this._disposers.push(
      c(t, "mouseenter", () => this._clearTimers()),
      c(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(t, e, i, o = !1) {
    const n = a("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return n.innerHTML = t, this._disposers.push(c(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeImg === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeImg = t, this._show(t);
    }, Fe));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), We));
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
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 220, o = this._el.offsetHeight || 32, n = 6;
    let l = e.bottom + n, r = e.left + (e.width - i) / 2;
    l + o > window.innerHeight - n && (l = e.top - o - n), r + i > window.innerWidth - n && (r = window.innerWidth - i - n), r < n && (r = n), this._el.style.top = `${l}px`, this._el.style.left = `${r}px`;
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
const F = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteVideo: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Ve = 100, qe = 180;
class Ye {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeWrapper = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      c(t, "mouseover", (e) => {
        const i = e.target.closest(".asn-video-wrapper");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      c(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      c(document, "click", (e) => {
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
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Video", t.appendChild(this._label), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(F.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(F.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(F.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(F.floatRight, "Float Right", () => this._setFloat("right")), t.appendChild(this._floatLeftBtn), t.appendChild(this._floatNoneBtn), t.appendChild(this._alignCenterBtn), t.appendChild(this._floatRightBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(F.originalSize, "Original Size", () => this._resetSize()), t.appendChild(this._originalBtn), t.appendChild(a("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(F.deleteVideo, "Delete Video", () => this._delete(), !0), t.appendChild(this._deleteBtn), this._disposers.push(
      c(t, "mouseenter", () => this._clearTimers()),
      c(t, "mouseleave", () => this._scheduleHide())
    ), t;
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(t, e, i, o = !1) {
    const n = a("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return n.innerHTML = t, this._disposers.push(c(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeWrapper === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeWrapper = t, this._show(t);
    }, Ve));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), qe));
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
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 220, o = this._el.offsetHeight || 32, n = 6;
    let l = e.bottom + n, r = e.left + (e.width - i) / 2;
    l + o > window.innerHeight - n && (l = e.top - o - n), r + i > window.innerWidth - n && (r = window.innerWidth - i - n), r < n && (r = n), this._el.style.top = `${l}px`, this._el.style.left = `${r}px`;
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
const Ke = 120, Xe = 200, z = {
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
class Ge {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activeTable = null, this._activeCell = null, this._showTimer = null, this._hideTimer = null, this._disposers = [], this._sizePopover = null, this._sizeApply = null, this._sizeTitleEl = null, this._sizeInputEl = null;
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      c(t, "mouseover", (e) => {
        const i = e.target.closest("table");
        if (i && t.contains(i)) {
          const o = e.target.closest("td, th");
          o && (this._activeCell = o), this._scheduleShow(i);
        }
      }),
      c(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i) && !(this._sizePopover && this._sizePopover.contains(i))) && this._scheduleHide();
      }),
      c(document, "click", (e) => {
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
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Table", t.appendChild(this._label), t.appendChild(this._sep()), t.appendChild(this._makeBtn(z.rowAbove, "Add Row Above", () => this._addRow("above"))), t.appendChild(this._makeBtn(z.rowBelow, "Add Row Below", () => this._addRow("below"))), t.appendChild(this._makeBtn(z.deleteRow, "Delete Row", () => this._deleteRow())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(z.colLeft, "Add Column Left", () => this._addColumn("left"))), t.appendChild(this._makeBtn(z.colRight, "Add Column Right", () => this._addColumn("right"))), t.appendChild(this._makeBtn(z.deleteCol, "Delete Column", () => this._deleteColumn())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(z.mergeCells, "Merge Cells", () => this._mergeCells())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(z.colWidth, "Column Width", () => this._openSizePopover("col"))), t.appendChild(this._makeBtn(z.rowHeight, "Row Height", () => this._openSizePopover("row"))), t.appendChild(this._sep()), t.appendChild(this._makeBtn(z.deleteTable, "Delete Table", () => this._deleteTable(), !0)), this._disposers.push(
      c(t, "mouseenter", () => this._clearTimers()),
      c(t, "mouseleave", () => this._scheduleHide())
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
  _makeBtn(t, e, i, o = !1) {
    const n = a("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return n.innerHTML = t, this._disposers.push(c(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activeTable === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeTable = t, this._show();
    }, Ke));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Xe));
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
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 400, o = this._el.offsetHeight || 30, n = 6;
    let l = e.left + (e.width - i) / 2, r = e.top - o - n;
    r < n && (r = e.bottom + n), l + i > window.innerWidth - n && (l = window.innerWidth - i - n), l < n && (l = n), this._el.style.left = `${l}px`, this._el.style.top = `${r}px`;
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
    const o = Array.from(i.cells).reduce((l, r) => l + (r.colSpan || 1), 0), n = document.createElement("tr");
    for (let l = 0; l < o; l++) {
      const r = document.createElement("td");
      r.style.border = "1px solid #dee2e6", r.style.padding = "6px 12px", r.innerHTML = "&#8203;", n.appendChild(r);
    }
    t === "above" ? i.parentElement.insertBefore(n, i) : i.insertAdjacentElement("afterend", n), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _addColumn(t) {
    const e = this._getCell();
    if (!e) return;
    const i = e.closest("tr"), o = e.closest("table");
    if (!i || !o) return;
    const n = Array.from(i.cells).indexOf(e);
    Array.from(o.querySelectorAll("tr")).forEach((l) => {
      const r = Array.from(l.cells), h = document.createElement("td");
      h.style.border = "1px solid #dee2e6", h.style.padding = "6px 12px", h.innerHTML = "&#8203;";
      const p = t === "left" ? r[n] : r[n + 1] || null;
      l.insertBefore(h, p);
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
    const o = Array.from(e.cells).indexOf(t);
    this._activeCell = null, Array.from(i.querySelectorAll("tr")).forEach((n) => {
      const l = n.cells[o];
      l && n.removeChild(l);
    }), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _mergeCells() {
    const t = this._getCell();
    if (!t) return;
    const e = t.closest("tr");
    if (!e) return;
    const i = window.getSelection();
    if (!i || i.rangeCount === 0) return;
    const o = i.getRangeAt(0), n = Array.from(e.cells).filter((r) => {
      try {
        return o.intersectsNode(r);
      } catch {
        return !1;
      }
    });
    if (n.length < 2) return;
    const l = n[0];
    l.colSpan = n.reduce((r, h) => r + (h.colSpan || 1), 0), l.innerHTML = n.map((r) => r.innerHTML).join(""), n.slice(1).forEach((r) => e.removeChild(r)), this.context.invoke("editor.afterCommand");
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
    const e = a("div", { class: "asn-size-popover-title" }), i = a("div", { class: "asn-size-popover-body" }), o = a("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), n = a("span", { class: "asn-size-unit" }, ["px"]);
    i.appendChild(o), i.appendChild(n);
    const l = a("div", { class: "asn-size-popover-actions" }), r = a("button", { type: "button", class: "asn-btn" });
    r.textContent = "Cancel";
    const h = a("button", { type: "button", class: "asn-btn asn-btn-primary" });
    h.textContent = "Apply", l.appendChild(r), l.appendChild(h), t.appendChild(e), t.appendChild(i), t.appendChild(l), this._sizeTitleEl = e, this._sizeInputEl = o, this._sizeApply = null;
    const p = c(h, "click", () => {
      const m = parseInt(this._sizeInputEl.value, 10);
      m > 0 && typeof this._sizeApply == "function" && this._sizeApply(m), this._hideSizePopover();
    }), d = c(r, "click", () => this._hideSizePopover()), u = c(o, "keydown", (m) => {
      m.key === "Enter" && (m.preventDefault(), h.click()), m.key === "Escape" && this._hideSizePopover();
    }), f = c(document, "click", (m) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(m.target) && !this._el.contains(m.target) && this._hideSizePopover();
    });
    return this._disposers.push(p, d, u, f), t;
  }
  _openSizePopover(t) {
    const e = this._getCell();
    if (!e || !this._sizePopover) return;
    const i = t === "col";
    this._sizeTitleEl.textContent = i ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = i ? e.offsetWidth || 120 : e.closest("tr") && e.closest("tr").offsetHeight || 40, this._sizeApply = (o) => {
      if (i) {
        const n = e.closest("table"), l = Array.from(e.closest("tr").cells).indexOf(e);
        Array.from(n.querySelectorAll("tr")).forEach((r) => {
          const h = r.cells[l];
          h && (h.style.width = `${o}px`, h.style.minWidth = `${o}px`);
        });
      } else {
        const n = e.closest("tr");
        n && Array.from(n.cells).forEach((l) => {
          l.style.height = `${o}px`;
        });
      }
      this.context.invoke("editor.afterCommand");
    }, this._sizePopover.style.display = "block", requestAnimationFrame(() => {
      if (!this._sizePopover || !this._el) return;
      const o = this._el.getBoundingClientRect(), n = this._sizePopover.offsetWidth || 220, l = this._sizePopover.offsetHeight || 110;
      let r = o.left, h = o.bottom + 6;
      r + n > window.innerWidth - 8 && (r = window.innerWidth - n - 8), h + l > window.innerHeight - 8 && (h = o.top - l - 6), this._sizePopover.style.left = `${r}px`, this._sizePopover.style.top = `${h}px`, this._sizeInputEl && (this._sizeInputEl.focus(), this._sizeInputEl.select());
    });
  }
  _hideSizePopover() {
    this._sizePopover && (this._sizePopover.style.display = "none"), this._sizeApply = null;
  }
}
const Qe = 100, Ze = 180, V = {
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  wrapOn: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 0 1 0 6H3"/><polyline points="6 15 3 18 6 21"/></svg>',
  toParagraph: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M9 4h8a4 4 0 0 1 0 8H9V4z"/></svg>',
  deleteCode: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
};
class Je {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this._el = null, this._activePre = null, this._showTimer = null, this._hideTimer = null, this._disposers = [], this._copyBtn = null;
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const t = this.context.layoutInfo.editable;
    return this._disposers.push(
      c(t, "mouseover", (e) => {
        const i = e.target.closest("pre");
        i && t.contains(i) && this._scheduleShow(i);
      }),
      c(t, "mouseout", (e) => {
        const i = e.relatedTarget;
        (!i || !t.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      c(document, "click", (e) => {
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
    return t.style.display = "none", this._label = a("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Code", t.appendChild(this._label), t.appendChild(this._sep()), this._copyBtn = this._makeBtn(V.copy, "Copy Code", () => this._copyCode()), t.appendChild(this._copyBtn), t.appendChild(this._sep()), this._wrapBtn = this._makeBtn(V.wrapOn, "Toggle Word Wrap", () => this._toggleWrap()), t.appendChild(this._wrapBtn), t.appendChild(this._sep()), t.appendChild(this._makeBtn(V.toParagraph, "Convert to Paragraph", () => this._toParagraph())), t.appendChild(this._sep()), t.appendChild(this._makeBtn(V.deleteCode, "Delete Code Block", () => this._delete(), !0)), this._disposers.push(
      c(t, "mouseenter", () => this._clearTimers()),
      c(t, "mouseleave", () => this._scheduleHide())
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
  _makeBtn(t, e, i, o = !1) {
    const n = a("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: e
    });
    return n.innerHTML = t, this._disposers.push(c(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(t) {
    this._activePre === t && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activePre = t, this._syncWrapBtn(), this._show(t);
    }, Qe));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Ze));
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
    const e = t.getBoundingClientRect(), i = this._el.offsetWidth || 260, o = this._el.offsetHeight || 32, n = 6;
    let l = e.top - o - n, r = e.left + (e.width - i) / 2;
    l < n && (l = e.bottom + n), r + i > window.innerWidth - n && (r = window.innerWidth - i - n), r < n && (r = n), this._el.style.top = `${l + window.scrollY}px`, this._el.style.left = `${r + window.scrollX}px`;
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
`), o = document.createElement("p");
    i.forEach((n, l) => {
      l > 0 && o.appendChild(document.createElement("br")), o.appendChild(document.createTextNode(n));
    }), t.parentNode.replaceChild(o, t), this._hide(), this.context.invoke("editor.afterCommand");
  }
  _delete() {
    const t = this._activePre;
    t && (this._hide(), t.parentNode && t.parentNode.removeChild(t), this.context.invoke("editor.afterCommand"));
  }
}
const ti = [
  { id: "popular", label: "Popular" },
  { id: "interface", label: "Interface" },
  { id: "navigation", label: "Navigation" },
  { id: "media", label: "Media" },
  { id: "communication", label: "Communication" },
  { id: "files", label: "Files" },
  { id: "people", label: "People" },
  { id: "objects", label: "Objects" }
], ei = [
  // Popular
  ["house", "popular"],
  ["star", "popular"],
  ["heart", "popular"],
  ["check", "popular"],
  ["xmark", "popular"],
  ["plus", "popular"],
  ["minus", "popular"],
  ["magnifying-glass", "popular"],
  ["gear", "popular"],
  ["bell", "popular"],
  ["user", "popular"],
  ["envelope", "popular"],
  ["phone", "popular"],
  ["calendar", "popular"],
  ["clock", "popular"],
  ["lock", "popular"],
  ["eye", "popular"],
  ["eye-slash", "popular"],
  ["trash", "popular"],
  ["pen", "popular"],
  ["bookmark", "popular"],
  ["flag", "popular"],
  ["thumbs-up", "popular"],
  ["thumbs-down", "popular"],
  ["circle-info", "popular"],
  ["triangle-exclamation", "popular"],
  ["circle-check", "popular"],
  ["circle-xmark", "popular"],
  ["share", "popular"],
  ["download", "popular"],
  ["upload", "popular"],
  ["tag", "popular"],
  // Interface
  ["bars", "interface"],
  ["ellipsis", "interface"],
  ["ellipsis-vertical", "interface"],
  ["list", "interface"],
  ["table-cells", "interface"],
  ["table-list", "interface"],
  ["grip", "interface"],
  ["filter", "interface"],
  ["sort", "interface"],
  ["arrows-rotate", "interface"],
  ["rotate", "interface"],
  ["rotate-left", "interface"],
  ["rotate-right", "interface"],
  ["copy", "interface"],
  ["floppy-disk", "interface"],
  ["print", "interface"],
  ["link", "interface"],
  ["code", "interface"],
  ["expand", "interface"],
  ["compress", "interface"],
  ["cloud", "interface"],
  ["lock-open", "interface"],
  ["key", "interface"],
  ["shield", "interface"],
  ["shield-halved", "interface"],
  ["sliders", "interface"],
  ["toggle-on", "interface"],
  ["square-check", "interface"],
  ["circle-plus", "interface"],
  ["circle-minus", "interface"],
  // Navigation
  ["arrow-right", "navigation"],
  ["arrow-left", "navigation"],
  ["arrow-up", "navigation"],
  ["arrow-down", "navigation"],
  ["chevron-right", "navigation"],
  ["chevron-left", "navigation"],
  ["chevron-up", "navigation"],
  ["chevron-down", "navigation"],
  ["angle-right", "navigation"],
  ["angle-left", "navigation"],
  ["angle-up", "navigation"],
  ["angle-down", "navigation"],
  ["angles-right", "navigation"],
  ["angles-left", "navigation"],
  ["location-dot", "navigation"],
  ["compass", "navigation"],
  ["map", "navigation"],
  ["map-pin", "navigation"],
  ["route", "navigation"],
  ["circle-arrow-right", "navigation"],
  ["circle-arrow-left", "navigation"],
  ["arrow-trend-up", "navigation"],
  ["arrow-trend-down", "navigation"],
  ["right-from-bracket", "navigation"],
  ["right-to-bracket", "navigation"],
  // Media
  ["play", "media"],
  ["pause", "media"],
  ["stop", "media"],
  ["forward", "media"],
  ["backward", "media"],
  ["forward-step", "media"],
  ["backward-step", "media"],
  ["volume-high", "media"],
  ["volume-low", "media"],
  ["volume-xmark", "media"],
  ["volume-off", "media"],
  ["music", "media"],
  ["headphones", "media"],
  ["microphone", "media"],
  ["microphone-slash", "media"],
  ["film", "media"],
  ["camera", "media"],
  ["camera-rotate", "media"],
  ["video", "media"],
  ["image", "media"],
  ["images", "media"],
  ["photo-film", "media"],
  ["podcast", "media"],
  ["radio", "media"],
  // Communication
  ["comment", "communication"],
  ["comments", "communication"],
  ["comment-dots", "communication"],
  ["message", "communication"],
  ["paper-plane", "communication"],
  ["reply", "communication"],
  ["reply-all", "communication"],
  ["at", "communication"],
  ["hashtag", "communication"],
  ["wifi", "communication"],
  ["signal", "communication"],
  ["rss", "communication"],
  ["share-nodes", "communication"],
  ["inbox", "communication"],
  ["phone-volume", "communication"],
  ["mobile", "communication"],
  ["mobile-screen", "communication"],
  ["laptop", "communication"],
  ["desktop", "communication"],
  ["tower-broadcast", "communication"],
  // Files
  ["file", "files"],
  ["file-lines", "files"],
  ["folder", "files"],
  ["folder-open", "files"],
  ["folder-plus", "files"],
  ["folder-minus", "files"],
  ["file-image", "files"],
  ["file-pdf", "files"],
  ["file-code", "files"],
  ["file-zipper", "files"],
  ["file-audio", "files"],
  ["file-video", "files"],
  ["file-arrow-up", "files"],
  ["file-arrow-down", "files"],
  ["database", "files"],
  ["box", "files"],
  ["box-open", "files"],
  ["hard-drive", "files"],
  ["server", "files"],
  // People
  ["user", "people"],
  ["users", "people"],
  ["user-group", "people"],
  ["user-plus", "people"],
  ["user-minus", "people"],
  ["user-check", "people"],
  ["user-xmark", "people"],
  ["user-tie", "people"],
  ["user-shield", "people"],
  ["user-secret", "people"],
  ["person", "people"],
  ["person-running", "people"],
  ["person-walking", "people"],
  ["child", "people"],
  ["handshake", "people"],
  ["hand", "people"],
  ["hands-holding", "people"],
  ["people-group", "people"],
  // Objects
  ["pencil", "objects"],
  ["paintbrush", "objects"],
  ["eraser", "objects"],
  ["scissors", "objects"],
  ["wrench", "objects"],
  ["screwdriver", "objects"],
  ["hammer", "objects"],
  ["toolbox", "objects"],
  ["graduation-cap", "objects"],
  ["book", "objects"],
  ["book-open", "objects"],
  ["glasses", "objects"],
  ["microscope", "objects"],
  ["flask", "objects"],
  ["stethoscope", "objects"],
  ["hospital", "objects"],
  ["building", "objects"],
  ["city", "objects"],
  ["car", "objects"],
  ["truck", "objects"],
  ["plane", "objects"],
  ["train", "objects"],
  ["bicycle", "objects"],
  ["bus", "objects"],
  ["rocket", "objects"],
  ["briefcase", "objects"],
  ["cart-shopping", "objects"],
  ["bag-shopping", "objects"],
  ["credit-card", "objects"],
  ["money-bill", "objects"],
  ["chart-bar", "objects"],
  ["chart-line", "objects"],
  ["chart-pie", "objects"],
  ["bolt", "objects"],
  ["sun", "objects"],
  ["moon", "objects"],
  ["snowflake", "objects"],
  ["fire", "objects"],
  ["droplet", "objects"],
  ["leaf", "objects"],
  ["tree", "objects"],
  ["earth-americas", "objects"],
  ["globe", "objects"],
  ["award", "objects"],
  ["trophy", "objects"],
  ["gift", "objects"],
  ["puzzle-piece", "objects"]
];
class ii {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(t) {
    this.context = t, this._dialog = null, this._disposers = [], this._savedRange = null, this._selectedIcon = null, this._activeCat = "all";
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._ensureFontAwesome(), this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  /**
   * Injects FA 6 Free CSS from CDN if it is not already on the page.
   * This guarantees icon glyphs render in the grid, preview, and in the
   * editor content after insertion — regardless of whether the host page
   * loaded FA itself.
   */
  _ensureFontAwesome() {
    if (document.getElementById("asn-fontawesome-css")) return;
    const t = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((i) => i.href || "").join(" ");
    if (/fontawesome|font-awesome/.test(t) || document.querySelector(".fa-solid, .fas, .far, .fab")) return;
    const e = document.createElement("link");
    e.id = "asn-fontawesome-css", e.rel = "stylesheet", e.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css", e.crossOrigin = "anonymous", e.referrerPolicy = "no-referrer", document.head.appendChild(e);
  }
  destroy() {
    this._disposers.forEach((t) => t()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  show() {
    Y((t) => {
      this._savedRange = t;
    }), this._selectedIcon = null, this._activeCat = "all", this._searchInput.value = "", this._updateCatTabs(), this._filterIcons("", "all"), this._updatePreview(null), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const t = a("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert icon"
    }), e = a("div", { class: "asn-dialog-box asn-icon-box" }), i = a("div", { class: "asn-icon-title-row" }), o = a("h3", { class: "asn-dialog-title" });
    o.textContent = "Insert Icon";
    const n = a("button", { type: "button", class: "asn-icon-close", "aria-label": "Close" });
    n.innerHTML = "&times;", i.append(o, n);
    const l = a("input", {
      type: "search",
      class: "asn-input asn-icon-search",
      placeholder: "Search icons…",
      autocomplete: "off"
    });
    this._searchInput = l;
    const r = a("div", { class: "asn-icon-cats" }), h = a("button", { type: "button", class: "asn-icon-cat active", "data-cat": "all" });
    h.textContent = "All", r.appendChild(h), ti.forEach(({ id: B, label: M }) => {
      const H = a("button", { type: "button", class: "asn-icon-cat", "data-cat": B });
      H.textContent = M, r.appendChild(H);
    }), this._catBar = r;
    const p = a("div", { class: "asn-icon-grid" });
    ei.forEach(([B, M]) => {
      const H = a("button", { type: "button", class: "asn-icon-cell", "data-name": B, "data-cat": M, title: B }), At = a("i", { class: "fa-solid fa-" + B, "aria-hidden": "true" }), J = a("span");
      J.textContent = B, H.append(At, J), p.appendChild(H);
    }), this._grid = p;
    const d = a("div", { class: "asn-icon-options" }), u = a("label", { class: "asn-label" });
    u.textContent = "Style";
    const f = a("select", { class: "asn-input asn-icon-option-select" });
    [["fa-solid", "Solid"], ["fa-regular", "Regular"], ["fa-light", "Light (Pro)"]].forEach(([B, M]) => {
      const H = a("option", { value: B });
      H.textContent = M, f.appendChild(H);
    }), f.value = "fa-solid", this._styleSelect = f;
    const m = a("label", { class: "asn-label" });
    m.textContent = "Size";
    const v = a("select", { class: "asn-input asn-icon-option-select" });
    [["", "Inherit"], ["0.75em", "0.75em"], ["1em", "1em"], ["1.25em", "1.25em"], ["1.5em", "1.5em"], ["2em", "2em"], ["3em", "3em"]].forEach(([B, M]) => {
      const H = a("option", { value: B });
      B === "1em" && (H.selected = !0), H.textContent = M, v.appendChild(H);
    }), this._sizeSelect = v;
    const _ = a("label", { class: "asn-label" });
    _.textContent = "Color";
    const g = a("input", { type: "color", class: "asn-icon-color", value: "#000000" });
    this._colorInput = g;
    const w = a("label", { class: "asn-label asn-label-inline asn-icon-use-color" }), N = a("input", { type: "checkbox", checked: "" });
    this._useColorCb = N, w.append(N, document.createTextNode(" Use color")), d.append(u, f, m, v, _, g, w);
    const R = a("div", { class: "asn-icon-preview" }), x = a("span", { class: "asn-icon-preview-hint" });
    x.textContent = "Select an icon", R.appendChild(x), this._preview = R;
    const T = a("div", { class: "asn-dialog-actions" }), E = a("button", { type: "button", class: "asn-btn asn-btn-primary", disabled: "" });
    E.textContent = "Insert Icon";
    const b = a("button", { type: "button", class: "asn-btn" });
    b.textContent = "Cancel", T.append(E, b), this._insertBtn = E, e.append(i, l, r, p, d, R, T), t.appendChild(e);
    const I = c(n, "click", () => this._close()), S = c(b, "click", () => this._close()), j = c(E, "click", () => this._onInsert()), C = c(t, "click", (B) => {
      B.target === t && this._close();
    }), P = c(l, "input", () => this._filterIcons(l.value, this._activeCat)), Tt = c(r, "click", (B) => {
      const M = B.target.closest("[data-cat]");
      M && (this._activeCat = M.dataset.cat, this._updateCatTabs(), this._filterIcons(this._searchInput.value, this._activeCat));
    }), It = c(p, "click", (B) => {
      const M = B.target.closest(".asn-icon-cell");
      M && this._selectIcon(M.dataset.name);
    }), Et = c(f, "change", () => this._updatePreview(this._selectedIcon)), Bt = c(v, "change", () => this._updatePreview(this._selectedIcon)), Lt = c(g, "input", () => this._updatePreview(this._selectedIcon)), St = c(N, "change", () => this._updatePreview(this._selectedIcon)), Z = (B) => {
      B.key === "Escape" && this._close();
    };
    document.addEventListener("keydown", Z);
    const Mt = () => document.removeEventListener("keydown", Z);
    return this._disposers.push(I, S, j, C, P, Tt, It, Et, Bt, Lt, St, Mt), t;
  }
  // ---------------------------------------------------------------------------
  // Filter / select
  // ---------------------------------------------------------------------------
  _updateCatTabs() {
    this._catBar.querySelectorAll(".asn-icon-cat").forEach((t) => {
      t.classList.toggle("active", t.dataset.cat === this._activeCat);
    });
  }
  _filterIcons(t, e) {
    const i = (t || "").trim().toLowerCase();
    let o = 0;
    this._grid.querySelectorAll(".asn-icon-cell").forEach((l) => {
      const r = l.dataset.name, h = l.dataset.cat, p = !e || e === "all" || h === e, d = !i || r.includes(i), u = p && d;
      l.hidden = !u, u && o++;
    });
    let n = this._grid.querySelector(".asn-icon-empty");
    n || (n = a("div", { class: "asn-icon-empty" }), n.textContent = "No icons found", this._grid.appendChild(n)), n.hidden = o > 0;
  }
  _selectIcon(t) {
    this._selectedIcon = t, this._grid.querySelectorAll(".asn-icon-cell").forEach((e) => {
      e.classList.toggle("active", e.dataset.name === t);
    }), this._insertBtn.removeAttribute("disabled"), this._updatePreview(t);
  }
  _updatePreview(t) {
    if (!this._preview) return;
    if (!t) {
      this._preview.innerHTML = '<span class="asn-icon-preview-hint">Select an icon</span>';
      return;
    }
    const e = this._styleSelect && this._styleSelect.value || "fa-solid", i = this._sizeSelect && this._sizeSelect.value || "1em", n = (this._useColorCb ? this._useColorCb.checked : !1) && this._colorInput ? this._colorInput.value : "", l = [
      `font-size:${i}`,
      n ? `color:${n}` : ""
    ].filter(Boolean).join(";");
    this._preview.innerHTML = `<i class="${e} fa-${t}" aria-hidden="true"${l ? ` style="${l}"` : ""}></i><div class="asn-icon-preview-name">${e} fa-${t}</div>`;
  }
  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------
  _onInsert() {
    if (!this._selectedIcon) return;
    const t = this._styleSelect && this._styleSelect.value || "fa-solid", e = this._sizeSelect && this._sizeSelect.value || "", o = (this._useColorCb ? this._useColorCb.checked : !1) && this._colorInput ? this._colorInput.value : "", n = [
      e ? `font-size:${e}` : "",
      o ? `color:${o}` : ""
    ].filter(Boolean), l = document.createElement("i");
    l.className = `${t} fa-${this._selectedIcon}`, l.setAttribute("aria-hidden", "true"), n.length && l.setAttribute("style", n.join(";"));
    const r = this._savedRange, h = this.context.layoutInfo.editable;
    r && r.select();
    const p = window.getSelection();
    let d = p && p.rangeCount > 0 ? p.getRangeAt(0) : null;
    d || (d = document.createRange(), d.selectNodeContents(h), d.collapse(!1)), d.deleteContents(), d.insertNode(l);
    const u = document.createTextNode("​");
    l.parentNode.insertBefore(u, l.nextSibling), d.setStart(u, 1), d.collapse(!0), p && (p.removeAllRanges(), p.addRange(d)), this._close(), h.focus(), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._searchInput && this._searchInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null, this._selectedIcon = null;
  }
}
const L = {
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
}, si = [
  { name: "undo", label: "Undo", icon: L.undo, action: (s) => s.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: L.redo, action: (s) => s.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: L.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: L.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: L.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: L.bold, action: (s) => s.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: L.italic, action: (s) => s.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: L.underline, action: (s) => s.invoke("editor.underline") },
  { separator: !0 },
  { name: "copyFormat", label: "Copy Format", icon: L.copyFormat, action: (s) => s.invoke("contextMenu.copyFormat") },
  { name: "pasteFormat", label: "Paste Format", icon: L.pasteFormat, action: (s) => s.invoke("contextMenu.pasteFormat"), disabled: (s) => !s.invoke("contextMenu.hasCopiedFormat") },
  { name: "removeFormat", label: "Remove Format", icon: L.removeFormat, action: (s) => s.invoke("contextMenu.removeFormat") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: L.link, action: (s) => s.invoke("linkDialog.show") },
  { name: "image", label: "Insert Image", icon: L.image, action: (s) => s.invoke("imageDialog.show") },
  { name: "video", label: "Insert Video", icon: L.video, action: (s) => s.invoke("videoDialog.show") },
  { name: "table", label: "Insert Table", icon: L.table, tableGrid: !0 }
];
class oi {
  /** @param {import('../Context.js').Context} context */
  constructor(t) {
    this.context = t, this.options = t.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || si, this.el = null, this._disposers = [], this._menuDisposers = [], this._lastX = 0, this._lastY = 0, this._copiedFormat = null, this._savedRange = null;
  }
  initialize() {
    this.el = a("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._renderItems(this._items);
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
    }), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  _renderItems(t) {
    this._menuDisposers.forEach((e) => e()), this._menuDisposers = [], this.el && (this.el.innerHTML = "", t.forEach((e) => {
      if (e.separator || e.sep) {
        this.el.appendChild(a("div", { class: "asn-context-sep" }));
        return;
      }
      if (e.back) {
        const n = a("button", { type: "button", class: "asn-context-back" }), l = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
        l.innerHTML = L.back, n.appendChild(l), n.appendChild(a("span", { class: "asn-context-label" }, [e.label || "Back"]));
        const r = c(n, "click", (h) => {
          h.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(r), this.el.appendChild(n);
        return;
      }
      if (e.navigate) {
        const n = a("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": e.name || "" });
        if (e.icon) {
          const h = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
          h.innerHTML = e.icon, n.appendChild(h);
        }
        n.appendChild(a("span", { class: "asn-context-label" }, [e.label || e.name]));
        const l = a("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        l.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', n.appendChild(l);
        const r = c(n, "click", (h) => {
          h.stopPropagation(), this._renderItems(e.navigate()), this._reposition();
        });
        this._menuDisposers.push(r), this.el.appendChild(n);
        return;
      }
      if (e.tableGrid) {
        const r = a("div", { class: "asn-context-table-wrap" }), h = a("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": e.name || "table" });
        if (e.icon) {
          const x = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
          x.innerHTML = e.icon, h.appendChild(x);
        }
        h.appendChild(a("span", { class: "asn-context-label" }, [e.label || "Insert Table"]));
        const p = a("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        p.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', h.appendChild(p);
        const d = a("div", { class: "asn-context-table-grid-panel" });
        d.style.display = "none";
        const u = a("div", { class: "asn-table-grid" });
        u.style.gridTemplateColumns = "repeat(8, 16px)";
        const f = a("div", { class: "asn-table-label" });
        f.textContent = "Insert Table";
        const m = [];
        for (let x = 1; x <= 8; x++)
          for (let T = 1; T <= 8; T++) {
            const E = a("div", { class: "asn-table-cell", "data-row": String(x), "data-col": String(T) });
            E.style.width = "16px", E.style.height = "16px", m.push(E), u.appendChild(E);
          }
        const v = (x, T) => {
          m.forEach((E) => {
            E.classList.toggle("active", +E.dataset.row <= x && +E.dataset.col <= T);
          }), f.textContent = x && T ? `${T} × ${x}` : "Insert Table";
        };
        d.appendChild(u), d.appendChild(f);
        let _ = !1;
        const g = c(h, "click", (x) => {
          x.stopPropagation(), _ = !_, d.style.display = _ ? "" : "none", p.style.transform = _ ? "rotate(90deg)" : "", this._reposition();
        });
        this._menuDisposers.push(g);
        const w = c(u, "mousemove", (x) => {
          const T = x.target.closest("[data-row]");
          T && v(+T.dataset.row, +T.dataset.col);
        }), N = c(u, "mouseleave", () => v(0, 0)), R = c(u, "click", (x) => {
          const T = x.target.closest("[data-row]");
          if (!T) return;
          const E = +T.dataset.row, b = +T.dataset.col, I = this.context.layoutInfo && this.context.layoutInfo.editable;
          if (I && this._savedRange) {
            I.focus();
            const S = window.getSelection();
            S.removeAllRanges(), S.addRange(this._savedRange.cloneRange());
          }
          this.hide(), this.context.invoke("editor.insertTable", b, E);
        });
        this._menuDisposers.push(w, N, R), r.appendChild(h), r.appendChild(d), this.el.appendChild(r);
        return;
      }
      const i = a("button", { type: "button", class: "asn-context-item", "data-name": e.name || "" });
      if ((typeof e.disabled == "function" ? e.disabled(this.context) : e.disabled) && (i.disabled = !0), e.icon) {
        const n = a("span", { class: "asn-context-icon", "aria-hidden": "true" });
        n.innerHTML = e.icon, i.appendChild(n);
      }
      i.appendChild(a("span", { class: "asn-context-label" }, [e.label || e.name]));
      const o = c(i, "click", (n) => {
        n.stopPropagation(), this.hide();
        try {
          e.action(this.context);
        } catch (l) {
          console.error(l);
        }
      });
      this._menuDisposers.push(o), this.el.appendChild(i);
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
    const i = t !== void 0 ? t : this._lastX, o = e !== void 0 ? e : this._lastY, n = this.el.getBoundingClientRect();
    let l = i, r = o;
    l + n.width > window.innerWidth && (l = window.innerWidth - n.width - 8), r + n.height > window.innerHeight && (r = window.innerHeight - n.height - 8), this.el.style.left = `${l}px`, this.el.style.top = `${r}px`;
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
    const o = window.getComputedStyle(i), n = this._findExplicitStyle(i, e, "fontFamily"), l = this._findExplicitStyle(i, e, "fontSize");
    this._copiedFormat = {
      bold: parseInt(o.fontWeight, 10) >= 700,
      italic: o.fontStyle === "italic" || o.fontStyle === "oblique",
      underline: (o.textDecorationLine || "").includes("underline"),
      strikethrough: (o.textDecorationLine || "").includes("line-through"),
      fontFamily: n,
      fontSize: l,
      color: this._isDefaultColor(o.color) ? null : o.color,
      backgroundColor: o.backgroundColor
    };
  }
  /** Walk up the tree looking for a property explicitly set in inline style. Returns null if only inherited. */
  _findExplicitStyle(t, e, i) {
    let o = t;
    for (; o && o !== e && o !== document.body; ) {
      if (o.style && o.style[i]) return o.style[i];
      if (o.nodeName === "FONT") {
        if (i === "fontFamily" && o.getAttribute("face")) return o.getAttribute("face");
        if (i === "fontSize" && o.getAttribute("size"))
          return null;
      }
      o = o.parentElement;
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
    if (i.removeAllRanges(), i.addRange(this._savedRange.cloneRange()), document.execCommand("removeFormat"), t.bold && document.execCommand("bold"), t.italic && document.execCommand("italic"), t.underline && document.execCommand("underline"), t.strikethrough && document.execCommand("strikeThrough"), t.color && document.execCommand("foreColor", !1, t.color), ((n) => !n || n === "rgba(0, 0, 0, 0)" || n === "transparent")(t.backgroundColor) || document.execCommand("hiliteColor", !1, t.backgroundColor), t.fontSize) {
      const n = `fs-${Date.now()}`;
      document.execCommand("fontSize", !1, "7"), e.querySelectorAll('font[size="7"]').forEach((l) => l.setAttribute("data-asn-tmp", n)), e.querySelectorAll(`[data-asn-tmp="${n}"]`).forEach((l) => {
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
    const i = e.getRangeAt(0), o = i.commonAncestorContainer, n = o.nodeType === Node.TEXT_NODE ? o.parentElement : o, l = document.createNodeIterator(n, NodeFilter.SHOW_ELEMENT);
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
class ni {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(t, e = {}) {
    this.targetEl = t, this.options = st(kt, e), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: t, editable: e } = ve(this.targetEl, this.options);
    this.layoutInfo.container = t, this.layoutInfo.editable = e, this._registerModules();
    const i = this._modules.get("toolbar");
    i && i.el && (t.insertBefore(i.el, e), this.layoutInfo.toolbar = i.el);
    const o = this._modules.get("statusbar");
    return o && o.el && (t.appendChild(o.el), this.layoutInfo.statusbar = o.el), this._bindEditorEvents(e), this.options.focus && e.focus(), this._alive = !0, this.invoke("toolbar.refresh"), this;
  }
  _registerModules() {
    const t = (e, i) => {
      const o = new i(this);
      o.initialize(), this._modules.set(e, o);
    };
    t("editor", Te), t("toolbar", Ie), t("statusbar", Ee), t("clipboard", Be), t("contextMenu", oi), t("placeholder", Le), t("codeview", Se), t("fullscreen", Me), t("linkDialog", Ae), t("imageDialog", He), t("videoDialog", Re), t("imageResizer", Ne), t("videoResizer", Pe), t("linkTooltip", De), t("imageTooltip", Ue), t("videoTooltip", Ye), t("tableTooltip", Ge), t("codeTooltip", Je), t("iconDialog", ii);
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
    const [i, o] = t.split("."), n = this._modules.get(i);
    if (n && typeof n[o] == "function")
      return n[o](...e);
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
    const o = i.indexOf(e);
    o !== -1 && i.splice(o, 1);
  }
  /**
   * Triggers an editor event.
   * @param {string} eventName
   * @param {...*} args
   */
  triggerEvent(t, ...e) {
    (this._listeners.get(t) || []).forEach((n) => n(...e));
    const o = "on" + t.charAt(0).toUpperCase() + t.slice(1);
    typeof this.options[o] == "function" && this.options[o](...e);
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
function Ni(s) {
  return s[s.length - 1];
}
function ji(s) {
  return s[0];
}
function Pi(s, t = 1) {
  return s.slice(0, s.length - t);
}
function $i(s, t = 1) {
  return s.slice(t);
}
function Oi(s) {
  return s.reduce((t, e) => t.concat(e), []);
}
function Di(s) {
  return [...new Set(s)];
}
function Fi(s, t) {
  const e = [];
  for (let i = 0; i < s.length; i += t)
    e.push(s.slice(i, i + t));
  return e;
}
function Wi(s, t) {
  return s.reduce((e, i) => {
    const o = t(i);
    return e[o] || (e[o] = []), e[o].push(i), e;
  }, {});
}
function Ui(s, t) {
  return s.every(t);
}
function Vi(s, t) {
  return s.some(t);
}
const $ = navigator.userAgent, qi = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test($),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test($),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test($),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test($),
  /** True if running on macOS */
  isMac: /Macintosh/.test($),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test($),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test($) ? "metaKey" : "ctrlKey"
}, W = /* @__PURE__ */ new WeakMap(), Yi = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(s, t = {}) {
    const i = it(s).map((o) => {
      if (W.has(o)) return W.get(o);
      const n = new ni(o, t);
      return n.initialize(), W.set(o, n), n;
    });
    return i.length === 1 ? i[0] : i;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(s) {
    it(s).forEach((t) => {
      const e = W.get(t);
      e && (e.destroy(), W.delete(t));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(s) {
    const t = typeof s == "string" ? document.querySelector(s) : s;
    return t && W.get(t) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: kt,
  /** Library version */
  version: "1.0.0"
};
function it(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : s instanceof Element ? [s] : s instanceof NodeList || Array.isArray(s) ? Array.from(s) : [];
}
export {
  ni as Context,
  Rt as ELEMENT_NODE,
  zt as TEXT_NODE,
  Q as WrappedRange,
  Ui as all,
  vi as ancestors,
  Vi as any,
  wi as children,
  Fi as chunk,
  li as clamp,
  G as closest,
  tt as closestPara,
  Hi as collapsedRange,
  ri as compose,
  a as createElement,
  et as currentRange,
  Ht as debounce,
  Yi as default,
  kt as defaultOptions,
  qi as env,
  ji as first,
  Oi as flatten,
  nt as fromNativeRange,
  Wi as groupBy,
  ci as identity,
  Pi as initial,
  Ii as insertAfter,
  _i as isAnchor,
  $t as isEditable,
  A as isElement,
  Bi as isEmpty,
  pi as isFunction,
  yi as isImage,
  gi as isInline,
  Mi as isInsideEditable,
  q as isKey,
  Pt as isLi,
  fi as isList,
  O as isModifier,
  hi as isNil,
  jt as isPara,
  K as isPlainObject,
  Ri as isSelectionInside,
  di as isString,
  mi as isTable,
  ot as isText,
  Nt as isVoid,
  X as key,
  Ni as last,
  st as mergeDeep,
  xi as nextElement,
  Ei as nodeValue,
  c as on,
  Li as outerHtml,
  Si as placeCaret,
  bi as prevElement,
  Ai as rangeFromElement,
  ui as rect2bnd,
  Ci as remove,
  zi as splitText,
  $i as tail,
  ai as throttle,
  Di as unique,
  ki as unwrap,
  Y as withSavedRange,
  Ti as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
