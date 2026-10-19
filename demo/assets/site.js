/*
 * site.js: behaviour shared by every page of the autumnnote-plus site.
 * Smooth scrolling (Lenis), the theme toggle, the mobile menu, copy buttons,
 * tabs and the one-time reveal of sections.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const THEME_KEY = 'anp-theme';
const root = document.documentElement;
const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)');

/* ── Live region for status messages ──────────────────────────────────── */

export function announce(message) {
  const live = document.getElementById('a11y-status');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = message; }, 50);
}

/* ── Theme ────────────────────────────────────────────────────────────── */

export function currentTheme() {
  return root.dataset.theme === 'light' ? 'light' : 'dark';
}

function setTheme(theme, { persist = true } = {}) {
  root.dataset.theme = theme;
  if (persist) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) { void err; }
  }
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(theme === 'light'));
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  });
  document.dispatchEvent(new CustomEvent('site:themechange', { detail: { theme } }));
}

function initTheme() {
  setTheme(currentTheme(), { persist: false });
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(currentTheme() === 'light' ? 'dark' : 'light'));
  });
  // Follow the system setting until the visitor picks a theme here.
  globalThis.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { void err; }
    if (!saved) setTheme(e.matches ? 'light' : 'dark', { persist: false });
  });
}

/**
 * Editor design tokens that seat the demo editors on the site's surfaces.
 * Only surfaces, lines and text change: the accent stays the editor's own
 * default, so the demos show the colours a project gets out of the box.
 */
export function editorThemeVars(theme = currentTheme()) {
  const shared = { radius: '12px', 'radius-sm': '8px' };
  return theme === 'light'
    ? { ...shared, bg: '#ffffff', 'bg-toolbar': '#fafafa', border: '#e4e4e7', text: '#09090b', muted: '#52525b', 'bg-btn-hover': '#f4f4f5', 'bg-btn-active': '#e4e4e7', 'input-border': '#8a8a93', 'statusbar-bg': '#fafafa' }
    : { ...shared, bg: '#0c0c0d', 'bg-toolbar': '#111113', border: '#26262a', text: '#fafafa', muted: '#a1a1aa', 'bg-btn-hover': '#1c1c1f', 'bg-btn-active': '#2a2a2f', 'input-border': '#71717a', 'statusbar-bg': '#111113' };
}

/** Options that make an editor follow the site theme. */
export function editorAppearance(theme = currentTheme()) {
  return { theme, themeVars: editorThemeVars(theme) };
}

/* ── Smooth scrolling ─────────────────────────────────────────────────── */

let lenis = null;

function initLenis() {
  if (reducedMotion.matches) return;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.11,
    // Anchor links land below the sticky header through the page's
    // scroll-padding-top, which Lenis already honours.
    anchors: true,
    // The editors and their floating UI scroll on their own, so they keep
    // native scrolling; other scroll areas opt out with data-lenis-prevent.
    prevent: (node) => Boolean(node.closest?.('.an-container, .an-portal')),
  });
  reducedMotion.addEventListener('change', (e) => {
    if (e.matches && lenis) { lenis.destroy(); lenis = null; }
  });
}

/** Scrolls `el` to `offset` px below the top of the viewport. */
export function scrollToElement(el, offset = 80) {
  if (lenis) {
    // Lenis adds scroll-padding-top on its own; pass only the difference.
    const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    lenis.scrollTo(el, { offset: padding - offset });
    return;
  }
  const top = el.getBoundingClientRect().top + globalThis.scrollY - offset;
  globalThis.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}

/* ── Mobile menu ──────────────────────────────────────────────────────── */

function initMenu() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById(btn?.getAttribute('aria-controls') || '');
  if (!btn || !nav) return;
  const label = btn.querySelector('.menu-btn__label');
  const close = ({ focus = false } = {}) => {
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    if (focus) btn.focus();
  };
  btn.addEventListener('click', (e) => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close' : 'Menu';
    // Move focus into the panel only for keyboard activation (detail 0).
    if (open && e.detail === 0) nav.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) close({ focus: true });
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) close();
  });
  globalThis.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) close(); });
}

/* ── Copy buttons ─────────────────────────────────────────────────────── */

export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

/**
 * Buttons with `data-copy` copy that text; with `data-copy-target` they copy
 * the text of the element with that id, and with `data-copy-next` the text of
 * the element right after them. Feedback stays in the button and is
 * announced for screen readers.
 */
function initCopyButtons() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy], [data-copy-target], [data-copy-next]');
    if (!btn) return;
    const source = 'copyNext' in btn.dataset ? btn.nextElementSibling : document.getElementById(btn.dataset.copyTarget);
    const text = btn.dataset.copy ?? source?.textContent ?? '';
    const labelEl = btn.querySelector('[data-copy-label]') || btn;
    const original = labelEl.dataset.original || labelEl.textContent;
    labelEl.dataset.original = original;
    try {
      await copyText(text);
      btn.dataset.state = 'done';
      labelEl.textContent = 'Copied';
      announce('Copied to clipboard');
    } catch (err) {
      void err;
      btn.dataset.state = 'error';
      labelEl.textContent = 'Copy failed';
      announce('Copy failed. Select the text and copy it manually.');
    }
    setTimeout(() => { labelEl.textContent = original; delete btn.dataset.state; }, 1800);
  });
}

/* ── Tabs ─────────────────────────────────────────────────────────────── */

/** WAI-ARIA tabs: click or arrow keys move between tabs, Home/End jump. */
export function initTabs(scope = document) {
  scope.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, { focus = false } = {}) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      list.dispatchEvent(new CustomEvent('tabs:change', { detail: { tab } }));
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select(tabs[(keys[e.key] + tabs.length) % tabs.length], { focus: true });
      });
    });
  });
}

/* ── Reveal on scroll ─────────────────────────────────────────────────── */

function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (reducedMotion.matches || !('IntersectionObserver' in globalThis)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}

/* ── Boot ─────────────────────────────────────────────────────────────── */

initTheme();
initLenis();
initMenu();
initCopyButtons();
initTabs();
initReveal();
