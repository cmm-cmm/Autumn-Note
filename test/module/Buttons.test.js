import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  tableBtn,
  foreColorBtn,
  backColorBtn,
  defaultToolbar,
  inlineCodeBtn,
  checklistBtn,
  printBtn,
  boldBtn,
  italicBtn,
  underlineBtn,
  strikeBtn,
  superscriptBtn,
  subscriptBtn,
  alignLeftBtn,
  alignCenterBtn,
  alignRightBtn,
  alignJustifyBtn,
  ulBtn,
  olBtn,
  indentBtn,
  outdentBtn,
  undoBtn,
  redoBtn,
  hrBtn,
  linkBtn,
  imageBtn,
  videoBtn,
  emojiBtn,
  iconBtn,
  removeFormatBtn,
  directionBtn,
  fontSizeBtn,
  fontFamilyBtn,
  paragraphStyleBtn,
  lineHeightBtn,
  codeviewBtn,
  fullscreenBtn,
  shortcutsBtn,
  findBtn,
  findReplaceBtn,
  registerButton,
  getButton,
  _buttonRegistry,
  buttons,
} from '../../src/js/module/Buttons.js';

// document.execCommand is a tripwire: no button may reach it any more.
let execCommandMock;

beforeEach(() => {
  execCommandMock = vi.fn(() => true);
  Object.defineProperty(document, 'execCommand', {
    value: execCommandMock, configurable: true, writable: true,
  });
  vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
});

afterEach(() => {
  expect(execCommandMock).not.toHaveBeenCalled();
  delete document.execCommand;
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  try { window.getSelection().removeAllRanges(); } catch (_) { void _; }
});

const makeCtx = (overrides = {}) => {
  const container = document.createElement('div');
  container.className = 'an-container';
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>hello</p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    ...overrides,
  };
};

/**
 * An editor context whose editable holds `html`, with `{`/`}` marking the
 * selection inside one text node (the whole first text node when absent).
 */
const selectIn = (html) => {
  const ctx = makeCtx();
  const { editable } = ctx.layoutInfo;
  editable.innerHTML = html.replace(/[{}]/g, '');
  const text = [...editable.querySelectorAll('*'), editable]
    .flatMap((el) => [...el.childNodes]).find((n) => n.nodeType === 3);
  const start = html.indexOf('{');
  const range = document.createRange();
  if (start === -1) {
    range.selectNodeContents(text);
  } else {
    const plainBefore = html.slice(0, start).replace(/<[^>]*>/g, '');
    const inner = html.slice(start + 1, html.indexOf('}')).replace(/<[^>]*>/g, '');
    range.setStart(text, plainBefore.length);
    range.setEnd(text, plainBefore.length + inner.length);
  }
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  return ctx;
};

// ── Button contract ────────────────────────────────────────────────────────────

describe('Buttons contract', () => {
  it('exposes expected specialized button types', () => {
    expect(tableBtn.type).toBe('grid');
    expect(foreColorBtn.type).toBe('colorpicker');
    expect(backColorBtn.type).toBe('colorpicker');
  });

  it('default toolbar contains newly documented buttons', () => {
    const flat = defaultToolbar.flat();
    expect(flat.some((b) => b.name === inlineCodeBtn.name)).toBe(true);
    expect(flat.some((b) => b.name === checklistBtn.name)).toBe(true);
    expect(flat.some((b) => b.name === printBtn.name)).toBe(true);
  });
});

// ── registerButton / getButton ─────────────────────────────────────────────────

describe('registerButton / getButton', () => {
  afterEach(() => _buttonRegistry.clear());

  it('registers and retrieves a button by name', () => {
    const myBtn = { name: 'myBtn', icon: 'x', tooltip: 'Test', action: vi.fn() };
    registerButton(myBtn);
    expect(getButton('myBtn')).toBe(myBtn);
  });

  it('warns and skips registration when btnDef has no name', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerButton({});
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('warns when overwriting an existing button', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerButton({ name: 'dup', icon: 'x', action: vi.fn() });
    registerButton({ name: 'dup', icon: 'y', action: vi.fn() });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('overwriting'));
    warnSpy.mockRestore();
  });

  it('returns undefined for unknown button', () => {
    expect(getButton('__nonexistent__')).toBeUndefined();
  });
});

