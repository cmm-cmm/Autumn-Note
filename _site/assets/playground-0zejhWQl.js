import{a as e,n as t,r as n,t as r}from"./site-C00g-u2h.js";import{t as i}from"./all-C2HHQk9z.js";var a=[{id:1,label:`editor`},{id:2,label:`reviewer`},{id:3,label:`designer`},{id:4,label:`support`},{id:5,label:`maintainer`}],o={empty:``,article:`<h1>Getting started with autumnnote-plus</h1>
<p>autumnnote-plus is a <strong>zero-dependency WYSIWYG editor</strong> built with vanilla JavaScript. Install it from npm:</p>
<pre><code class="language-bash">npm install autumnnote-plus</code></pre>
<h2>Basic setup</h2>
<p>Add a <em>textarea</em> or <em>div</em> to your HTML, then call <code>AutumnNote.create()</code>:</p>
<pre><code class="language-js">const editor = AutumnNote.create('#editor', {
  placeholder: 'Start writing…',
  height: 300,
  bubbleToolbar: true,
  onChange(html) { console.log(html); },
});</code></pre>
<h2>Key features</h2>
<ul><li>Rich formatting: bold, italic, underline, strikethrough</li><li>Tables with merge and split</li><li>Image upload with drag and drop</li><li>@mention autocomplete</li><li>Find &amp; replace</li><li>9 built-in languages</li></ul>`,checklist:`<h2>Release checklist</h2>
<ul class="an-checklist">
  <li><input type="checkbox" contenteditable="false" checked>Set up project repository</li>
  <li><input type="checkbox" contenteditable="false" checked>Install dependencies</li>
  <li><input type="checkbox" contenteditable="false">Configure linting &amp; formatting</li>
  <li><input type="checkbox" contenteditable="false">Write unit tests</li>
  <li><input type="checkbox" contenteditable="false">Set up CI pipeline</li>
  <li><input type="checkbox" contenteditable="false">Deploy to staging</li>
  <li><input type="checkbox" contenteditable="false">Code review &amp; sign-off</li>
</ul>
<p>Progress: <strong>2 / 7</strong> tasks completed</p>`,table:`<h2>Build sizes in 4.0.0</h2>
<table class="an-table"><thead><tr><th>Build</th><th>File</th><th>Size (gzip)</th></tr></thead>
<tbody>
<tr><td>ES module</td><td>dist/autumnnote.es.js</td><td>97.9 KiB</td></tr>
<tr><td>UMD (CDN)</td><td>dist/autumnnote.umd.js</td><td>93.4 KiB</td></tr>
<tr><td>Minified</td><td>dist/autumnnote.min.js</td><td>93.4 KiB</td></tr>
<tr><td>CommonJS</td><td>dist/autumnnote.cjs</td><td>93.4 KiB</td></tr>
<tr><td>Core ES module</td><td>dist/autumnnote.core.es.js</td><td>57.3 KiB</td></tr>
<tr><td>One locale</td><td>dist/i18n/&lt;code&gt;.umd.js</td><td>3.2 to 3.7 KiB</td></tr>
</tbody></table>
<p>Measured by <code>pnpm check:bundle</code>, which fails the build when a file leaves its budget.</p>`,code:`<h2>Code example</h2>
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
});</code></pre>`,formatting:`<h1>Rich formatting</h1>
<p>The editor supports <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<p>You can also use <sup>superscript</sup> and <sub>subscript</sub>.</p>
<h2>Text colours</h2>
<p><span style="color:#e11d48">Red text</span>, <span style="color:#2563eb">blue text</span>, <span style="background-color:#fef08a">highlighted text</span>.</p>
<h2>Blockquote</h2>
<blockquote>Design is not just what it looks like and feels like. Design is how it works. (Steve Jobs)</blockquote>
<h2>Lists</h2>
<ul><li>Unordered item one</li><li>Unordered item two</li><li>Unordered item three</li></ul>
<ol><li>First ordered step</li><li>Second ordered step</li><li>Third ordered step</li></ol>`},s=`---
title: Markdown Import Demo
---

Markdown Import
===============

This content was loaded from **raw markdown**, not HTML, the same pipeline used when you paste markdown text or drop a \`.md\` file. The frontmatter above was stripped automatically.

## Inline formatting ##

**Bold**, _italic_, ~~strikethrough~~, \`inline code\`, escaped \\*literals\\*, an autolink https://autumnnote.habibiahmada.dev, a [reference link][repo], and a footnote[^1].

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

[repo]: https://github.com/habibiahmada/autumnnote-plus "autumnnote-plus repository"
[^1]: Footnotes render as superscript markers.`,c=null,l=`html`;function u(){let e={theme:document.getElementById(`cfg-theme`).value,lang:document.getElementById(`cfg-lang`).value,bubbleToolbar:document.getElementById(`cfg-bubble`).checked,markdownShortcuts:document.getElementById(`cfg-markdown`).checked,stickyToolbar:document.getElementById(`cfg-sticky`).checked,readOnly:document.getElementById(`cfg-readonly`).checked,maxChars:Number.parseInt(document.getElementById(`cfg-maxchars`).value)||0,focusColor:document.getElementById(`cfg-color`).value},t=Number.parseInt(document.getElementById(`cfg-height`).value);return e.height=t>0?t:380,e}function d(t){let r=t===`site`?n():t;return r===`auto`?{theme:r,themeVars:null}:{theme:r,themeVars:e(r)}}function f(e){c&&=(e??=c.getHTML(),i.destroy(c.targetEl),null);let t=u(),n=document.getElementById(`editor-panel`);n.style.setProperty(`--pg-focus-color`,t.focusColor||`#2563eb`),c=i.create(`#editor-el`,{...t,...d(t.theme),placeholder:`Start typing…`,codeHighlight:!0,resizable:!0,stickyToolbarOffset:document.querySelector(`.site-header`).offsetHeight,mention:{onSearch(e,t){let n=e.toLowerCase();t(n?a.filter(e=>e.label.includes(n)):a)}},onFocus:()=>n.classList.add(`is-focused`),onBlur:()=>n.classList.remove(`is-focused`),onChange:p}),e&&c.setHTML(e),window.editor=c,p(),v()}function p(){if(!c)return;document.getElementById(`out-html`).textContent=c.getHTML(),document.getElementById(`out-markdown`).textContent=c.getMarkdown();let e=c.getWordCount(),t=c.getCharCount(),n=(c.getHTML().match(/<p[\s>]/gi)||[]).length,r=e?Math.max(1,Math.round(e/200)):0;document.getElementById(`stat-words`).textContent=e,document.getElementById(`stat-chars`).textContent=t,document.getElementById(`stat-read`).textContent=r+` min`,document.getElementById(`stat-para`).textContent=n}function m(){let e=l!==`stats`;document.getElementById(`copy-btn`).disabled=!e,document.getElementById(`download-btn`).disabled=!e}window.applyConfig=()=>{f(),r(`Options applied`)},window.loadSnippet=e=>{c&&(e===`markdown`?c.setMarkdown(s):c.setHTML(o[e]||``)),p(),r(e===`empty`?`Editor cleared`:`Sample content loaded`)},document.querySelector(`.output-tabs`).addEventListener(`tabs:change`,e=>{l=e.detail.tab.dataset.tab,m()}),window.switchTab=e=>{document.querySelector(`.output-tab[data-tab="${e}"]`)?.click()};function h(e,t,n=1600){let r=document.querySelector(`#${e} .btn-label`),i=r.dataset.original||r.textContent;r.dataset.original=i,r.textContent=t,setTimeout(()=>{r.textContent=i},n)}window.copyOutput=()=>{let e=``;l===`html`?e=c?.getHTML()||``:l===`markdown`&&(e=c?.getMarkdown()||``),t(e).then(()=>{h(`copy-btn`,`Copied`),r(`Copied to clipboard`)}).catch(()=>{h(`copy-btn`,`Copy failed`,2e3),r(`Copy failed. Select the output and copy it manually.`)})},window.downloadOutput=()=>{if(!c)return;let e,t,n;l===`markdown`?(e=c.getMarkdown(),t=`document.md`,n=`text/markdown`):(e=c.getHTML(),t=`document.html`,n=`text/html`);let i=document.createElement(`a`);i.href=URL.createObjectURL(new Blob([e],{type:n})),i.download=t,i.click(),setTimeout(()=>URL.revokeObjectURL(i.href),1e3),r(`Downloading ${t}`)},window.sharePlayground=()=>{if(!c)return;let e={cfg:u(),html:c.getHTML()},n=btoa(encodeURIComponent(JSON.stringify(e))),i=location.origin+location.pathname+`#`+n;t(i).then(()=>{h(`share-btn`,`Link copied`,2e3),r(`Share link copied to clipboard`)}).catch(()=>{prompt(`Copy this URL:`,i)})};function g(e,{markdownDefault:t}){let n=document.getElementById(`cfg-theme`);e.theme&&[...n.options].some(t=>t.value===e.theme)&&(n.value=e.theme),e.lang&&(document.getElementById(`cfg-lang`).value=e.lang),document.getElementById(`cfg-bubble`).checked=!!e.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=t?e.markdownShortcuts!==!1:!!e.markdownShortcuts,document.getElementById(`cfg-sticky`).checked=!!e.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!e.readOnly,e.maxChars&&(document.getElementById(`cfg-maxchars`).value=e.maxChars),e.focusColor&&(document.getElementById(`cfg-color`).value=e.focusColor),e.height&&(document.getElementById(`cfg-height`).value=e.height)}function _(){try{if(!location.hash)return null;let e=JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));return e.cfg&&g(e.cfg,{markdownDefault:!1}),e.html||null}catch{return null}}function v(){try{localStorage.setItem(`an-playground-cfg`,JSON.stringify(u()))}catch{}}function y(){try{let e=JSON.parse(localStorage.getItem(`an-playground-cfg`)||`null`);e&&g(e,{markdownDefault:!0})}catch{}}document.addEventListener(`site:themechange`,()=>{let e=document.getElementById(`cfg-theme`),t=e.value!==`site`;e.value=`site`,c&&c.updateOptions(d(`site`)),t&&(v(),r(`Editor theme now follows the site`))});var b=_();b||y(),f(b||void 0),m();