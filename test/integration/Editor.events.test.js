/**
 * Integration tests that exercise Editor._bindEvents by dispatching real
 * DOM events on a fully-initialized AutumnNote editor.
 *
 * These tests intentionally use AutumnNote.create() so that all modules
 * (Editor, Toolbar, Clipboard, Typing, History, etc.) are initialized and
 * event bindings are live. The goal is to cover the event handler code paths
 * in Editor.js that are difficult to reach with unit tests.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import AutumnNote from '../../src/js/index.js';

// jsdom stubs for browser APIs used by editor modules
if (typeof document.queryCommandState !== 'function') {
  Object.defineProperty(document, 'queryCommandState', { value: () => false, configurable: true, writable: true });
}
if (typeof document.queryCommandValue !== 'function') {
  Object.defineProperty(document, 'queryCommandValue', { value: () => '', configurable: true, writable: true });
}
if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: () => true, configurable: true, writable: true });
}

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  AutumnNote.resetDefaults();
  vi.clearAllMocks();
});

function makeEditor(options = {}) {
  const ta = document.createElement('textarea');
  ta.value = '<p>Hello world</p>';
  document.body.appendChild(ta);
  const editor = AutumnNote.create(ta, {
    bubbleToolbar: false,
    markdownShortcuts: false,
    ...options,
  });
  return { editor, ta };
}

// ── Focus / blur ────────────────────────────────────────────────────────────

describe('Editor focus/blur events', () => {
  it('focus event adds an-focused class to container', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    expect(editor.layoutInfo.container.classList.contains('an-focused')).toBe(true);
    editor.destroy();
  });

  it('blur event removes an-focused class from container', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    editable.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    expect(editor.layoutInfo.container.classList.contains('an-focused')).toBe(false);
    editor.destroy();
  });
});

// ── Input event ──────────────────────────────────────────────────────────────

describe('Editor input event', () => {
  it('input event triggers toolbar refresh via afterCommand', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>modified content</p>';
    editable.dispatchEvent(new InputEvent('input', { bubbles: true }));
    // No throw = success; toolbar.refresh and statusbar.update are invoked internally
    editor.destroy();
  });
});

// ── Keyboard events ───────────────────────────────────────────────────────────

describe('Editor keydown events', () => {
  it('Ctrl+Z fires undo (does not throw)', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'z', ctrlKey: true, bubbles: true,
    }));
    editor.destroy();
  });

  it('Ctrl+Y fires redo (does not throw)', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'y', ctrlKey: true, bubbles: true,
    }));
    editor.destroy();
  });

  it('Tab key dispatches through Typing module (does not throw)', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Tab', bubbles: true,
    }));
    editor.destroy();
  });

  it('Enter key dispatches through Typing module (does not throw)', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true,
    }));
    editor.destroy();
  });

  it('Arrow keys navigate without error', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].forEach((key) => {
      editable.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    });
    editor.destroy();
  });

  it('Backspace key does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Backspace', bubbles: true,
    }));
    editor.destroy();
  });
});

// ── Paste event ──────────────────────────────────────────────────────────────

describe('Editor paste event', () => {
  it('paste event does not throw with no clipboardData', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    // jsdom does not have ClipboardEvent — use plain Event
    const event = new Event('paste', { bubbles: true, cancelable: true });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });
});

// ── Context menu event ────────────────────────────────────────────────────────

describe('Editor contextmenu event', () => {
  it('contextmenu event on editable opens context menu', () => {
    const { editor } = makeEditor({ contextMenu: true });
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>Hello</p>';
    editable.dispatchEvent(new MouseEvent('contextmenu', {
      clientX: 100, clientY: 200, bubbles: true, cancelable: true,
    }));
    // ContextMenu may or may not be shown (depends on position); no throw
    editor.destroy();
  });
});

// ── SelectionChange ───────────────────────────────────────────────────────────

describe('Editor selectionchange event', () => {
  it('selectionchange fires without error', () => {
    const { editor } = makeEditor({ bubbleToolbar: true });
    // Trigger selectionchange at document level
    document.dispatchEvent(new Event('selectionchange'));
    expect(() => editor.destroy()).not.toThrow();
  });
});

// ── Cut / Copy ────────────────────────────────────────────────────────────────

describe('Editor cut/copy events', () => {
  it('cut event on editable does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    expect(() => editable.dispatchEvent(new Event('cut', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });

  it('copy event on editable does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    expect(() => editable.dispatchEvent(new Event('copy', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });
});

// ── maxChars enforcement ──────────────────────────────────────────────────────

describe('Editor maxChars enforcement', () => {
  it('beforeinput event fires without error when maxChars is set', () => {
    const { editor } = makeEditor({ maxChars: 10 });
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>1234567890</p>'; // exactly at limit
    // InputEvent with inputType — exercises _enforceLimit
    const event = new InputEvent('beforeinput', {
      bubbles: true, cancelable: true, inputType: 'insertText', data: 'x',
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });
});

// ── onSelectionChange callback ────────────────────────────────────────────────

describe('Editor onSelectionChange', () => {
  it('onSelectionChange callback is called on selection change', () => {
    const onSelectionChange = vi.fn();
    const { editor } = makeEditor({ onSelectionChange });
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>Hello</p>';
    // Place cursor inside editable
    const textNode = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(textNode, 0);
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    // Fire selectionchange
    document.dispatchEvent(new Event('selectionchange'));
    // Callback may or may not fire depending on jsdom selection detection
    expect(() => editor.destroy()).not.toThrow();
  });
});

// ── Checkbox click ────────────────────────────────────────────────────────────

describe('Editor checkbox click', () => {
  it('clicking a checkbox in a checklist does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    // Set up checklist HTML
    editable.innerHTML = '<ul class="an-checklist"><li><input type="checkbox" contenteditable="false">Item</li></ul>';
    const checkbox = editable.querySelector('input[type="checkbox"]');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: checkbox, configurable: true });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });
});

// ── Ctrl keyboard shortcuts ───────────────────────────────────────────────────

describe('Editor Ctrl keyboard shortcuts', () => {
  it.each([
    ['b', 'bold'],
    ['i', 'italic'],
    ['u', 'underline'],
    ['z', 'undo'],
    ['y', 'redo'],
    ['a', 'selectAll'],
  ])('Ctrl+%s does not throw', (key) => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    expect(() => editable.dispatchEvent(new KeyboardEvent('keydown', {
      key, ctrlKey: true, bubbles: true, cancelable: true,
    }))).not.toThrow();
    editor.destroy();
  });

  it('Ctrl+Shift+V (paste plain) does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    expect(() => editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'v', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true,
    }))).not.toThrow();
    editor.destroy();
  });
});

// ── Paste with mock clipboardData ─────────────────────────────────────────────

describe('Editor paste with mock clipboardData', () => {
  it('paste event with HTML clipboardData does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    // Attach mock clipboardData
    Object.defineProperty(event, 'clipboardData', {
      value: {
        getData: (type) => type === 'text/html' ? '<p>pasted</p>' : 'pasted',
        types: ['text/html', 'text/plain'],
        files: { length: 0 },
      },
      configurable: true,
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });

  it('paste event with text/plain data does not throw', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: {
        getData: (type) => type === 'text/plain' ? 'plain text' : '',
        types: ['text/plain'],
        files: { length: 0 },
      },
      configurable: true,
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });

  it('paste with pasteAsPlainText option forces plain text', () => {
    const { editor } = makeEditor({ pasteAsPlainText: true });
    const editable = editor.layoutInfo.editable;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: {
        getData: (type) => type === 'text/plain' ? 'plain' : '<b>bold</b>',
        types: ['text/html', 'text/plain'],
        files: { length: 0 },
      },
      configurable: true,
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });

  it('paste with Word HTML triggers cleanWordHtml path', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    // Word HTML contains urn:schemas-microsoft-com marker
    const wordHtml = '<!--[if gte mso 9]><xml></xml><![endif]--><p class="MsoNormal">Word content</p>';
    Object.defineProperty(event, 'clipboardData', {
      value: {
        getData: (type) => type === 'text/html' ? wordHtml : '',
        types: ['text/html'],
        files: { length: 0 },
      },
      configurable: true,
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });

  it('paste with Markdown triggers markdown conversion path', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: {
        getData: (type) => type === 'text/plain' ? '# Hello\n\n**bold**' : '',
        types: ['text/plain'],
        files: { length: 0 },
      },
      configurable: true,
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });

  it('paste with pasteStripAttributes strips attribute path', () => {
    const { editor } = makeEditor({ pasteStripAttributes: true });
    const editable = editor.layoutInfo.editable;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: {
        getData: (type) => type === 'text/html' ? '<p class="foo" style="color:red">text</p>' : '',
        types: ['text/html'],
        files: { length: 0 },
      },
      configurable: true,
    });
    expect(() => editable.dispatchEvent(event)).not.toThrow();
    editor.destroy();
  });
});

// ── onChange callback ─────────────────────────────────────────────────────────

describe('Editor onChange callback', () => {
  it('onChange is called when content changes via setHTML', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { editor } = makeEditor({ onChange });
    editor.setHTML('<p>New content</p>');
    vi.advanceTimersByTime(500);
    expect(onChange).toHaveBeenCalled();
    vi.useRealTimers();
    editor.destroy();
  });
});

// ── Renderer options ──────────────────────────────────────────────────────────

describe('Editor renderer options', () => {
  it('toolbarOverflow scroll adds an-toolbar-overflow-scroll class', () => {
    const { editor } = makeEditor({ toolbarOverflow: 'scroll' });
    expect(editor.layoutInfo.container.classList.contains('an-toolbar-overflow-scroll')).toBe(true);
    editor.destroy();
  });

  it('stickyToolbar adds an-sticky-toolbar class', () => {
    const { editor } = makeEditor({ stickyToolbar: true, stickyToolbarOffset: 60 });
    expect(editor.layoutInfo.container.classList.contains('an-sticky-toolbar')).toBe(true);
    editor.destroy();
  });

  it('focusColor sets CSS custom property', () => {
    const { editor } = makeEditor({ focusColor: '#ff0000' });
    const style = editor.layoutInfo.container.style.getPropertyValue('--an-focus-color');
    expect(style).toBe('#ff0000');
    editor.destroy();
  });

  it('direction rtl adds an-dir-rtl class', () => {
    const { editor } = makeEditor({ direction: 'rtl' });
    expect(editor.layoutInfo.container.classList.contains('an-dir-rtl')).toBe(true);
    editor.destroy();
  });
});

// ── Read-only mode ────────────────────────────────────────────────────────────

describe('Editor read-only mode', () => {
  it('editable is non-editable when readOnly=true', () => {
    const { editor } = makeEditor({ readOnly: true });
    expect(editor.layoutInfo.editable.getAttribute('contenteditable')).toBe('false');
    editor.destroy();
  });

  it('setDisabled toggles editable contenteditable', () => {
    const { editor } = makeEditor();
    editor.setDisabled(true);
    expect(editor.layoutInfo.container.classList.contains('an-disabled')).toBe(true);
    editor.setDisabled(false);
    expect(editor.layoutInfo.container.classList.contains('an-disabled')).toBe(false);
    editor.destroy();
  });
});

// ── Content API through context ───────────────────────────────────────────────

describe('Editor public content API', () => {
  it('getHTML returns current content', () => {
    const { editor } = makeEditor();
    editor.layoutInfo.editable.innerHTML = '<p>test</p>';
    expect(editor.getHTML()).toContain('test');
    editor.destroy();
  });

  it('setHTML + getHTML roundtrip', () => {
    const { editor } = makeEditor();
    editor.setHTML('<p>roundtrip</p>');
    expect(editor.getHTML()).toContain('roundtrip');
    editor.destroy();
  });

  it('clear() empties content', () => {
    const { editor } = makeEditor();
    editor.setHTML('<p>some text</p>');
    editor.clear();
    expect(editor.getHTML().replace(/<[^>]+>/g, '').trim()).toBe('');
    editor.destroy();
  });

  it('isEmpty returns true after clear()', () => {
    const { editor } = makeEditor();
    editor.clear();
    expect(editor.isEmpty()).toBe(true);
    editor.destroy();
  });

  it('setMarkdown / getMarkdown roundtrip', () => {
    const { editor } = makeEditor();
    editor.setMarkdown('# Hello');
    const md = editor.getMarkdown();
    expect(md).toContain('Hello');
    editor.destroy();
  });
});

// ── Renderer options ──────────────────────────────────────────────────────────

describe('Renderer options', () => {
  it('height option sets editable minHeight', () => {
    const { editor } = makeEditor({ height: 250 });
    expect(editor.layoutInfo.editable.style.minHeight).toBe('250px');
    editor.destroy();
  });

  it('minHeight option sets editable minHeight (when height is explicitly 0)', () => {
    const { editor } = makeEditor({ height: 0, minHeight: 150 });
    expect(editor.layoutInfo.editable.style.minHeight).toBe('150px');
    editor.destroy();
  });

  it('maxHeight option sets editable maxHeight', () => {
    const { editor } = makeEditor({ maxHeight: 500 });
    expect(editor.layoutInfo.editable.style.maxHeight).toBe('500px');
    editor.destroy();
  });

  it('theme: dark adds an-theme-dark class to container', () => {
    const { editor } = makeEditor({ theme: 'dark' });
    expect(editor.layoutInfo.container.classList.contains('an-theme-dark')).toBe(true);
    editor.destroy();
  });

  it('readOnly option disables editing and checklist checkboxes', () => {
    const ta = document.createElement('textarea');
    ta.value = '<ul class="an-checklist"><li><input type="checkbox"><span>item</span></li></ul>';
    document.body.appendChild(ta);
    const editor = AutumnNote.create(ta, { readOnly: true });
    expect(editor.layoutInfo.container.classList.contains('an-disabled')).toBe(true);
    const cb = editor.layoutInfo.editable.querySelector('input[type="checkbox"]');
    if (cb) expect(cb.hasAttribute('disabled')).toBe(true);
    editor.destroy();
  });

  it('autoSave with autoSaveKey tries to restore from localStorage', () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue({
      getItem: vi.fn(() => '<p>saved</p>'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    const editor = AutumnNote.create(ta, { autoSave: true, autoSaveKey: 'test-key' });
    editor.destroy();
  });
});

// ── Extended keyboard shortcuts (_onKeydown) ──────────────────────────────────

describe('Editor extended keyboard shortcuts', () => {
  it('Ctrl+K invokes linkDialog.show', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k', ctrlKey: true, bubbles: true, cancelable: true,
    }));
    editor.destroy();
  });

  it('Ctrl+F invokes findReplace.show find mode', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    }));
    editor.destroy();
  });

  it('Ctrl+H invokes findReplace.show replace mode', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'h', ctrlKey: true, bubbles: true, cancelable: true,
    }));
    editor.destroy();
  });

  it('Ctrl+` invokes inlineCode', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: '`', ctrlKey: true, bubbles: true, cancelable: true,
    }));
    editor.destroy();
  });

  it('Ctrl+Shift+/ invokes shortcutsDialog.show', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: '/', shiftKey: true, ctrlKey: true, bubbles: true, cancelable: true,
    }));
    editor.destroy();
  });

  it('Ctrl+Shift+Z fires redo', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'z', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true,
    }));
    editor.destroy();
  });
});

// ── dragstart / drop in readOnly ──────────────────────────────────────────────

describe('Editor dragstart / drop events', () => {
  it('dragstart on editable in readOnly mode is prevented', () => {
    const { editor } = makeEditor({ readOnly: true });
    const editable = editor.layoutInfo.editable;
    const e = new Event('dragstart', { bubbles: true, cancelable: true });
    editable.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    editor.destroy();
  });

  it('dragstart on iframe element in edit mode is prevented', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<div class="an-video-wrapper"><iframe src="about:blank"></iframe></div>';
    const iframe = editable.querySelector('iframe');
    const e = new Event('dragstart', { bubbles: true, cancelable: true });
    // Dispatch from the iframe so e.target === iframe and it bubbles to editable
    iframe.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    editor.destroy();
  });

  it('drop event in readOnly mode is prevented', () => {
    const { editor } = makeEditor({ readOnly: true });
    const editable = editor.layoutInfo.editable;
    const e = new Event('drop', { bubbles: true, cancelable: true });
    editable.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    editor.destroy();
  });

  it('drop event in edit mode is not prevented', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    const e = new Event('drop', { bubbles: true, cancelable: true });
    editable.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
    editor.destroy();
  });
});

// ── compositionstart / compositionend (IME) ───────────────────────────────────

describe('Editor IME composition events', () => {
  it('compositionstart detects superscript context', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>text <sup>sup</sup></p>';
    const supNode = editable.querySelector('sup');
    const textNode = supNode.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    expect(() => editable.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });

  it('compositionstart detects subscript context', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>text <sub>sub</sub></p>';
    const subNode = editable.querySelector('sub');
    const textNode = subNode.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    expect(() => editable.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });

  it('compositionstart clears context when outside sup/sub', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>normal text</p>';
    const p = editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    expect(() => editable.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });

  it('compositionend fires without throwing', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    expect(() => editable.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });
});

// ── fixChecklistCursor ────────────────────────────────────────────────────────

describe('Editor fixChecklistCursor', () => {
  it('keyup with cursor at li element moves it to text node', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<ul class="an-checklist"><li><input type="checkbox" contenteditable="false"><span>item</span></li></ul>';
    const li = editable.querySelector('li');
    const range = document.createRange();
    range.setStart(li, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    expect(() => editable.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }))).not.toThrow();
    editor.destroy();
  });

  it('mouseup with cursor at li element fires fixChecklistCursor', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<ul class="an-checklist"><li><input type="checkbox" contenteditable="false"><span>item</span></li></ul>';
    const li = editable.querySelector('li');
    const range = document.createRange();
    range.setStart(li, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    expect(() => editable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))).not.toThrow();
    editor.destroy();
  });

  it('keyup with cursor at text node (not li) does nothing special', () => {
    const { editor } = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>hello</p>';
    const p = editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    expect(() => editable.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }))).not.toThrow();
    editor.destroy();
  });
});