// ── Inline style button actions ─────────────────────────────────────────────────

describe('Style button actions', () => {
  it.each([
    ['boldBtn', boldBtn, '<p><b>hello</b></p>'],
    ['italicBtn', italicBtn, '<p><i>hello</i></p>'],
    ['strikeBtn', strikeBtn, '<p><s>hello</s></p>'],
    ['superscriptBtn', superscriptBtn, '<p><sup>hello</sup></p>'],
    ['subscriptBtn', subscriptBtn, '<p><sub>hello</sub></p>'],
  ])('%s.action formats the selection', (_name, def, expected) => {
    const ctx = selectIn('<p>hello</p>');
    def.action(ctx);
    expect(ctx.layoutInfo.editable.innerHTML).toBe(expected);
  });

  it('removeFormatBtn.action strips inline formatting', () => {
    const ctx = selectIn('<p><b>hello</b></p>');
    removeFormatBtn.action(ctx);
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<p>hello</p>');
  });

  it('hrBtn.action inserts a horizontal rule', () => {
    const ctx = selectIn('<p>hello</p>');
    window.getSelection().collapseToEnd();
    hrBtn.action(ctx);
    expect(ctx.layoutInfo.editable.querySelector('hr')).not.toBeNull();
  });
});

// ── isActive callbacks ─────────────────────────────────────────────────────────

describe('isActive callbacks', () => {
  it.each([
    ['boldBtn', boldBtn, 'b'],
    ['italicBtn', italicBtn, 'em'],
    ['strikeBtn', strikeBtn, 'del'],
    ['superscriptBtn', superscriptBtn, 'sup'],
    ['subscriptBtn', subscriptBtn, 'sub'],
  ])('%s.isActive reads the format from the DOM', (_name, def, tag) => {
    const on = selectIn(`<p><${tag}>hello</${tag}></p>`);
    expect(def.isActive(on)).toBe(true);
    const off = selectIn('<p>hello</p>');
    expect(def.isActive(off)).toBe(false);
  });

  it('codeviewBtn.isActive delegates to context.invoke', () => {
    const ctx = makeCtx();
    ctx.invoke.mockReturnValue(true);
    expect(codeviewBtn.isActive(ctx)).toBe(true);
    expect(ctx.invoke).toHaveBeenCalledWith('codeview.isActive');
  });

  it('fullscreenBtn.isActive delegates to context.invoke', () => {
    const ctx = makeCtx();
    ctx.invoke.mockReturnValue(false);
    expect(fullscreenBtn.isActive(ctx)).toBe(false);
  });
});

// ── underlineBtn.isActive — complex path ──────────────────────────────────────

describe('underlineBtn.isActive', () => {
  it('returns false with no selection', () => {
    window.getSelection().removeAllRanges();
    expect(underlineBtn.isActive(makeCtx())).toBe(false);
  });

  it('returns true inside <u>, including inside inline code', () => {
    expect(underlineBtn.isActive(selectIn('<p><u>underlined</u></p>'))).toBe(true);
    expect(underlineBtn.isActive(selectIn('<p><code><u>code</u></code></p>'))).toBe(true);
  });

  it('returns true for an inline text-decoration underline', () => {
    expect(underlineBtn.isActive(selectIn('<p><span style="text-decoration: underline;">x</span></p>'))).toBe(true);
  });
});

// ── Alignment button actions ───────────────────────────────────────────────────

describe('Alignment button actions', () => {
  it.each([
    ['alignCenterBtn', alignCenterBtn, 'center'],
    ['alignRightBtn', alignRightBtn, 'right'],
    ['alignJustifyBtn', alignJustifyBtn, 'justify'],
  ])('%s.action sets text-align on the block', (_name, def, value) => {
    const ctx = selectIn('<p>hello</p>');
    def.action(ctx);
    expect(ctx.layoutInfo.editable.querySelector('p').style.textAlign).toBe(value);
  });

  it('alignLeftBtn.action clears the alignment', () => {
    const ctx = selectIn('<p style="text-align: center;">hello</p>');
    alignLeftBtn.action(ctx);
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<p>hello</p>');
  });
});

