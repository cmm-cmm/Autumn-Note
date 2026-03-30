function mi(s, e, t) {
  return Math.min(Math.max(s, e), t);
}
function ze(s, e) {
  let t;
  return function(...i) {
    clearTimeout(t), t = setTimeout(() => s.apply(this, i), e);
  };
}
function fi(s, e) {
  let t = 0;
  return function(...i) {
    const o = Date.now();
    if (o - t >= e)
      return t = o, s.apply(this, i);
  };
}
function gi(...s) {
  return (e) => s.reduceRight((t, i) => i(t), e);
}
function yi(s) {
  return s;
}
function _i(s) {
  return s == null;
}
function bi(s) {
  return typeof s == "string";
}
function vi(s) {
  return typeof s == "function";
}
function ne(s, e) {
  const t = {};
  for (const i of Object.keys(s))
    t[i] = Array.isArray(s[i]) ? [...s[i]] : s[i];
  if (K(s) && K(e))
    for (const i of Object.keys(e))
      K(e[i]) ? i in s ? t[i] = ne(s[i], e[i]) : t[i] = e[i] : Array.isArray(e[i]) ? t[i] = [...e[i]] : t[i] = e[i];
  return t;
}
function K(s) {
  return s !== null && typeof s == "object" && !Array.isArray(s);
}
function wi(s) {
  return s ? {
    top: Math.round(s.top),
    left: Math.round(s.left),
    width: Math.round(s.width),
    height: Math.round(s.height),
    bottom: Math.round(s.bottom),
    right: Math.round(s.right)
  } : null;
}
const Ne = 1, He = 3, S = (s) => s && s.nodeType === Ne, le = (s) => s && s.nodeType === He, Pe = (s) => S(s) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(s.nodeName), De = (s) => S(s) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(s.nodeName), Oe = (s) => S(s) && /^(li)$/i.test(s.nodeName), xi = (s) => S(s) && /^(ul|ol)$/i.test(s.nodeName), ki = (s) => S(s) && s.nodeName.toUpperCase() === "TABLE", Ci = (s) => S(s) && /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(s.nodeName), $e = (s) => S(s) && s.isContentEditable, Ti = (s) => S(s) && s.nodeName.toUpperCase() === "A", Ii = (s) => S(s) && s.nodeName.toUpperCase() === "IMG";
function Q(s, e, t) {
  let i = s;
  for (; i && i !== t; ) {
    if (e(i)) return i;
    i = i.parentNode;
  }
  return null;
}
function te(s, e) {
  return Q(s, De, e);
}
function Ei(s, e) {
  const t = [];
  let i = s.parentNode;
  for (; i && i !== e; )
    t.push(i), i = i.parentNode;
  return t;
}
function Bi(s) {
  return Array.from(s.childNodes);
}
function Li(s) {
  let e = s.previousSibling;
  for (; e && !S(e); )
    e = e.previousSibling;
  return e;
}
function Ai(s) {
  let e = s.nextSibling;
  for (; e && !S(e); )
    e = e.nextSibling;
  return e;
}
function r(s, e = {}, t = []) {
  const i = document.createElement(s);
  for (const [o, n] of Object.entries(e))
    i.setAttribute(o, n);
  for (const o of t)
    typeof o == "string" ? i.appendChild(document.createTextNode(o)) : i.appendChild(o);
  return i;
}
function Si(s) {
  s && s.parentNode && s.parentNode.removeChild(s);
}
function ji(s) {
  const e = s.parentNode;
  if (e) {
    for (; s.firstChild; )
      e.insertBefore(s.firstChild, s);
    e.removeChild(s);
  }
}
function Mi(s, e) {
  return s.parentNode.insertBefore(e, s), e.appendChild(s), e;
}
function Ri(s, e) {
  e.nextSibling ? e.parentNode.insertBefore(s, e.nextSibling) : e.parentNode.appendChild(s);
}
function zi(s) {
  return le(s) ? s.nodeValue : s.textContent || "";
}
function Ni(s) {
  return le(s) ? !s.nodeValue : Pe(s) ? !1 : !s.textContent.trim() && !s.querySelector("img, video, hr, table");
}
function Hi(s) {
  return s.outerHTML;
}
function Pi(s) {
  const e = document.createRange();
  e.selectNodeContents(s), e.collapse(!1);
  const t = window.getSelection();
  t && (t.removeAllRanges(), t.addRange(e));
}
function Di(s) {
  return !!Q(s, $e);
}
function h(s, e, t, i) {
  return s.addEventListener(e, t, i), () => s.removeEventListener(e, t, i);
}
class J {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(e, t, i, o) {
    this.sc = e, this.so = t, this.ec = i, this.eo = o;
  }
  /** @returns {boolean} */
  isCollapsed() {
    return this.sc === this.ec && this.so === this.eo;
  }
  /** @returns {Range} */
  toNativeRange() {
    const e = document.createRange();
    try {
      e.setStart(this.sc, this.so), e.setEnd(this.ec, this.eo);
    } catch {
    }
    return e;
  }
  /**
   * Select this wrapped range in the window.
   */
  select() {
    const e = window.getSelection();
    e && (e.removeAllRanges(), e.addRange(this.toNativeRange()));
  }
  /**
   * Returns the common ancestor element of this range.
   * @returns {Element|null}
   */
  commonAncestor() {
    const t = this.toNativeRange().commonAncestorContainer;
    return S(t) ? t : t.parentElement;
  }
  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(e) {
    return Q(this.sc, (t) => S(t) && t !== e, e);
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
    const e = this.toNativeRange().getClientRects();
    return e.length > 0 ? e[e.length - 1] : null;
  }
  /**
   * Inserts a node at the start of this range.
   * @param {Node} node
   */
  insertNode(e) {
    this.toNativeRange().insertNode(e);
  }
  /**
   * Replaces the range contents with the given HTML string.
   * @param {string} html
   */
  pasteHTML(e) {
    const t = this.toNativeRange();
    t.deleteContents();
    const i = document.createRange().createContextualFragment(e);
    t.insertNode(i);
  }
}
function ae(s) {
  return new J(
    s.startContainer,
    s.startOffset,
    s.endContainer,
    s.endOffset
  );
}
function ie(s) {
  const e = window.getSelection();
  if (!e || e.rangeCount === 0) return null;
  const t = e.getRangeAt(0);
  return s && !s.contains(t.commonAncestorContainer) ? null : ae(t);
}
function Oi(s) {
  return new J(s, 0, s, s.childNodes.length);
}
function $i(s, e = 0) {
  return new J(s, e, s, e);
}
function Fi(s) {
  const e = window.getSelection();
  return !e || e.rangeCount === 0 ? !1 : s.contains(e.getRangeAt(0).commonAncestorContainer);
}
function U(s) {
  const e = window.getSelection();
  if (!e || e.rangeCount === 0) {
    s(null);
    return;
  }
  const t = e.getRangeAt(0).cloneRange();
  s(ae(t)), e.removeAllRanges(), e.addRange(t);
}
function Wi(s, e) {
  const t = s.splitText(e);
  return [s, t];
}
function w(s, e = null) {
  return document.execCommand(s, !1, e);
}
const re = () => w("bold"), ce = () => w("italic"), he = () => w("underline"), de = () => w("strikeThrough"), pe = () => w("superscript"), ue = () => w("subscript"), me = (s) => w("foreColor", s), fe = (s) => w("hiliteColor", s), ge = (s) => w("fontName", s);
function Fe(s, e = document) {
  w("fontSize", "7"), e.querySelectorAll('font[size="7"]').forEach((t) => {
    const i = document.createElement("span");
    for (i.style.fontSize = s, t.parentNode.insertBefore(i, t); t.firstChild; ) i.appendChild(t.firstChild);
    t.parentNode.removeChild(t);
  });
}
const ye = (s) => w("formatBlock", `<${s}>`), _e = () => w("justifyLeft"), be = () => w("justifyCenter"), ve = () => w("justifyRight"), we = () => w("justifyFull"), xe = () => w("indent"), ke = () => w("outdent"), Ce = () => w("insertUnorderedList"), Te = () => w("insertOrderedList");
function We(s, e) {
  const t = document.createElement("table");
  t.style.borderCollapse = "collapse", t.style.width = "100%";
  const i = document.createElement("tbody");
  for (let o = 0; o < s; o++) {
    const n = document.createElement("tr");
    for (let l = 0; l < e; l++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.style.minWidth = "40px", a.innerHTML = "&#8203;", n.appendChild(a);
    }
    i.appendChild(n);
  }
  t.appendChild(i), w("insertHTML", t.outerHTML);
}
function Ue(s) {
  const e = window.getSelection();
  if (!e || e.rangeCount === 0) return;
  const t = e.getRangeAt(0), i = /* @__PURE__ */ new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "TD", "TH"]), o = (c) => {
    let d = c instanceof Element ? c : c.parentElement;
    for (; d; ) {
      if (i.has(d.tagName)) return d;
      d = d.parentElement;
    }
    return null;
  };
  if (t.collapsed) {
    const c = o(t.startContainer);
    c && (c.style.lineHeight = s);
    return;
  }
  const n = /* @__PURE__ */ new Set(), l = document.createNodeIterator(t.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
  let a;
  for (; a = l.nextNode(); )
    if (t.intersectsNode(a)) {
      const c = o(a);
      c && n.add(c);
    }
  if (n.size === 0) {
    const c = o(t.commonAncestorContainer);
    c && n.add(c);
  }
  n.forEach((c) => {
    c.style.lineHeight = s;
  });
}
function C(s, e, t, i, o) {
  return { name: s, icon: e, tooltip: t, action: i, isActive: o };
}
const qe = C("bold", "bold", "Bold (Ctrl+B)", () => re(), () => document.queryCommandState("bold")), Ve = C("italic", "italic", "Italic (Ctrl+I)", () => ce(), () => document.queryCommandState("italic")), Ye = C("underline", "underline", "Underline (Ctrl+U)", () => he(), () => document.queryCommandState("underline")), Xe = C("strikethrough", "strikethrough", "Strikethrough", () => de(), () => document.queryCommandState("strikeThrough")), Ke = C("superscript", "superscript", "Superscript", () => pe(), () => document.queryCommandState("superscript")), Ge = C("subscript", "subscript", "Subscript", () => ue(), () => document.queryCommandState("subscript")), Qe = C("alignLeft", "align-left", "Align Left", () => _e()), Je = C("alignCenter", "align-center", "Align Center", () => be()), Ze = C("alignRight", "align-right", "Align Right", () => ve()), et = C("alignJustify", "align-justify", "Justify", () => we()), tt = C("ul", "list-ul", "Unordered List", () => Ce()), it = C("ol", "list-ol", "Ordered List", () => Te()), st = C("indent", "indent", "Indent", () => xe()), ot = C("outdent", "outdent", "Outdent", () => ke()), nt = C("undo", "undo", "Undo (Ctrl+Z)", (s) => s.invoke("editor.undo")), lt = C("redo", "redo", "Redo (Ctrl+Y)", (s) => s.invoke("editor.redo")), at = C("hr", "minus", "Horizontal Rule", () => w("insertHorizontalRule")), rt = C("link", "link", "Insert Link", (s) => s.invoke("linkDialog.show")), ct = C("image", "image", "Insert Image", (s) => s.invoke("imageDialog.show")), ht = C("video", "video", "Insert Video", (s) => s.invoke("videoDialog.show")), dt = C("emoji", "emoji", "Insert Emoji", (s) => s.invoke("emojiDialog.show")), pt = C("icon", "icon", "Insert FA Icon", (s) => s.invoke("iconDialog.show")), ut = {
  name: "table",
  type: "grid",
  icon: "table",
  tooltip: "Insert Table",
  action: (s, e, t) => {
    We(e, t), s.invoke("editor.afterCommand");
  }
}, mt = {
  name: "fontFamily",
  type: "select",
  tooltip: "Font Family",
  action: (s, e) => ge(e),
  getValue: () => {
    try {
      return document.queryCommandValue("fontName") || "";
    } catch {
      return "";
    }
  }
}, ft = {
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
  action: (s, e) => ye(e),
  getValue: () => {
    try {
      const s = document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
      return s === "div" ? "p" : s || "p";
    } catch {
      return "";
    }
  }
}, gt = {
  name: "lineHeight",
  type: "select",
  tooltip: "Line Height",
  placeholder: "↕ Line",
  selectClass: "asn-select-narrow",
  items: ["1.0", "1.15", "1.5", "1.75", "2.0", "2.5", "3.0"],
  action: (s, e) => Ue(e),
  getValue: () => {
    try {
      const s = window.getSelection();
      if (!s || !s.rangeCount) return "";
      const e = /* @__PURE__ */ new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "TD", "TH"]);
      let t = s.getRangeAt(0).startContainer;
      for (t.nodeType === 3 && (t = t.parentElement); t && !e.has(t.tagName); ) t = t.parentElement;
      return t && t.style.lineHeight || "";
    } catch {
      return "";
    }
  }
}, yt = C("codeview", "code", "HTML Code View", (s) => s.invoke("codeview.toggle"), (s) => s.invoke("codeview.isActive")), _t = C("fullscreen", "expand", "Fullscreen", (s) => s.invoke("fullscreen.toggle"), (s) => s.invoke("fullscreen.isActive")), bt = {
  name: "foreColor",
  type: "colorpicker",
  icon: "foreColor",
  tooltip: "Text Color",
  defaultColor: "#e11d48",
  action: (s, e) => me(e)
}, vt = {
  name: "backColor",
  type: "colorpicker",
  icon: "backColor",
  tooltip: "Highlight Color",
  defaultColor: "#fbbf24",
  action: (s, e) => fe(e)
}, wt = [
  [ft, mt, gt],
  [nt, lt],
  [qe, Ve, Ye, Xe],
  [Ke, Ge],
  [bt, vt],
  [Qe, Je, Ze, et],
  [tt, it, st, ot],
  [at, rt, ct, ht, ut, dt, pt],
  [yt, _t]
], Ie = {
  placeholder: "",
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: !1,
  resizeable: !0,
  toolbar: wt,
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
}, xt = ["script", "style", "iframe", "object", "embed", "form", "input", "button"], kt = ["href", "src", "action", "formaction"];
function W(s) {
  const e = new DOMParser().parseFromString(`<body>${s || ""}</body>`, "text/html");
  return xt.forEach((t) => {
    e.querySelectorAll(t).forEach((i) => i.remove());
  }), e.querySelectorAll("*").forEach((t) => {
    Array.from(t.attributes).forEach((i) => {
      if (i.name.startsWith("on")) {
        t.removeAttribute(i.name);
        return;
      }
      if (kt.includes(i.name)) {
        const o = i.value.trim();
        if (/^(javascript|vbscript):/i.test(o)) {
          t.removeAttribute(i.name);
          return;
        }
        /^data:/i.test(o) && !(i.name === "src" && t.tagName === "IMG") && t.removeAttribute(i.name);
      }
    });
  }), e.body.innerHTML;
}
function se(s, { allowData: e = !1 } = {}) {
  const t = (s || "").trim();
  return /^(javascript|vbscript):/i.test(t) || !e && /^data:/i.test(t) ? null : s;
}
function Ct(s, e) {
  const t = r("div", { class: "asn-container" }), i = r("div", {
    class: "asn-editable",
    contenteditable: "true",
    spellcheck: "true",
    "aria-multiline": "true",
    "aria-label": "Rich text editor",
    role: "textbox"
  });
  s.tagName === "TEXTAREA" ? i.innerHTML = W((s.value || "").trim()) : i.innerHTML = W((s.innerHTML || "").trim());
  const o = e.defaultFontFamily || e.fontFamilies && e.fontFamilies[0];
  return o && (i.style.fontFamily = o), e.height && (i.style.minHeight = `${e.height}px`), e.minHeight && (i.style.minHeight = `${e.minHeight}px`), e.maxHeight && (i.style.maxHeight = `${e.maxHeight}px`), t.appendChild(i), s.style.display = "none", s.insertAdjacentElement("afterend", t), { container: t, editable: i };
}
const Tt = 100;
class It {
  /**
   * @param {HTMLElement} editable - the contenteditable element
   */
  constructor(e) {
    this.editable = e, this.stack = [], this.stackOffset = -1, this._savePoint();
  }
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  _serialize() {
    return this.editable.innerHTML;
  }
  /**
   * Serializes the current selection as character offsets from the start of
   * the editable element, so it can be restored after innerHTML replacement.
   * @returns {{ start: number, end: number }|null}
   */
  _serializeSelection() {
    const e = window.getSelection();
    if (!e || e.rangeCount === 0) return null;
    const t = e.getRangeAt(0);
    return this.editable.contains(t.startContainer) ? {
      start: this._charOffset(t.startContainer, t.startOffset),
      end: this._charOffset(t.endContainer, t.endOffset)
    } : null;
  }
  /**
   * Returns the character offset of (node, offset) from the beginning of
   * the editable's text content.
   * @param {Node} node
   * @param {number} offset
   * @returns {number}
   */
  _charOffset(e, t) {
    let i = 0;
    const o = document.createTreeWalker(this.editable, NodeFilter.SHOW_TEXT, null);
    let n;
    for (; n = o.nextNode(); ) {
      if (n === e) return i + t;
      i += n.length;
    }
    return i;
  }
  /**
   * Restores a previously serialized selection inside the editable.
   * @param {{ start: number, end: number }|null} saved
   */
  _restoreSelection(e) {
    if (!e) return;
    let t = null, i = 0, o = null, n = 0, l = 0;
    const a = document.createTreeWalker(this.editable, NodeFilter.SHOW_TEXT, null);
    let c;
    for (; c = a.nextNode(); ) {
      const d = c.length;
      if (!t && l + d >= e.start && (t = c, i = e.start - l), !o && l + d >= e.end) {
        o = c, n = e.end - l;
        break;
      }
      l += d;
    }
    if (t) {
      o || (o = t, n = i);
      try {
        const d = document.createRange();
        d.setStart(t, i), d.setEnd(o, n);
        const p = window.getSelection();
        p.removeAllRanges(), p.addRange(d);
      } catch {
      }
    }
  }
  _savePoint() {
    this.stackOffset < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.stackOffset + 1));
    const e = this._serialize(), { html: t, images: i } = this._tokenizeImages(e);
    this.stack.push({ html: t, images: i, sel: this._serializeSelection() }), this.stack.length > Tt ? this.stack.shift() : this.stackOffset++;
  }
  _restore(e) {
    e && (this.editable.innerHTML = this._detokenizeImages(e), this._restoreSelection(e.sel));
  }
  // ---------------------------------------------------------------------------
  // Base64 tokenisation — keeps snapshot strings small so that the
  // per-keystroke `recordUndo` string comparison stays fast even when the
  // editor contains large embedded images.
  // ---------------------------------------------------------------------------
  /**
   * Replaces every `data:…;base64,…` occurrence in `html` with a compact
   * token `__asn_img_0__`, `__asn_img_1__`, … and returns the tokenized
   * string together with a map from token → original data URL.
   * @param {string} html
   * @returns {{ html: string, images: Object<string,string> }}
   */
  _tokenizeImages(e) {
    const t = {};
    let i = 0;
    return { html: e.replace(/data:[^;]+;base64,[^"' >]*/g, (n) => {
      const l = `__asn_img_${i}__`;
      return t[l] = n, i++, l;
    }), images: t };
  }
  /**
   * Restores a snapshot by replacing tokens back with their data URLs.
   * @param {{ html: string, images: Object<string,string> }} point
   * @returns {string}
   */
  _detokenizeImages(e) {
    return !e.images || Object.keys(e.images).length === 0 ? e.html : e.html.replace(/__asn_img_\d+__/g, (t) => e.images[t] || t);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /**
   * Records the current editor state as a history checkpoint.
   */
  recordUndo() {
    const e = this._serialize(), { html: t } = this._tokenizeImages(e), i = this.stack[this.stackOffset];
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
function Et(s, e) {
  const t = r("table", { class: "asn-table" }), i = r("tbody");
  t.appendChild(i);
  for (let o = 0; o < e; o++) {
    const n = r("tr");
    for (let l = 0; l < s; l++) {
      const a = r("td", {}, [" "]);
      n.appendChild(a);
    }
    i.appendChild(n);
  }
  return t;
}
function Bt(s, e) {
  const t = Et(s, e);
  w("insertHTML", t.outerHTML);
}
const G = {
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
function Y(s, e) {
  return s.key === e || s.key === e.toUpperCase();
}
function D(s, e) {
  return (s.ctrlKey || s.metaKey) && Y(s, e);
}
function Lt(s, e, t = {}) {
  if (Y(s, G.TAB)) {
    const i = ie(e);
    if (!i) return !1;
    const o = te(i.sc, e);
    if (o && Oe(o))
      return s.preventDefault(), s.shiftKey ? w("outdent") : w("indent"), !0;
    if (o && o.nodeName.toUpperCase() === "PRE")
      return s.preventDefault(), w("insertText", "    "), !0;
    if (t.tabSize)
      return s.preventDefault(), w("insertText", " ".repeat(t.tabSize)), !0;
  }
  if (Y(s, G.ENTER) && !s.shiftKey) {
    const i = ie(e);
    if (!i) return !1;
    const o = te(i.sc, e);
    if (o && o.nodeName.toUpperCase() === "BLOCKQUOTE") {
      const n = i.toNativeRange();
      if (n.setStart(o, o.childNodes.length), n.toString() === "" && i.isCollapsed())
        return s.preventDefault(), w("formatBlock", "<p>"), !0;
    }
  }
  return !1;
}
class At {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this._history = null, this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    const e = this.context.layoutInfo.editable;
    return this._history = new It(e), this._bindEvents(e), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._history = null;
  }
  // ---------------------------------------------------------------------------
  // Event binding
  // ---------------------------------------------------------------------------
  _bindEvents(e) {
    const t = (l) => this._onKeydown(l), i = (l) => {
      this._isContentKey(l) && this.afterCommand();
    }, o = () => this.afterCommand(), n = () => {
      const l = window.getSelection();
      l && l.rangeCount > 0 && e.contains(l.anchorNode) && this.context.invoke("toolbar.refresh");
    };
    this._disposers.push(
      h(e, "keydown", t),
      h(e, "keyup", i),
      h(e, "input", o),
      h(document, "selectionchange", n)
    );
  }
  /**
   * Returns true for keys that modify editor content (excludes navigation,
   * modifier-only, and function keys).
   * @param {KeyboardEvent} event
   * @returns {boolean}
   */
  _isContentKey(e) {
    const { key: t } = e;
    return !([
      "Shift",
      "Control",
      "Alt",
      "Meta",
      "CapsLock",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
      "Escape"
    ].includes(t) || t.startsWith("F") && t.length <= 3 && /^F\d+$/.test(t));
  }
  _onKeydown(e) {
    const t = this.context.layoutInfo.editable;
    if (!Lt(e, t, this.options)) {
      if (D(e, "z") && !e.shiftKey) {
        e.preventDefault(), this.undo();
        return;
      }
      if (D(e, "z") && e.shiftKey || D(e, "y")) {
        e.preventDefault(), this.redo();
        return;
      }
      if (D(e, "b")) {
        e.preventDefault(), this.bold();
        return;
      }
      if (D(e, "i")) {
        e.preventDefault(), this.italic();
        return;
      }
      if (D(e, "u")) {
        e.preventDefault(), this.underline();
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
  setHTML(e) {
    this.context.layoutInfo.editable.innerHTML = W(e), this._history && this._history.reset(), this.afterCommand();
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
  setText(e) {
    this.context.layoutInfo.editable.textContent = e, this._history && this._history.reset(), this.afterCommand();
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
    re(), this.afterCommand();
  }
  italic() {
    ce(), this.afterCommand();
  }
  underline() {
    he(), this.afterCommand();
  }
  strikethrough() {
    de(), this.afterCommand();
  }
  superscript() {
    pe(), this.afterCommand();
  }
  subscript() {
    ue(), this.afterCommand();
  }
  justifyLeft() {
    _e(), this.afterCommand();
  }
  justifyCenter() {
    be(), this.afterCommand();
  }
  justifyRight() {
    ve(), this.afterCommand();
  }
  justifyFull() {
    we(), this.afterCommand();
  }
  indent() {
    xe(), this.afterCommand();
  }
  outdent() {
    ke(), this.afterCommand();
  }
  insertUL() {
    Ce(), this.afterCommand();
  }
  insertOL() {
    Te(), this.afterCommand();
  }
  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(e) {
    ye(e), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  foreColor(e) {
    me(e), this.afterCommand();
  }
  /**
   * @param {string} color
   */
  backColor(e) {
    fe(e), this.afterCommand();
  }
  /**
   * @param {string} name
   */
  fontName(e) {
    ge(e), this.afterCommand();
  }
  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(e) {
    Fe(e, this.context.layoutInfo.editable), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------
  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    w("insertHorizontalRule"), this.afterCommand();
  }
  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(e, t, i = !1) {
    const o = window.getSelection();
    if (!o || o.rangeCount === 0) return;
    const n = se(e);
    if (!n) return;
    if (o.toString().trim().length > 0) {
      if (w("createLink", n), i) {
        const a = this._getClosestAnchor();
        a && (a.setAttribute("target", "_blank"), a.setAttribute("rel", "noopener noreferrer"));
      }
    } else {
      const a = this._escapeAttr(t || n);
      w("insertHTML", `<a href="${this._escapeAttr(n)}"${i ? ' target="_blank" rel="noopener noreferrer"' : ""}>${a}</a>`);
    }
    this.afterCommand();
  }
  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    w("unlink"), this.afterCommand();
  }
  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(e, t = "") {
    const i = se(e, { allowData: !0 });
    i && (w("insertHTML", `<img src="${this._escapeAttr(i)}" alt="${this._escapeAttr(t)}" class="asn-image">`), this.afterCommand());
  }
  /**
   * Inserts a video embed (iframe or <video> element).
   * The html string is already validated/built by VideoDialog.
   * @param {string} html
   */
  insertVideo(e) {
    e && (w("insertHTML", e), this.afterCommand());
  }
  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(e, t) {
    Bt(e, t), this.afterCommand();
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _getClosestAnchor() {
    const e = window.getSelection();
    if (!e || e.rangeCount === 0) return null;
    let t = e.getRangeAt(0).startContainer;
    for (; t; ) {
      if (t.nodeName === "A") return t;
      t = t.parentNode;
    }
    return null;
  }
  /**
   * Escapes a string for safe use inside an HTML attribute value.
   * @param {string} str
   * @returns {string}
   */
  _escapeAttr(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // --- delegated to shared sanitise.js ---
}
class St {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this.el = null, this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this.el = r("div", { class: "asn-toolbar" }), this._faReady = this._detectFontAwesome(), this._buildButtons(), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildButtons() {
    (this.options.toolbar || []).forEach((t) => {
      const i = r("div", { class: "asn-btn-group" });
      t.forEach((o) => {
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
  _createGridPicker(e) {
    const o = r("div", { class: "asn-table-picker-wrap" }), l = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", a = r("button", {
      type: "button",
      class: l,
      title: e.tooltip || "",
      "data-btn": e.name,
      "aria-label": e.tooltip || e.name,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    if (this._faReady) {
      const m = this.options.fontAwesomeClass || "fas";
      a.innerHTML = `<i class="${m} fa-table" aria-hidden="true"></i>`;
    } else {
      const m = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${m} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }
    const c = r("div", {
      class: "asn-table-picker-popup",
      role: "dialog",
      "aria-label": "Select table size"
    }), d = r("div", { class: "asn-table-grid" }), p = r("div", { class: "asn-table-label" });
    p.textContent = "Insert Table";
    const u = [];
    for (let m = 1; m <= 10; m++)
      for (let _ = 1; _ <= 10; _++) {
        const I = r("div", {
          class: "asn-table-cell",
          "data-row": String(m),
          "data-col": String(_)
        });
        u.push(I), d.appendChild(I);
      }
    c.appendChild(d), c.appendChild(p);
    let f = !1;
    const g = (m, _) => {
      u.forEach((I) => {
        const R = +I.getAttribute("data-row"), N = +I.getAttribute("data-col");
        I.classList.toggle("active", R <= m && N <= _);
      }), p.textContent = m && _ ? `${m} × ${_}` : "Insert Table";
    }, y = () => {
      f = !0, c.style.display = "block", a.setAttribute("aria-expanded", "true");
    }, v = () => {
      f = !1, c.style.display = "none", a.setAttribute("aria-expanded", "false"), g(0, 0);
    }, x = h(a, "click", (m) => {
      m.stopPropagation(), f ? v() : y();
    }), k = h(d, "mouseover", (m) => {
      const _ = m.target.closest(".asn-table-cell");
      _ && g(+_.getAttribute("data-row"), +_.getAttribute("data-col"));
    }), j = h(d, "mouseleave", () => g(0, 0)), L = h(d, "click", (m) => {
      const _ = m.target.closest(".asn-table-cell");
      if (!_) return;
      const I = +_.getAttribute("data-row"), R = +_.getAttribute("data-col");
      v(), this.context.invoke("editor.focus"), e.action(this.context, I, R);
    }), b = h(document, "click", () => {
      f && v();
    });
    return this._disposers.push(x, k, j, L, b), o.appendChild(a), o.appendChild(c), o;
  }
  /**
   * Creates a split color-picker widget:
   *   [icon + strip | ▾] — left applies current color, right opens swatch popup.
   * @param {{ name: string, type: 'colorpicker', tooltip: string, defaultColor: string, action: Function }} def
   * @returns {HTMLDivElement}
   */
  _createColorPicker(e) {
    const t = [
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
    let i = e.defaultColor || "#000000";
    const o = r("div", { class: "asn-color-picker-wrap" }), l = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", a = r("button", {
      type: "button",
      class: `${l} asn-color-btn`,
      title: e.tooltip || "",
      "data-btn": e.name,
      "aria-label": e.tooltip || e.name
    }), c = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', d = e.name === "foreColor" ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${c} style="display:block"><path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${c} style="display:block"><path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/></svg>`;
    a.innerHTML = d;
    const p = r("span", { class: "asn-color-strip" });
    p.style.background = i, a.appendChild(p);
    const u = r("button", {
      type: "button",
      class: `${l} asn-color-arrow`,
      title: `Choose ${e.name === "foreColor" ? "text" : "highlight"} color`,
      "aria-haspopup": "true",
      "aria-expanded": "false"
    });
    u.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:block"><path d="M7 10l5 5 5-5H7z"/></svg>';
    const f = r("div", { class: "asn-color-popup" });
    f.style.display = "none";
    const g = r("div", { class: "asn-color-swatches" });
    t.forEach((T) => {
      const H = r("div", { class: "asn-color-swatch", title: T, "data-color": T });
      H.style.background = T, g.appendChild(H);
    });
    const y = r("div", { class: "asn-color-custom" }), v = r("input", { type: "color", value: i, title: "Custom color" }), x = r("span", {}, ["Custom color"]);
    y.appendChild(v), y.appendChild(x), f.appendChild(g), f.appendChild(y);
    let k = !1;
    const j = () => {
      k = !0, f.style.display = "block", u.setAttribute("aria-expanded", "true");
    }, L = () => {
      k = !1, f.style.display = "none", u.setAttribute("aria-expanded", "false");
    }, b = (T) => {
      i = T, p.style.background = T, v.value = T, this.context.invoke("editor.focus"), e.action(this.context, T), this.context.invoke("editor.afterCommand"), L();
    }, m = h(a, "click", (T) => {
      T.preventDefault(), this.context.invoke("editor.focus"), e.action(this.context, i), this.context.invoke("editor.afterCommand");
    }), _ = h(u, "click", (T) => {
      T.stopPropagation(), k ? L() : j();
    }), I = h(g, "click", (T) => {
      const H = T.target.closest(".asn-color-swatch");
      H && b(H.dataset.color);
    }), R = h(v, "change", (T) => {
      b(T.target.value);
    }), N = h(document, "click", (T) => {
      k && !o.contains(T.target) && L();
    }), X = h(f, "click", (T) => T.stopPropagation());
    return this._disposers.push(m, _, I, R, N, X), o.appendChild(a), o.appendChild(u), o.appendChild(f), o;
  }
  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(e) {
    const t = e.name === "fontFamily" ? this.options.fontFamilies || [] : e.items || [], i = e.selectClass ? `asn-select ${e.selectClass}` : "asn-select", o = r("select", {
      class: i,
      title: e.tooltip || "",
      "data-btn": e.name,
      "aria-label": e.tooltip || e.name
    }), n = e.placeholder || "Font", l = r("option", { value: "" }, [n]);
    o.appendChild(l), t.forEach((c) => {
      const d = typeof c == "object" ? c.value : c, p = typeof c == "object" ? c.label : c, u = r("option", { value: d }, [p]);
      e.name === "fontFamily" && (u.style.fontFamily = d), o.appendChild(u);
    });
    const a = h(o, "change", (c) => {
      const d = c.target.value;
      d && (this.context.invoke("editor.focus"), e.action(this.context, d), this.context.invoke("editor.afterCommand"));
    });
    return this._disposers.push(a), o;
  }
  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(e) {
    const i = !!this.options.useBootstrap ? this.options.toolbarButtonClass || "btn btn-sm btn-light" : "asn-btn", o = e.className ? ` ${e.className}` : "", n = `${i}${o}`, l = r("button", {
      type: "button",
      class: n,
      title: e.tooltip || "",
      "data-btn": e.name,
      "aria-label": e.tooltip || e.name
    }), a = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"', c = (y) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${a} style="display:block">${y}</svg>`, d = /* @__PURE__ */ new Map([
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
      ["video", c('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')],
      ["table", c('<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>')],
      ["emoji", c('<circle cx="12" cy="12" r="10"/><path d="M8.5 14.5s1.5 2.5 3.5 2.5 3.5-2.5 3.5-2.5"/><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/>')],
      ["icon", c('<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><rect x="5" y="13" width="6" height="6" rx="1"/><rect x="13" y="13" width="6" height="6" rx="1"/>')],
      // View
      ["code", c('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ["expand", c('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')],
      // Color pickers
      ["foreColor", c('<path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/>')],
      ["backColor", c('<path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/>')]
    ]), p = this.options.fontAwesomeClass || "fas", u = /* @__PURE__ */ new Map([
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
      ["emoji", "fa-face-smile"],
      ["icon", "fa-icons"],
      ["foreColor", "fa-font"],
      ["backColor", "fa-highlighter"]
    ]);
    if (this._faReady) {
      const y = u.get(e.icon) || u.get(e.name) || null;
      y ? l.innerHTML = `<i class="${p} ${y}" aria-hidden="true"></i>` : d.has(e.icon) ? l.innerHTML = d.get(e.icon) : l.textContent = e.icon || e.name;
    } else
      d.has(e.icon) ? l.innerHTML = d.get(e.icon) : d.has(e.name) ? l.innerHTML = d.get(e.name) : l.textContent = e.icon || e.name;
    const g = h(l, "click", (y) => {
      y.preventDefault(), this.context.invoke("editor.focus"), e.action(this.context), this.refresh();
    });
    return this._disposers.push(g), l;
  }
  // ---------------------------------------------------------------------------
  // FontAwesome detection (run once at initialize time)
  // ---------------------------------------------------------------------------
  _detectFontAwesome() {
    if (!this.options.useFontAwesome) return !1;
    if (document.querySelector(".fa, .fas, .far, .fal, .fab, .fa-solid")) return !0;
    const e = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((t) => t.href || "").join(" ");
    return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(e);
  }
  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------
  refresh() {
    if (!this.el) return;
    const e = this.options.toolbar || [], t = new Map(e.flat().map((i) => [i.name, i]));
    this.el.querySelectorAll("button[data-btn]").forEach((i) => {
      const o = t.get(i.getAttribute("data-btn"));
      o && typeof o.isActive == "function" && i.classList.toggle("active", !!o.isActive(this.context));
    }), this.el.querySelectorAll("select[data-btn]").forEach((i) => {
      const o = t.get(i.getAttribute("data-btn"));
      if (!o || typeof o.getValue != "function") return;
      let n = (o.getValue(this.context) || "").replace(/["']/g, "").trim();
      n || (n = this.options.defaultFontFamily || this.options.fontFamilies && this.options.fontFamilies[0] || "");
      const l = Array.from(i.options).find(
        (a) => a.value && a.value.toLowerCase() === n.toLowerCase()
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
class jt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this.el = null, this._disposers = [], this._wordCountEl = null, this._charCountEl = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    if (this.el = r("div", { class: "asn-statusbar" }), this.options.resizeable !== !1) {
      const t = r("div", {
        class: "asn-resize-handle",
        title: "Resize editor",
        "aria-hidden": "true"
      });
      this._bindResize(t), this.el.appendChild(t);
    }
    this._wordCountEl = r("span", { class: "asn-word-count" }), this._charCountEl = r("span", { class: "asn-char-count" });
    const e = r("div", { class: "asn-status-info" });
    return e.appendChild(this._wordCountEl), e.appendChild(this._charCountEl), this.el.appendChild(e), this._bindContentEvents(), this.update(), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dragDisposers && (this._dragDisposers.forEach((e) => e()), this._dragDisposers = null), this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  // ---------------------------------------------------------------------------
  // Resize logic
  // ---------------------------------------------------------------------------
  _bindResize(e) {
    let t = 0, i = 0;
    const o = this.context.layoutInfo.container, n = (d) => {
      const p = d.clientY - t, u = Math.max(120, i + p);
      o.style.height = `${u}px`;
    }, l = () => {
      document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", l), this._dragDisposers = null;
    }, c = h(e, "mousedown", (d) => {
      t = d.clientY, i = o.offsetHeight, document.addEventListener("mousemove", n), document.addEventListener("mouseup", l), this._dragDisposers = [
        () => document.removeEventListener("mousemove", n),
        () => document.removeEventListener("mouseup", l)
      ], d.preventDefault();
    });
    this._disposers.push(c);
  }
  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------
  _bindContentEvents() {
    const e = this.context.layoutInfo.editable, t = ze(() => this.update(), 200), i = h(e, "input", t);
    this._disposers.push(i);
  }
  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const t = this.context.layoutInfo.editable.innerText || "", i = t.trim() ? t.trim().split(/\s+/).length : 0, o = t.length;
    this._wordCountEl.textContent = `Words: ${i}`, this._charCountEl.textContent = `Chars: ${o}`;
  }
}
class Mt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this._disposers = [];
  }
  initialize() {
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "paste", (t) => this._onPaste(t)),
      h(e, "dragover", (t) => this._onDragover(t)),
      h(e, "drop", (t) => this._onDrop(t))
    ), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [];
  }
  // ---------------------------------------------------------------------------
  // Paste handler
  // ---------------------------------------------------------------------------
  _onPaste(e) {
    const t = e.clipboardData || window.clipboardData;
    if (t) {
      if (t.items) {
        const i = Array.from(t.items).filter(
          (o) => o.kind === "file" && o.type.startsWith("image/")
        );
        if (i.length > 0) {
          e.preventDefault();
          const o = i.map((n) => n.getAsFile()).filter(Boolean);
          this._insertImageFiles(o);
          return;
        }
      }
      if (this.options.pasteAsPlainText) {
        e.preventDefault();
        const o = t.getData("text/plain").split(/\r?\n/).map((n) => `<p>${this._escapeHTML(n) || "<br>"}</p>`).join("");
        w("insertHTML", o), this.context.invoke("editor.afterCommand");
        return;
      }
      if (this.options.pasteCleanHTML !== !1 && t.types.includes("text/html")) {
        e.preventDefault();
        const i = t.getData("text/html"), o = W(i);
        w("insertHTML", o), this.context.invoke("editor.afterCommand");
        return;
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Drag & drop handlers
  // ---------------------------------------------------------------------------
  _onDragover(e) {
    if (!e.dataTransfer) return;
    Array.from(e.dataTransfer.types || []).includes("Files") && (e.preventDefault(), e.dataTransfer.dropEffect = "copy");
  }
  _onDrop(e) {
    const t = e.dataTransfer;
    if (!t || !t.files || t.files.length === 0) return;
    const i = Array.from(t.files).filter((o) => o.type.startsWith("image/"));
    i.length !== 0 && (e.preventDefault(), e.stopPropagation(), this._placeCaretAtPoint(e.clientX, e.clientY), this._insertImageFiles(i));
  }
  // ---------------------------------------------------------------------------
  // Image file processing — shared by paste and drop
  // ---------------------------------------------------------------------------
  /**
   * Inserts one or more image Files into the editor.
   * Delegates to `options.onImageUpload` when provided; otherwise compresses
   * and embeds as base64.
   * @param {File[]} files
   */
  _insertImageFiles(e) {
    if (!e || e.length === 0) return;
    if (typeof this.options.onImageUpload == "function") {
      this.options.onImageUpload(e);
      return;
    }
    const t = (this.options.maxImageSize || 5) * 1024 * 1024;
    e.forEach((i) => {
      if (!i || !i.type.startsWith("image/")) return;
      if (i.size > t) {
        alert(`Image "${i.name}" is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`);
        return;
      }
      const o = i.name.replace(/\.[^.]+$/, "");
      this._compressImage(i).then((n) => {
        this.context.invoke("editor.insertImage", n, o);
      });
    });
  }
  /**
   * Compresses an image File using a Canvas.
   * - Resizes so the longest edge is at most MAX_DIM pixels.
   * - Encodes as WebP (if supported) or JPEG at quality 0.85.
   * Falls back to plain FileReader if canvas is unavailable.
   * @param {File} file
   * @returns {Promise<string>} data URL
   */
  _compressImage(e) {
    return new Promise((o) => {
      const n = URL.createObjectURL(e), l = new Image();
      l.onload = () => {
        URL.revokeObjectURL(n);
        let { width: a, height: c } = l;
        (a > 1920 || c > 1920) && (a >= c ? (c = Math.round(c * 1920 / a), a = 1920) : (a = Math.round(a * 1920 / c), c = 1920));
        const d = document.createElement("canvas");
        d.width = a, d.height = c, d.getContext("2d").drawImage(l, 0, 0, a, c);
        const u = d.toDataURL("image/webp", 0.85);
        o(u.startsWith("data:image/webp") ? u : d.toDataURL("image/jpeg", 0.85));
      }, l.onerror = () => {
        URL.revokeObjectURL(n);
        const a = new FileReader();
        a.onload = (c) => o(
          /** @type {string} */
          c.target.result
        ), a.readAsDataURL(e);
      }, l.src = n;
    });
  }
  /**
   * Positions the caret at the given viewport coordinates.
   * Supports both Chrome (caretRangeFromPoint) and Firefox (caretPositionFromPoint).
   * @param {number} x
   * @param {number} y
   */
  _placeCaretAtPoint(e, t) {
    let i;
    if (document.caretRangeFromPoint)
      i = document.caretRangeFromPoint(e, t);
    else if (document.caretPositionFromPoint) {
      const n = document.caretPositionFromPoint(e, t);
      n && (i = document.createRange(), i.setStart(n.offsetNode, n.offset), i.collapse(!0));
    }
    if (!i) return;
    const o = window.getSelection();
    o && (o.removeAllRanges(), o.addRange(i));
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  /**
   * Escapes HTML special characters.
   * @param {string} str
   * @returns {string}
   */
  _escapeHTML(e) {
    return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
class Rt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this._disposers = [];
  }
  initialize() {
    const e = this.context.layoutInfo.editable, t = this.options.placeholder || "";
    t && (e.dataset.placeholder = t);
    const i = () => this._update(), o = h(e, "input", i), n = h(e, "focus", i), l = h(e, "blur", i);
    return this._disposers.push(o, n, l), this._update(), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [];
  }
  _update() {
    const e = this.context.layoutInfo.editable, t = !e.textContent.trim() && !e.querySelector("img, table, hr");
    e.classList.toggle("asn-placeholder", t);
  }
}
class zt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this._active = !1, this._textarea = null, this._disposers = [];
  }
  initialize() {
    return this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._textarea && this._textarea.parentNode && this._textarea.parentNode.removeChild(this._textarea), this._textarea = null;
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
    const { editable: e } = this.context.layoutInfo, t = e.innerHTML;
    this._textarea = r("textarea", {
      class: "asn-codeview",
      spellcheck: "false",
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off"
    }), this._textarea.value = this._prettyPrint(t), e.style.display = "none", e.parentNode.insertBefore(this._textarea, e.nextSibling), this._active = !0, this.context.invoke("toolbar.refresh");
  }
  deactivate() {
    if (!this._active || !this._textarea) return;
    const { editable: e } = this.context.layoutInfo;
    e.innerHTML = W(this._textarea.value), this._textarea.parentNode.removeChild(this._textarea), this._textarea = null, e.style.display = "", this._active = !1, this.context.invoke("toolbar.refresh"), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  /**
   * Very simple HTML pretty-printer (indent nested tags).
   * @param {string} html
   * @returns {string}
   */
  _prettyPrint(e) {
    let t = 0;
    return e.replace(/>\s*</g, `>
<`).split(`
`).map((i) => {
      const o = i.trim();
      if (!o) return "";
      /^<\//.test(o) && (t = Math.max(0, t - 1));
      const n = "  ".repeat(t) + o;
      return /^<[^/][^>]*[^/]>/.test(o) && !/^<(br|hr|img|input|link|meta)/.test(o) && t++, n;
    }).filter(Boolean).join(`
`);
  }
  /**
   * Basic HTML sanitiser — removes script/dangerous elements.
   * @param {string} html
   * @returns {string}
   */
  _sanitise(e) {
    const i = new DOMParser().parseFromString(`<body>${e}</body>`, "text/html");
    return ["script", "style", "iframe", "object", "embed", "form"].forEach((o) => {
      i.querySelectorAll(o).forEach((n) => n.remove());
    }), i.querySelectorAll("*").forEach((o) => {
      Array.from(o.attributes).forEach((n) => {
        n.name.startsWith("on") && o.removeAttribute(n.name), ["href", "src"].includes(n.name) && /^\s*javascript:/i.test(n.value) && o.removeAttribute(n.name);
      });
    }), i.body.innerHTML;
  }
}
class Nt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this._active = !1, this._disposers = [], this._prevHeight = "";
  }
  initialize() {
    const e = h(document, "keydown", (t) => {
      this._active && Y(t, G.ESCAPE) && this.deactivate();
    });
    return this._disposers.push(e), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._active && this.deactivate();
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
    const e = this.context.layoutInfo.container;
    this._prevHeight = e.style.height, e.classList.add("asn-fullscreen"), e.style.height = "", document.body.style.overflow = "hidden", this._active = !0, this.context.invoke("toolbar.refresh");
  }
  deactivate() {
    if (!this._active) return;
    const e = this.context.layoutInfo.container;
    e.classList.remove("asn-fullscreen"), e.style.height = this._prevHeight, document.body.style.overflow = "", this._active = !1, this.context.invoke("toolbar.refresh");
  }
}
class Ht {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this._dialog = null, this._disposers = [], this._savedRange = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /**
   * Opens the link dialog.
   * Pre-fills with the currently selected link if present.
   */
  show() {
    U((e) => {
      this._savedRange = e;
    }), this._prefill(), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const e = r("div", { class: "asn-dialog-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Insert link" }), t = r("div", { class: "asn-dialog-box" }), i = r("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Link";
    const o = r("label", { class: "asn-label" });
    o.textContent = "URL";
    const n = r("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://",
      id: "asn-link-url",
      name: "url",
      autocomplete: "off"
    });
    this._urlInput = n;
    const l = r("label", { class: "asn-label" });
    l.textContent = "Display Text";
    const a = r("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Link text",
      id: "asn-link-text",
      name: "linkText",
      autocomplete: "off"
    });
    this._textInput = a;
    const c = r("label", { class: "asn-label asn-label-inline" }), d = r("input", {
      type: "checkbox",
      id: "asn-link-newtab",
      name: "openInNewTab"
    });
    this._tabCheckbox = d, c.appendChild(d), c.appendChild(document.createTextNode(" Open in new tab"));
    const p = r("div", { class: "asn-dialog-actions" }), u = r("button", { type: "button", class: "asn-btn asn-btn-primary" });
    u.textContent = "Insert";
    const f = r("button", { type: "button", class: "asn-btn" });
    f.textContent = "Cancel", p.appendChild(u), p.appendChild(f), t.append(i, o, n, l, a, c, p), e.appendChild(t);
    const g = h(u, "click", () => this._onInsert()), y = h(f, "click", () => this._close()), v = h(e, "click", (x) => {
      x.target === e && this._close();
    });
    return this._disposers.push(g, y, v), e;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _prefill() {
    const e = window.getSelection();
    let t = null;
    if (e && e.rangeCount > 0) {
      let i = e.getRangeAt(0).startContainer;
      for (; i; ) {
        if (i.nodeName === "A") {
          t = i;
          break;
        }
        i = i.parentNode;
      }
    }
    t ? (this._urlInput.value = t.getAttribute("href") || "", this._textInput.value = t.textContent || "", this._tabCheckbox.checked = t.getAttribute("target") === "_blank") : (this._urlInput.value = "", this._textInput.value = e ? e.toString() : "", this._tabCheckbox.checked = !1);
  }
  _onInsert() {
    const e = this._urlInput.value.trim(), t = this._textInput.value.trim(), i = this._tabCheckbox.checked;
    if (!e) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertLink", e, t, i), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
class Pt {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this.options = e.options, this._dialog = null, this._disposers = [], this._savedRange = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  show() {
    U((e) => {
      this._savedRange = e;
    }), this._urlInput.value = "", this._altInput.value = "", this._fileInput && (this._fileInput.value = ""), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const e = r("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert image"
    }), t = r("div", { class: "asn-dialog-box" }), i = r("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Image";
    const o = r("label", { class: "asn-label" });
    o.textContent = "Image URL";
    const n = r("input", {
      type: "url",
      class: "asn-input",
      placeholder: "https://example.com/image.png",
      autocomplete: "off"
    });
    this._urlInput = n;
    const l = r("label", { class: "asn-label" });
    l.textContent = "Alt Text";
    const a = r("input", {
      type: "text",
      class: "asn-input",
      placeholder: "Describe the image",
      autocomplete: "off"
    });
    if (this._altInput = a, this.options.allowImageUpload !== !1) {
      const y = r("label", { class: "asn-label" });
      y.textContent = "Or upload a file";
      const v = r("input", {
        type: "file",
        class: "asn-input",
        accept: "image/*"
      });
      this._fileInput = v;
      const x = h(v, "change", () => this._onFileChange());
      this._disposers.push(x), t.append(y, v);
    }
    const c = r("div", { class: "asn-dialog-actions" }), d = r("button", { type: "button", class: "asn-btn asn-btn-primary" });
    d.textContent = "Insert";
    const p = r("button", { type: "button", class: "asn-btn" });
    p.textContent = "Cancel", c.appendChild(d), c.appendChild(p), t.append(i, o, n, l, a, c), e.appendChild(t);
    const u = h(d, "click", () => this._onInsert()), f = h(p, "click", () => this._close()), g = h(e, "click", (y) => {
      y.target === e && this._close();
    });
    return this._disposers.push(u, f, g), e;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _onFileChange() {
    const e = this._fileInput && this._fileInput.files && this._fileInput.files[0];
    if (!e || !e.type.startsWith("image/")) return;
    const t = (this.options.maxImageSize || 5) * 1024 * 1024;
    if (e.size > t) {
      alert(`Image file is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`), this._fileInput.value = "";
      return;
    }
    const i = new FileReader();
    i.onload = (o) => {
      this._urlInput.value = o.target.result;
    }, i.readAsDataURL(e);
  }
  _onInsert() {
    const e = this._urlInput.value.trim(), t = this._altInput.value.trim();
    if (!e) {
      this._urlInput.focus();
      return;
    }
    this._savedRange && this._savedRange.select(), this.context.invoke("editor.insertImage", e, t), this._close();
  }
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._urlInput && this._urlInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
class Dt {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this.options = e.options, this._dialog = null, this._disposers = [], this._savedRange = null;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  show() {
    U((e) => {
      this._savedRange = e;
    }), this._urlInput.value = "", this._widthInput.value = "560", this._hintEl.textContent = "", this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const e = r("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert video"
    }), t = r("div", { class: "asn-dialog-box" }), i = r("h3", { class: "asn-dialog-title" });
    i.textContent = "Insert Video";
    const o = r("label", { class: "asn-label" });
    o.textContent = "Video URL";
    const n = r("input", {
      type: "url",
      class: "asn-input",
      placeholder: "YouTube, Vimeo, or direct .mp4 URL",
      autocomplete: "off"
    });
    this._urlInput = n;
    const l = r("p", { class: "asn-dialog-hint" });
    this._hintEl = l;
    const a = r("label", { class: "asn-label" });
    a.textContent = "Width (px)";
    const c = r("input", {
      type: "number",
      class: "asn-input",
      placeholder: "560",
      min: "80",
      max: "1920",
      value: "560"
    });
    this._widthInput = c;
    const d = r("div", { class: "asn-dialog-actions" }), p = r("button", { type: "button", class: "asn-btn asn-btn-primary" });
    p.textContent = "Insert";
    const u = r("button", { type: "button", class: "asn-btn" });
    u.textContent = "Cancel", d.appendChild(p), d.appendChild(u), t.append(i, o, n, l, a, c, d), e.appendChild(t);
    const f = h(n, "input", () => {
      const k = this._parseVideoUrl(n.value.trim());
      l.textContent = k ? `Detected: ${k.type}` : n.value ? "Unknown format — will try direct video embed" : "";
    }), g = h(p, "click", () => this._onInsert()), y = h(u, "click", () => this._close()), v = h(e, "click", (k) => {
      k.target === e && this._close();
    }), x = h(n, "keydown", (k) => {
      k.key === "Enter" && (k.preventDefault(), this._onInsert());
    });
    return this._disposers.push(f, g, y, v, x), e;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _onInsert() {
    const e = this._urlInput.value.trim(), t = Math.max(80, parseInt(this._widthInput.value, 10) || 560);
    if (!e) {
      this._urlInput.focus();
      return;
    }
    const i = this._buildEmbedHtml(e, t);
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
  _parseVideoUrl(e) {
    if (!e) return null;
    try {
      const l = new URL(e);
      if (/^javascript:/i.test(l.protocol)) return null;
    } catch {
      return null;
    }
    const t = e.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (t) return { type: "YouTube", embedUrl: `https://www.youtube.com/embed/${t[1]}` };
    const i = e.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (i) return { type: "YouTube", embedUrl: `https://www.youtube.com/embed/${i[1]}` };
    const o = e.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (o) return { type: "YouTube Shorts", embedUrl: `https://www.youtube.com/embed/${o[1]}` };
    const n = e.match(/vimeo\.com\/(\d+)/);
    return n ? { type: "Vimeo", embedUrl: `https://player.vimeo.com/video/${n[1]}` } : /\.(mp4|webm|ogg|ogv|mov)(#.*|\?.*)?$/i.test(e) ? { type: "Direct video", embedUrl: e } : null;
  }
  /**
   * Builds the HTML string to insert.
   * @param {string} url
   * @param {number} width
   * @returns {string|null}
   */
  _buildEmbedHtml(e, t) {
    const i = this._parseVideoUrl(e), o = Math.round(t * 9 / 16);
    if (i && (i.type === "YouTube" || i.type === "YouTube Shorts" || i.type === "Vimeo"))
      return `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><iframe src="${i.embedUrl}" width="${t}" height="${o}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="display:block;max-width:100%"></iframe><div class="asn-video-shield"></div></div>`;
    if (i && i.type === "Direct video")
      return `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${i.embedUrl}" width="${t}" height="${o}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>`;
    const n = (() => {
      try {
        const l = new URL(e);
        return /^javascript:/i.test(l.protocol) ? null : e;
      } catch {
        return null;
      }
    })();
    return n ? `<div class="asn-video-wrapper" style="position:relative;display:inline-block;max-width:100%"><video src="${n}" width="${t}" height="${o}" controls style="display:block;max-width:100%"></video><div class="asn-video-shield"></div></div>` : null;
  }
}
const Ot = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class $t {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._activeImg = null, this._overlay = null, this._disposers = [];
  }
  initialize() {
    this._overlay = this._buildOverlay(), document.body.appendChild(this._overlay);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "click", (t) => this._onEditorClick(t)),
      // Also select on right-click so the highlight shows before the context menu
      h(e, "contextmenu", (t) => {
        const i = t.target.closest("img");
        i && this._select(i);
      }),
      h(document, "click", (t) => this._onDocClick(t)),
      h(window, "scroll", () => this._updateOverlayPosition(), { passive: !0 }),
      h(window, "resize", () => this._updateOverlayPosition()),
      h(e, "scroll", () => this._updateOverlayPosition(), { passive: !0 })
    ), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dragDisposers && (this._dragDisposers.forEach((e) => e()), this._dragDisposers = null), this._deselect(), this._overlay && this._overlay.parentNode && this._overlay.parentNode.removeChild(this._overlay), this._overlay = null;
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
    const e = document.createElement("div");
    return e.className = "asn-image-resizer", e.style.display = "none", Ot.forEach(({ pos: t }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${t}`, i.dataset.handle = t, this._disposers.push(
        h(i, "mousedown", (o) => {
          o.preventDefault(), o.stopPropagation(), this._startResize(o, t);
        })
      ), e.appendChild(i);
    }), e;
  }
  _onEditorClick(e) {
    const t = e.target.closest("img");
    t && (e.preventDefault(), this._select(t));
  }
  _onDocClick(e) {
    this._activeImg && e.target !== this._activeImg && (this._overlay && this._overlay.contains(e.target) || e.target.closest(".asn-contextmenu") || this._deselect());
  }
  _select(e) {
    this._activeImg && this._activeImg !== e && this._activeImg.classList.remove("asn-image-selected"), this._activeImg = e, e.classList.add("asn-image-selected"), this._updateOverlayPosition(), this._overlay.style.display = "block";
  }
  _deselect() {
    this._activeImg && (this._activeImg.classList.remove("asn-image-selected"), this._activeImg = null), this._overlay && (this._overlay.style.display = "none");
  }
  _updateOverlayPosition() {
    if (!this._activeImg || !this._overlay) return;
    const e = this._activeImg.getBoundingClientRect();
    this._overlay.style.left = `${e.left}px`, this._overlay.style.top = `${e.top}px`, this._overlay.style.width = `${e.width}px`, this._overlay.style.height = `${e.height}px`;
  }
  _startResize(e, t) {
    const i = this._activeImg;
    if (!i) return;
    const o = e.clientX, n = e.clientY, l = i.offsetWidth || i.naturalWidth || 100, a = i.offsetHeight || i.naturalHeight || 100, c = l / a, d = t.length === 2, p = (f) => {
      const g = f.clientX - o, y = f.clientY - n;
      let v = l, x = a;
      t.includes("e") && (v = Math.max(20, l + g)), t.includes("w") && (v = Math.max(20, l - g)), t.includes("s") && (x = Math.max(20, a + y)), t.includes("n") && (x = Math.max(20, a - y)), d && (Math.abs(g) >= Math.abs(y) ? x = Math.max(20, Math.round(v / c)) : v = Math.max(20, Math.round(x * c))), i.style.width = `${v}px`, i.style.height = `${x}px`, this._updateOverlayPosition();
    }, u = () => {
      document.removeEventListener("mousemove", p), document.removeEventListener("mouseup", u), this._dragDisposers = null, this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", p), document.addEventListener("mouseup", u), this._dragDisposers = [
      () => document.removeEventListener("mousemove", p),
      () => document.removeEventListener("mouseup", u)
    ];
  }
}
const Ft = [
  { pos: "nw", cursor: "nw-resize" },
  { pos: "n", cursor: "n-resize" },
  { pos: "ne", cursor: "ne-resize" },
  { pos: "e", cursor: "e-resize" },
  { pos: "se", cursor: "se-resize" },
  { pos: "s", cursor: "s-resize" },
  { pos: "sw", cursor: "sw-resize" },
  { pos: "w", cursor: "w-resize" }
];
class Wt {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._activeWrapper = null, this._overlay = null, this._disposers = [];
  }
  initialize() {
    this._overlay = this._buildOverlay(), document.body.appendChild(this._overlay);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "click", (t) => this._onEditorClick(t)),
      h(e, "contextmenu", (t) => {
        const i = this._findWrapper(t.target);
        i && this._select(i);
      }),
      h(document, "click", (t) => this._onDocClick(t)),
      h(window, "scroll", () => this._updateOverlayPosition(), { passive: !0 }),
      h(window, "resize", () => this._updateOverlayPosition()),
      h(e, "scroll", () => this._updateOverlayPosition(), { passive: !0 })
    ), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dragDisposers && (this._dragDisposers.forEach((e) => e()), this._dragDisposers = null), this._deselect(), this._overlay && this._overlay.parentNode && this._overlay.parentNode.removeChild(this._overlay), this._overlay = null;
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
  _findWrapper(e) {
    if (!e || !(e instanceof Element)) return null;
    if (e.classList && e.classList.contains("asn-video-wrapper")) return e;
    const t = e.closest(".asn-video-wrapper");
    return t || null;
  }
  _buildOverlay() {
    const e = document.createElement("div");
    return e.className = "asn-video-resizer", e.style.display = "none", Ft.forEach(({ pos: t }) => {
      const i = document.createElement("div");
      i.className = `asn-resize-handle asn-resize-${t}`, i.dataset.handle = t, this._disposers.push(
        h(i, "mousedown", (o) => {
          o.preventDefault(), o.stopPropagation(), this._startResize(o, t);
        })
      ), e.appendChild(i);
    }), e;
  }
  _onEditorClick(e) {
    const t = this._findWrapper(e.target);
    t && (e.preventDefault(), this._select(t));
  }
  _onDocClick(e) {
    this._activeWrapper && (this._activeWrapper.contains(e.target) || this._overlay && this._overlay.contains(e.target) || e.target.closest(".asn-contextmenu") || this._deselect());
  }
  _select(e) {
    this._activeWrapper && this._activeWrapper !== e && this._activeWrapper.classList.remove("asn-video-selected"), this._activeWrapper = e, e.classList.add("asn-video-selected"), this._updateOverlayPosition(), this._overlay.style.display = "block";
  }
  _deselect() {
    this._activeWrapper && (this._activeWrapper.classList.remove("asn-video-selected"), this._activeWrapper = null), this._overlay && (this._overlay.style.display = "none");
  }
  _updateOverlayPosition() {
    if (!this._activeWrapper || !this._overlay) return;
    const e = this._activeWrapper.getBoundingClientRect();
    this._overlay.style.left = `${e.left}px`, this._overlay.style.top = `${e.top}px`, this._overlay.style.width = `${e.width}px`, this._overlay.style.height = `${e.height}px`;
  }
  _startResize(e, t) {
    const i = this._activeWrapper;
    if (!i) return;
    const o = i.querySelector("iframe, video"), n = e.clientX, l = e.clientY, a = i.offsetWidth || 560, c = i.offsetHeight || 315, d = a / c, p = t.length === 2, u = (g) => {
      const y = g.clientX - n, v = g.clientY - l;
      let x = a, k = c;
      t.includes("e") && (x = Math.max(80, a + y)), t.includes("w") && (x = Math.max(80, a - y)), t.includes("s") && (k = Math.max(45, c + v)), t.includes("n") && (k = Math.max(45, c - v)), p && (Math.abs(y) >= Math.abs(v) ? k = Math.max(45, Math.round(x / d)) : x = Math.max(80, Math.round(k * d))), i.style.width = `${x}px`, i.style.height = `${k}px`, o && (o.width = x, o.height = k, o.style.width = `${x}px`, o.style.height = `${k}px`), this._updateOverlayPosition();
    }, f = () => {
      document.removeEventListener("mousemove", u), document.removeEventListener("mouseup", f), this._dragDisposers = null, this.context.invoke("editor.afterCommand");
    };
    document.addEventListener("mousemove", u), document.addEventListener("mouseup", f), this._dragDisposers = [
      () => document.removeEventListener("mousemove", u),
      () => document.removeEventListener("mouseup", f)
    ];
  }
}
const q = {
  open: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  unlink: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
}, Ut = 120, qt = 200;
class Vt {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._el = null, this._activeAnchor = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      // Detect when pointer enters a link
      h(e, "mouseover", (t) => {
        const i = t.target.closest("a[href]");
        i && e.contains(i) && this._scheduleShow(i);
      }),
      // Detect when pointer leaves the editable area entirely
      h(e, "mouseout", (t) => {
        const i = t.relatedTarget;
        (!i || !e.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((e) => e()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const e = r("div", { class: "asn-link-tooltip", role: "toolbar", "aria-label": "Link actions" });
    return e.style.display = "none", this._urlLabel = r("span", { class: "asn-link-tooltip-url" }), e.appendChild(this._urlLabel), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._openBtn = this._makeBtn(q.open, "Open link", () => this._openLink()), this._copyBtn = this._makeBtn(q.copy, "Copy URL", () => this._copyLink()), this._editBtn = this._makeBtn(q.edit, "Edit link", () => this._editLink()), this._unlinkBtn = this._makeBtn(q.unlink, "Remove link", () => this._unlink()), e.appendChild(this._openBtn), e.appendChild(this._copyBtn), e.appendChild(this._editBtn), e.appendChild(this._unlinkBtn), this._disposers.push(
      h(e, "mouseenter", () => this._clearTimers()),
      h(e, "mouseleave", () => this._scheduleHide())
    ), e;
  }
  _makeBtn(e, t, i) {
    const o = r("button", { type: "button", class: "asn-link-tooltip-btn", title: t });
    return o.innerHTML = e, this._disposers.push(h(o, "click", (n) => {
      n.preventDefault(), n.stopPropagation(), i();
    })), o;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide logic
  // ---------------------------------------------------------------------------
  _scheduleShow(e) {
    this._activeAnchor === e && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeAnchor = e, this._show(e);
    }, Ut));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => {
      this._hide();
    }, qt));
  }
  _show(e) {
    const t = e.getAttribute("href") || "";
    this._urlLabel.textContent = this._truncateUrl(t), this._urlLabel.title = t, this._el.style.display = "flex", this._positionNear(e);
  }
  _hide() {
    this._el.style.display = "none", this._activeAnchor = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(e) {
    const t = e.getBoundingClientRect(), i = this._el.offsetWidth || 260, o = this._el.offsetHeight || 34, n = 6;
    let l = t.bottom + n, a = t.left;
    l + o > window.innerHeight - n && (l = t.top - o - n), a + i > window.innerWidth - n && (a = window.innerWidth - i - n), a < n && (a = n), this._el.style.top = `${l}px`, this._el.style.left = `${a}px`;
  }
  _truncateUrl(e) {
    try {
      const t = new URL(e), i = t.host + (t.pathname !== "/" ? t.pathname : "");
      return i.length > 48 ? i.slice(0, 48) + "…" : i;
    } catch {
      return e.length > 48 ? e.slice(0, 48) + "…" : e;
    }
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _openLink() {
    const e = this._activeAnchor && this._activeAnchor.getAttribute("href");
    e && window.open(e, "_blank", "noopener,noreferrer"), this._hide();
  }
  _copyLink() {
    const e = this._activeAnchor && this._activeAnchor.getAttribute("href");
    e && navigator.clipboard.writeText(e).catch(() => {
      const t = document.createElement("textarea");
      t.value = e, t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t);
    }), this._copyBtn && (this._copyBtn.classList.add("asn-link-tooltip-btn--copied"), setTimeout(() => this._copyBtn && this._copyBtn.classList.remove("asn-link-tooltip-btn--copied"), 1e3));
  }
  _editLink() {
    const e = this._activeAnchor;
    if (!e) return;
    this._hide();
    const t = window.getSelection(), i = document.createRange();
    i.selectNodeContents(e), t.removeAllRanges(), t.addRange(i), this.context.invoke("linkDialog.show");
  }
  _unlink() {
    const e = this._activeAnchor;
    if (!e) return;
    this._hide();
    const t = window.getSelection(), i = document.createRange();
    i.selectNode(e), t.removeAllRanges(), t.addRange(i), document.execCommand("unlink"), this.context.invoke("editor.afterCommand");
  }
}
const O = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteImg: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Yt = 100, Xt = 180;
class Kt {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._el = null, this._activeImg = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "mouseover", (t) => {
        const i = t.target.closest("img");
        i && e.contains(i) && this._scheduleShow(i);
      }),
      h(e, "mouseout", (t) => {
        const i = t.relatedTarget;
        (!i || !e.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      // Hide when image is deselected by clicking elsewhere
      h(document, "click", (t) => {
        this._activeImg && !this._activeImg.contains(t.target) && !this._el.contains(t.target) && this._hide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((e) => e()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const e = r("div", {
      class: "asn-link-tooltip asn-image-tooltip",
      role: "toolbar",
      "aria-label": "Image actions"
    });
    return e.style.display = "none", this._label = r("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Image", e.appendChild(this._label), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn(O.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn(O.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn(O.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn(O.floatRight, "Float Right", () => this._setFloat("right")), e.appendChild(this._floatLeftBtn), e.appendChild(this._floatNoneBtn), e.appendChild(this._alignCenterBtn), e.appendChild(this._floatRightBtn), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn(O.originalSize, "Original Size", () => this._resetSize()), e.appendChild(this._originalBtn), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn(O.deleteImg, "Delete Image", () => this._delete(), !0), e.appendChild(this._deleteBtn), this._disposers.push(
      h(e, "mouseenter", () => this._clearTimers()),
      h(e, "mouseleave", () => this._scheduleHide())
    ), e;
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(e, t, i, o = !1) {
    const n = r("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: t
    });
    return n.innerHTML = e, this._disposers.push(h(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(e) {
    this._activeImg === e && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeImg = e, this._show(e);
    }, Yt));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Xt));
  }
  _show(e) {
    this._el.style.display = "flex", this._positionNear(e);
  }
  _hide() {
    this._el.style.display = "none", this._activeImg = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(e) {
    const t = e.getBoundingClientRect(), i = this._el.offsetWidth || 220, o = this._el.offsetHeight || 32, n = 6;
    let l = t.bottom + n, a = t.left + (t.width - i) / 2;
    l + o > window.innerHeight - n && (l = t.top - o - n), a + i > window.innerWidth - n && (a = window.innerWidth - i - n), a < n && (a = n), this._el.style.top = `${l}px`, this._el.style.left = `${a}px`;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _setFloat(e) {
    const t = this._activeImg;
    t && (t.style.float = e, t.style.display = "", t.style.marginLeft = e === "right" ? "12px" : "", t.style.marginRight = e === "left" ? "12px" : "", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay"), this._positionNear(t));
  }
  _setCenter() {
    const e = this._activeImg;
    e && (e.style.float = "", e.style.display = "block", e.style.marginLeft = "auto", e.style.marginRight = "auto", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay"), this._positionNear(e));
  }
  _resetSize() {
    const e = this._activeImg;
    e && (e.style.width = "", e.style.height = "", this.context.invoke("editor.afterCommand"), this.context.invoke("imageResizer.updateOverlay"), this._positionNear(e));
  }
  _delete() {
    const e = this._activeImg;
    e && (this._hide(), this.context.invoke("imageResizer.deselect"), e.parentNode && e.parentNode.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
}
const $ = {
  floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatRight: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>',
  floatNone: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>',
  alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
  originalSize: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  deleteVideo: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
}, Gt = 100, Qt = 180;
class Jt {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._el = null, this._activeWrapper = null, this._showTimer = null, this._hideTimer = null, this._disposers = [];
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "mouseover", (t) => {
        const i = t.target.closest(".asn-video-wrapper");
        i && e.contains(i) && this._scheduleShow(i);
      }),
      h(e, "mouseout", (t) => {
        const i = t.relatedTarget;
        (!i || !e.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      h(document, "click", (t) => {
        this._activeWrapper && !this._activeWrapper.contains(t.target) && !this._el.contains(t.target) && this._hide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((e) => e()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const e = r("div", {
      class: "asn-link-tooltip asn-video-tooltip",
      role: "toolbar",
      "aria-label": "Video actions"
    });
    return e.style.display = "none", this._label = r("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Video", e.appendChild(this._label), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._floatLeftBtn = this._makeBtn($.floatLeft, "Float Left", () => this._setFloat("left")), this._floatNoneBtn = this._makeBtn($.floatNone, "No Float", () => this._setFloat("")), this._alignCenterBtn = this._makeBtn($.alignCenter, "Align Center", () => this._setCenter()), this._floatRightBtn = this._makeBtn($.floatRight, "Float Right", () => this._setFloat("right")), e.appendChild(this._floatLeftBtn), e.appendChild(this._floatNoneBtn), e.appendChild(this._alignCenterBtn), e.appendChild(this._floatRightBtn), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._originalBtn = this._makeBtn($.originalSize, "Original Size", () => this._resetSize()), e.appendChild(this._originalBtn), e.appendChild(r("div", { class: "asn-link-tooltip-sep" })), this._deleteBtn = this._makeBtn($.deleteVideo, "Delete Video", () => this._delete(), !0), e.appendChild(this._deleteBtn), this._disposers.push(
      h(e, "mouseenter", () => this._clearTimers()),
      h(e, "mouseleave", () => this._scheduleHide())
    ), e;
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(e, t, i, o = !1) {
    const n = r("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: t
    });
    return n.innerHTML = e, this._disposers.push(h(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(e) {
    this._activeWrapper === e && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeWrapper = e, this._show(e);
    }, Gt));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), Qt));
  }
  _show(e) {
    this._el.style.display = "flex", this._positionNear(e);
  }
  _hide() {
    this._el.style.display = "none", this._activeWrapper = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(e) {
    const t = e.getBoundingClientRect(), i = this._el.offsetWidth || 220, o = this._el.offsetHeight || 32, n = 6;
    let l = t.bottom + n, a = t.left + (t.width - i) / 2;
    l + o > window.innerHeight - n && (l = t.top - o - n), a + i > window.innerWidth - n && (a = window.innerWidth - i - n), a < n && (a = n), this._el.style.top = `${l}px`, this._el.style.left = `${a}px`;
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _setFloat(e) {
    const t = this._activeWrapper;
    t && (t.style.float = e, t.style.display = "inline-block", t.style.marginLeft = e === "right" ? "12px" : "", t.style.marginRight = e === "left" ? "12px" : "", this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay"), this._positionNear(t));
  }
  _setCenter() {
    const e = this._activeWrapper;
    e && (e.style.float = "", e.style.display = "block", e.style.marginLeft = "auto", e.style.marginRight = "auto", this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay"), this._positionNear(e));
  }
  _resetSize() {
    const e = this._activeWrapper;
    if (!e) return;
    const t = e.querySelector("iframe, video");
    e.style.width = "", e.style.height = "", t && (t.removeAttribute("width"), t.removeAttribute("height"), t.style.width = "", t.style.height = ""), this.context.invoke("editor.afterCommand"), this.context.invoke("videoResizer.updateOverlay"), this._positionNear(e);
  }
  _delete() {
    const e = this._activeWrapper;
    e && (this._hide(), this.context.invoke("videoResizer.deselect"), e.parentNode && e.parentNode.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
}
const Zt = 120, ei = 200, z = {
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
class ti {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._el = null, this._activeTable = null, this._activeCell = null, this._showTimer = null, this._hideTimer = null, this._disposers = [], this._sizePopover = null, this._sizeApply = null, this._sizeTitleEl = null, this._sizeInputEl = null;
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el), this._sizePopover = this._buildSizePopover(), document.body.appendChild(this._sizePopover);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "mouseover", (t) => {
        const i = t.target.closest("table");
        if (i && e.contains(i)) {
          const o = t.target.closest("td, th");
          o && (this._activeCell = o), this._scheduleShow(i);
        }
      }),
      h(e, "mouseout", (t) => {
        const i = t.relatedTarget;
        (!i || !e.contains(i) && !this._el.contains(i) && !(this._sizePopover && this._sizePopover.contains(i))) && this._scheduleHide();
      }),
      h(document, "click", (t) => {
        this._activeTable && !this._activeTable.contains(t.target) && !this._el.contains(t.target) && !(this._sizePopover && this._sizePopover.contains(t.target)) && this._hide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((e) => e()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null, this._sizePopover && this._sizePopover.parentNode && this._sizePopover.parentNode.removeChild(this._sizePopover), this._sizePopover = null;
  }
  // ---------------------------------------------------------------------------
  // Build tooltip bar
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const e = r("div", {
      class: "asn-link-tooltip asn-table-tooltip",
      role: "toolbar",
      "aria-label": "Table actions"
    });
    return e.style.display = "none", this._label = r("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Table", e.appendChild(this._label), e.appendChild(this._sep()), e.appendChild(this._makeBtn(z.rowAbove, "Add Row Above", () => this._addRow("above"))), e.appendChild(this._makeBtn(z.rowBelow, "Add Row Below", () => this._addRow("below"))), e.appendChild(this._makeBtn(z.deleteRow, "Delete Row", () => this._deleteRow())), e.appendChild(this._sep()), e.appendChild(this._makeBtn(z.colLeft, "Add Column Left", () => this._addColumn("left"))), e.appendChild(this._makeBtn(z.colRight, "Add Column Right", () => this._addColumn("right"))), e.appendChild(this._makeBtn(z.deleteCol, "Delete Column", () => this._deleteColumn())), e.appendChild(this._sep()), e.appendChild(this._makeBtn(z.mergeCells, "Merge Cells", () => this._mergeCells())), e.appendChild(this._sep()), e.appendChild(this._makeBtn(z.colWidth, "Column Width", () => this._openSizePopover("col"))), e.appendChild(this._makeBtn(z.rowHeight, "Row Height", () => this._openSizePopover("row"))), e.appendChild(this._sep()), e.appendChild(this._makeBtn(z.deleteTable, "Delete Table", () => this._deleteTable(), !0)), this._disposers.push(
      h(e, "mouseenter", () => this._clearTimers()),
      h(e, "mouseleave", () => this._scheduleHide())
    ), e;
  }
  _sep() {
    return r("div", { class: "asn-link-tooltip-sep" });
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(e, t, i, o = !1) {
    const n = r("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: t
    });
    return n.innerHTML = e, this._disposers.push(h(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(e) {
    this._activeTable === e && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activeTable = e, this._show();
    }, Zt));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), ei));
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
  _positionNear(e) {
    if (!e) return;
    const t = e.getBoundingClientRect(), i = this._el.offsetWidth || 400, o = this._el.offsetHeight || 30, n = 6;
    let l = t.left + (t.width - i) / 2, a = t.top - o - n;
    a < n && (a = t.bottom + n), l + i > window.innerWidth - n && (l = window.innerWidth - i - n), l < n && (l = n), this._el.style.left = `${l}px`, this._el.style.top = `${a}px`;
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
  _addRow(e) {
    const t = this._getCell();
    if (!t) return;
    const i = t.closest("tr");
    if (!i) return;
    const o = Array.from(i.cells).reduce((l, a) => l + (a.colSpan || 1), 0), n = document.createElement("tr");
    for (let l = 0; l < o; l++) {
      const a = document.createElement("td");
      a.style.border = "1px solid #dee2e6", a.style.padding = "6px 12px", a.innerHTML = "&#8203;", n.appendChild(a);
    }
    e === "above" ? i.parentElement.insertBefore(n, i) : i.insertAdjacentElement("afterend", n), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _addColumn(e) {
    const t = this._getCell();
    if (!t) return;
    const i = t.closest("tr"), o = t.closest("table");
    if (!i || !o) return;
    const n = Array.from(i.cells).indexOf(t);
    Array.from(o.querySelectorAll("tr")).forEach((l) => {
      const a = Array.from(l.cells), c = document.createElement("td");
      c.style.border = "1px solid #dee2e6", c.style.padding = "6px 12px", c.innerHTML = "&#8203;";
      const d = e === "left" ? a[n] : a[n + 1] || null;
      l.insertBefore(c, d);
    }), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _deleteRow() {
    const e = this._getCell();
    if (!e) return;
    const t = e.closest("tr"), i = e.closest("table");
    !t || !i || i.querySelectorAll("tr").length <= 1 || (this._activeCell = null, t.parentElement.removeChild(t), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand"));
  }
  _deleteColumn() {
    const e = this._getCell();
    if (!e) return;
    const t = e.closest("tr"), i = e.closest("table");
    if (!t || !i || t.cells.length <= 1) return;
    const o = Array.from(t.cells).indexOf(e);
    this._activeCell = null, Array.from(i.querySelectorAll("tr")).forEach((n) => {
      const l = n.cells[o];
      l && n.removeChild(l);
    }), this._positionNear(this._activeTable), this.context.invoke("editor.afterCommand");
  }
  _mergeCells() {
    const e = this._getCell();
    if (!e) return;
    const t = e.closest("tr");
    if (!t) return;
    const i = window.getSelection();
    if (!i || i.rangeCount === 0) return;
    const o = i.getRangeAt(0), n = Array.from(t.cells).filter((a) => {
      try {
        return o.intersectsNode(a);
      } catch {
        return !1;
      }
    });
    if (n.length < 2) return;
    const l = n[0];
    l.colSpan = n.reduce((a, c) => a + (c.colSpan || 1), 0), l.innerHTML = n.map((a) => a.innerHTML).join(""), n.slice(1).forEach((a) => t.removeChild(a)), this.context.invoke("editor.afterCommand");
  }
  _deleteTable() {
    const e = this._activeTable;
    e && (this._hide(), e.parentNode && e.parentNode.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------
  _buildSizePopover() {
    const e = r("div", { class: "asn-size-popover" });
    e.style.display = "none";
    const t = r("div", { class: "asn-size-popover-title" }), i = r("div", { class: "asn-size-popover-body" }), o = r("input", {
      type: "number",
      class: "asn-size-input",
      min: "1",
      max: "2000",
      step: "1"
    }), n = r("span", { class: "asn-size-unit" }, ["px"]);
    i.appendChild(o), i.appendChild(n);
    const l = r("div", { class: "asn-size-popover-actions" }), a = r("button", { type: "button", class: "asn-btn" });
    a.textContent = "Cancel";
    const c = r("button", { type: "button", class: "asn-btn asn-btn-primary" });
    c.textContent = "Apply", l.appendChild(a), l.appendChild(c), e.appendChild(t), e.appendChild(i), e.appendChild(l), this._sizeTitleEl = t, this._sizeInputEl = o, this._sizeApply = null;
    const d = h(c, "click", () => {
      const g = parseInt(this._sizeInputEl.value, 10);
      g > 0 && typeof this._sizeApply == "function" && this._sizeApply(g), this._hideSizePopover();
    }), p = h(a, "click", () => this._hideSizePopover()), u = h(o, "keydown", (g) => {
      g.key === "Enter" && (g.preventDefault(), c.click()), g.key === "Escape" && this._hideSizePopover();
    }), f = h(document, "click", (g) => {
      this._sizePopover && this._sizePopover.style.display !== "none" && !this._sizePopover.contains(g.target) && !this._el.contains(g.target) && this._hideSizePopover();
    });
    return this._disposers.push(d, p, u, f), e;
  }
  _openSizePopover(e) {
    const t = this._getCell();
    if (!t || !this._sizePopover) return;
    const i = e === "col";
    this._sizeTitleEl.textContent = i ? "Column Width (px)" : "Row Height (px)", this._sizeInputEl.value = i ? t.offsetWidth || 120 : t.closest("tr") && t.closest("tr").offsetHeight || 40, this._sizeApply = (o) => {
      if (i) {
        const n = t.closest("table"), l = Array.from(t.closest("tr").cells).indexOf(t);
        Array.from(n.querySelectorAll("tr")).forEach((a) => {
          const c = a.cells[l];
          c && (c.style.width = `${o}px`, c.style.minWidth = `${o}px`);
        });
      } else {
        const n = t.closest("tr");
        n && Array.from(n.cells).forEach((l) => {
          l.style.height = `${o}px`;
        });
      }
      this.context.invoke("editor.afterCommand");
    }, this._sizePopover.style.display = "block", requestAnimationFrame(() => {
      if (!this._sizePopover || !this._el) return;
      const o = this._el.getBoundingClientRect(), n = this._sizePopover.offsetWidth || 220, l = this._sizePopover.offsetHeight || 110;
      let a = o.left, c = o.bottom + 6;
      a + n > window.innerWidth - 8 && (a = window.innerWidth - n - 8), c + l > window.innerHeight - 8 && (c = o.top - l - 6), this._sizePopover.style.left = `${a}px`, this._sizePopover.style.top = `${c}px`, this._sizeInputEl && (this._sizeInputEl.focus(), this._sizeInputEl.select());
    });
  }
  _hideSizePopover() {
    this._sizePopover && (this._sizePopover.style.display = "none"), this._sizeApply = null;
  }
}
const ii = 100, si = 180, V = {
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  wrapOn: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 0 1 0 6H3"/><polyline points="6 15 3 18 6 21"/></svg>',
  toParagraph: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M9 4h8a4 4 0 0 1 0 8H9V4z"/></svg>',
  deleteCode: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
};
class oi {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this._el = null, this._activePre = null, this._showTimer = null, this._hideTimer = null, this._disposers = [], this._copyBtn = null;
  }
  initialize() {
    this._el = this._buildTooltip(), document.body.appendChild(this._el);
    const e = this.context.layoutInfo.editable;
    return this._disposers.push(
      h(e, "mouseover", (t) => {
        const i = t.target.closest("pre");
        i && e.contains(i) && this._scheduleShow(i);
      }),
      h(e, "mouseout", (t) => {
        const i = t.relatedTarget;
        (!i || !e.contains(i) && !this._el.contains(i)) && this._scheduleHide();
      }),
      h(document, "click", (t) => {
        this._activePre && !this._activePre.contains(t.target) && !this._el.contains(t.target) && this._hide();
      })
    ), this;
  }
  destroy() {
    this._clearTimers(), this._disposers.forEach((e) => e()), this._disposers = [], this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = null;
  }
  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  _buildTooltip() {
    const e = r("div", {
      class: "asn-link-tooltip asn-code-tooltip",
      role: "toolbar",
      "aria-label": "Code block actions"
    });
    return e.style.display = "none", this._label = r("span", { class: "asn-link-tooltip-url" }), this._label.textContent = "Code", e.appendChild(this._label), e.appendChild(this._sep()), this._copyBtn = this._makeBtn(V.copy, "Copy Code", () => this._copyCode()), e.appendChild(this._copyBtn), e.appendChild(this._sep()), this._wrapBtn = this._makeBtn(V.wrapOn, "Toggle Word Wrap", () => this._toggleWrap()), e.appendChild(this._wrapBtn), e.appendChild(this._sep()), e.appendChild(this._makeBtn(V.toParagraph, "Convert to Paragraph", () => this._toParagraph())), e.appendChild(this._sep()), e.appendChild(this._makeBtn(V.deleteCode, "Delete Code Block", () => this._delete(), !0)), this._disposers.push(
      h(e, "mouseenter", () => this._clearTimers()),
      h(e, "mouseleave", () => this._scheduleHide())
    ), e;
  }
  _sep() {
    return r("div", { class: "asn-link-tooltip-sep" });
  }
  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(e, t, i, o = !1) {
    const n = r("button", {
      type: "button",
      class: o ? "asn-link-tooltip-btn asn-link-tooltip-btn--danger" : "asn-link-tooltip-btn",
      title: t
    });
    return n.innerHTML = e, this._disposers.push(h(n, "click", (l) => {
      l.preventDefault(), l.stopPropagation(), i();
    })), n;
  }
  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------
  _scheduleShow(e) {
    this._activePre === e && this._el.style.display !== "none" || (clearTimeout(this._hideTimer), this._hideTimer = null, clearTimeout(this._showTimer), this._showTimer = setTimeout(() => {
      this._activePre = e, this._syncWrapBtn(), this._show(e);
    }, ii));
  }
  _scheduleHide() {
    clearTimeout(this._showTimer), this._showTimer = null, !this._hideTimer && (this._hideTimer = setTimeout(() => this._hide(), si));
  }
  _show(e) {
    this._el.style.display = "flex", this._positionNear(e);
  }
  _hide() {
    this._el.style.display = "none", this._activePre = null, this._clearTimers();
  }
  _clearTimers() {
    clearTimeout(this._showTimer), clearTimeout(this._hideTimer), this._showTimer = null, this._hideTimer = null;
  }
  _positionNear(e) {
    const t = e.getBoundingClientRect(), i = this._el.offsetWidth || 260, o = this._el.offsetHeight || 32, n = 6;
    let l = t.top - o - n, a = t.left + (t.width - i) / 2;
    l < n && (l = t.bottom + n), a + i > window.innerWidth - n && (a = window.innerWidth - i - n), a < n && (a = n), this._el.style.top = `${l + window.scrollY}px`, this._el.style.left = `${a + window.scrollX}px`;
  }
  // ---------------------------------------------------------------------------
  // Sync wrap-button active state
  // ---------------------------------------------------------------------------
  _syncWrapBtn() {
    if (!this._activePre || !this._wrapBtn) return;
    const e = (this._activePre.style.whiteSpace || "").includes("pre-wrap") || window.getComputedStyle(this._activePre).whiteSpace === "pre-wrap";
    this._wrapBtn.classList.toggle("active", e), this._wrapBtn.title = e ? "Disable Word Wrap" : "Enable Word Wrap";
  }
  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  _copyCode() {
    const e = this._activePre;
    if (!e) return;
    const t = e.textContent || "";
    if (navigator.clipboard)
      navigator.clipboard.writeText(t).then(() => this._flashCopied()).catch(() => {
      });
    else {
      const i = document.createElement("textarea");
      i.value = t, i.style.cssText = "position:fixed;opacity:0;top:0;left:0", document.body.appendChild(i), i.select();
      try {
        document.execCommand("copy"), this._flashCopied();
      } catch {
      }
      document.body.removeChild(i);
    }
  }
  _flashCopied() {
    if (!this._copyBtn) return;
    const e = this._copyBtn.innerHTML;
    this._copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', this._copyBtn.classList.add("asn-link-tooltip-btn--copied"), setTimeout(() => {
      this._copyBtn && (this._copyBtn.innerHTML = e, this._copyBtn.classList.remove("asn-link-tooltip-btn--copied"));
    }, 1400);
  }
  _toggleWrap() {
    const e = this._activePre;
    if (!e) return;
    const t = e.style.whiteSpace === "pre-wrap";
    e.style.whiteSpace = t ? "pre" : "pre-wrap", this._syncWrapBtn(), this.context.invoke("editor.afterCommand"), this._positionNear(e);
  }
  _toParagraph() {
    const e = this._activePre;
    if (!e || !this.context.layoutInfo.editable) return;
    const i = (e.textContent || "").split(`
`), o = document.createElement("p");
    i.forEach((n, l) => {
      l > 0 && o.appendChild(document.createElement("br")), o.appendChild(document.createTextNode(n));
    }), e.parentNode.replaceChild(o, e), this._hide(), this.context.invoke("editor.afterCommand");
  }
  _delete() {
    const e = this._activePre;
    e && (this._hide(), e.parentNode && e.parentNode.removeChild(e), this.context.invoke("editor.afterCommand"));
  }
}
const ni = [
  { id: "smileys", label: "Smileys" },
  { id: "people", label: "People" },
  { id: "animals", label: "Animals" },
  { id: "food", label: "Food" },
  { id: "travel", label: "Travel" },
  { id: "objects", label: "Objects" },
  { id: "symbols", label: "Symbols" }
], li = [
  // Smileys & Emotions
  ["😀", "grin smile happy face", "smileys"],
  ["😃", "happy smile big eyes", "smileys"],
  ["😄", "grinning smile laugh", "smileys"],
  ["😁", "beaming smile grin", "smileys"],
  ["😆", "laughing lol", "smileys"],
  ["😅", "sweat grin awkward", "smileys"],
  ["🤣", "rolling laugh rofl", "smileys"],
  ["😂", "tears laugh cry joy", "smileys"],
  ["🙂", "slight smile", "smileys"],
  ["🙃", "upside down smile", "smileys"],
  ["😉", "wink", "smileys"],
  ["😊", "blush smile happy", "smileys"],
  ["😇", "innocent halo angel", "smileys"],
  ["🥰", "hearts love adore", "smileys"],
  ["😍", "heart eyes love", "smileys"],
  ["🤩", "star eyes excited wow", "smileys"],
  ["😘", "kiss blow love", "smileys"],
  ["😋", "yum delicious tongue", "smileys"],
  ["😛", "tongue stuck out", "smileys"],
  ["😜", "wink tongue crazy", "smileys"],
  ["🤪", "zany crazy wild", "smileys"],
  ["😝", "squint tongue", "smileys"],
  ["🤑", "money mouth", "smileys"],
  ["🤗", "hugging hug", "smileys"],
  ["🤔", "thinking hmm", "smileys"],
  ["🤨", "raised eyebrow", "smileys"],
  ["😐", "neutral face", "smileys"],
  ["😶", "no mouth", "smileys"],
  ["😏", "smirk", "smileys"],
  ["😒", "unamused", "smileys"],
  ["🙄", "roll eyes", "smileys"],
  ["😬", "grimace", "smileys"],
  ["😔", "pensive sad", "smileys"],
  ["😪", "sleepy tired", "smileys"],
  ["😴", "sleeping zzz", "smileys"],
  ["🤤", "drool", "smileys"],
  ["😷", "mask sick", "smileys"],
  ["🤒", "sick thermometer", "smileys"],
  ["🤕", "hurt bandage", "smileys"],
  ["🤢", "nausea sick", "smileys"],
  ["🤮", "vomit sick", "smileys"],
  ["🤧", "sneeze cold", "smileys"],
  ["🥵", "hot sweat", "smileys"],
  ["🥶", "cold freeze", "smileys"],
  ["😵", "dizzy dead", "smileys"],
  ["🤯", "mind blown", "smileys"],
  ["🤠", "cowboy hat", "smileys"],
  ["🥳", "party celebrate", "smileys"],
  ["😎", "cool sunglasses", "smileys"],
  ["🤓", "nerd glasses", "smileys"],
  ["🧐", "monocle curious", "smileys"],
  ["😕", "confused", "smileys"],
  ["😟", "worried", "smileys"],
  ["🙁", "frown sad", "smileys"],
  ["☹️", "sad frown", "smileys"],
  ["😮", "surprised open mouth", "smileys"],
  ["😲", "astonished", "smileys"],
  ["🥺", "pleading begging puppy eyes", "smileys"],
  ["😢", "cry sad tear", "smileys"],
  ["😭", "sob cry loudly", "smileys"],
  ["😱", "scream horror fear", "smileys"],
  ["😡", "angry red pouting", "smileys"],
  ["😠", "angry mad", "smileys"],
  ["🤬", "cursing swear", "smileys"],
  ["😈", "devil evil smile", "smileys"],
  ["👿", "devil angry evil", "smileys"],
  ["💀", "skull death", "smileys"],
  ["☠️", "skull crossbones", "smileys"],
  ["💩", "poop", "smileys"],
  ["🤡", "clown", "smileys"],
  ["👻", "ghost boo", "smileys"],
  ["👽", "alien ufo", "smileys"],
  ["🤖", "robot", "smileys"],
  // People & Body
  ["👋", "wave hello hi hand", "people"],
  ["🤚", "raised back hand", "people"],
  ["✋", "raised hand stop", "people"],
  ["🖖", "vulcan salute spock", "people"],
  ["👌", "ok perfect fine", "people"],
  ["✌️", "peace victory fingers", "people"],
  ["🤞", "fingers crossed luck", "people"],
  ["🤟", "love you gesture", "people"],
  ["🤘", "sign of horns rock", "people"],
  ["🤙", "call me hand", "people"],
  ["👈", "point left", "people"],
  ["👉", "point right", "people"],
  ["👆", "point up", "people"],
  ["👇", "point down", "people"],
  ["☝️", "index pointing up", "people"],
  ["👍", "thumbs up like good", "people"],
  ["👎", "thumbs down dislike bad", "people"],
  ["✊", "raised fist punch", "people"],
  ["👊", "oncoming fist punch", "people"],
  ["👏", "clap applause", "people"],
  ["🙌", "celebrate raise hands", "people"],
  ["🤝", "handshake deal", "people"],
  ["🙏", "pray hope please thanks", "people"],
  ["💅", "nail polish", "people"],
  ["💪", "flexed bicep strong muscle", "people"],
  ["👀", "eyes look see", "people"],
  ["👁️", "eye", "people"],
  ["👅", "tongue", "people"],
  ["👶", "baby", "people"],
  ["🧒", "child", "people"],
  ["👦", "boy", "people"],
  ["👧", "girl", "people"],
  ["🧑", "person adult", "people"],
  ["👨", "man", "people"],
  ["👩", "woman", "people"],
  ["🧔", "beard man", "people"],
  ["🧓", "older person", "people"],
  ["👴", "old man", "people"],
  ["👵", "old woman", "people"],
  ["❤️", "heart love red", "people"],
  ["🧡", "orange heart love", "people"],
  ["💛", "yellow heart love", "people"],
  ["💚", "green heart love", "people"],
  ["💙", "blue heart love", "people"],
  ["💜", "purple heart love", "people"],
  ["🖤", "black heart", "people"],
  ["🤍", "white heart", "people"],
  ["🤎", "brown heart", "people"],
  ["💔", "broken heart", "people"],
  ["❣️", "exclamation heart", "people"],
  ["💕", "two hearts love", "people"],
  ["💞", "revolving hearts", "people"],
  ["💓", "beating heart", "people"],
  ["💗", "growing heart", "people"],
  ["💖", "sparkling heart", "people"],
  ["💘", "heart arrow", "people"],
  ["💝", "heart ribbon", "people"],
  ["💬", "speech bubble comment chat", "people"],
  ["💭", "thought bubble", "people"],
  ["💯", "100 hundred percent perfect", "people"],
  ["💢", "anger symbol mad", "people"],
  ["💤", "zzz sleep", "people"],
  // Animals & Nature
  ["🐶", "dog puppy", "animals"],
  ["🐱", "cat kitten", "animals"],
  ["🐭", "mouse", "animals"],
  ["🐹", "hamster", "animals"],
  ["🐰", "rabbit bunny", "animals"],
  ["🦊", "fox", "animals"],
  ["🐻", "bear", "animals"],
  ["🐼", "panda", "animals"],
  ["🐨", "koala", "animals"],
  ["🐯", "tiger", "animals"],
  ["🦁", "lion", "animals"],
  ["🐮", "cow", "animals"],
  ["🐷", "pig", "animals"],
  ["🐸", "frog", "animals"],
  ["🐵", "monkey", "animals"],
  ["🙈", "see no evil monkey", "animals"],
  ["🙉", "hear no evil monkey", "animals"],
  ["🙊", "speak no evil monkey", "animals"],
  ["🐔", "chicken hen", "animals"],
  ["🐧", "penguin", "animals"],
  ["🐦", "bird", "animals"],
  ["🦆", "duck", "animals"],
  ["🦅", "eagle", "animals"],
  ["🦉", "owl", "animals"],
  ["🦇", "bat", "animals"],
  ["🐺", "wolf", "animals"],
  ["🐴", "horse", "animals"],
  ["🦄", "unicorn", "animals"],
  ["🐝", "bee", "animals"],
  ["🦋", "butterfly", "animals"],
  ["🐌", "snail", "animals"],
  ["🐞", "ladybug", "animals"],
  ["🐢", "turtle", "animals"],
  ["🐍", "snake", "animals"],
  ["🦎", "lizard", "animals"],
  ["🐊", "crocodile", "animals"],
  ["🐟", "fish", "animals"],
  ["🐠", "tropical fish", "animals"],
  ["🦈", "shark", "animals"],
  ["🐬", "dolphin", "animals"],
  ["🐳", "whale", "animals"],
  ["🐙", "octopus", "animals"],
  ["🦑", "squid", "animals"],
  ["🦀", "crab", "animals"],
  ["🌸", "cherry blossom flower", "animals"],
  ["🌺", "hibiscus flower", "animals"],
  ["🌻", "sunflower", "animals"],
  ["🌹", "rose flower", "animals"],
  ["🌷", "tulip flower", "animals"],
  ["🍀", "four leaf clover luck", "animals"],
  ["🌿", "herb leaf green", "animals"],
  ["🌱", "seedling sprout", "animals"],
  ["🌲", "evergreen tree pine", "animals"],
  ["🌳", "deciduous tree", "animals"],
  ["🌴", "palm tree", "animals"],
  ["🍄", "mushroom", "animals"],
  ["🌾", "sheaf wheat", "animals"],
  ["🐾", "paw prints animal", "animals"],
  // Food & Drink
  ["🍎", "apple red", "food"],
  ["🍊", "orange tangerine", "food"],
  ["🍋", "lemon yellow", "food"],
  ["🍇", "grapes", "food"],
  ["🍓", "strawberry", "food"],
  ["🫐", "blueberry", "food"],
  ["🍒", "cherry", "food"],
  ["🍑", "peach", "food"],
  ["🥭", "mango", "food"],
  ["🍍", "pineapple", "food"],
  ["🥥", "coconut", "food"],
  ["🥝", "kiwi", "food"],
  ["🍅", "tomato", "food"],
  ["🥑", "avocado", "food"],
  ["🍆", "eggplant aubergine", "food"],
  ["🥕", "carrot", "food"],
  ["🌽", "corn", "food"],
  ["🥦", "broccoli", "food"],
  ["🥬", "leafy green", "food"],
  ["🧄", "garlic", "food"],
  ["🥜", "peanut nut", "food"],
  ["🍞", "bread loaf", "food"],
  ["🥐", "croissant", "food"],
  ["🧀", "cheese", "food"],
  ["🍳", "egg fry cooking", "food"],
  ["🥚", "egg", "food"],
  ["🥞", "pancake", "food"],
  ["🧇", "waffle", "food"],
  ["🥓", "bacon", "food"],
  ["🥩", "meat steak", "food"],
  ["🍗", "chicken leg", "food"],
  ["🌭", "hotdog", "food"],
  ["🍔", "burger hamburger", "food"],
  ["🍟", "fries french", "food"],
  ["🍕", "pizza", "food"],
  ["🌮", "taco", "food"],
  ["🌯", "burrito wrap", "food"],
  ["🍜", "noodles ramen", "food"],
  ["🍝", "spaghetti pasta", "food"],
  ["🍣", "sushi", "food"],
  ["🍱", "bento box", "food"],
  ["🍦", "ice cream soft serve", "food"],
  ["🍩", "donut", "food"],
  ["🍪", "cookie", "food"],
  ["🎂", "birthday cake", "food"],
  ["🍰", "cake slice", "food"],
  ["🧁", "cupcake", "food"],
  ["🍫", "chocolate", "food"],
  ["🍬", "candy", "food"],
  ["🍭", "lollipop", "food"],
  ["☕", "coffee hot", "food"],
  ["🍵", "tea hot", "food"],
  ["🧋", "bubble tea boba", "food"],
  ["🥤", "cup straw drink", "food"],
  ["🍷", "wine red", "food"],
  ["🍸", "cocktail martini", "food"],
  ["🍺", "beer mug", "food"],
  ["🍻", "clinking beer mugs", "food"],
  ["🥂", "champagne toast celebrate", "food"],
  ["🧃", "juice box", "food"],
  ["🧊", "ice cube", "food"],
  // Travel & Places
  ["🚀", "rocket space", "travel"],
  ["🛸", "ufo flying saucer", "travel"],
  ["✈️", "airplane plane fly", "travel"],
  ["🚁", "helicopter", "travel"],
  ["🚂", "train locomotive", "travel"],
  ["🚄", "bullet train fast", "travel"],
  ["🚇", "subway metro", "travel"],
  ["🚌", "bus", "travel"],
  ["🚑", "ambulance", "travel"],
  ["🚒", "fire truck", "travel"],
  ["🚓", "police car", "travel"],
  ["🚕", "taxi cab", "travel"],
  ["🚗", "car automobile red", "travel"],
  ["🚙", "suv car", "travel"],
  ["🚚", "truck delivery", "travel"],
  ["🚜", "tractor farm", "travel"],
  ["🏎️", "racing car fast", "travel"],
  ["🏍️", "motorcycle", "travel"],
  ["🚲", "bicycle bike", "travel"],
  ["🛴", "scooter kick", "travel"],
  ["⛵", "sailboat boat", "travel"],
  ["🚢", "ship cruise", "travel"],
  ["🏠", "house home", "travel"],
  ["🏢", "office building", "travel"],
  ["🏥", "hospital", "travel"],
  ["🏦", "bank", "travel"],
  ["🏪", "store shop convenience", "travel"],
  ["🏫", "school", "travel"],
  ["🏰", "castle european", "travel"],
  ["🏯", "japanese castle", "travel"],
  ["🗼", "tokyo tower", "travel"],
  ["🗽", "statue liberty new york", "travel"],
  ["⛪", "church", "travel"],
  ["🕌", "mosque", "travel"],
  ["⛩️", "shinto shrine", "travel"],
  ["⛲", "fountain", "travel"],
  ["⛺", "tent camping", "travel"],
  ["🌁", "fog foggy bridge", "travel"],
  ["🌃", "night city stars", "travel"],
  ["🏙️", "cityscape city buildings", "travel"],
  ["🌅", "sunrise morning", "travel"],
  ["🌈", "rainbow colorful", "travel"],
  ["⛰️", "mountain", "travel"],
  ["🏔️", "snow mountain", "travel"],
  ["🗻", "mount fuji", "travel"],
  ["🏕️", "camping tent", "travel"],
  ["🗺️", "world map", "travel"],
  ["🧭", "compass navigation", "travel"],
  ["🌍", "earth europe africa globe", "travel"],
  ["🌎", "earth americas globe", "travel"],
  ["🌏", "earth asia globe", "travel"],
  ["🌐", "globe internet web", "travel"],
  // Objects
  ["💎", "diamond gem jewel", "objects"],
  ["💍", "ring engagement", "objects"],
  ["👑", "crown royal king queen", "objects"],
  ["🎩", "top hat magic", "objects"],
  ["💼", "briefcase work business", "objects"],
  ["👜", "handbag purse", "objects"],
  ["🎒", "backpack bag school", "objects"],
  ["👓", "glasses eyewear", "objects"],
  ["🕶️", "sunglasses cool", "objects"],
  ["💡", "light bulb idea", "objects"],
  ["🔦", "flashlight torch", "objects"],
  ["🕯️", "candle light", "objects"],
  ["🔋", "battery charge", "objects"],
  ["💻", "laptop computer", "objects"],
  ["🖥️", "desktop monitor computer", "objects"],
  ["📱", "phone mobile cell", "objects"],
  ["⌨️", "keyboard type", "objects"],
  ["🖱️", "mouse computer click", "objects"],
  ["📺", "television tv", "objects"],
  ["📷", "camera photo", "objects"],
  ["📹", "video camera", "objects"],
  ["🎥", "movie camera film", "objects"],
  ["☎️", "telephone phone", "objects"],
  ["⏰", "alarm clock wake", "objects"],
  ["⌚", "watch time", "objects"],
  ["🔑", "key", "objects"],
  ["🗝️", "old key", "objects"],
  ["🔒", "lock closed", "objects"],
  ["🔓", "unlock open", "objects"],
  ["🔨", "hammer tool", "objects"],
  ["🔧", "wrench tool", "objects"],
  ["🔩", "bolt nut", "objects"],
  ["⚙️", "gear setting", "objects"],
  ["🧲", "magnet attract", "objects"],
  ["📚", "books stack library", "objects"],
  ["📖", "book open read", "objects"],
  ["📝", "memo write note", "objects"],
  ["✏️", "pencil write edit", "objects"],
  ["📌", "pushpin tack", "objects"],
  ["📎", "paperclip attach", "objects"],
  ["📊", "bar chart graph", "objects"],
  ["📈", "chart up growth trend", "objects"],
  ["📉", "chart down loss decline", "objects"],
  ["📅", "calendar date", "objects"],
  ["📦", "package box", "objects"],
  ["📫", "mailbox closed", "objects"],
  ["📧", "email envelope", "objects"],
  ["🎁", "gift present", "objects"],
  ["🎀", "ribbon bow", "objects"],
  ["🎉", "party celebrate confetti", "objects"],
  ["🎊", "confetti celebrate", "objects"],
  ["🔮", "crystal ball magic fortune", "objects"],
  ["🪄", "magic wand", "objects"],
  ["🎯", "target bullseye dart", "objects"],
  ["🎲", "dice game board", "objects"],
  ["🎮", "video game controller", "objects"],
  ["🎭", "theater masks drama", "objects"],
  ["🎨", "art palette paint", "objects"],
  ["🎬", "clapper film movie", "objects"],
  ["🎤", "microphone sing karaoke", "objects"],
  ["🎧", "headphones music listen", "objects"],
  ["🎵", "music note", "objects"],
  ["🎶", "music notes", "objects"],
  ["🎸", "guitar electric", "objects"],
  ["🎹", "piano keyboard music", "objects"],
  ["🥁", "drum percussion", "objects"],
  ["🎷", "saxophone jazz", "objects"],
  ["🎺", "trumpet", "objects"],
  ["🎻", "violin", "objects"],
  ["⚽", "soccer ball football", "objects"],
  ["🏀", "basketball", "objects"],
  ["🏈", "american football", "objects"],
  ["⚾", "baseball", "objects"],
  ["🎾", "tennis", "objects"],
  ["🏐", "volleyball", "objects"],
  ["🏆", "trophy winner award", "objects"],
  ["🥇", "gold medal first", "objects"],
  ["🏅", "sports medal", "objects"],
  // Symbols
  ["✅", "check green done success", "symbols"],
  ["❌", "cross x no cancel", "symbols"],
  ["⭕", "circle red", "symbols"],
  ["⛔", "no entry stop", "symbols"],
  ["🚫", "prohibited no banned", "symbols"],
  ["⚠️", "warning caution danger", "symbols"],
  ["❗", "exclamation red important", "symbols"],
  ["❓", "question mark", "symbols"],
  ["‼️", "double exclamation", "symbols"],
  ["💯", "100 hundred percent perfect", "symbols"],
  ["🔴", "red circle dot", "symbols"],
  ["🟠", "orange circle", "symbols"],
  ["🟡", "yellow circle", "symbols"],
  ["🟢", "green circle", "symbols"],
  ["🔵", "blue circle", "symbols"],
  ["🟣", "purple circle", "symbols"],
  ["⚫", "black circle", "symbols"],
  ["⚪", "white circle", "symbols"],
  ["🟤", "brown circle", "symbols"],
  ["🔺", "red triangle up", "symbols"],
  ["🔻", "red triangle down", "symbols"],
  ["🔷", "blue diamond large", "symbols"],
  ["🔶", "orange diamond large", "symbols"],
  ["🔹", "blue diamond small", "symbols"],
  ["🔸", "orange diamond small", "symbols"],
  ["⭐", "star yellow", "symbols"],
  ["🌟", "glowing star shine", "symbols"],
  ["✨", "sparkles shine", "symbols"],
  ["💫", "dizzy star spin", "symbols"],
  ["⚡", "lightning bolt energy power", "symbols"],
  ["🔥", "fire hot flame", "symbols"],
  ["💥", "explosion boom", "symbols"],
  ["❄️", "snowflake cold ice winter", "symbols"],
  ["🌊", "wave water ocean sea", "symbols"],
  ["💨", "wind blow dash", "symbols"],
  ["🌀", "cyclone tornado spiral", "symbols"],
  ["♻️", "recycle loop green", "symbols"],
  ["✔️", "check tick done", "symbols"],
  ["➕", "plus add", "symbols"],
  ["➖", "minus subtract", "symbols"],
  ["➗", "divide division", "symbols"],
  ["✖️", "multiply times cross", "symbols"],
  ["▶️", "play button right", "symbols"],
  ["⏸️", "pause", "symbols"],
  ["⏹️", "stop square", "symbols"],
  ["⏩", "fast forward", "symbols"],
  ["⏪", "rewind fast backward", "symbols"],
  ["🔔", "bell notification", "symbols"],
  ["🔕", "bell slash mute", "symbols"],
  ["🔊", "speaker volume high", "symbols"],
  ["🔇", "mute silent no sound", "symbols"],
  ["📢", "loudspeaker announcement", "symbols"],
  ["📣", "megaphone cheer", "symbols"],
  ["🏳️", "white flag", "symbols"],
  ["🏴", "black flag", "symbols"],
  ["🚩", "red flag", "symbols"],
  ["🏁", "checkered flag finish race", "symbols"],
  ["🆕", "new badge", "symbols"],
  ["🆓", "free badge", "symbols"],
  ["🆒", "cool badge", "symbols"],
  ["🔝", "top arrow", "symbols"],
  ["🔙", "back arrow", "symbols"],
  ["ℹ️", "information info", "symbols"],
  ["📍", "pin location map", "symbols"],
  ["🔗", "link chain", "symbols"],
  ["©️", "copyright", "symbols"],
  ["®️", "registered trademark", "symbols"],
  ["™️", "trademark", "symbols"],
  ["#️⃣", "hash number", "symbols"],
  ["0️⃣", "zero number", "symbols"],
  ["1️⃣", "one number", "symbols"],
  ["2️⃣", "two number", "symbols"],
  ["3️⃣", "three number", "symbols"],
  ["4️⃣", "four number", "symbols"],
  ["5️⃣", "five number", "symbols"]
];
class ai {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this._dialog = null, this._disposers = [], this._savedRange = null, this._activeCat = "all";
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  initialize() {
    return this._dialog = this._buildDialog(), document.body.appendChild(this._dialog), this;
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  show() {
    U((e) => {
      this._savedRange = e;
    }), this._activeCat = "all", this._searchInput.value = "", this._updateCatTabs(), this._filterEmojis("", "all"), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const e = r("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert emoji"
    }), t = r("div", { class: "asn-dialog-box asn-emoji-box" }), i = r("div", { class: "asn-icon-title-row" }), o = r("h3", { class: "asn-dialog-title" });
    o.textContent = "Insert Emoji";
    const n = r("button", { type: "button", class: "asn-icon-close", "aria-label": "Close" });
    n.innerHTML = "&times;", i.append(o, n);
    const l = r("input", {
      type: "search",
      class: "asn-input asn-icon-search",
      placeholder: "Search emojis…",
      autocomplete: "off"
    });
    this._searchInput = l;
    const a = r("div", { class: "asn-icon-cats" }), c = r("button", { type: "button", class: "asn-icon-cat active", "data-cat": "all" });
    c.textContent = "All", a.appendChild(c), ni.forEach(({ id: b, label: m }) => {
      const _ = r("button", { type: "button", class: "asn-icon-cat", "data-cat": b });
      _.textContent = m, a.appendChild(_);
    }), this._catBar = a;
    const d = r("div", { class: "asn-emoji-grid" });
    li.forEach(([b, m, _]) => {
      const I = r("button", {
        type: "button",
        class: "asn-emoji-cell",
        "data-char": b,
        "data-keywords": m,
        "data-cat": _,
        title: m.split(" ").slice(0, 2).join(" ")
      });
      I.textContent = b, d.appendChild(I);
    }), this._grid = d;
    const p = r("div", { class: "asn-dialog-actions" }), u = r("button", { type: "button", class: "asn-btn" });
    u.textContent = "Cancel", p.appendChild(u), t.append(i, l, a, d, p), e.appendChild(t);
    const f = h(n, "click", () => this._close()), g = h(u, "click", () => this._close()), y = h(e, "click", (b) => {
      b.target === e && this._close();
    }), v = h(l, "input", () => this._filterEmojis(l.value, this._activeCat)), x = h(a, "click", (b) => {
      const m = b.target.closest("[data-cat]");
      m && (this._activeCat = m.dataset.cat, this._updateCatTabs(), this._filterEmojis(this._searchInput.value, this._activeCat));
    }), k = h(d, "click", (b) => {
      const m = b.target.closest(".asn-emoji-cell");
      m && this._onEmojiClick(m.dataset.char);
    }), j = (b) => {
      b.key === "Escape" && this._close();
    };
    document.addEventListener("keydown", j);
    const L = () => document.removeEventListener("keydown", j);
    return this._disposers.push(f, g, y, v, x, k, L), e;
  }
  // ---------------------------------------------------------------------------
  // Filter
  // ---------------------------------------------------------------------------
  _updateCatTabs() {
    this._catBar.querySelectorAll(".asn-icon-cat").forEach((e) => {
      e.classList.toggle("active", e.dataset.cat === this._activeCat);
    });
  }
  _filterEmojis(e, t) {
    const i = (e || "").trim().toLowerCase();
    let o = 0;
    this._grid.querySelectorAll(".asn-emoji-cell").forEach((l) => {
      const a = !t || t === "all" || l.dataset.cat === t, c = !i || l.dataset.keywords.includes(i) || l.dataset.char === i, d = a && c;
      l.style.display = d ? "" : "none", d && o++;
    });
    let n = this._grid.querySelector(".asn-icon-empty");
    n || (n = r("div", { class: "asn-icon-empty" }), n.textContent = "No emojis found", this._grid.appendChild(n)), n.style.display = o > 0 ? "none" : "";
  }
  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------
  _onEmojiClick(e) {
    const t = this._savedRange, i = this.context.layoutInfo.editable;
    t && t.select();
    const o = window.getSelection();
    let n = o && o.rangeCount > 0 ? o.getRangeAt(0) : null;
    n || (n = document.createRange(), n.selectNodeContents(i), n.collapse(!1)), n.deleteContents();
    const l = document.createTextNode(e);
    n.insertNode(l), n.setStartAfter(l), n.collapse(!0), o && (o.removeAllRanges(), o.addRange(n)), this._close(), i.focus(), this.context.invoke("editor.afterCommand");
  }
  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------
  _open() {
    this._dialog && (this._dialog.style.display = "flex", setTimeout(() => this._searchInput && this._searchInput.focus(), 50));
  }
  _close() {
    this._dialog && (this._dialog.style.display = "none"), this._savedRange = null;
  }
}
const ri = [
  { id: "popular", label: "Popular" },
  { id: "interface", label: "Interface" },
  { id: "navigation", label: "Navigation" },
  { id: "media", label: "Media" },
  { id: "communication", label: "Communication" },
  { id: "files", label: "Files" },
  { id: "people", label: "People" },
  { id: "objects", label: "Objects" }
], ci = [
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
class hi {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(e) {
    this.context = e, this._dialog = null, this._disposers = [], this._savedRange = null, this._selectedIcon = null, this._activeCat = "all";
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
    const e = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((i) => i.href || "").join(" ");
    if (/fontawesome|font-awesome/.test(e) || document.querySelector(".fa-solid, .fas, .far, .fab")) return;
    const t = document.createElement("link");
    t.id = "asn-fontawesome-css", t.rel = "stylesheet", t.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css", t.crossOrigin = "anonymous", t.referrerPolicy = "no-referrer", document.head.appendChild(t);
  }
  destroy() {
    this._disposers.forEach((e) => e()), this._disposers = [], this._dialog && this._dialog.parentNode && this._dialog.parentNode.removeChild(this._dialog), this._dialog = null;
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  show() {
    U((e) => {
      this._savedRange = e;
    }), this._selectedIcon = null, this._activeCat = "all", this._searchInput.value = "", this._updateCatTabs(), this._filterIcons("", "all"), this._updatePreview(null), this._open();
  }
  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------
  _buildDialog() {
    const e = r("div", {
      class: "asn-dialog-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Insert FA icon"
    }), t = r("div", { class: "asn-dialog-box asn-icon-box" }), i = r("div", { class: "asn-icon-title-row" }), o = r("h3", { class: "asn-dialog-title" });
    o.textContent = "Insert FA Icon";
    const n = r("button", { type: "button", class: "asn-icon-close", "aria-label": "Close" });
    n.innerHTML = "&times;", i.append(o, n);
    const l = r("input", {
      type: "search",
      class: "asn-input asn-icon-search",
      placeholder: "Search icons…",
      autocomplete: "off"
    });
    this._searchInput = l;
    const a = r("div", { class: "asn-icon-cats" }), c = r("button", { type: "button", class: "asn-icon-cat active", "data-cat": "all" });
    c.textContent = "All", a.appendChild(c), ri.forEach(({ id: E, label: A }) => {
      const M = r("button", { type: "button", class: "asn-icon-cat", "data-cat": E });
      M.textContent = A, a.appendChild(M);
    }), this._catBar = a;
    const d = r("div", { class: "asn-icon-grid" });
    ci.forEach(([E, A]) => {
      const M = r("button", { type: "button", class: "asn-icon-cell", "data-name": E, "data-cat": A, title: E }), Re = r("i", { class: "fa-solid fa-" + E, "aria-hidden": "true" }), ee = r("span");
      ee.textContent = E, M.append(Re, ee), d.appendChild(M);
    }), this._grid = d;
    const p = r("div", { class: "asn-icon-options" }), u = r("label", { class: "asn-label" });
    u.textContent = "Style";
    const f = r("select", { class: "asn-input asn-icon-option-select" });
    [["fa-solid", "Solid"], ["fa-regular", "Regular"], ["fa-light", "Light (Pro)"]].forEach(([E, A]) => {
      const M = r("option", { value: E });
      M.textContent = A, f.appendChild(M);
    }), f.value = "fa-solid", this._styleSelect = f;
    const g = r("label", { class: "asn-label" });
    g.textContent = "Size";
    const y = r("select", { class: "asn-input asn-icon-option-select" });
    [["", "Inherit"], ["0.75em", "0.75em"], ["1em", "1em"], ["1.25em", "1.25em"], ["1.5em", "1.5em"], ["2em", "2em"], ["3em", "3em"]].forEach(([E, A]) => {
      const M = r("option", { value: E });
      E === "1em" && (M.selected = !0), M.textContent = A, y.appendChild(M);
    }), this._sizeSelect = y;
    const v = r("label", { class: "asn-label" });
    v.textContent = "Color";
    const x = r("input", { type: "color", class: "asn-icon-color", value: "#000000" });
    this._colorInput = x;
    const k = r("label", { class: "asn-label asn-label-inline asn-icon-use-color" }), j = r("input", { type: "checkbox", checked: "" });
    this._useColorCb = j, k.append(j, document.createTextNode(" Use color")), p.append(u, f, g, y, v, x, k);
    const L = r("div", { class: "asn-icon-preview" }), b = r("span", { class: "asn-icon-preview-hint" });
    b.textContent = "Select an icon", L.appendChild(b), this._preview = L;
    const m = r("div", { class: "asn-dialog-actions" }), _ = r("button", { type: "button", class: "asn-btn asn-btn-primary", disabled: "" });
    _.textContent = "Insert FA Icon";
    const I = r("button", { type: "button", class: "asn-btn" });
    I.textContent = "Cancel", m.append(_, I), this._insertBtn = _, t.append(i, l, a, d, p, L, m), e.appendChild(t);
    const R = h(n, "click", () => this._close()), N = h(I, "click", () => this._close()), X = h(_, "click", () => this._onInsert()), T = h(e, "click", (E) => {
      E.target === e && this._close();
    }), H = h(l, "input", () => this._filterIcons(l.value, this._activeCat)), Ee = h(a, "click", (E) => {
      const A = E.target.closest("[data-cat]");
      A && (this._activeCat = A.dataset.cat, this._updateCatTabs(), this._filterIcons(this._searchInput.value, this._activeCat));
    }), Be = h(d, "click", (E) => {
      const A = E.target.closest(".asn-icon-cell");
      A && this._selectIcon(A.dataset.name);
    }), Le = h(f, "change", () => this._updatePreview(this._selectedIcon)), Ae = h(y, "change", () => this._updatePreview(this._selectedIcon)), Se = h(x, "input", () => this._updatePreview(this._selectedIcon)), je = h(j, "change", () => this._updatePreview(this._selectedIcon)), Z = (E) => {
      E.key === "Escape" && this._close();
    };
    document.addEventListener("keydown", Z);
    const Me = () => document.removeEventListener("keydown", Z);
    return this._disposers.push(R, N, X, T, H, Ee, Be, Le, Ae, Se, je, Me), e;
  }
  // ---------------------------------------------------------------------------
  // Filter / select
  // ---------------------------------------------------------------------------
  _updateCatTabs() {
    this._catBar.querySelectorAll(".asn-icon-cat").forEach((e) => {
      e.classList.toggle("active", e.dataset.cat === this._activeCat);
    });
  }
  _filterIcons(e, t) {
    const i = (e || "").trim().toLowerCase();
    let o = 0;
    this._grid.querySelectorAll(".asn-icon-cell").forEach((l) => {
      const a = l.dataset.name, c = l.dataset.cat, d = !t || t === "all" || c === t, p = !i || a.includes(i), u = d && p;
      l.style.display = u ? "" : "none", u && o++;
    });
    let n = this._grid.querySelector(".asn-icon-empty");
    n || (n = r("div", { class: "asn-icon-empty" }), n.textContent = "No icons found", this._grid.appendChild(n)), n.style.display = o > 0 ? "none" : "";
  }
  _selectIcon(e) {
    this._selectedIcon = e, this._grid.querySelectorAll(".asn-icon-cell").forEach((t) => {
      t.classList.toggle("active", t.dataset.name === e);
    }), this._insertBtn.removeAttribute("disabled"), this._updatePreview(e);
  }
  _updatePreview(e) {
    if (!this._preview) return;
    if (!e) {
      this._preview.innerHTML = '<span class="asn-icon-preview-hint">Select an icon</span>';
      return;
    }
    const t = this._styleSelect && this._styleSelect.value || "fa-solid", i = this._sizeSelect && this._sizeSelect.value || "1em", n = (this._useColorCb ? this._useColorCb.checked : !1) && this._colorInput ? this._colorInput.value : "", l = [
      `font-size:${i}`,
      n ? `color:${n}` : ""
    ].filter(Boolean).join(";");
    this._preview.innerHTML = `<i class="${t} fa-${e}" aria-hidden="true"${l ? ` style="${l}"` : ""}></i><div class="asn-icon-preview-name">${t} fa-${e}</div>`;
  }
  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------
  _onInsert() {
    if (!this._selectedIcon) return;
    const e = this._styleSelect && this._styleSelect.value || "fa-solid", t = this._sizeSelect && this._sizeSelect.value || "", o = (this._useColorCb ? this._useColorCb.checked : !1) && this._colorInput ? this._colorInput.value : "", n = [
      t ? `font-size:${t}` : "",
      o ? `color:${o}` : ""
    ].filter(Boolean), l = document.createElement("i");
    l.className = `${e} fa-${this._selectedIcon}`, l.setAttribute("aria-hidden", "true"), n.length && l.setAttribute("style", n.join(";"));
    const a = this._savedRange, c = this.context.layoutInfo.editable;
    a && a.select();
    const d = window.getSelection();
    let p = d && d.rangeCount > 0 ? d.getRangeAt(0) : null;
    p || (p = document.createRange(), p.selectNodeContents(c), p.collapse(!1)), p.deleteContents(), p.insertNode(l);
    const u = document.createTextNode("​");
    l.parentNode.insertBefore(u, l.nextSibling), p.setStart(u, 1), p.collapse(!0), d && (d.removeAllRanges(), d.addRange(p)), this._close(), c.focus(), this.context.invoke("editor.afterCommand");
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
const B = {
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
}, di = [
  { name: "undo", label: "Undo", icon: B.undo, action: (s) => s.invoke("editor.undo") },
  { name: "redo", label: "Redo", icon: B.redo, action: (s) => s.invoke("editor.redo") },
  { separator: !0 },
  { name: "cut", label: "Cut", icon: B.cut, action: () => document.execCommand("cut") },
  { name: "copy", label: "Copy", icon: B.copy, action: () => document.execCommand("copy") },
  { name: "paste", label: "Paste", icon: B.paste, action: () => document.execCommand("paste") },
  { separator: !0 },
  { name: "bold", label: "Bold", icon: B.bold, action: (s) => s.invoke("editor.bold") },
  { name: "italic", label: "Italic", icon: B.italic, action: (s) => s.invoke("editor.italic") },
  { name: "underline", label: "Underline", icon: B.underline, action: (s) => s.invoke("editor.underline") },
  { separator: !0 },
  { name: "copyFormat", label: "Copy Format", icon: B.copyFormat, action: (s) => s.invoke("contextMenu.copyFormat") },
  { name: "pasteFormat", label: "Paste Format", icon: B.pasteFormat, action: (s) => s.invoke("contextMenu.pasteFormat"), disabled: (s) => !s.invoke("contextMenu.hasCopiedFormat") },
  { name: "removeFormat", label: "Remove Format", icon: B.removeFormat, action: (s) => s.invoke("contextMenu.removeFormat") },
  { separator: !0 },
  { name: "link", label: "Insert Link", icon: B.link, action: (s) => s.invoke("linkDialog.show") },
  { name: "image", label: "Insert Image", icon: B.image, action: (s) => s.invoke("imageDialog.show") },
  { name: "video", label: "Insert Video", icon: B.video, action: (s) => s.invoke("videoDialog.show") },
  { name: "table", label: "Insert Table", icon: B.table, tableGrid: !0 }
];
class pi {
  /** @param {import('../Context.js').Context} context */
  constructor(e) {
    this.context = e, this.options = e.options || {}, this._items = this.options.contextMenu && this.options.contextMenu.items || di, this.el = null, this._disposers = [], this._menuDisposers = [], this._lastX = 0, this._lastY = 0, this._copiedFormat = null, this._savedRange = null;
  }
  initialize() {
    this.el = r("div", { class: "asn-contextmenu", role: "menu", "aria-hidden": "true" }), this.el.style.display = "none", document.body.appendChild(this.el), this._renderItems(this._items);
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    return e && this._disposers.push(h(e, "contextmenu", (t) => this._onContextMenu(t))), this._disposers.push(h(document, "click", (t) => this._maybeHide(t))), this._disposers.push(h(document, "keydown", (t) => {
      t.key === "Escape" && this.hide();
    })), this._disposers.push(h(window, "scroll", () => this.hide(), { passive: !0 })), this;
  }
  destroy() {
    this._menuDisposers.forEach((e) => {
      try {
        e();
      } catch {
      }
    }), this._menuDisposers = [], this._disposers.forEach((e) => {
      try {
        e();
      } catch {
      }
    }), this._disposers = [], this.el && this.el.parentNode && this.el.parentNode.removeChild(this.el), this.el = null;
  }
  _renderItems(e) {
    this._menuDisposers.forEach((t) => t()), this._menuDisposers = [], this.el && (this.el.innerHTML = "", e.forEach((t) => {
      if (t.separator || t.sep) {
        this.el.appendChild(r("div", { class: "asn-context-sep" }));
        return;
      }
      if (t.back) {
        const n = r("button", { type: "button", class: "asn-context-back" }), l = r("span", { class: "asn-context-icon", "aria-hidden": "true" });
        l.innerHTML = B.back, n.appendChild(l), n.appendChild(r("span", { class: "asn-context-label" }, [t.label || "Back"]));
        const a = h(n, "click", (c) => {
          c.stopPropagation(), this._renderItems(t.navigate()), this._reposition();
        });
        this._menuDisposers.push(a), this.el.appendChild(n);
        return;
      }
      if (t.navigate) {
        const n = r("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": t.name || "" });
        if (t.icon) {
          const c = r("span", { class: "asn-context-icon", "aria-hidden": "true" });
          c.innerHTML = t.icon, n.appendChild(c);
        }
        n.appendChild(r("span", { class: "asn-context-label" }, [t.label || t.name]));
        const l = r("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        l.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', n.appendChild(l);
        const a = h(n, "click", (c) => {
          c.stopPropagation(), this._renderItems(t.navigate()), this._reposition();
        });
        this._menuDisposers.push(a), this.el.appendChild(n);
        return;
      }
      if (t.tableGrid) {
        const a = r("div", { class: "asn-context-table-wrap" }), c = r("button", { type: "button", class: "asn-context-item asn-context-submenu", "data-name": t.name || "table" });
        if (t.icon) {
          const b = r("span", { class: "asn-context-icon", "aria-hidden": "true" });
          b.innerHTML = t.icon, c.appendChild(b);
        }
        c.appendChild(r("span", { class: "asn-context-label" }, [t.label || "Insert Table"]));
        const d = r("span", { class: "asn-context-chevron", "aria-hidden": "true" });
        d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', c.appendChild(d);
        const p = r("div", { class: "asn-context-table-grid-panel" });
        p.style.display = "none";
        const u = r("div", { class: "asn-table-grid" });
        u.style.gridTemplateColumns = "repeat(8, 16px)";
        const f = r("div", { class: "asn-table-label" });
        f.textContent = "Insert Table";
        const g = [];
        for (let b = 1; b <= 8; b++)
          for (let m = 1; m <= 8; m++) {
            const _ = r("div", { class: "asn-table-cell", "data-row": String(b), "data-col": String(m) });
            _.style.width = "16px", _.style.height = "16px", g.push(_), u.appendChild(_);
          }
        const y = (b, m) => {
          g.forEach((_) => {
            _.classList.toggle("active", +_.dataset.row <= b && +_.dataset.col <= m);
          }), f.textContent = b && m ? `${m} × ${b}` : "Insert Table";
        };
        p.appendChild(u), p.appendChild(f);
        let v = !1;
        const x = h(c, "click", (b) => {
          b.stopPropagation(), v = !v, p.style.display = v ? "" : "none", d.style.transform = v ? "rotate(90deg)" : "", this._reposition();
        });
        this._menuDisposers.push(x);
        const k = h(u, "mousemove", (b) => {
          const m = b.target.closest("[data-row]");
          m && y(+m.dataset.row, +m.dataset.col);
        }), j = h(u, "mouseleave", () => y(0, 0)), L = h(u, "click", (b) => {
          const m = b.target.closest("[data-row]");
          if (!m) return;
          const _ = +m.dataset.row, I = +m.dataset.col, R = this.context.layoutInfo && this.context.layoutInfo.editable;
          if (R && this._savedRange) {
            R.focus();
            const N = window.getSelection();
            N.removeAllRanges(), N.addRange(this._savedRange.cloneRange());
          }
          this.hide(), this.context.invoke("editor.insertTable", I, _);
        });
        this._menuDisposers.push(k, j, L), a.appendChild(c), a.appendChild(p), this.el.appendChild(a);
        return;
      }
      const i = r("button", { type: "button", class: "asn-context-item", "data-name": t.name || "" });
      if ((typeof t.disabled == "function" ? t.disabled(this.context) : t.disabled) && (i.disabled = !0), t.icon) {
        const n = r("span", { class: "asn-context-icon", "aria-hidden": "true" });
        n.innerHTML = t.icon, i.appendChild(n);
      }
      i.appendChild(r("span", { class: "asn-context-label" }, [t.label || t.name]));
      const o = h(i, "click", (n) => {
        n.stopPropagation(), this.hide();
        try {
          t.action(this.context);
        } catch (l) {
          console.error(l);
        }
      });
      this._menuDisposers.push(o), this.el.appendChild(i);
    }));
  }
  _onContextMenu(e) {
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!t || !t.contains(e.target)) return;
    e.preventDefault(), this._lastX = e.clientX, this._lastY = e.clientY;
    const i = window.getSelection();
    this._savedRange = i && i.rangeCount > 0 ? i.getRangeAt(0).cloneRange() : null, this._renderItems(this._items), this.showAt(e.clientX, e.clientY);
  }
  _maybeHide(e) {
    this.el && (this.el.contains(e.target) || this.hide());
  }
  showAt(e, t) {
    this.el && (this.el.style.display = "block", this._reposition(e, t), this.el.setAttribute("aria-hidden", "false"));
  }
  _reposition(e, t) {
    if (!this.el) return;
    const i = e !== void 0 ? e : this._lastX, o = t !== void 0 ? t : this._lastY, n = this.el.getBoundingClientRect();
    let l = i, a = o;
    l + n.width > window.innerWidth && (l = window.innerWidth - n.width - 8), a + n.height > window.innerHeight && (a = window.innerHeight - n.height - 8), this.el.style.left = `${l}px`, this.el.style.top = `${a}px`;
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
    const e = this._savedRange;
    if (!e) return;
    const t = this.context.layoutInfo && this.context.layoutInfo.editable;
    let i = e.startContainer;
    if (i.nodeType === Node.TEXT_NODE && (i = i.parentElement), !i || !t || !t.contains(i)) return;
    const o = window.getComputedStyle(i), n = this._findExplicitStyle(i, t, "fontFamily"), l = this._findExplicitStyle(i, t, "fontSize");
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
  _findExplicitStyle(e, t, i) {
    let o = e;
    for (; o && o !== t && o !== document.body; ) {
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
  _isDefaultColor(e) {
    return !e || e === "rgb(0, 0, 0)" || e === "rgba(0, 0, 0, 0)" || e === "transparent";
  }
  /** Apply the most-recently copied format to the saved selection. */
  pasteFormat() {
    if (!this._copiedFormat || !this._savedRange) return;
    const e = this._copiedFormat, t = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!t) return;
    t.focus();
    const i = window.getSelection();
    if (i.removeAllRanges(), i.addRange(this._savedRange.cloneRange()), document.execCommand("removeFormat"), e.bold && document.execCommand("bold"), e.italic && document.execCommand("italic"), e.underline && document.execCommand("underline"), e.strikethrough && document.execCommand("strikeThrough"), e.color && document.execCommand("foreColor", !1, e.color), ((n) => !n || n === "rgba(0, 0, 0, 0)" || n === "transparent")(e.backgroundColor) || document.execCommand("hiliteColor", !1, e.backgroundColor), e.fontSize) {
      const n = `fs-${Date.now()}`;
      document.execCommand("fontSize", !1, "7"), t.querySelectorAll('font[size="7"]').forEach((l) => l.setAttribute("data-asn-tmp", n)), t.querySelectorAll(`[data-asn-tmp="${n}"]`).forEach((l) => {
        const a = document.createElement("span");
        for (a.style.fontSize = e.fontSize, l.parentNode.insertBefore(a, l); l.firstChild; ) a.appendChild(l.firstChild);
        l.parentNode.removeChild(l);
      });
    }
    e.fontFamily && document.execCommand("fontName", !1, e.fontFamily), this.context.invoke("editor.afterCommand");
  }
  /** Strip all inline formatting from the saved selection. */
  removeFormat() {
    if (!this._savedRange) return;
    const e = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!e) return;
    const t = window.getSelection();
    t.removeAllRanges(), t.addRange(this._savedRange.cloneRange()), e.focus(), document.execCommand("removeFormat");
    const i = t.getRangeAt(0), o = i.commonAncestorContainer, n = o.nodeType === Node.TEXT_NODE ? o.parentElement : o, l = document.createNodeIterator(n, NodeFilter.SHOW_ELEMENT);
    let a;
    for (; a = l.nextNode(); )
      if (!(!e.contains(a) || a === e))
        try {
          i.intersectsNode(a) && a.removeAttribute("style");
        } catch {
        }
    this.context.invoke("editor.afterCommand");
  }
}
class ui {
  /**
   * @param {HTMLElement} targetEl - The element to replace with the editor
   * @param {import('./settings.js').AsnOptions} [userOptions]
   */
  constructor(e, t = {}) {
    this.targetEl = e, this.options = ne(Ie, t), this.layoutInfo = {}, this._listeners = /* @__PURE__ */ new Map(), this._modules = /* @__PURE__ */ new Map(), this._disposers = [], this._alive = !1;
  }
  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------
  initialize() {
    const { container: e, editable: t } = Ct(this.targetEl, this.options);
    this.layoutInfo.container = e, this.layoutInfo.editable = t, this._registerModules();
    const i = this._modules.get("toolbar");
    i && i.el && (e.insertBefore(i.el, t), this.layoutInfo.toolbar = i.el);
    const o = this._modules.get("statusbar");
    return o && o.el && (e.appendChild(o.el), this.layoutInfo.statusbar = o.el), this._bindEditorEvents(t), this.options.focus && t.focus(), this._alive = !0, this.invoke("toolbar.refresh"), this;
  }
  _registerModules() {
    const e = (t, i) => {
      const o = new i(this);
      o.initialize(), this._modules.set(t, o);
    };
    e("editor", At), e("toolbar", St), e("statusbar", jt), e("clipboard", Mt), e("contextMenu", pi), e("placeholder", Rt), e("codeview", zt), e("fullscreen", Nt), e("linkDialog", Ht), e("imageDialog", Pt), e("videoDialog", Dt), e("imageResizer", $t), e("videoResizer", Wt), e("linkTooltip", Vt), e("imageTooltip", Kt), e("videoTooltip", Jt), e("tableTooltip", ti), e("codeTooltip", oi), e("emojiDialog", ai), e("iconDialog", hi);
  }
  _bindEditorEvents(e) {
    const t = h(e, "focus", () => {
      this.layoutInfo.container.classList.add("asn-focused"), typeof this.options.onFocus == "function" && this.options.onFocus(this);
    }), i = h(e, "blur", () => {
      this.layoutInfo.container.classList.remove("asn-focused"), this._syncToTarget(), typeof this.options.onBlur == "function" && this.options.onBlur(this);
    });
    this._disposers.push(t, i);
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
  invoke(e, ...t) {
    var l, a;
    const [i, o] = e.split("."), n = this._modules.get(i);
    if (!n) {
      (typeof process > "u" || ((l = process.env) == null ? void 0 : l.NODE_ENV) !== "production") && console.warn(`[AfterSummerNote] invoke: module "${i}" not found (path: "${e}")`);
      return;
    }
    if (typeof n[o] != "function") {
      (typeof process > "u" || ((a = process.env) == null ? void 0 : a.NODE_ENV) !== "production") && console.warn(`[AfterSummerNote] invoke: method "${o}" not found on module "${i}" (path: "${e}")`);
      return;
    }
    return n[o](...t);
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
  on(e, t) {
    return this._listeners.has(e) || this._listeners.set(e, []), this._listeners.get(e).push(t), () => this.off(e, t);
  }
  /**
   * Unsubscribes from an editor event.
   * @param {string} eventName
   * @param {Function} handler
   */
  off(e, t) {
    const i = this._listeners.get(e);
    if (!i) return;
    const o = i.indexOf(t);
    o !== -1 && i.splice(o, 1);
  }
  /**
   * Triggers an editor event.
   * @param {string} eventName
   * @param {...*} args
   */
  triggerEvent(e, ...t) {
    (this._listeners.get(e) || []).forEach((n) => n(...t));
    const o = "on" + e.charAt(0).toUpperCase() + e.slice(1);
    typeof this.options[o] == "function" && this.options[o](...t);
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
  setHTML(e) {
    this.invoke("editor.setHTML", e);
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
  setDisabled(e) {
    const t = this.layoutInfo.editable;
    e ? (t.setAttribute("contenteditable", "false"), this.layoutInfo.container.classList.add("asn-disabled")) : (t.setAttribute("contenteditable", "true"), this.layoutInfo.container.classList.remove("asn-disabled"));
  }
  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------
  /**
   * Completely removes the editor and restores the original element.
   */
  destroy() {
    if (!this._alive) return;
    this._modules.forEach((t) => {
      typeof t.destroy == "function" && t.destroy();
    }), this._modules.clear(), this._disposers.forEach((t) => t()), this._disposers = [];
    const e = this.layoutInfo.container;
    e && e.parentNode && (this.targetEl.style.display = "", e.parentNode.removeChild(e)), this._alive = !1, this._listeners.clear();
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
function Ui(s) {
  return s[s.length - 1];
}
function qi(s) {
  return s[0];
}
function Vi(s, e = 1) {
  return s.slice(0, s.length - e);
}
function Yi(s, e = 1) {
  return s.slice(e);
}
function Xi(s) {
  return s.reduce((e, t) => e.concat(t), []);
}
function Ki(s) {
  return [...new Set(s)];
}
function Gi(s, e) {
  const t = [];
  for (let i = 0; i < s.length; i += e)
    t.push(s.slice(i, i + e));
  return t;
}
function Qi(s, e) {
  return s.reduce((t, i) => {
    const o = e(i);
    return t[o] || (t[o] = []), t[o].push(i), t;
  }, {});
}
function Ji(s, e) {
  return s.every(e);
}
function Zi(s, e) {
  return s.some(e);
}
const P = navigator.userAgent, es = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(P),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(P),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(P),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(P),
  /** True if running on macOS */
  isMac: /Macintosh/.test(P),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(P),
  /** True if touch is supported */
  isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(P) ? "metaKey" : "ctrlKey"
}, F = /* @__PURE__ */ new WeakMap(), ts = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(s, e = {}) {
    const i = oe(s).map((o) => {
      if (F.has(o)) return F.get(o);
      const n = new ui(o, e);
      return n.initialize(), F.set(o, n), n;
    });
    return i.length === 1 ? i[0] : i;
  },
  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(s) {
    oe(s).forEach((e) => {
      const t = F.get(e);
      t && (t.destroy(), F.delete(e));
    });
  },
  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(s) {
    const e = typeof s == "string" ? document.querySelector(s) : s;
    return e && F.get(e) || null;
  },
  /** Default options (can be mutated globally before calling create). */
  defaults: Ie,
  /** Library version */
  version: "1.0.0"
};
function oe(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : s instanceof Element ? [s] : s instanceof NodeList || Array.isArray(s) ? Array.from(s) : [];
}
export {
  ui as Context,
  Ne as ELEMENT_NODE,
  He as TEXT_NODE,
  J as WrappedRange,
  Ji as all,
  Ei as ancestors,
  Zi as any,
  Bi as children,
  Gi as chunk,
  mi as clamp,
  Q as closest,
  te as closestPara,
  $i as collapsedRange,
  gi as compose,
  r as createElement,
  ie as currentRange,
  ze as debounce,
  ts as default,
  Ie as defaultOptions,
  es as env,
  qi as first,
  Xi as flatten,
  ae as fromNativeRange,
  Qi as groupBy,
  yi as identity,
  Vi as initial,
  Ri as insertAfter,
  Ti as isAnchor,
  $e as isEditable,
  S as isElement,
  Ni as isEmpty,
  vi as isFunction,
  Ii as isImage,
  Ci as isInline,
  Di as isInsideEditable,
  Y as isKey,
  Oe as isLi,
  xi as isList,
  D as isModifier,
  _i as isNil,
  De as isPara,
  K as isPlainObject,
  Fi as isSelectionInside,
  bi as isString,
  ki as isTable,
  le as isText,
  Pe as isVoid,
  G as key,
  Ui as last,
  ne as mergeDeep,
  Ai as nextElement,
  zi as nodeValue,
  h as on,
  Hi as outerHtml,
  Pi as placeCaret,
  Li as prevElement,
  Oi as rangeFromElement,
  wi as rect2bnd,
  Si as remove,
  W as sanitiseHTML,
  se as sanitiseUrl,
  Wi as splitText,
  Yi as tail,
  fi as throttle,
  Ki as unique,
  ji as unwrap,
  U as withSavedRange,
  Mi as wrap
};
//# sourceMappingURL=aftersummernote.es.js.map
