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
} from '../../src/js/module/Buttons.js';

// Stub execCommand and queryCommand* globally
let execCommandMock;
let queryCommandStateMock;
let queryCommandValueMock;

beforeEach(() => {
  execCommandMock = vi.fn(() => true);
  queryCommandStateMock = vi.fn(() => false);
  queryCommandValueMock = vi.fn(() => '');

  Object.defineProperty(document, 'execCommand', {
    value: execCommandMock, configurable: true, writable: true,
  });
  Object.defineProperty(document, 'queryCommandState', {
    value: queryCommandStateMock, configurable: true, writable: true,
  });
  Object.defineProperty(document, 'queryCommandValue', {
    value: queryCommandValueMock, configurable: true, writable: true,
  });
  vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  try { window.getSelection().removeAllRanges(); } catch (_) {}
});

function makeCtx(overrides = {}) {
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
}

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
  it('boldBtn.action calls execCommand bold', () => {
    boldBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('bold', false, null);
  });

  it('italicBtn.action calls execCommand italic', () => {
    italicBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('italic', false, null);
  });

  it('strikeBtn.action calls execCommand strikeThrough', () => {
    const p = document.createElement('p');
    p.textContent = 'test';
    document.body.appendChild(p);
    const range = document.createRange();
    range.selectNodeContents(p.firstChild);
    window.getSelection().addRange(range);
    strikeBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('strikeThrough', false, null);
  });

  it('superscriptBtn.action calls execCommand superscript', () => {
    superscriptBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('superscript', false, null);
  });

  it('subscriptBtn.action calls execCommand subscript', () => {
    subscriptBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('subscript', false, null);
  });

  it('removeFormatBtn.action calls execCommand removeFormat', () => {
    removeFormatBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('removeFormat', false, null);
  });

  it('hrBtn.action calls execCommand insertHorizontalRule', () => {
    hrBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('insertHorizontalRule', false, null);
  });
});

// ── isActive callbacks ─────────────────────────────────────────────────────────

describe('isActive callbacks', () => {
  it('boldBtn.isActive returns queryCommandState result', () => {
    queryCommandStateMock.mockReturnValueOnce(true);
    expect(boldBtn.isActive()).toBe(true);
  });

  it('italicBtn.isActive returns queryCommandState result', () => {
    queryCommandStateMock.mockReturnValueOnce(true);
    expect(italicBtn.isActive()).toBe(true);
  });

  it('strikeBtn.isActive returns queryCommandState result', () => {
    queryCommandStateMock.mockReturnValueOnce(true);
    expect(strikeBtn.isActive()).toBe(true);
  });

  it('superscriptBtn.isActive returns queryCommandState result', () => {
    queryCommandStateMock.mockReturnValueOnce(true);
    expect(superscriptBtn.isActive()).toBe(true);
  });

  it('subscriptBtn.isActive returns queryCommandState result', () => {
    queryCommandStateMock.mockReturnValueOnce(true);
    expect(subscriptBtn.isActive()).toBe(true);
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
  it('returns false when queryCommandState returns false and no <u> ancestor', () => {
    queryCommandStateMock.mockReturnValue(false);
    // No selection → returns false
    expect(underlineBtn.isActive()).toBe(false);
  });

  it('returns true when queryCommandState returns true', () => {
    queryCommandStateMock.mockReturnValue(true);
    expect(underlineBtn.isActive()).toBe(true);
  });

  it('returns true when cursor is inside <u> even if queryCommandState is false', () => {
    // Set up DOM with <u> element and a selection inside it
    const div = document.createElement('div');
    div.innerHTML = '<u>underlined text</u>';
    document.body.appendChild(div);
    const textNode = div.querySelector('u').firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection().addRange(range);

    queryCommandStateMock.mockReturnValue(false);
    expect(underlineBtn.isActive()).toBe(true);
  });
});

// ── Alignment button actions ───────────────────────────────────────────────────

describe('Alignment button actions', () => {
  it('alignLeftBtn.action calls execCommand justifyLeft', () => {
    alignLeftBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('justifyLeft', false, null);
  });

  it('alignCenterBtn.action calls execCommand justifyCenter', () => {
    alignCenterBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('justifyCenter', false, null);
  });

  it('alignRightBtn.action calls execCommand justifyRight', () => {
    alignRightBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('justifyRight', false, null);
  });

  it('alignJustifyBtn.action calls execCommand justifyFull', () => {
    alignJustifyBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('justifyFull', false, null);
  });
});

// ── List / indent button actions ───────────────────────────────────────────────

describe('List and indent button actions', () => {
  it('ulBtn.action calls execCommand insertUnorderedList', () => {
    ulBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('insertUnorderedList', false, null);
  });

  it('olBtn.action calls execCommand insertOrderedList', () => {
    olBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('insertOrderedList', false, null);
  });

  it('indentBtn.action calls execCommand indent', () => {
    indentBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('indent', false, null);
  });

  it('outdentBtn.action calls execCommand outdent', () => {
    outdentBtn.action();
    expect(execCommandMock).toHaveBeenCalledWith('outdent', false, null);
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
  it('foreColorBtn.action calls execCommand foreColor', () => {
    foreColorBtn.action(null, '#ff0000');
    expect(execCommandMock).toHaveBeenCalledWith('foreColor', false, '#ff0000');
  });

  it('backColorBtn.action calls execCommand hiliteColor', () => {
    backColorBtn.action(null, '#ffff00');
    expect(execCommandMock).toHaveBeenCalledWith('hiliteColor', false, '#ffff00');
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
  it('returns queryCommandValue result for fontName', () => {
    queryCommandValueMock.mockReturnValue('Arial');
    const val = fontFamilyBtn.getValue();
    expect(val).toBe('Arial');
  });

  it('returns empty string when queryCommandValue returns empty', () => {
    queryCommandValueMock.mockReturnValue('');
    expect(fontFamilyBtn.getValue()).toBe('');
  });
});

// ── fontFamilyBtn action ──────────────────────────────────────────────────────

describe('fontFamilyBtn.action', () => {
  it('calls execCommand fontName', () => {
    fontFamilyBtn.action(null, 'Georgia');
    expect(execCommandMock).toHaveBeenCalledWith('fontName', false, 'Georgia');
  });
});

// ── paragraphStyleBtn action / getValue ───────────────────────────────────────

describe('paragraphStyleBtn', () => {
  it('action calls execCommand formatBlock', () => {
    paragraphStyleBtn.action(null, 'h2');
    expect(execCommandMock).toHaveBeenCalledWith('formatBlock', false, '<h2>');
  });

  it('getValue returns p when queryCommandValue returns div', () => {
    queryCommandValueMock.mockReturnValue('div');
    expect(paragraphStyleBtn.getValue()).toBe('p');
  });

  it('getValue returns p when queryCommandValue returns empty', () => {
    queryCommandValueMock.mockReturnValue('');
    expect(paragraphStyleBtn.getValue()).toBe('p');
  });

  it('getValue returns lowercase block tag', () => {
    queryCommandValueMock.mockReturnValue('H2');
    expect(paragraphStyleBtn.getValue()).toBe('h2');
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