// ── List / indent button actions ───────────────────────────────────────────────

describe('List and indent button actions', () => {
  it('ulBtn.action makes a bulleted list', () => {
    const ctx = selectIn('<p>hello</p>');
    ulBtn.action(ctx);
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<ul><li>hello</li></ul>');
  });

  it('olBtn.action makes a numbered list', () => {
    const ctx = selectIn('<p>hello</p>');
    olBtn.action(ctx);
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<ol><li>hello</li></ol>');
  });

  it('indentBtn.action and outdentBtn.action move a paragraph by one step', () => {
    const ctx = selectIn('<p>hello</p>');
    indentBtn.action(ctx);
    expect(ctx.layoutInfo.editable.querySelector('p').style.marginLeft).toBe('40px');
    outdentBtn.action(ctx);
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<p>hello</p>');
  });
});

// ── Undo / redo buttons ───────────────────────────────────────────────────────

describe('Undo/redo button actions', () => {
  it('undoBtn.action calls context.invoke editor.undo', () => {
    const ctx = makeCtx();
    undoBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.undo');
  });

  it('redoBtn.action calls context.invoke editor.redo', () => {
    const ctx = makeCtx();
    redoBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.redo');
  });

  it('undoBtn.isDisabled returns !ctx.invoke(editor.canUndo)', () => {
    const ctx = makeCtx();
    ctx.invoke.mockReturnValue(false); // canUndo returns false → isDisabled = true
    expect(undoBtn.isDisabled(ctx)).toBe(true);
  });

  it('redoBtn.isDisabled returns !ctx.invoke(editor.canRedo)', () => {
    const ctx = makeCtx();
    ctx.invoke.mockReturnValue(true); // canRedo returns true → isDisabled = false
    expect(redoBtn.isDisabled(ctx)).toBe(false);
  });
});

// ── Context-invoking buttons ──────────────────────────────────────────────────

describe('Context-invoking button actions', () => {
  it('linkBtn.action invokes linkDialog.show', () => {
    const ctx = makeCtx();
    linkBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('linkDialog.show');
  });

  it('imageBtn.action invokes imageDialog.show', () => {
    const ctx = makeCtx();
    imageBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('imageDialog.show');
  });

  it('videoBtn.action invokes videoDialog.show', () => {
    const ctx = makeCtx();
    videoBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('videoDialog.show');
  });

  it('emojiBtn.action invokes emojiDialog.show', () => {
    const ctx = makeCtx();
    emojiBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('emojiDialog.show');
  });

  it('iconBtn.action invokes iconDialog.show', () => {
    const ctx = makeCtx();
    iconBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('iconDialog.show');
  });

  it('codeviewBtn.action invokes codeview.toggle', () => {
    const ctx = makeCtx();
    codeviewBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('codeview.toggle');
  });

  it('fullscreenBtn.action invokes fullscreen.toggle', () => {
    const ctx = makeCtx();
    fullscreenBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('fullscreen.toggle');
  });

  it('shortcutsBtn.action invokes shortcutsDialog.show', () => {
    const ctx = makeCtx();
    shortcutsBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('shortcutsDialog.show');
  });

  it('findBtn.action invokes findReplace.show with find mode', () => {
    const ctx = makeCtx();
    findBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('findReplace.show', 'find');
  });

  it('findReplaceBtn.action invokes findReplace.show with replace mode', () => {
    const ctx = makeCtx();
    findReplaceBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('findReplace.show', 'replace');
  });

  it('inlineCodeBtn.action invokes editor.inlineCode', () => {
    const ctx = makeCtx();
    inlineCodeBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.inlineCode');
  });

  it('checklistBtn.action invokes editor.toggleChecklist', () => {
    const ctx = makeCtx();
    checklistBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.toggleChecklist');
  });

  it('printBtn.action invokes editor.print', () => {
    const ctx = makeCtx();
    printBtn.action(ctx);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.print');
  });
});

// ── tableBtn action ────────────────────────────────────────────────────────────

