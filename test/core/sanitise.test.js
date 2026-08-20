import { describe, it, expect } from 'vitest';
import { sanitiseHTML, sanitiseToBody, sanitiseUrl } from '../../src/js/core/sanitise.js';

// ---------------------------------------------------------------------------
// sanitiseHTML
// ---------------------------------------------------------------------------
describe('sanitiseHTML', () => {
  it('returns empty string for empty input', () => {
    expect(sanitiseHTML('')).toBe('');
    expect(sanitiseHTML(null)).toBe('');
    expect(sanitiseHTML(undefined)).toBe('');
  });

  it('strips <script> tags and their content', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitiseHTML(input)).not.toContain('<script');
    expect(sanitiseHTML(input)).not.toContain('alert');
  });

  it('strips <iframe> tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    expect(sanitiseHTML(input)).not.toContain('<iframe');
  });

  it('strips <object> and <embed> tags', () => {
    expect(sanitiseHTML('<object data="x.swf"></object>')).not.toContain('<object');
    expect(sanitiseHTML('<embed src="x.swf">')).not.toContain('<embed');
  });

  it('strips <form> and <input> tags', () => {
    expect(sanitiseHTML('<form action="/hack"><input name="q"></form>')).not.toContain('<form');
  });

  it('unwraps <button>: removes the tag but preserves text content', () => {
    const result = sanitiseHTML('<button onclick="evil()">Click me</button>');
    expect(result).not.toContain('<button');
    expect(result).toContain('Click me');
  });

  it('unwraps <button> with inline formatting: preserves child elements', () => {
    const result = sanitiseHTML('<button><strong>Bold CTA</strong></button>');
    expect(result).not.toContain('<button');
    expect(result).toContain('<strong>Bold CTA</strong>');
  });

  it('strips <base> tag (prevents relative URL hijacking)', () => {
    const result = sanitiseHTML('<base href="https://evil.com"><p>content</p>');
    expect(result).not.toContain('<base');
    expect(result).toContain('<p>content</p>');
  });

  it('strips <style> tags and their content', () => {
    const input = '<p>text</p><style>body { color: red }</style>';
    expect(sanitiseHTML(input)).not.toContain('<style');
    expect(sanitiseHTML(input)).not.toContain('color: red');
  });

  it('strips standalone <input> tags', () => {
    const input = '<p>fill in: <input type="text" name="q"></p>';
    expect(sanitiseHTML(input)).not.toContain('<input');
    expect(sanitiseHTML(input)).toContain('fill in:');
  });

  it('preserves input[type="checkbox"] inside ul.an-checklist li', () => {
    const input = '<ul class="an-checklist"><li><input type="checkbox">item</li></ul>';
    const result = sanitiseHTML(input);
    expect(result).toContain('<input type="checkbox">');
    expect(result).toContain('item');
  });

  it('preserves checked state of checklist checkbox', () => {
    const input = '<ul class="an-checklist"><li><input type="checkbox" checked>done</li></ul>';
    const result = sanitiseHTML(input);
    expect(result).toContain('checked');
    expect(result).toContain('done');
  });

  it('strips input[type="checkbox"] that is NOT inside ul.an-checklist li', () => {
    const input = '<p><input type="checkbox"> standalone</p>';
    expect(sanitiseHTML(input)).not.toContain('<input');
  });

  it('strips extra attributes from checklist checkboxes (hardening)', () => {
    const input = '<ul class="an-checklist"><li><input type="checkbox" id="x" class="y" onclick="evil()">item</li></ul>';
    const result = sanitiseHTML(input);
    expect(result).toContain('<input type="checkbox">');
    expect(result).not.toContain('id="x"');
    expect(result).not.toContain('class="y"');
    expect(result).not.toContain('onclick');
  });

  it('removes all on* event handler attributes', () => {
    const input = '<p onclick="evil()" onmouseover="bad()">text</p>';
    const result = sanitiseHTML(input);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
    expect(result).toContain('<p>');
    expect(result).toContain('text');
  });

  it('removes javascript: hrefs', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitiseHTML(input);
    expect(result).not.toContain('javascript:');
  });

  it('removes vbscript: hrefs', () => {
    const input = '<a href="vbscript:msgbox()">click</a>';
    const result = sanitiseHTML(input);
    expect(result).not.toContain('vbscript:');
  });

  it('allows safe hrefs', () => {
    const input = '<a href="https://example.com">link</a>';
    expect(sanitiseHTML(input)).toContain('href="https://example.com"');
  });

  it('allows data: URI on img[src] (base64 uploads)', () => {
    const input = '<img src="data:image/png;base64,abc123" alt="test">';
    const result = sanitiseHTML(input);
    expect(result).toContain('src="data:image/png;base64,abc123"');
  });

  it('removes data: URI from non-img elements (e.g. anchor href)', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">x</a>';
    const result = sanitiseHTML(input);
    expect(result).not.toContain('data:text/html');
  });

  it('preserves safe formatting tags', () => {
    const input = '<p><strong>bold</strong> and <em>italic</em></p>';
    expect(sanitiseHTML(input)).toBe('<p><strong>bold</strong> and <em>italic</em></p>');
  });

  it('keeps trusted video iframe src when allowIframes is true', () => {
    const input = '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>';
    const result = sanitiseHTML(input, { allowIframes: true });
    expect(result).toContain('<iframe');
    expect(result).toContain('src="https://www.youtube.com/embed/abcdefghijk"');
  });

  it('removes untrusted iframe when allowIframes is true', () => {
    const input = '<iframe src="https://evil.example/embed/1"></iframe>';
    const result = sanitiseHTML(input, { allowIframes: true });
    expect(result).not.toContain('<iframe');
  });

  it('strips iframe srcdoc payloads when allowIframes is true', () => {
    const input = '<iframe src="https://www.youtube.com/embed/abcdefghijk" srcdoc="<script>alert(1)</script>"></iframe>';
    const result = sanitiseHTML(input, { allowIframes: true });
    expect(result).toContain('<iframe');
    expect(result).toContain('src="https://www.youtube.com/embed/abcdefghijk"');
    expect(result).not.toContain('srcdoc=');
    expect(result).not.toContain('alert(1)');
  });

  // ── Regression tests for issues #64-#67 ─────────────────────────────────

  it('strips <template> and everything nested inside it (#64)', () => {
    const input = '<template><script>alert(1)</script></template>';
    const result = sanitiseHTML(input);
    expect(result).not.toContain('<template');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('strips <link> tags (#66)', () => {
    const input = '<link rel="stylesheet" href="https://evil.com/exfil.css">';
    expect(sanitiseHTML(input)).not.toContain('<link');
  });

  it('strips <meta> tags (#66)', () => {
    const input = '<meta http-equiv="refresh" content="0;url=https://evil.com">';
    expect(sanitiseHTML(input)).not.toContain('<meta');
  });

  it('strips javascript: from the legacy xlink:href SVG attribute (#67)', () => {
    const input = '<svg><a xlink:href="javascript:alert(1)"><text>Click</text></a></svg>';
    const result = sanitiseHTML(input);
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('xlink:href');
  });

  it('strips <noscript> elements and their content', () => {
    const input = '<noscript><img src="x" onerror="alert(1)"></noscript>';
    expect(sanitiseHTML(input)).not.toContain('<noscript');
    expect(sanitiseHTML(input)).not.toContain('onerror');
  });

  it('strips <portal> elements', () => {
    expect(sanitiseHTML('<portal src="https://evil.com"></portal>')).not.toContain('<portal');
  });

  it('strips legacy frame elements (<frame>, <frameset>, <applet>)', () => {
    expect(sanitiseHTML('<frameset><frame src="https://evil.com"></frameset>')).not.toContain('<frame');
    expect(sanitiseHTML('<applet code="Evil.class"></applet>')).not.toContain('<applet');
  });

  describe('style attribute filtering (#65)', () => {
    it('strips a style attribute containing url() (data exfiltration)', () => {
      const input = '<p style="background:url(https://evil.com/steal)">Hello</p>';
      const result = sanitiseHTML(input);
      expect(result).not.toContain('url(');
      expect(result).not.toContain('evil.com');
    });

    it('strips position:fixed (phishing overlay) while keeping allowlisted size properties', () => {
      const input = '<p style="position:fixed;top:0;left:0;width:100%;height:100%">x</p>';
      const result = sanitiseHTML(input);
      expect(result).not.toContain('position');
      expect(result).not.toContain('fixed');
    });

    it('strips expression() values', () => {
      const input = '<p style="width:expression(alert(1))">x</p>';
      expect(sanitiseHTML(input)).not.toContain('expression');
    });

    it('drops only the dangerous declaration when mixed with a safe one', () => {
      const input = '<p style="color:red; background:url(evil.com)">x</p>';
      const result = sanitiseHTML(input);
      expect(result).toContain('color: red');
      expect(result).not.toContain('url(');
    });

    it('removes the style attribute entirely when nothing survives', () => {
      const input = '<p style="position:fixed">x</p>';
      expect(sanitiseHTML(input)).not.toContain('style=');
    });

    it('keeps color and background-color (text color / highlight toolbar features)', () => {
      expect(sanitiseHTML('<span style="color:red">x</span>')).toContain('color: red');
      expect(sanitiseHTML('<span style="background-color:#fef08a">x</span>')).toContain('background-color: #fef08a');
    });

    it('keeps font-size and line-height', () => {
      expect(sanitiseHTML('<span style="font-size:18px">x</span>')).toContain('font-size: 18px');
      expect(sanitiseHTML('<p style="line-height:1.5">x</p>')).toContain('line-height: 1.5');
    });

    it('keeps text-align and vertical-align (table alignment)', () => {
      expect(sanitiseHTML('<table><tr><th style="text-align:center">A</th></tr></table>')).toContain('text-align: center');
      expect(sanitiseHTML('<table><tr><td style="vertical-align:middle">A</td></tr></table>')).toContain('vertical-align: middle');
    });

    it('keeps table sizing/border/padding properties', () => {
      const input = '<table><tr><td style="width:100px; min-width:50px; height:40px; min-height:20px; '
        + 'border-width:1px; border-style:solid; border-color:#333; padding:6px">x</td></tr></table>';
      const result = sanitiseHTML(input);
      for (const decl of ['width: 100px', 'min-width: 50px', 'height: 40px', 'min-height: 20px',
        'border-width: 1px', 'border-style: solid', 'border-color: #333', 'padding: 6px']) {
        expect(result).toContain(decl);
      }
    });
  });
});

