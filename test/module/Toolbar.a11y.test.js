import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AutumnNote from '../../src/js/index.js';

/**
 * The selector the browser effectively uses to build the tab order: a control
 * is a tab stop unless it is disabled or carries tabindex="-1".
 */
const TAB_STOP = 'button:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"])';

let host;
let ctx;

/** @param {object} [options] */
function mount(options = {}) {
  host = document.createElement('div');
  document.body.appendChild(host);
  ctx = /** @type {any} */ (AutumnNote.create(host, options));
  return ctx.layoutInfo.container.querySelector('.an-toolbar');
}

/** @param {HTMLElement} el @param {string} key */
function press(el, key) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

afterEach(() => {
  if (host) AutumnNote.destroy(host);
  host?.remove();
  host = null;
  ctx = null;
});

describe('toolbar ARIA semantics', () => {
  it('identifies itself as a horizontal toolbar', () => {
    const toolbar = mount();
    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.getAttribute('aria-label')).toBeTruthy();
  });

  it('exposes toggle state on buttons that track an active state', () => {
    const toolbar = mount();
    const bold = toolbar.querySelector('button[data-btn="bold"]');
    expect(bold?.getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps aria-pressed in step with the .active class on refresh', () => {
    const toolbar = mount();
    const bold = /** @type {HTMLElement} */ (toolbar.querySelector('button[data-btn="bold"]'));
    ctx.setHTML('<p><b>bold</b> plain</p>');
    const select = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    };
    select(ctx.layoutInfo.editable.querySelector('b'));
    ctx.invoke('toolbar._doRefresh');
    expect(bold.classList.contains('active')).toBe(true);
    expect(bold.getAttribute('aria-pressed')).toBe('true');

    select(ctx.layoutInfo.editable.querySelector('p').lastChild);
    ctx.invoke('toolbar._doRefresh');
    expect(bold.classList.contains('active')).toBe(false);
    expect(bold.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('toolbar roving tabindex', () => {
  it('is a single tab stop no matter how many buttons it renders', () => {
    const toolbar = mount();
    const controls = toolbar.querySelectorAll('button, select');
    // Guard the premise: this only matters because the default toolbar is big.
    expect(controls.length).toBeGreaterThan(30);
    expect(toolbar.querySelectorAll(TAB_STOP)).toHaveLength(1);
  });

  it('puts the tab stop on the first control', () => {
    const toolbar = mount();
    const first = toolbar.querySelector('button, select');
    expect(first.getAttribute('tabindex')).toBe('0');
  });

  it('moves focus and the tab stop with ArrowRight', () => {
    const toolbar = mount();
    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[0].focus();
    press(controls[0], 'ArrowRight');
    expect(document.activeElement).toBe(controls[1]);
    expect(controls[1].getAttribute('tabindex')).toBe('0');
    expect(controls[0].getAttribute('tabindex')).toBe('-1');
    expect(toolbar.querySelectorAll(TAB_STOP)).toHaveLength(1);
  });

  it('wraps around both ends', () => {
    const toolbar = mount();
    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[0].focus();
    press(controls[0], 'ArrowLeft');
    expect(document.activeElement).toBe(controls.at(-1));

    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowRight');
    expect(document.activeElement).toBe(controls[0]);
  });

  it('jumps to the ends with Home and End', () => {
    const toolbar = mount();
    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[3].focus();
    press(controls[3], 'End');
    expect(document.activeElement).toBe(controls.at(-1));
    press(/** @type {HTMLElement} */ (document.activeElement), 'Home');
    expect(document.activeElement).toBe(controls[0]);
  });

  it('reverses the arrow directions in RTL', () => {
    const toolbar = mount({ direction: 'rtl' });
    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[0].focus();
    press(controls[0], 'ArrowLeft');
    expect(document.activeElement).toBe(controls[1]);
  });

  it('leaves ArrowUp/ArrowDown alone so selects keep native value changing', () => {
    const toolbar = mount();
    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[0].focus();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    controls[0].dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(controls[0]);
  });

  it('follows focus when a control is reached by click rather than by arrow', () => {
    const toolbar = mount();
    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[5].focus(); // fires focusin
    expect(controls[5].getAttribute('tabindex')).toBe('0');
    expect(toolbar.querySelectorAll(TAB_STOP)).toHaveLength(1);
  });

  it('hands the tab stop on when the holder becomes disabled', () => {
    const toolbar = mount();
    const undo = /** @type {HTMLButtonElement} */ (toolbar.querySelector('button[data-btn="undo"]'));
    undo.focus();
    expect(undo.getAttribute('tabindex')).toBe('0');

    undo.disabled = true;
    ctx.invoke('toolbar._doRefresh');
    expect(toolbar.querySelectorAll(TAB_STOP)).toHaveLength(1);
    expect(toolbar.querySelector(TAB_STOP)).not.toBe(undo);
  });

  it('restores a single tab stop after rebuild()', () => {
    const toolbar = mount();
    ctx.invoke('toolbar.rebuild');
    expect(toolbar.querySelectorAll(TAB_STOP)).toHaveLength(1);

    const controls = Array.from(toolbar.querySelectorAll('button, select'));
    controls[0].focus();
    press(controls[0], 'ArrowRight');
    expect(document.activeElement).toBe(controls[1]);
  });
});

/** Keyboard activation of a button: a click whose detail is 0. */
function keyClick(el) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }));
}

