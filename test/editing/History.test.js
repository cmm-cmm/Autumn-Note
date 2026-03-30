import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { History } from '../../src/js/editing/History.js';

// ---------------------------------------------------------------------------
// helpers — build a minimal contenteditable div
// ---------------------------------------------------------------------------
function makeEditable(html = '<p>hello</p>') {
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

function cleanup(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

describe('History', () => {
  let el;
  let history;

  beforeEach(() => {
    el = makeEditable('<p>initial</p>');
    history = new History(el);
  });

  afterEach(() => cleanup(el));

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  it('initialises with one savepoint', () => {
    expect(history.stack).toHaveLength(1);
    expect(history.stackOffset).toBe(0);
  });

  it('canUndo returns false on fresh history', () => {
    expect(history.canUndo()).toBe(false);
  });

  it('canRedo returns false on fresh history', () => {
    expect(history.canRedo()).toBe(false);
  });

  // -------------------------------------------------------------------------
  // recordUndo
  // -------------------------------------------------------------------------
  it('recordUndo adds a snapshot when content changes', () => {
    el.innerHTML = '<p>changed</p>';
    history.recordUndo();
    expect(history.stack).toHaveLength(2);
    expect(history.canUndo()).toBe(true);
  });

  it('recordUndo does not add a snapshot when content is unchanged', () => {
    history.recordUndo();
    expect(history.stack).toHaveLength(1); // no change — no new snapshot
  });

  it('caps the stack at MAX_HISTORY (100) entries', () => {
    for (let i = 0; i < 110; i++) {
      el.innerHTML = `<p>change ${i}</p>`;
      history.recordUndo();
    }
    expect(history.stack.length).toBeLessThanOrEqual(100);
    expect(history.stackOffset).toBe(history.stack.length - 1);
  });

  // -------------------------------------------------------------------------
  // undo / redo
  // -------------------------------------------------------------------------
  it('undo restores previous content', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.undo();
    expect(el.innerHTML).toBe('<p>initial</p>');
  });

  it('undo does nothing when at the beginning', () => {
    history.undo(); // should not throw
    expect(el.innerHTML).toBe('<p>initial</p>');
  });

  it('redo restores content after undo', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.undo();
    expect(el.innerHTML).toBe('<p>initial</p>');

    history.redo();
    expect(el.innerHTML).toBe('<p>step 2</p>');
  });

  it('redo does nothing when at the top of the stack', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.redo(); // should not throw
    expect(el.innerHTML).toBe('<p>step 2</p>');
  });

  it('canRedo is false after redo to the top', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();
    history.undo();
    history.redo();
    expect(history.canRedo()).toBe(false);
  });

  it('recording after undo discards the future (redo) branch', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.undo();

    el.innerHTML = '<p>branch</p>';
    history.recordUndo();

    expect(history.canRedo()).toBe(false);
    expect(history.stack).toHaveLength(2);
  });

  // -------------------------------------------------------------------------
  // reset
  // -------------------------------------------------------------------------
  it('reset clears the stack and records a fresh savepoint', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();
    expect(history.stack).toHaveLength(2);

    history.reset();
    expect(history.stack).toHaveLength(1);
    expect(history.stackOffset).toBe(0);
    expect(history.canUndo()).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Image tokenisation
  // -------------------------------------------------------------------------
  it('tokenises base64 images so snapshot strings stay small', () => {
    const dataUrl = 'data:image/png;base64,' + 'A'.repeat(1000);
    el.innerHTML = `<img src="${dataUrl}">`;
    history.recordUndo();

    const snapshot = history.stack[history.stackOffset];
    expect(snapshot.html).not.toContain('data:image/png');
    expect(snapshot.html).toContain('__asn_img_0__');
  });

  it('detokenises base64 images on restore', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    el.innerHTML = `<img src="${dataUrl}">`;
    history.recordUndo();

    history.undo();
    history.redo();

    expect(el.innerHTML).toContain(dataUrl);
  });
});