describe('sanitiseHTML adversarial corpus', () => {
  const protocolVariants = [
    'javascript:', 'JaVaScRiPt:', 'java\nscript:', 'java\rscript:', 'java\tscript:',
    'java&#10;script:', 'java&#x0a;script:', 'javascript&#58;', 'vbscript:',
    'data:text/html;base64,PHNjcmlwdD4=',
  ];

  it.each(protocolVariants)('rejects encoded or obfuscated navigation protocol %s', (protocol) => {
    const host = document.createElement('div');
    host.innerHTML = sanitiseHTML(`<a href="${protocol}alert(1)">link</a>`);
    expect(host.querySelector('a')?.hasAttribute('href')).toBe(false);
  });

  it('removes event handlers regardless of casing across representative elements', () => {
    const tags = ['img', 'svg', 'math', 'table', 'video', 'a'];
    for (const tag of tags) {
      const host = document.createElement('div');
      host.innerHTML = sanitiseHTML(`<${tag} oNeRrOr="alert(1)" ONCLICK="alert(2)">x</${tag}>`);
      for (const element of host.querySelectorAll('*')) {
        expect([...element.attributes].some((attribute) => attribute.name.startsWith('on'))).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// sanitiseUrl
// ---------------------------------------------------------------------------
describe('sanitiseUrl', () => {
  it('returns the URL as-is for safe https:// URLs', () => {
    expect(sanitiseUrl('https://example.com')).toBe('https://example.com');
  });

  it('returns the URL as-is for relative URLs', () => {
    expect(sanitiseUrl('/images/photo.jpg')).toBe('/images/photo.jpg');
  });

  it('returns null for javascript: URLs', () => {
    expect(sanitiseUrl('javascript:alert(1)')).toBeNull();
  });

  it('returns null for vbscript: URLs', () => {
    expect(sanitiseUrl('vbscript:msgbox()')).toBeNull();
  });

  it('returns null for javascript: with leading whitespace', () => {
    expect(sanitiseUrl('  javascript:alert(1)')).toBeNull();
  });

  it.each([
    'java\nscript:alert(1)',
    'jav\tascript:alert(1)',
    'file:///etc/passwd',
    'ftp://example.com/file',
    'custom:payload',
  ])('returns null for disallowed or obfuscated protocol %s', (url) => {
    expect(sanitiseUrl(url)).toBeNull();
  });

  it.each(['mailto:hello@example.com', 'tel:+123456789'])('allows safe link protocol %s', (url) => {
    expect(sanitiseUrl(url)).toBe(url);
  });

  it('returns null for data: URLs by default', () => {
    expect(sanitiseUrl('data:image/png;base64,abc')).toBeNull();
  });

  it('returns data: URL when allowData is true', () => {
    const url = 'data:image/png;base64,abc';
    expect(sanitiseUrl(url, { allowData: true })).toBe(url);
  });

  it('rejects data SVG and non-image data even when allowData is true', () => {
    expect(sanitiseUrl('data:image/svg+xml,<svg onload=alert(1)>', { allowData: true })).toBeNull();
    expect(sanitiseUrl('data:text/html,<script>alert(1)</script>', { allowData: true })).toBeNull();
  });

  it('allows blob media URLs only in media mode', () => {
    const url = 'blob:https://example.com/5b5d1b2a';
    expect(sanitiseUrl(url)).toBeNull();
    expect(sanitiseUrl(url, { allowData: true })).toBe(url);
  });

  it('returns null for null/empty input', () => {
    expect(sanitiseUrl(null)).toBeNull();
    expect(sanitiseUrl('')).toBe('');
  });
});

describe('URL protocol canonicalisation', () => {
  it.each([
    '<a href="java&#x0A;script:alert(1)">newline</a>',
    '<a href="jav&#x09;ascript:alert(1)">tab</a>',
    '<a href="file:///etc/passwd">file</a>',
  ])('removes unsafe encoded href from %s', (html) => {
    expect(sanitiseHTML(html)).not.toContain('href=');
  });

  it('blocks SVG data images but keeps raster data images', () => {
    const svg = sanitiseHTML('<img src="data:image/svg+xml,<svg onload=alert(1)></svg>">');
    const png = sanitiseHTML('<img src="data:image/png;base64,abc">');
    expect(svg).not.toContain('src=');
    expect(png).toContain('data:image/png;base64,abc');
  });

  it('removes an iframe when its trusted HTTPS source is missing or invalid', () => {
    expect(sanitiseHTML('<iframe src="https://evil.example/video"></iframe>', { allowIframes: true }))
      .not.toContain('<iframe');
    expect(sanitiseHTML('<iframe></iframe>', { allowIframes: true })).not.toContain('<iframe');
  });

  it('adds safe rel values to links that open a new tab', () => {
    const result = sanitiseHTML('<a href="https://example.com" target="_blank">safe</a>');
    expect(result).toContain('rel="noopener noreferrer"');
  });
});

// ---------------------------------------------------------------------------
// Post-sanitisation attribute rewriting (SMIL) and namespace-confusion (mXSS)
// ---------------------------------------------------------------------------
describe('SVG animation elements', () => {
  it.each([
    ['animate', '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text>click</text></a></svg>'],
    ['set', '<svg><a><set attributeName="href" to="javascript:alert(1)"/><text>click</text></a></svg>'],
    ['animateTransform', '<svg><a><animateTransform attributeName="href" to="javascript:alert(1)"/></a></svg>'],
    ['animateMotion', '<svg><a><animateMotion attributeName="href" to="javascript:alert(1)"/></a></svg>'],
  ])('removes <%s>, which could rewrite href after sanitisation', (_tag, html) => {
    const result = sanitiseHTML(html);
    expect(result).not.toContain('javascript:');
    expect(result).not.toMatch(/<animate|<set/i);
  });

  it('keeps the static SVG icons the editor itself inserts', () => {
    const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/></svg>';
    const result = sanitiseHTML(icon);
    expect(result).toContain('<svg');
    expect(result).toContain('<rect');
  });
});

describe('mXSS hardening', () => {
  it.each([
    '<math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>',
    '<svg></p><style><a id="</style><img src=1 onerror=alert(1)>">',
    '<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>',
    '<table><td><style><!--</style><img src=x onerror=alert(1)>',
    '<math><annotation-xml encoding="text/html"><style><!--</style><img src=x onerror=alert(1)>',
  ])('is a fixed point for mutation payload %#', (html) => {
    const pass1 = sanitiseHTML(html);
    // A sanitiser whose output re-parses into different markup is the
    // precondition for mXSS: the caller assigns pass1 to innerHTML, so pass1
    // must already describe the final tree.
    expect(sanitiseHTML(pass1)).toBe(pass1);
    expect(pass1).not.toContain('onerror');
  });

  it('drops MathML HTML-integration points but keeps ordinary formula markup', () => {
    const result = sanitiseHTML('<math><mrow><mi>x</mi><mglyph src="e.png"/></mrow></math>');
    expect(result).not.toContain('mglyph');
    expect(result).toContain('<mi>x</mi>');
  });
});

// ---------------------------------------------------------------------------
// URL-bearing attributes beyond href/src
// ---------------------------------------------------------------------------
describe('secondary URL attributes', () => {
  it('rejects an unsafe video poster', () => {
    expect(sanitiseHTML('<video poster="javascript:alert(1)" src="https://a.b/c.mp4"></video>'))
      .not.toContain('poster=');
  });

  it('keeps a safe video poster', () => {
    expect(sanitiseHTML('<video poster="https://a.b/p.png" src="https://a.b/c.mp4"></video>'))
      .toContain('poster="https://a.b/p.png"');
  });

  it('rejects an unsafe legacy background attribute', () => {
    expect(sanitiseHTML('<table background="javascript:alert(1)"><tr><td>x</td></tr></table>'))
      .not.toContain('background=');
  });

  it('strips the ping beacon from links', () => {
    const result = sanitiseHTML('<a href="https://ok.example" ping="https://evil.example/t">x</a>');
    expect(result).not.toContain('ping=');
    expect(result).toContain('href="https://ok.example"');
  });

  it('keeps a well-formed srcset', () => {
    const result = sanitiseHTML('<img src="https://a.b/1x.png" srcset="https://a.b/1x.png 1x, https://a.b/2x.png 2x">');
    expect(result).toContain('srcset=');
    expect(result).toContain('2x.png');
  });

  it('keeps a srcset using width descriptors and a raster data candidate', () => {
    const result = sanitiseHTML('<img srcset="data:image/png;base64,abc 300w" src="https://a.b/1.png">');
    expect(result).toContain('srcset=');
  });

  it('rejects the whole srcset when any candidate is unsafe', () => {
    const result = sanitiseHTML('<img src="https://a.b/1.png" srcset="https://a.b/1.png 1x, javascript:alert(1) 2x">');
    expect(result).not.toContain('srcset=');
    expect(result).toContain('src="https://a.b/1.png"');
  });
});

// ---------------------------------------------------------------------------
// Style values that fetch external resources
// ---------------------------------------------------------------------------
describe('style resource-loading functions', () => {
  it.each([
    'background-color: image-set("https://evil.example/t.png" 1x)',
    'background-color: -webkit-image-set("https://evil.example/t.png" 1x)',
    'background-color: src("https://evil.example/t.png")',
    'background-color: url(https://evil.example/t.png)',
  ])('drops the declaration using %s', (decl) => {
    const result = sanitiseHTML(`<div style="${decl.replace(/"/g, '&quot;')}">x</div>`);
    expect(result).not.toContain('evil.example');
  });

  it('keeps neighbouring safe declarations intact', () => {
    const result = sanitiseHTML('<div style="background-color: image-set(&quot;a.png&quot; 1x); color: red">x</div>');
    expect(result).toContain('color: red');
    expect(result).not.toContain('image-set');
  });
});

describe('sanitiseHTML — code block presentation', () => {
  it('keeps white-space so the word-wrap toggle survives a save/restore', () => {
    // CodeTooltip's wrap toggle persists as an inline style on the <pre>.
    // Dropping it lost the setting through setHTML, paste and auto-save restore.
    const html = '<pre style="white-space: pre-wrap"><code>x</code></pre>';
    expect(sanitiseHTML(html)).toContain('pre-wrap');
  });

  it('still drops a style property that is not allowlisted', () => {
    expect(sanitiseHTML('<pre style="position: fixed"><code>x</code></pre>'))
      .not.toContain('position');
  });

  it('still rejects a url() value on an allowlisted property', () => {
    expect(sanitiseHTML('<pre style="background-color: url(javascript:alert(1))"><code>x</code></pre>'))
      .not.toContain('url(');
  });
});

// ---------------------------------------------------------------------------
// sanitiseToBody — the node-returning form setHTML adopts from
// ---------------------------------------------------------------------------

describe('sanitiseToBody', () => {
  /**
   * Inputs picked for the ways they can diverge between the two forms: markup
   * the parser rewrites, namespace-switching tags (the mXSS lever), unwrapping
   * that can leave an element somewhere the parser would not have put it, and
   * the attribute rules.
   */
  const CASES = [
    '',
    '<p>plain</p>',
    '<script>alert(1)</script><p>after</p>',
    '<img src=x onerror=alert(1)>',
    '<a href="javascript:alert(1)">x</a>',
    '<a href="java&#x0A;script:alert(1)">x</a>',
    '<svg><mglyph><style><img src=x onerror=alert(1)></style></mglyph></svg>',
    '<math><annotation-xml encoding="text/html"><p>x</p></annotation-xml></math>',
    '<button><b>kept</b></button>',
    '<table><tr><td>cell</td></tr></table>',
    '<div><tr><td>orphan row</td></tr></div>',
    '<form><input type="checkbox"></form>',
    '<ul><li class="an-checklist"><input type="checkbox" checked></li></ul>',
    '<p style="color: red; position: fixed">styled</p>',
    '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>',
    '<p>unclosed<div>nested</p></div>',
    '<a href="#" ping="https://evil.example/beacon">x</a>',
  ];

  for (const input of CASES) {
    it(`serialises to exactly what sanitiseHTML returns: ${JSON.stringify(input).slice(0, 56)}`, () => {
      expect(sanitiseToBody(input).innerHTML).toBe(sanitiseHTML(input));
      expect(sanitiseToBody(input, { allowIframes: true }).innerHTML)
        .toBe(sanitiseHTML(input, { allowIframes: true }));
    });
  }

  it('hands back a detached body, so adopting its children cannot touch the page', () => {
    const body = sanitiseToBody('<p>x</p>');
    expect(body.tagName).toBe('BODY');
    expect(body.ownerDocument).not.toBe(document);
    expect(document.body.contains(body)).toBe(false);
  });

  it('yields nodes an element can adopt directly', () => {
    const host = document.createElement('div');
    const body = sanitiseToBody('<p>one</p><script>alert(1)</script><p>two</p>');
    host.replaceChildren(...body.childNodes);
    expect(host.querySelectorAll('p')).toHaveLength(2);
    expect(host.querySelector('script')).toBeNull();
    expect(host.ownerDocument).toBe(document);
  });
});
