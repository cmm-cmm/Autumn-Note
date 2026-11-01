import{t as e}from"./all-DvmGxi6c.js";/* empty css                   */var t=[{id:1,label:`Minh Pham`},{id:2,label:`An Nguyen`},{id:3,label:`Linh Tran`},{id:4,label:`Duc Le`},{id:5,label:`Hoa Vo`}],n={empty:``,transparent:`<h2>Bảng bố cục không viền</h2>
<p>Bảng này có <strong>viền trong suốt</strong> và tiêu đề nền trong suốt — các đường nét đứt chỉ là đường gợi ý khi soạn, không được lưu. Rê chuột vào một ô rồi mở bảng chọn màu viền hoặc màu nền ô trên thanh công cụ bảng để thử ô caro.</p>
<table class="an-table"><thead><tr><th style="border-color: transparent; background-color: transparent">Gói</th><th style="border-color: transparent; background-color: transparent">Giá</th><th style="border-color: transparent; background-color: transparent">Số editor</th></tr></thead>
<tbody>
<tr><td style="border-color: transparent">Khởi đầu</td><td style="border-color: transparent">Miễn phí</td><td style="border-color: transparent">1</td></tr>
<tr><td style="border-color: transparent">Nhóm</td><td style="border-color: transparent">$9</td><td style="border-color: transparent">10</td></tr>
<tr><td style="border-color: transparent">Studio</td><td style="border-color: transparent">$29</td><td style="border-color: transparent">Không giới hạn</td></tr>
</tbody></table>
<p>Chọn một đoạn chữ và tô màu <span style="background-color: #fff2cc">highlight</span>, rồi chọn <em>Trong suốt</em> để bỏ màu.</p>`,article:`<h1>Bắt đầu với Autumn Note</h1>
<p>Autumn Note là một <strong>trình soạn thảo WYSIWYG không phụ thuộc</strong>, được xây dựng bằng vanilla JavaScript. Cài đặt chỉ trong vài giây:</p>
<pre><code class="language-bash">npm install autumnnote</code></pre>
<h2>Thiết lập cơ bản</h2>
<p>Thêm một <em>textarea</em> hoặc <em>div</em> vào HTML, sau đó gọi <code>AutumnNote.create()</code>:</p>
<pre><code class="language-js">const editor = AutumnNote.create('#editor', {
  placeholder: 'Bắt đầu viết…',
  height: 300,
  bubbleToolbar: true,
  onChange(html) { console.log(html); },
});</code></pre>
<h2>Tính năng chính</h2>
<ul><li>Định dạng phong phú: đậm, nghiêng, gạch chân, gạch ngang</li><li>Bảng hỗ trợ gộp/tách ô</li><li>Tải ảnh lên bằng kéo-thả</li><li>Tự động gợi ý @mention</li><li>Tìm &amp; Thay thế</li><li>8 ngôn ngữ có sẵn</li></ul>`,checklist:`<h2>Danh sách công việc dự án</h2>
<ul class="an-checklist">
  <li><input type="checkbox" contenteditable="false" checked>Khởi tạo repository dự án</li>
  <li><input type="checkbox" contenteditable="false" checked>Cài đặt dependencies</li>
  <li><input type="checkbox" contenteditable="false">Cấu hình linting &amp; formatting</li>
  <li><input type="checkbox" contenteditable="false">Viết unit test</li>
  <li><input type="checkbox" contenteditable="false">Thiết lập pipeline CI</li>
  <li><input type="checkbox" contenteditable="false">Deploy lên staging</li>
  <li><input type="checkbox" contenteditable="false">Review code &amp; sign-off</li>
</ul>
<p>Tiến độ: <strong>2 / 7</strong> công việc hoàn thành</p>`,table:`<h2>So sánh sản phẩm</h2>
<table class="an-table"><thead><tr><th>Tính năng</th><th>Miễn phí</th><th>Pro</th><th>Enterprise</th></tr></thead>
<tbody>
<tr><td>Chỉnh sửa rich text</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Tải ảnh lên</td><td>5 MB</td><td>50 MB</td><td>Không giới hạn</td></tr>
<tr><td>Cộng tác</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Tùy chỉnh toolbar</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Plugin API</td><td>—</td><td>—</td><td>✓</td></tr>
<tr><td>Hỗ trợ ưu tiên</td><td>—</td><td>—</td><td>✓</td></tr>
</tbody></table>
<p>Tất cả gói đều bao gồm <strong>số lượng editor không giới hạn mỗi trang</strong> và <strong>hỗ trợ TypeScript</strong>.</p>`,code:`<h2>Ví dụ mã nguồn</h2>
<p>Đây là ví dụ JavaScript minh họa Plugin API:</p>
<pre><code class="language-js">// Define a plugin
const WordCountPlugin = {
  name: 'word-count',
  version: '1.0.0',
  buttons: [{
    name: 'wordCountBtn',
    icon: 'hashtag',
    tooltip: 'Show word count',
    action: (ctx) => {
      const n = ctx.getWordCount();
      alert(\`Document has \${n} words.\`);
    },
  }],
  install(ctx, opts) {
    ctx.on('change', () => {
      console.log('words:', ctx.getWordCount());
    });
    return { getMax: () => opts.maxWords };
  },
};

// Install globally
AutumnNote.use(WordCountPlugin, { maxWords: 500 });

const editor = AutumnNote.create('#editor', {
  toolbar: [['bold', 'italic', 'wordCountBtn']],
});</code></pre>`,formatting:`<h1>Demo định dạng phong phú</h1>
<p>Autumn Note hỗ trợ <strong>đậm</strong>, <em>nghiêng</em>, <u>gạch chân</u>, <s>gạch ngang</s>, và <code>mã inline</code>.</p>
<p>Bạn cũng có thể dùng <sup>chỉ số trên</sup> và <sub>chỉ số dưới</sub>.</p>
<h2>Màu chữ</h2>
<p><span style="color:#e11d48">Chữ đỏ</span>, <span style="color:#2563eb">chữ xanh</span>, <span style="background-color:#fef08a">chữ được tô sáng</span>.</p>
<h2>Trích dẫn</h2>
<blockquote>Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs</blockquote>
<h2>Danh sách</h2>
<ul><li>Mục không thứ tự một</li><li>Mục không thứ tự hai</li><li>Mục không thứ tự ba</li></ul>
<ol><li>Bước có thứ tự đầu tiên</li><li>Bước có thứ tự thứ hai</li><li>Bước có thứ tự thứ ba</li></ol>`},r=`---
title: Markdown Import Demo
---

Markdown Import
===============

This content was loaded from **raw markdown**, not HTML — the same pipeline used when you paste markdown text or drop a \`.md\` file. The frontmatter above was stripped automatically.

## Inline formatting ##

**Bold**, _italic_, ~~strikethrough~~, \`inline code\`, escaped \\*literals\\*, an autolink https://autumn.konexforge.com, a [reference link][repo], and a footnote[^1].

> Blockquotes nest:
> > with **block content** inside
> > - even lists

### Task list

- [x] Parse frontmatter
- [x] Align table columns
- [ ] Ship the next release

### Loose list

- First item

  with a second paragraph
- Second item

5. Ordered lists can start at any number
6. like this one

| Feature | Status | Notes |
| :------ | :----: | ----: |
| Tables | OK | aligned left / center / right |
| Escaped pipe | OK | a\\|b stays one cell |

- - -

\`\`\`js
// fenced code with language
const editor = AutumnNote.create('#editor');
\`\`\`

[repo]: https://github.com/cmm-cmm/Autumn-Note "Autumn Note repository"
[^1]: Footnotes render as superscript markers.`,i={solid:null,glass:{"menu-bg":`color-mix(in srgb, var(--an-bg, #ffffff) 62%, transparent)`,"menu-border":`color-mix(in srgb, var(--an-border, #d1d5db) 55%, transparent)`,"menu-backdrop":`blur(12px) saturate(1.5)`},transparent:{"menu-bg":`transparent`,"menu-shadow":`none`},borderless:{"menu-bg":`transparent`,"menu-border":`transparent`,"menu-shadow":`none`}},a=null,o=`html`;function s(){let e={theme:document.getElementById(`cfg-theme`).value,lang:document.getElementById(`cfg-lang`).value,bubbleToolbar:document.getElementById(`cfg-bubble`).checked,markdownShortcuts:document.getElementById(`cfg-markdown`).checked,stickyToolbar:document.getElementById(`cfg-sticky`).checked,readOnly:document.getElementById(`cfg-readonly`).checked,maxChars:Number.parseInt(document.getElementById(`cfg-maxchars`).value)||0,focusColor:document.getElementById(`cfg-color`).value,menuStyle:document.getElementById(`cfg-menu`).value},t=Number.parseInt(document.getElementById(`cfg-height`).value);return e.height=t>0?t:300,e}function c(n){a&&=(n??=a.getHTML(),e.destroy(a.targetEl),null);let r=s();document.body.classList.toggle(`dark`,r.theme===`dark`);let o=document.getElementById(`editor-panel`),c=r.focusColor||`#E87824`;if(o.style.setProperty(`--pg-focus-color`,c),/^#[0-9a-f]{6}$/i.test(c)){let e=Number.parseInt(c.slice(1,3),16),t=Number.parseInt(c.slice(3,5),16),n=Number.parseInt(c.slice(5,7),16);o.style.setProperty(`--pg-focus-shadow`,`rgba(${e},${t},${n},.2)`)}let{menuStyle:u,...f}=r;a=e.create(`#editor-el`,{...f,themeVars:i[u]||null,placeholder:`Bắt đầu gõ…`,codeHighlight:!0,resizable:!0,mention:{onSearch(e,n){let r=e.toLowerCase();n(r?t.filter(e=>e.label.toLowerCase().includes(r)):t)}},onFocus:()=>o.classList.add(`is-focused`),onBlur:()=>o.classList.remove(`is-focused`),onChange:l}),n&&a.setHTML(n),l(),d()}function l(){if(!a)return;document.getElementById(`out-html`).textContent=a.getHTML(),document.getElementById(`out-markdown`).textContent=a.getMarkdown();let e=a.getWordCount(),t=a.getCharCount(),n=(a.getHTML().match(/<p[\s>]/gi)||[]).length,r=Math.max(1,Math.round(e/200));document.getElementById(`stat-words`).textContent=e,document.getElementById(`stat-chars`).textContent=t,document.getElementById(`stat-read`).textContent=r+` phút`,document.getElementById(`stat-para`).textContent=n}window.applyConfig=()=>c(),window.loadSnippet=e=>{a&&(e===`markdown`?a.setMarkdown(r):a.setHTML(n[e]||``)),l()},window.switchTab=e=>{o=e,document.querySelectorAll(`.output-tab`).forEach(t=>t.classList.toggle(`active`,t.dataset.tab===e)),document.querySelectorAll(`.output-pane`).forEach(t=>t.classList.toggle(`active`,t.id===`tab-`+e))},window.copyOutput=()=>{let e=``;o===`html`?e=a?.getHTML()||``:o===`markdown`&&(e=a?.getMarkdown()||``),navigator.clipboard.writeText(e).then(()=>{let e=document.querySelector(`.act-btn`),t=e.textContent;e.textContent=`✓ Đã sao chép!`,setTimeout(()=>{e.textContent=t},1500)}).catch(()=>{})},window.downloadOutput=()=>{if(!a)return;let e,t,n;o===`markdown`?(e=a.getMarkdown(),t=`document.md`,n=`text/markdown`):(e=a.getHTML(),t=`document.html`,n=`text/html`);let r=document.createElement(`a`);r.href=URL.createObjectURL(new Blob([e],{type:n})),r.download=t,r.click(),URL.revokeObjectURL(r.href)},window.sharePlayground=()=>{if(!a)return;let e={cfg:s(),html:a.getHTML()},t=btoa(encodeURIComponent(JSON.stringify(e))),n=location.origin+location.pathname+`#`+t;navigator.clipboard.writeText(n).then(()=>{let e=document.querySelector(`.act-btn.primary`),t=e.textContent;e.textContent=`✓ Đã sao chép liên kết!`,setTimeout(()=>{e.textContent=t},2e3)}).catch(()=>{prompt(`Sao chép URL này:`,n)})};function u(){try{if(!location.hash)return null;let e=JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));if(e.cfg){let t=e.cfg;t.theme&&(document.getElementById(`cfg-theme`).value=t.theme),t.lang&&(document.getElementById(`cfg-lang`).value=t.lang),document.getElementById(`cfg-bubble`).checked=!!t.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=!!t.markdownShortcuts,document.getElementById(`cfg-sticky`).checked=!!t.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!t.readOnly,t.maxChars&&(document.getElementById(`cfg-maxchars`).value=t.maxChars),t.focusColor&&(document.getElementById(`cfg-color`).value=t.focusColor),t.height&&(document.getElementById(`cfg-height`).value=t.height),i[t.menuStyle]!==void 0&&(document.getElementById(`cfg-menu`).value=t.menuStyle)}return e.html||null}catch{return null}}function d(){try{localStorage.setItem(`an-playground-cfg`,JSON.stringify(s()))}catch{}}function f(){try{let e=JSON.parse(localStorage.getItem(`an-playground-cfg`)||`null`);if(!e)return;e.theme&&(document.getElementById(`cfg-theme`).value=e.theme),e.lang&&(document.getElementById(`cfg-lang`).value=e.lang),document.getElementById(`cfg-bubble`).checked=!!e.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=e.markdownShortcuts!==!1,document.getElementById(`cfg-sticky`).checked=!!e.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!e.readOnly,e.maxChars&&(document.getElementById(`cfg-maxchars`).value=e.maxChars),e.focusColor&&(document.getElementById(`cfg-color`).value=e.focusColor),e.height&&(document.getElementById(`cfg-height`).value=e.height),i[e.menuStyle]!==void 0&&(document.getElementById(`cfg-menu`).value=e.menuStyle)}catch{}}var p=u();p||f(),document.body.classList.toggle(`dark`,document.getElementById(`cfg-theme`).value===`dark`),c(p||void 0);