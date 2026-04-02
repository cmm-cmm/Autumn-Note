import { describe, it, expect, afterEach, vi } from 'vitest';
import { handleKeydown } from '../../src/js/editing/Typing.js';

function setCaret(node, offset) {
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

afterEach(() => {
  document.body.innerHTML = '';
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
});

describe('Typing arrow navigation around FA icons', () => {
  it('moves caret left across an FA icon in one key press', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const icon = p.querySelector('i');
    const anchor = icon.nextSibling;

    setCaret(anchor, 1);

    const event = { key: 'ArrowLeft', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(p);
    expect(r.startOffset).toBe(1);
  });

  it('moves caret right across an FA icon in one key press', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const icon = p.querySelector('i');
    const before = p.firstChild;
    const anchor = icon.nextSibling;

    setCaret(before, before.textContent.length);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(anchor);
    expect(r.startOffset).toBe(1);
  });

  it('crosses two adjacent FA icons to the right in two key presses', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B<i class="fa-solid fa-star" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const before = p.firstChild;
    const finalAnchor = p.lastChild;

    setCaret(before, before.textContent.length);

    const e1 = { key: 'ArrowRight', preventDefault: vi.fn() };
    const e2 = { key: 'ArrowRight', preventDefault: vi.fn() };

    const c1 = handleKeydown(e1, editable, {});
    const c2 = handleKeydown(e2, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(c1).toBe(true);
    expect(c2).toBe(true);
    expect(e1.preventDefault).toHaveBeenCalledTimes(1);
    expect(e2.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(finalAnchor);
    expect(r.startOffset).toBe(1);
  });

  it('crosses two adjacent FA icons to the left in two key presses', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B<i class="fa-solid fa-star" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const firstIcon = p.querySelector('.fa-house');
    const finalAnchor = p.lastChild;

    setCaret(finalAnchor, 1);

    const e1 = { key: 'ArrowLeft', preventDefault: vi.fn() };
    const e2 = { key: 'ArrowLeft', preventDefault: vi.fn() };

    const c1 = handleKeydown(e1, editable, {});
    const c2 = handleKeydown(e2, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(c1).toBe(true);
    expect(c2).toBe(true);
    expect(e1.preventDefault).toHaveBeenCalledTimes(1);
    expect(e2.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(p);
    expect(r.startOffset).toBe(Array.prototype.indexOf.call(p.childNodes, firstIcon));
  });
});