describe('colour picker popup keyboard support', () => {
  const portal = () => ctx.layoutInfo.portal || document.body;

  it('renders swatches as named buttons', () => {
    mount();
    const swatches = portal().querySelectorAll('.an-color-swatch');
    expect(swatches.length).toBeGreaterThan(0);
    swatches.forEach((sw) => {
      expect(sw.tagName).toBe('BUTTON');
      expect(sw.getAttribute('type')).toBe('button');
      expect(sw.getAttribute('aria-label')).toBe(sw.getAttribute('data-color'));
      expect(sw.getAttribute('title')).toBe(sw.getAttribute('data-color'));
    });
  });

  it('moves focus to the first swatch when opened from the keyboard', () => {
    const toolbar = mount();
    const arrow = /** @type {HTMLElement} */ (toolbar.querySelector('.an-color-arrow'));
    arrow.focus();
    keyClick(arrow);
    expect(arrow.getAttribute('aria-expanded')).toBe('true');
    const first = portal().querySelector('.an-color-popup .an-color-swatch');
    expect(document.activeElement).toBe(first);
  });

  it('Escape closes the popup and returns focus to the arrow button', () => {
    const toolbar = mount();
    const arrow = /** @type {HTMLElement} */ (toolbar.querySelector('.an-color-arrow'));
    arrow.focus();
    keyClick(arrow);
    press(/** @type {HTMLElement} */ (document.activeElement), 'Escape');
    expect(arrow.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(arrow);
  });

  it('applying a swatch with the keyboard returns focus to the arrow button', () => {
    const toolbar = mount();
    const arrow = /** @type {HTMLElement} */ (toolbar.querySelector('.an-color-arrow'));
    arrow.focus();
    keyClick(arrow);
    keyClick(/** @type {HTMLElement} */ (document.activeElement));
    expect(arrow.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(arrow);
  });
});

describe('table-size picker keyboard support', () => {
  const open = () => {
    const toolbar = mount();
    const btn = /** @type {HTMLElement} */ (toolbar.querySelector('button[data-btn="table"]'));
    btn.focus();
    keyClick(btn);
    const popup = /** @type {HTMLElement} */ ((ctx.layoutInfo.portal || document.body).querySelector('.an-table-picker-popup'));
    return { btn, popup };
  };

  it('renders cells as named buttons with a single tab stop', () => {
    const { popup } = open();
    const cells = popup.querySelectorAll('.an-table-cell');
    expect(cells).toHaveLength(100);
    expect(cells[0].tagName).toBe('BUTTON');
    expect(cells[0].getAttribute('type')).toBe('button');
    expect(cells[12].getAttribute('aria-label')).toBe('2 × 3');
    expect(popup.querySelectorAll('.an-table-cell[tabindex="0"]')).toHaveLength(1);
  });

  it('focuses the first cell on open', () => {
    const { popup } = open();
    expect(document.activeElement).toBe(popup.querySelector('.an-table-cell'));
  });

  it('arrow keys move focus and the size preview', () => {
    const { popup } = open();
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowRight');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowRight');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowDown');
    const focused = /** @type {HTMLElement} */ (document.activeElement);
    expect(focused.dataset.row).toBe('2');
    expect(focused.dataset.col).toBe('3');
    expect(focused.getAttribute('tabindex')).toBe('0');
    expect(popup.querySelectorAll('.an-table-cell.active')).toHaveLength(6);
    expect(popup.querySelector('.an-table-label')?.textContent).toBe('2 × 3');
    press(focused, 'ArrowUp');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowLeft');
    expect(/** @type {HTMLElement} */ (document.activeElement).dataset.col).toBe('2');
    expect(/** @type {HTMLElement} */ (document.activeElement).dataset.row).toBe('1');
  });

  it('clamps arrow movement at the grid edge', () => {
    open();
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowUp');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowLeft');
    const focused = /** @type {HTMLElement} */ (document.activeElement);
    expect(focused.dataset.row).toBe('1');
    expect(focused.dataset.col).toBe('1');
  });

  it('activating a cell inserts a table of that size', () => {
    open();
    const invoke = vi.spyOn(ctx, 'invoke');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowRight');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowRight');
    press(/** @type {HTMLElement} */ (document.activeElement), 'ArrowDown');
    keyClick(/** @type {HTMLElement} */ (document.activeElement));
    // 2 rows × 3 columns; the table action takes (cols, rows)
    expect(invoke).toHaveBeenCalledWith('editor.insertTable', 3, 2);
  });

  it('Escape closes the picker and returns focus to the trigger', () => {
    const { btn, popup } = open();
    press(/** @type {HTMLElement} */ (document.activeElement), 'Escape');
    expect(popup.style.display).toBe('none');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(btn);
  });
});

describe('decorative icons', () => {
  it('every rendered toolbar and portal SVG is hidden from assistive tech', () => {
    mount({ useFontAwesome: false, bubbleToolbar: true });
    const roots = [ctx.layoutInfo.container, ctx.layoutInfo.portal || document.body];
    const svgs = roots.flatMap((r) => Array.from(r.querySelectorAll('svg')));
    expect(svgs.length).toBeGreaterThan(10);
    svgs.forEach((svg) => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
    });
  });
});