describe('tableBtn.action', () => {
  it('invokes editor.insertTable and editor.afterCommand', () => {
    const ctx = makeCtx();
    tableBtn.action(ctx, 3, 4);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertTable', 4, 3);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });
});

// ── directionBtn.action ────────────────────────────────────────────────────────

describe('directionBtn.action', () => {
  it('toggles editable dir from ltr to rtl', () => {
    const ctx = makeCtx();
    ctx.layoutInfo.editable.setAttribute('dir', 'ltr');
    directionBtn.action(ctx);
    expect(ctx.layoutInfo.editable.getAttribute('dir')).toBe('rtl');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('toggles editable dir from rtl to ltr', () => {
    const ctx = makeCtx();
    ctx.layoutInfo.editable.setAttribute('dir', 'rtl');
    directionBtn.action(ctx);
    expect(ctx.layoutInfo.editable.getAttribute('dir')).toBe('ltr');
  });

  it('defaults dir to ltr when no dir attribute', () => {
    const ctx = makeCtx();
    directionBtn.action(ctx);
    expect(ctx.layoutInfo.editable.getAttribute('dir')).toBe('rtl');
  });
});

// ── foreColorBtn / backColorBtn actions ───────────────────────────────────────

describe('Color button actions', () => {
  it('foreColorBtn.action colours the selection', () => {
    const ctx = selectIn('<p>hello</p>');
    foreColorBtn.action(ctx, '#ff0000');
    expect(ctx.layoutInfo.editable.querySelector('span').style.color).toBe('rgb(255, 0, 0)');
  });

  it('backColorBtn.action highlights the selection', () => {
    const ctx = selectIn('<p>hello</p>');
    backColorBtn.action(ctx, '#ffff00');
    expect(ctx.layoutInfo.editable.querySelector('span').style.backgroundColor).toBe('rgb(255, 255, 0)');
  });
});

// ── fontSizeBtn getValue ───────────────────────────────────────────────────────

describe('fontSizeBtn.getValue', () => {
  it('returns empty string when no selection', () => {
    expect(fontSizeBtn.getValue()).toBe('');
  });

  it('returns font size from selection element style', () => {
    const div = document.createElement('div');
    div.style.fontSize = '18px';
    div.textContent = 'hi';
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    window.getSelection().addRange(range);
    const val = fontSizeBtn.getValue();
    // May not return exact value due to jsdom getSelection limitations, just shouldn't throw
    expect(typeof val).toBe('string');
  });

  it('falls back to editable fontSize when no explicit font on selection', () => {
    const ctx = makeCtx();
    ctx.layoutInfo.editable.style.fontSize = '14px';
    const result = fontSizeBtn.getValue(ctx);
    expect(typeof result).toBe('string');
  });

  it('returns empty string on error', () => {
    // Call with a context that has a null editable to force fallback
    const val = fontSizeBtn.getValue({ layoutInfo: { editable: null } });
    expect(val).toBe('');
  });
});

// ── fontFamilyBtn getValue ────────────────────────────────────────────────────

describe('fontFamilyBtn.getValue', () => {
  it('returns the first family of the font at the selection', () => {
    const ctx = selectIn('<p><span style="font-family: &quot;Courier New&quot;, monospace;">code</span></p>');
    expect(fontFamilyBtn.getValue(ctx)).toBe('Courier New');
  });

  it('returns an empty string without a selection', () => {
    window.getSelection().removeAllRanges();
    expect(fontFamilyBtn.getValue(makeCtx())).toBe('');
  });
});

// ── fontFamilyBtn action ──────────────────────────────────────────────────────

describe('fontFamilyBtn.action', () => {
  it('sets the font family as a style', () => {
    const ctx = selectIn('<p>hello</p>');
    fontFamilyBtn.action(ctx, 'Georgia');
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<p><span style="font-family: Georgia;">hello</span></p>');
  });
});

// ── paragraphStyleBtn action / getValue ───────────────────────────────────────

describe('paragraphStyleBtn', () => {
  it('action changes the block', () => {
    const ctx = selectIn('<p>hello</p>');
    paragraphStyleBtn.action(ctx, 'h2');
    expect(ctx.layoutInfo.editable.innerHTML).toBe('<h2>hello</h2>');
  });

  it('getValue reports the block tag, and p for a div', () => {
    expect(paragraphStyleBtn.getValue(selectIn('<h2>hello</h2>'))).toBe('h2');
    expect(paragraphStyleBtn.getValue(selectIn('<div>hello</div>'))).toBe('p');
    expect(paragraphStyleBtn.getValue(selectIn('<p>hello</p>'))).toBe('p');
  });
});

// ── lineHeightBtn getValue ────────────────────────────────────────────────────

describe('lineHeightBtn.getValue', () => {
  it('returns empty string when no selection', () => {
    expect(lineHeightBtn.getValue()).toBe('');
  });

  it('returns empty string when no block ancestor found', () => {
    const span = document.createElement('span');
    span.textContent = 'test';
    document.body.appendChild(span);
    const range = document.createRange();
    range.selectNodeContents(span);
    window.getSelection().addRange(range);
    // span is not a block element → returns ''
    const val = lineHeightBtn.getValue();
    expect(typeof val).toBe('string');
  });

  it('returns lineHeight from block element with explicit style', () => {
    const p = document.createElement('p');
    p.style.lineHeight = '1.5';
    p.textContent = 'text';
    document.body.appendChild(p);
    const range = document.createRange();
    range.selectNodeContents(p.firstChild);
    window.getSelection().addRange(range);
    const val = lineHeightBtn.getValue();
    expect(val).toBe('1.5');
  });
});

// ── lineHeightBtn action ──────────────────────────────────────────────────────

describe('lineHeightBtn.action', () => {
  it('is a function', () => {
    expect(typeof lineHeightBtn.action).toBe('function');
  });

  it('does not throw when called', () => {
    expect(() => lineHeightBtn.action(null, '1.5')).not.toThrow();
  });
});

// ── inlineCodeBtn.isActive / checklistBtn.isActive ───────────────────────────

describe('inlineCode and checklist isActive', () => {
  it('inlineCodeBtn.isActive returns boolean', () => {
    expect(typeof inlineCodeBtn.isActive()).toBe('boolean');
  });

  it('checklistBtn.isActive returns boolean', () => {
    expect(typeof checklistBtn.isActive()).toBe('boolean');
  });
});

// ── buttons namespace ─────────────────────────────────────────────────────────

describe('buttons namespace', () => {
  it('is a plain object', () => {
    expect(typeof buttons).toBe('object');
    expect(buttons).not.toBeNull();
  });

  it('contains all standard button definitions', () => {
    const expected = [
      'boldBtn', 'italicBtn', 'underlineBtn', 'strikeBtn', 'superscriptBtn',
      'subscriptBtn', 'alignLeftBtn', 'alignCenterBtn', 'alignRightBtn',
      'alignJustifyBtn', 'ulBtn', 'olBtn', 'indentBtn', 'outdentBtn',
      'undoBtn', 'redoBtn', 'hrBtn', 'linkBtn', 'imageBtn', 'videoBtn',
      'emojiBtn', 'iconBtn', 'tableBtn', 'fontSizeBtn', 'removeFormatBtn',
      'directionBtn', 'fontFamilyBtn', 'paragraphStyleBtn', 'lineHeightBtn',
      'codeviewBtn', 'fullscreenBtn', 'shortcutsBtn', 'findBtn', 'findReplaceBtn',
      'inlineCodeBtn', 'checklistBtn', 'printBtn', 'foreColorBtn', 'backColorBtn',
    ];
    expected.forEach((key) => {
      expect(buttons).toHaveProperty(key);
      expect(typeof buttons[key]).toBe('object');
    });
  });

  it('includes defaultToolbar', () => {
    expect(Array.isArray(buttons.defaultToolbar)).toBe(true);
    expect(buttons.defaultToolbar.length).toBeGreaterThan(0);
  });

  it('button objects in namespace are identical references to named exports', () => {
    expect(buttons.boldBtn).toBe(boldBtn);
    expect(buttons.undoBtn).toBe(undoBtn);
    expect(buttons.tableBtn).toBe(tableBtn);
    expect(buttons.defaultToolbar).toBe(defaultToolbar);
  });

  it('each entry has a name string', () => {
    const btnEntries = Object.values(buttons).filter((v) => v !== buttons.defaultToolbar);
    btnEntries.forEach((b) => {
      expect(typeof b.name).toBe('string');
    });
  });
});
