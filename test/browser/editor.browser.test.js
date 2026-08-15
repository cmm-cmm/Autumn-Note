import AutumnNote from '../../src/js/index.js';
import { sanitiseHTML } from '../../src/js/core/sanitise.js';
import { userEvent } from 'vitest/browser';

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

  // The transforms below run entirely through Selection/Range and execCommand.
  // jsdom stubs both, so the unit suite can only prove the code path is taken —
  // whether the resulting DOM is right is a question only a real engine answers.
  function selectContentsOf(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  }

  it('converts paragraphs to lists and back across engines', () => {
    const editable = mount();
    editor.invoke('editor.setHTML', '<p>first</p>');
    editable.focus();
    selectContentsOf(editable.querySelector('p'));

    editor.invoke('editor.insertUL');
    expect(editable.querySelector('ul > li')?.textContent).toBe('first');

    selectContentsOf(editable.querySelector('li'));
    editor.invoke('editor.insertOL');
    expect(editable.querySelector('ol > li')?.textContent).toBe('first');
    expect(editable.querySelector('ul')).toBeNull();
  });

  it('round-trips a checklist without destroying the editable root', () => {
    const editable = mount();
    editor.invoke('editor.setHTML', '<p>task</p>');
    editable.focus();
    selectContentsOf(editable.querySelector('p'));

    editor.invoke('editor.toggleChecklist');
    const item = editable.querySelector('ul.an-checklist li');
    expect(item?.textContent).toContain('task');
    expect(item.querySelector('input[type="checkbox"]')).not.toBeNull();

    selectContentsOf(item);
    editor.invoke('editor.toggleChecklist');
    expect(editable.querySelector('ul.an-checklist')).toBeNull();
    // Regression guard: the toggle used to be able to unwrap the root itself.
    expect(editable.isConnected).toBe(true);
    expect(editable.getAttribute('contenteditable')).toBe('true');
    expect(editable.textContent).toContain('task');
  });

  it('inserts a table with the requested shape', () => {
    const editable = mount({ tableHeaderRow: true });
    editor.invoke('editor.setHTML', '<p><br></p>');
    editable.focus();
    const range = document.createRange();
    range.setStart(editable.querySelector('p'), 0);
    range.collapse(true);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // `rows` is the total row count, header included — so 3 here means one
    // header row plus two body rows.
    editor.invoke('editor.insertTable', 3, 3);

    const table = editable.querySelector('table');
    expect(table).not.toBeNull();
    expect(table.querySelectorAll('thead th')).toHaveLength(3);
    expect(table.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(table.querySelectorAll('tbody tr')[0].querySelectorAll('td')).toHaveLength(3);
  });

  it('unwinds a multi-step edit through undo and replays it through redo', async () => {
    const editable = mount();
    editor.invoke('editor.setHTML', '<p>one</p>');
    editable.focus();

    // Snapshots are debounced by 400ms so a burst of typing collapses into one
    // undo step. Two *separate* steps therefore need the timer to fire between
    // them — without the wait this asserts the coalescing behaviour instead.
    const settleSnapshot = () => new Promise((resolve) => setTimeout(resolve, 450));

    selectContentsOf(editable.querySelector('p'));
    editor.invoke('editor.bold');
    await settleSnapshot();

    selectContentsOf(editable.querySelector('p'));
    editor.invoke('editor.italic');
    await settleSnapshot();
    expect(editable.querySelector('i, em')).not.toBeNull();

    editor.invoke('editor.undo');
    expect(editable.querySelector('i, em')).toBeNull();
    expect(editable.querySelector('b, strong')).not.toBeNull();

    editor.invoke('editor.undo');
    expect(editable.querySelector('b, strong')).toBeNull();
    expect(editable.textContent).toContain('one');

    editor.invoke('editor.redo');
    expect(editable.querySelector('b, strong')).not.toBeNull();
  });

  it('walks the toolbar with arrow keys under a single tab stop', async () => {
    mount({
      toolbar: [[AutumnNote.buttons.boldBtn, AutumnNote.buttons.italicBtn, AutumnNote.buttons.ulBtn]],
    });

    const toolbar = document.querySelector('.an-toolbar');
    expect(toolbar.getAttribute('role')).toBe('toolbar');

    const buttons = [...toolbar.querySelectorAll('button')];
    // Roving tabindex: exactly one control is reachable by Tab.
    expect(buttons.filter((b) => b.getAttribute('tabindex') === '0')).toHaveLength(1);

    buttons[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(buttons[1]);
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('makes no Font Awesome CDN request when the injection is opted out', async () => {
    mount({ fontAwesomeAutoInject: false, toolbar: [[AutumnNote.buttons.iconBtn]] });

    await editor.invoke('iconDialog.show');
    expect(document.getElementById('an-fontawesome-css')).toBeNull();
    // The dialog is still fully built — only the glyph font is absent.
    expect(document.querySelector('.an-icon-grid')?.children.length).toBeGreaterThan(0);
  });

  it.runIf(navigator.userAgent.includes('Chrome'))(
    'sanitises HTML copied and pasted through Chromium clipboard automation',
    async () => {
      const editable = mount();
      const source = document.createElement('div');
      source.contentEditable = 'true';
      source.innerHTML = '<p>clipboard <span onclick="alert(1)">content</span></p>';
      document.body.appendChild(source);

      const sourceRange = document.createRange();
      sourceRange.selectNodeContents(source);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(sourceRange);
      await userEvent.copy();

      editable.focus();
      const targetRange = document.createRange();
      targetRange.selectNodeContents(editable);
      targetRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(targetRange);
      await userEvent.paste();

      expect(editable.textContent.replaceAll('\u00a0', ' ')).toContain('clipboard content');
      expect(editable.innerHTML).not.toContain('onclick');
      source.remove();
    },
  );
});
