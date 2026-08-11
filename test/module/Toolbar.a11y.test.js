import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
    document.queryCommandState = () => true;
    ctx.invoke('toolbar._doRefresh');
    expect(bold.classList.contains('active')).toBe(true);
    expect(bold.getAttribute('aria-pressed')).toBe('true');

    document.queryCommandState = () => false;
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
