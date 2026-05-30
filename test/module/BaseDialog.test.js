import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// BaseDialog is abstract — test via a concrete minimal subclass
class ConcreteDialog extends (await import('../../src/js/module/BaseDialog.js')).BaseDialog {
  _buildDialog() {
    const { overlay, box } = this._buildDialogShell('Test dialog', '<svg/>', 'Test');
    const input = document.createElement('input');
    input.type = 'text';
    box.appendChild(input);
    this._firstInput = input;

    const btnRow = this._buildButtonRow('Insert', 'Cancel', () => this._close());
    box.appendChild(btnRow);

    overlay.style.display = 'none';
    return overlay;
  }
}

function makeContext(overrides = {}) {
  return {
    options: {},
    locale: {
      contextMenu: { customColorLabel: 'Custom…' },
    },
    layoutInfo: { editable: document.createElement('div') },
    invoke: vi.fn(),
    on: vi.fn(() => () => {}),
    ...overrides,
  };
}

describe('BaseDialog', () => {
  let ctx;
  let dialog;

  beforeEach(() => {
    ctx = makeContext();
    dialog = new ConcreteDialog(ctx);
    dialog.initialize();
  });

  afterEach(() => {
    dialog.destroy();
  });

  it('initialize() appends dialog to document.body', () => {
    expect(document.body.contains(dialog._dialog)).toBe(true);
  });

  it('dialog is hidden on init', () => {
    expect(dialog._dialog.style.display).toBe('none');
  });

  it('_open() shows the dialog', () => {
    dialog._open();
    expect(dialog._dialog.style.display).toBe('flex');
  });

  it('_close() hides the dialog', () => {
    dialog._open();
    dialog._close();
    expect(dialog._dialog.style.display).toBe('none');
  });

  it('_close() removes focus trap', () => {
    dialog._open();
    expect(dialog._removeTrap).toBeTruthy();
    dialog._close();
    expect(dialog._removeTrap).toBeNull();
  });

  it('destroy() removes dialog from DOM', () => {
    const el = dialog._dialog;
    dialog.destroy();
    expect(document.body.contains(el)).toBe(false);
    expect(dialog._dialog).toBeNull();
  });

  it('destroy() clears disposers', () => {
    const disposer = vi.fn();
    dialog._disposers.push(disposer);
    dialog.destroy();
    expect(disposer).toHaveBeenCalled();
  });

  it('_buildDialogShell() creates overlay with role=dialog', () => {
    const overlay = dialog._dialog;
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
  });

  it('_buildDialogShell() sets aria-label', () => {
    const overlay = dialog._dialog;
    expect(overlay.getAttribute('aria-label')).toBe('Test dialog');
  });

  it('clicking overlay closes dialog', () => {
    dialog._open();
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: dialog._dialog });
    dialog._dialog.dispatchEvent(event);
    expect(dialog._dialog.style.display).toBe('none');
  });

  it('_buildButtonRow() creates insert and cancel buttons', () => {
    const btnRow = dialog._dialog.querySelector('.an-dialog-actions');
    expect(btnRow).toBeTruthy();
    const buttons = btnRow.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('Insert');
    expect(buttons[1].textContent).toBe('Cancel');
  });

  it('cancel button closes dialog', () => {
    dialog._open();
    const cancelBtn = dialog._dialog.querySelector('.an-btn:not(.an-btn-primary)');
    cancelBtn.click();
    expect(dialog._dialog.style.display).toBe('none');
  });

  it('_saveRange() does not throw', () => {
    expect(() => dialog._saveRange()).not.toThrow();
  });

  it('multiple open/close cycles work correctly', () => {
    for (let i = 0; i < 3; i++) {
      dialog._open();
      expect(dialog._dialog.style.display).toBe('flex');
      dialog._close();
      expect(dialog._dialog.style.display).toBe('none');
    }
  });
});
