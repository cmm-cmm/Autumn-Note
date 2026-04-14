import { describe, it, expect, afterEach } from 'vitest';
import { ShortcutsDialog } from '../../src/js/module/ShortcutsDialog.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeDialog() {
  const dialog = new ShortcutsDialog({ locale: en });
  dialog.initialize();
  return dialog;
}

describe('ShortcutsDialog', () => {
  it('shows updated keyboard shortcut text and closes via close button', () => {
    const dialog = makeDialog();

    dialog.show();
    const overlay = document.querySelector('.an-dialog-overlay[aria-label="Keyboard Shortcuts"]');
    expect(overlay).not.toBeNull();
    expect(overlay.style.display).toBe('flex');
    expect(overlay.textContent).toContain('Ctrl + Shift + /');

    const closeBtn = overlay.querySelector('.an-icon-close');
    closeBtn.click();
    expect(overlay.style.display).toBe('none');

    dialog.destroy();
  });

  it('removes dialog node on destroy', () => {
    const dialog = makeDialog();
    expect(document.querySelectorAll('.an-dialog-overlay[aria-label="Keyboard Shortcuts"]').length).toBe(1);

    dialog.destroy();
    expect(document.querySelector('.an-dialog-overlay[aria-label="Keyboard Shortcuts"]')).toBeNull();
  });
});
