import AutumnNote from '../../src/js/index.js';
import { sanitiseHTML } from '../../src/js/core/sanitise.js';

describe('Autumn Note in a real browser', () => {
  let target;
  let editor;

  afterEach(() => {
    editor?.destroy();
    target?.remove();
    editor = null;
    target = null;
  });

  function mount(options = {}) {
    target = document.createElement('textarea');
    document.body.appendChild(target);
    editor = AutumnNote.create(target, options);
    return document.querySelector('.an-editable');
  }

  it('mounts an accessible editor and cleans it up', () => {
    mount({ toolbar: [[AutumnNote.buttons.boldBtn]] });

    const editable = document.querySelector('[role="textbox"][aria-label="Rich text editor"]');
    const bold = document.querySelector('button[data-btn="bold"]');
    expect(editable).toBeInstanceOf(HTMLElement);
    expect(editable.getAttribute('contenteditable')).toBe('true');
    expect(bold?.getAttribute('aria-label')).toBeTruthy();

    editable.focus();
    expect(document.activeElement).toBe(editable);
    editor.destroy();
    editor = null;
    expect(document.querySelector('.an-container')).toBeNull();
  });

  it('blocks canonicalised script protocols in the browser DOM', () => {
    const clean = sanitiseHTML('<a href="java&#x0A;script:alert(1)">unsafe</a>');
    const host = document.createElement('div');
    host.innerHTML = clean;
    expect(host.querySelector('a').hasAttribute('href')).toBe(false);
  });

  it('sanitises setHTML content and preserves only trusted video embeds', () => {
    mount();
    editor.invoke('editor.setHTML', [
      '<a href="java&#x0A;script:alert(1)">unsafe</a>',
      '<iframe src="https://evil.example/video"></iframe>',
      '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>',
    ].join(''));

    const html = editor.invoke('editor.getHTML');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('evil.example');
    expect(html).toContain('youtube.com/embed/abcdefghijk');
  });

  it('applies toolbar formatting and supports undo/redo', () => {
    const editable = mount({ toolbar: [[AutumnNote.buttons.boldBtn]] });
    editor.invoke('editor.setHTML', '<p>format me</p>');

    const text = editable.querySelector('p').firstChild;
    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.querySelector('button[data-btn="bold"]').click();

    expect(editable.querySelector('b, strong')?.textContent).toBe('format me');
    editor.invoke('editor.undo');
    expect(editable.querySelector('b, strong')).toBeNull();
    editor.invoke('editor.redo');
    expect(editable.querySelector('b, strong')?.textContent).toBe('format me');
  });

  it('sanitises rich HTML paste before insertion', () => {
    const editable = mount();
    editable.innerHTML = '<p><br></p>';
    editable.focus();
    const range = document.createRange();
    range.setStart(editable.querySelector('p'), 0);
    range.collapse(true);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: {
        types: ['text/html', 'text/plain'],
        getData: (type) => type === 'text/html'
          ? '<p>safe<span onclick="alert(1)">content</span></p>'
          : 'safe content',
      },
    });
    editable.dispatchEvent(paste);

    expect(editable.innerHTML).toContain('safe');
    expect(editable.innerHTML).not.toContain('onclick');
  });
});
