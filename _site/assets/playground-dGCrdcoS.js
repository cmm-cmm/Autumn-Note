import{t as e}from"./js-BAgs7FzB.js";var t={empty:``,article:`<h1>Getting Started with AutumnNote</h1>
<p>AutumnNote is a <strong>zero-dependency WYSIWYG editor</strong> built with vanilla JavaScript. Install it in seconds:</p>
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
<p>AutumnNote supports <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<p>You can also use <sup>superscript</sup> and <sub>subscript</sub>.</p>
<h2>Text Colours</h2>
<p><span style="color:#e11d48">Red text</span>, <span style="color:#2563eb">blue text</span>, <span style="background-color:#fef08a">highlighted text</span>.</p>
<h2>Blockquote</h2>
<blockquote>Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs</blockquote>
<h2>Lists</h2>
<ul><li>Unordered item one</li><li>Unordered item two</li><li>Unordered item three</li></ul>
<ol><li>First ordered step</li><li>Second ordered step</li><li>Third ordered step</li></ol>`},n=null,r=`html`;function i(){let e={theme:document.getElementById(`cfg-theme`).value,lang:document.getElementById(`cfg-lang`).value,bubbleToolbar:document.getElementById(`cfg-bubble`).checked,markdownShortcuts:document.getElementById(`cfg-markdown`).checked,stickyToolbar:document.getElementById(`cfg-sticky`).checked,readOnly:document.getElementById(`cfg-readonly`).checked,maxChars:parseInt(document.getElementById(`cfg-maxchars`).value)||0,focusColor:document.getElementById(`cfg-color`).value},t=parseInt(document.getElementById(`cfg-height`).value);return t>0&&(e.height=t),e}function a(t){n&&=(t??=n.getHTML(),n.destroy(),null);let r=i();n=e.create(`#editor-el`,{...r,placeholder:`Start typing…`,codeHighlight:!0,resizable:!0,onChange:o}),t&&n.setHTML(t),o(),c()}function o(){if(!n)return;document.getElementById(`out-html`).textContent=n.getHTML(),document.getElementById(`out-markdown`).textContent=n.getMarkdown();let e=n.getWordCount(),t=n.getCharCount(),r=(n.getHTML().match(/<p[\s>]/gi)||[]).length,i=Math.max(1,Math.round(e/200));document.getElementById(`stat-words`).textContent=e,document.getElementById(`stat-chars`).textContent=t,document.getElementById(`stat-read`).textContent=i+` min`,document.getElementById(`stat-para`).textContent=r}window.applyConfig=()=>a(),window.loadSnippet=e=>{n&&n.setHTML(t[e]||``),o()},window.switchTab=e=>{r=e,document.querySelectorAll(`.output-tab`).forEach(t=>t.classList.toggle(`active`,t.dataset.tab===e)),document.querySelectorAll(`.output-pane`).forEach(t=>t.classList.toggle(`active`,t.id===`tab-`+e))},window.copyOutput=()=>{let e=r===`html`?n?.getHTML()||``:r===`markdown`&&n?.getMarkdown()||``;navigator.clipboard.writeText(e).then(()=>{let e=document.querySelector(`.act-btn`),t=e.textContent;e.textContent=`✓ Copied!`,setTimeout(()=>{e.textContent=t},1500)}).catch(()=>{})},window.downloadOutput=()=>{if(!n)return;let e,t,i;r===`markdown`?(e=n.getMarkdown(),t=`document.md`,i=`text/markdown`):(e=n.getHTML(),t=`document.html`,i=`text/html`);let a=document.createElement(`a`);a.href=URL.createObjectURL(new Blob([e],{type:i})),a.download=t,a.click(),URL.revokeObjectURL(a.href)},window.sharePlayground=()=>{if(!n)return;let e={cfg:i(),html:n.getHTML()},t=btoa(encodeURIComponent(JSON.stringify(e))),r=location.origin+location.pathname+`#`+t;navigator.clipboard.writeText(r).then(()=>{let e=document.querySelector(`.act-btn.primary`),t=e.textContent;e.textContent=`✓ Link copied!`,setTimeout(()=>{e.textContent=t},2e3)}).catch(()=>{prompt(`Copy this URL:`,r)})};function s(){try{if(!location.hash)return null;let e=JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));if(e.cfg){let t=e.cfg;t.theme&&(document.getElementById(`cfg-theme`).value=t.theme),t.lang&&(document.getElementById(`cfg-lang`).value=t.lang),document.getElementById(`cfg-bubble`).checked=!!t.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=!!t.markdownShortcuts,document.getElementById(`cfg-sticky`).checked=!!t.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!t.readOnly,t.maxChars&&(document.getElementById(`cfg-maxchars`).value=t.maxChars),t.focusColor&&(document.getElementById(`cfg-color`).value=t.focusColor),t.height&&(document.getElementById(`cfg-height`).value=t.height)}return e.html||null}catch{return null}}function c(){try{localStorage.setItem(`an-playground-cfg`,JSON.stringify(i()))}catch{}}function l(){try{let e=JSON.parse(localStorage.getItem(`an-playground-cfg`)||`null`);if(!e)return;e.theme&&(document.getElementById(`cfg-theme`).value=e.theme),e.lang&&(document.getElementById(`cfg-lang`).value=e.lang),document.getElementById(`cfg-bubble`).checked=!!e.bubbleToolbar,document.getElementById(`cfg-markdown`).checked=e.markdownShortcuts!==!1,document.getElementById(`cfg-sticky`).checked=!!e.stickyToolbar,document.getElementById(`cfg-readonly`).checked=!!e.readOnly,e.maxChars&&(document.getElementById(`cfg-maxchars`).value=e.maxChars),e.focusColor&&(document.getElementById(`cfg-color`).value=e.focusColor),e.height&&(document.getElementById(`cfg-height`).value=e.height)}catch{}}var u=s();u||l(),a(u||void 0);