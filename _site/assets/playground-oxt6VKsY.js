import{t as e}from"./all-BHMBkMrE.js";/* empty css                   */var t=[{id:1,label:`Minh Pham`},{id:2,label:`An Nguyen`},{id:3,label:`Linh Tran`},{id:4,label:`Duc Le`},{id:5,label:`Hoa Vo`}],n={empty:``,transparent:`<h2>Borderless layout table</h2>
<p>This table has <strong>transparent borders</strong> and a transparent header — the dashed lines are an editing guide only and are not saved. Hover a cell and open the border-colour or cell-background picker in the table toolbar to try the checkerboard swatch.</p>
<table class="an-table"><thead><tr><th style="border-color: transparent; background-color: transparent">Plan</th><th style="border-color: transparent; background-color: transparent">Price</th><th style="border-color: transparent; background-color: transparent">Editors</th></tr></thead>
<tbody>
<tr><td style="border-color: transparent">Starter</td><td style="border-color: transparent">Free</td><td style="border-color: transparent">1</td></tr>
<tr><td style="border-color: transparent">Team</td><td style="border-color: transparent">$9</td><td style="border-color: transparent">10</td></tr>
<tr><td style="border-color: transparent">Studio</td><td style="border-color: transparent">$29</td><td style="border-color: transparent">Unlimited</td></tr>
</tbody></table>
<p>Select some text and pick the <span style="background-color: #fff2cc">highlight</span> colour, then choose <em>Transparent</em> to clear it.</p>`,article:`<h1>Getting Started with Autumn Note</h1>
<p>Autumn Note is a <strong>zero-dependency WYSIWYG editor</strong> built with vanilla JavaScript. Install it in seconds:</p>
<pre><code class="language-bash">npm install autumnnote</code></pre>
<h2>Basic Setup</h2>
<p>Add a <em>textarea</em> or <em>div</em> to your HTML, then call <code>AutumnNote.create()</code>:</p>
<pre><code class="language-js">const editor = AutumnNote.create('#editor', {
  placeholder: 'Start writing…',
  height: 300,
  bubbleToolbar: true,
  onChange(html) { console.log(html); },
});</code></pre>
<h2>Key Features</h2>
<ul><li>Rich formatting: bold, italic, underline, strikethrough</li><li>Tables with merge/split support</li><li>Image upload with drag-and-drop</li><li>@mention autocomplete</li><li>Find &amp; Replace</li><li>8 built-in languages</li></ul>`,checklist:`<h2>My Project Checklist</h2>
<ul class="an-checklist">
  <li><input type="checkbox" contenteditable="false" checked>Set up project repository</li>
  <li><input type="checkbox" contenteditable="false" checked>Install dependencies</li>
  <li><input type="checkbox" contenteditable="false">Configure linting &amp; formatting</li>
  <li><input type="checkbox" contenteditable="false">Write unit tests</li>
  <li><input type="checkbox" contenteditable="false">Set up CI pipeline</li>
  <li><input type="checkbox" contenteditable="false">Deploy to staging</li>
  <li><input type="checkbox" contenteditable="false">Code review &amp; sign-off</li>
</ul>
<p>Progress: <strong>2 / 7</strong> tasks completed</p>`,table:`<h2>Product Comparison</h2>
<table class="an-table"><thead><tr><th>Feature</th><th>Free</th><th>Pro</th><th>Enterprise</th></tr></thead>
<tbody>
<tr><td>Rich text editing</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Image upload</td><td>5 MB</td><td>50 MB</td><td>Unlimited</td></tr>
<tr><td>Collaboration</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Custom toolbar</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Plugin API</td><td>—</td><td>—</td><td>✓</td></tr>
<tr><td>Priority support</td><td>—</td><td>—</td><td>✓</td></tr>
</tbody></table>
<p>All plans include <strong>unlimited editors per page</strong> and <strong>TypeScript support</strong>.</p>`,code:`<h2>Code Example</h2>
<p>Here is a JavaScript example showing the Plugin API:</p>
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
});</code></pre>`,formatting:`<h1>Rich Formatting Demo</h1>
<p>Autumn Note supports <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<p>You can also use <sup>superscript</sup> and <sub>subscript</sub>.</p>
<h2>Text Colours</h2>
<p><span style="color:#e11d48">Red text</span>, <span style="color:#2563eb">blue text</span>, <span style="background-color:#fef08a">highlighted text</span>.</p>
<h2>Blockquote</h2>
<blockquote>Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs</blockquote>
<h2>Lists</h2>
<ul><li>Unordered item one</li><li>Unordered item two</li><li>Unordered item three</li></ul>
<ol><li>First ordered step</li><li>Second ordered step</li><li>Third ordered step</li></ol>`},r=`---
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
[^1]: Footnotes render as superscript markers.`,i={solid:{transparency:0,vars:{}},glass:{transparency:40,vars:{"menu-border":`color-mix(in srgb, var(--an-border, #d1d5db) 55%, transparent)`,"menu-backdrop":`blur(12px) saturate(1.5)`}},transparent:{transparency:100,vars:{"menu-shadow":`none`}},borderless:{transparency:100,vars:{"menu-border":`transparent`,"menu-shadow":`none`}}};function a(e,t){let n=i[e]||i.solid,r=Math.min(100,Math.max(0,Number(t)||0)),a={...n.vars};return r>0&&(a[`menu-opacity`]=`${100-r}%`),Object.keys(a).length?a:null}function o(e){let t=document.getElementById(`cfg-menu-t`);t.value=String(e),document.getElementById(`cfg-menu-t-val`).textContent=`${t.value}%`}document.getElementById(`cfg-menu`).addEventListener(`change`,e=>{o(i[e.target.value]?.transparency??0),c&&(c.updateOptions({themeVars:null}),s())}),document.getElementById(`cfg-menu-t`).addEventListener(`input`,e=>{o(e.target.value),s()});function s(){if(!c)return;let e=u();c.updateOptions({themeVars:null});let t=a(e.menuStyle,e.menuTransparency);t&&c.updateOptions({themeVars:t}),m()}var c=null,l=`html`;function u(){let e={theme:document.getElementById(`cfg-theme`).value,lang:document.getElementById(`cfg-lang`).value,bubbleToolbar:document.getElementById(`cfg-bubble`).checked,markdownShortcuts:document.getElementById(`cfg-markdown`).checked,stickyToolbar:document.getElementById(`cfg-sticky`).checked,readOnly:document.getElementById(`cfg-readonly`).checked,maxChars:Number.parseInt(document.getElementById(`cfg-maxchars`).value)||0,focusColor:document.getElementById(`cfg-color`).value,menuStyle:document.getElementById(`cfg-menu`).value,menuTransparency:Number(document.getElementById(`cfg-menu-t`).value)},t=Number.parseInt(document.getElementById(`cfg-height`).value);return e.height=t>0?t:300,e}function d(n){c&&=(n??=c.getHTML(),e.destroy(c.targetEl),null);let r=u();document.body.classList.toggle(`dark`,r.theme===`dark`);let i=document.getElementById(`editor-panel`),o=r.focusColor||`#E87824`;if(i.style.setProperty(`--pg-focus-color`,o),/^#[0-9a-f]{6}$/i.test(o)){let e=Number.parseInt(o.slice(1,3),16),t=Number.parseInt(o.slice(3,5),16),n=Number.parseInt(o.slice(5,7),16);i.style.setProperty(`--pg-focus-shadow`,`rgba(${e},${t},${n},.2)`)}let{menuStyle:s,menuTransparency:l,...d}=r;c=e.create(`#editor-el`,{...d,themeVars:a(s,l),placeholder:`Start typing…`,codeHighlight:!0,resizable:!0,mention:{onSearch(e,n){let r=e.toLowerCase();n(r?t.filter(e=>e.label.toLowerCase().includes(r)):t)}},onFocus:()=>i.classList.add(`is-focused`),onBlur:()=>i.classList.remove(`is-focused`),onChange:f}),n&&c.setHTML(n),f(),m()}function f(){if(!c)return;document.getElementById(`out-html`).textContent=c.getHTML(),document.getElementById(`out-markdown`).textContent=c.getMarkdown();let e=c.getWordCount(),t=c.getCharCount(),n=(c.getHTML().match(/<p[\s>]/gi)||[]).length,r=Math.max(1,Math.round(e/200));document.getElementById(`stat-words`).textContent=e,document.getElementById(`stat-chars`).textContent=t,document.getElementById(`stat-read`).textContent=r+` min`,document.getElementById(`stat-para`).textContent=n}window.applyConfig=()=>d(),window.loadSnippet=e=>{c&&(e===`markdown`?c.setMarkdown(r):c.setHTML(n[e]||``)),f()},window.switchTab=e=>{l=e,document.querySelectorAll(`.output-tab`).forEach(t=>t.classList.toggle(`active`,t.dataset.tab===e)),document.querySelectorAll(`.output-pane`).forEach(t=>t.classList.toggle(`active`,t.id===`tab-`+e))},window.copyOutput=()=>{let e=``;l===`html`?e=c?.getHTML()||``:l===`markdown`&&(e=c?.getMarkdown()||``),navigator.clipboard.writeText(e).then(()=>{let e=document.querySelector(`.act-btn`),t=e.textContent;e.textContent=`✓ Copied!`,setTimeout(()=>{e.textContent=t},1500)}).catch(()=>{})},window.downloadOutput=()=>{if(!c)return;let e,t,n;l===`markdown`?(e=c.getMarkdown(),t=`document.md`,n=`text/markdown`):(e=c.getHTML(),t=`document.html`,n=`text/html`);let r=document.createElement(`a`);r.href=URL.createObjectURL(new Blob([e],{type:n})),r.download=t,r.click(),URL.revokeObjectURL(r.href)},window.sharePlayground=()=>{if(!c)return;let e={cfg:u(),html:c.getHTML()},t=btoa(encodeURIComponent(JSON.stringify(e))),n=location.origin+location.pathname+`#`+t;navigator.clipboard.writeText(n).then(()=>{let e=document.querySelector(`.act-btn.primary`),t=e.textContent;e.textContent=`✓ Link copied!`,setTimeout(()=>{e.textContent=t},2e3)}).catch(()=>{prompt(`Copy this URL:`,n)})};function p(){try{if(!location.hash)return null;let e=JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));if(e.cfg){let t=e.cfg;t.theme&&(document.getElementById(`cfg-theme`).value=t.theme),t.lang&&(document.getElementById(`cfg-lang`).value=t.lang),document.getElementById(`cfg-bubble`).checked=!!t.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=!!t.markdownShortcuts,document.getElementById(`cfg-sticky`).checked=!!t.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!t.readOnly,t.maxChars&&(document.getElementById(`cfg-maxchars`).value=t.maxChars),t.focusColor&&(document.getElementById(`cfg-color`).value=t.focusColor),t.height&&(document.getElementById(`cfg-height`).value=t.height),i[t.menuStyle]!==void 0&&(document.getElementById(`cfg-menu`).value=t.menuStyle),o(Number.isFinite(t.menuTransparency)?t.menuTransparency:i[t.menuStyle]?.transparency??0)}return e.html||null}catch{return null}}function m(){try{localStorage.setItem(`an-playground-cfg`,JSON.stringify(u()))}catch{}}function h(){try{let e=JSON.parse(localStorage.getItem(`an-playground-cfg`)||`null`);if(!e)return;e.theme&&(document.getElementById(`cfg-theme`).value=e.theme),e.lang&&(document.getElementById(`cfg-lang`).value=e.lang),document.getElementById(`cfg-bubble`).checked=!!e.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=e.markdownShortcuts!==!1,document.getElementById(`cfg-sticky`).checked=!!e.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!e.readOnly,e.maxChars&&(document.getElementById(`cfg-maxchars`).value=e.maxChars),e.focusColor&&(document.getElementById(`cfg-color`).value=e.focusColor),e.height&&(document.getElementById(`cfg-height`).value=e.height),i[e.menuStyle]!==void 0&&(document.getElementById(`cfg-menu`).value=e.menuStyle),o(Number.isFinite(e.menuTransparency)?e.menuTransparency:i[e.menuStyle]?.transparency??0)}catch{}}var g=p();g||h(),document.body.classList.toggle(`dark`,document.getElementById(`cfg-theme`).value===`dark`),d(g||void 0);