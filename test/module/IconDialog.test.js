import { describe, it, expect, afterEach, vi } from 'vitest';
import { IconDialog } from '../../src/js/module/IconDialog.js';
import { en } from '../../src/js/i18n/en.js';

const setCaret = (node, offset) => {
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};

afterEach(() => {
  document.body.innerHTML = '';
  document.getElementById('an-fontawesome-css')?.remove();
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
});

function makeDialog() {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>text</p>';
  document.body.appendChild(editable);
  const context = {
    layoutInfo: { editable },
    options: {},
    locale: en,
    invoke: vi.fn(),
  };
  const dialog = new IconDialog(context);
  dialog.initialize();
  return { dialog, editable, context };
}

describe('IconDialog insertion caret behavior', () => {
  it('keeps caret after inserted icon at end of line', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello</p>';
    document.body.appendChild(editable);

    const text = editable.querySelector('p').firstChild;
    setCaret(text, text.textContent.length);

    const context = {
      layoutInfo: { editable },
      options: {},
      locale: en,
      invoke: vi.fn(),
    };

    const dialog = new IconDialog(context);
    dialog.initialize();
    dialog.show();

    dialog._selectedIcon = 'house';
    dialog._onInsert();

    const icon = editable.querySelector('i.fa-house');
    expect(icon).not.toBeNull();

    const sel = window.getSelection();
    const r = sel.getRangeAt(0);
    expect(r.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(r.startContainer.previousSibling).toBe(icon);
    expect(r.startContainer.textContent.startsWith('\u200B')).toBe(true);
    expect(r.startOffset).toBe(1);

    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');

    dialog.destroy();
  });
});

describe('IconDialog lifecycle, filtering, and options', () => {
  it('injects Font Awesome once and respects an existing host stylesheet', () => {
    const first = makeDialog().dialog;
    const link = document.getElementById('an-fontawesome-css');
    expect(link?.getAttribute('crossorigin')).toBe('anonymous');
    first._ensureFontAwesome();
    expect(document.querySelectorAll('#an-fontawesome-css')).toHaveLength(1);
    first.destroy();

    link.remove();
    const hostLink = document.createElement('link');
    hostLink.rel = 'stylesheet';
    hostLink.href = 'https://example.com/font-awesome.css';
    document.head.appendChild(hostLink);
    const second = makeDialog().dialog;
    expect(document.getElementById('an-fontawesome-css')).toBeNull();
    second.destroy();
    hostLink.remove();
  });

  it('reuses its dialog and resets selection, search, and category on show', () => {
    const { dialog } = makeDialog();
    dialog.show();
    const built = dialog._dialog;
    dialog._selectIcon('house');
    dialog._searchInput.value = 'house';
    dialog._activeCat = 'objects';
    dialog.show();

    expect(dialog._dialog).toBe(built);
    expect(dialog._selectedIcon).toBeNull();
    expect(dialog._searchInput.value).toBe('');
    expect(dialog._activeCat).toBe('all');
    expect(dialog._insertBtn.disabled).toBe(true);
    dialog.destroy();
  });

  it('filters by search and category and renders an empty state', () => {
    const { dialog } = makeDialog();
    dialog.show();
    dialog._filterIcons('house', 'all');
    expect(dialog._grid.querySelector('[data-name="house"]').style.display).toBe('');
    expect(dialog._grid.querySelector('[data-name="heart"]').style.display).toBe('none');

    dialog._filterIcons('', 'objects');
    expect(dialog._grid.querySelector('[data-cat="objects"]').style.display).toBe('');
    dialog._filterIcons('definitely-missing', 'all');
    expect(dialog._grid.querySelector('.an-icon-empty').style.display).toBe('');
    dialog.destroy();
  });

  it('responds to category, grid, search, and option events', () => {
    const { dialog } = makeDialog();
    dialog.show();
    dialog._catBar.querySelector('[data-cat="objects"]').click();
    expect(dialog._activeCat).toBe('objects');

    dialog._grid.querySelector('[data-name="house"]').click();
    expect(dialog._selectedIcon).toBe('house');
    expect(dialog._insertBtn.disabled).toBe(false);

    dialog._styleSelect.value = 'fa-regular';
    dialog._sizeSelect.value = '2em';
    dialog._colorInput.value = '#ff0000';
    dialog._styleSelect.dispatchEvent(new Event('change'));
    dialog._sizeSelect.dispatchEvent(new Event('change'));
    dialog._colorInput.dispatchEvent(new Event('input'));
    expect(dialog._preview.innerHTML).toContain('fa-regular fa-house');
    expect(dialog._preview.innerHTML).toContain('font-size:2em');

    dialog._useColorCb.checked = false;
    dialog._useColorCb.dispatchEvent(new Event('change'));
    expect(dialog._preview.innerHTML).not.toContain('color:#ff0000');
    dialog.destroy();
  });

  it('guards insertion without a selection and appends when no saved range exists', () => {
    const { dialog, editable, context } = makeDialog();
    dialog.show();
    dialog._onInsert();
    expect(editable.querySelector('i')).toBeNull();

    dialog._selectedIcon = 'star';
    dialog._savedRange = null;
    getSelection().removeAllRanges();
    dialog._onInsert();
    expect(editable.querySelector('i.fa-star')).not.toBeNull();
    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');
    dialog.destroy();
  });
});
