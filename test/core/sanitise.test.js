import { describe, it, expect } from 'vitest';
import { sanitiseHTML, sanitiseUrl } from '../../src/js/core/sanitise.js';

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

  it('strips <form>, <input>, <button> tags', () => {
    expect(sanitiseHTML('<form action="/hack"><input name="q"></form>')).not.toContain('<form');
    expect(sanitiseHTML('<button onclick="evil()">Click</button>')).not.toContain('<button');
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

  it('removes untrusted iframe src when allowIframes is true', () => {
    const input = '<iframe src="https://evil.example/embed/1"></iframe>';
    const result = sanitiseHTML(input, { allowIframes: true });
    expect(result).toContain('<iframe');
    expect(result).not.toContain('src="https://evil.example/embed/1"');
  });

  it('strips iframe srcdoc payloads when allowIframes is true', () => {
    const input = '<iframe src="https://www.youtube.com/embed/abcdefghijk" srcdoc="<script>alert(1)</script>"></iframe>';
    const result = sanitiseHTML(input, { allowIframes: true });
    expect(result).toContain('<iframe');
    expect(result).toContain('src="https://www.youtube.com/embed/abcdefghijk"');
    expect(result).not.toContain('srcdoc=');
    expect(result).not.toContain('alert(1)');
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

  it('returns null for data: URLs by default', () => {
    expect(sanitiseUrl('data:image/png;base64,abc')).toBeNull();
  });

  it('returns data: URL when allowData is true', () => {
    const url = 'data:image/png;base64,abc';
    expect(sanitiseUrl(url, { allowData: true })).toBe(url);
  });

  it('returns null for null/empty input', () => {
    expect(sanitiseUrl(null)).toBeNull();
    expect(sanitiseUrl('')).toBe('');
  });
});
