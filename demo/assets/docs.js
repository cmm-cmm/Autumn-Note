/* docs.js: sidebar filter, contents disclosure and the active section link. */
import { scrollToElement } from './site.js';

const toc = document.getElementById('docs-toc');
const search = document.getElementById('sidebar-search');
const empty = document.getElementById('sidebar-empty');
const links = [...document.querySelectorAll('#sidebar-nav .sidebar-link')];
const groups = [...document.querySelectorAll('#sidebar-nav .sidebar-group')];

/* ── Contents: always open beside the text, a disclosure on small screens ── */

const wide = globalThis.matchMedia('(min-width: 1001px)');
function syncToc() { toc.open = wide.matches; }
syncToc();
wide.addEventListener('change', syncToc);
toc.querySelector('summary').addEventListener('click', (e) => { if (wide.matches) e.preventDefault(); });
// On small screens the panel closes first, then the page scrolls, so the
// target is measured after the panel has collapsed.
document.getElementById('sidebar-nav').addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link || wide.matches) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  e.stopPropagation();
  toc.open = false;
  history.pushState(null, '', link.getAttribute('href'));
  requestAnimationFrame(() => scrollToElement(target, document.querySelector('.site-header').offsetHeight + toc.closest('.docs-sidebar').offsetHeight + 16));
});

/* ── Filter ─────────────────────────────────────────────────────────────── */

function filter(q) {
  const term = q.trim().toLowerCase();
  let shown = 0;
  links.forEach((link) => {
    const match = !term || link.textContent.toLowerCase().includes(term);
    link.hidden = !match;
    if (match) shown += 1;
  });
  groups.forEach((group) => {
    group.hidden = ![...group.querySelectorAll('.sidebar-link')].some((l) => !l.hidden);
  });
  empty.hidden = shown > 0;
}
search.addEventListener('input', () => filter(search.value));
document.getElementById('sidebar-clear').addEventListener('click', () => {
  search.value = '';
  filter('');
  search.focus();
});

/* ── Active section ─────────────────────────────────────────────────────── */

const sideLinks = links.filter((l) => l.getAttribute('href').startsWith('#'));
const sections = [...document.querySelectorAll('.docs-section[id]')];
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    sideLinks.forEach((l) => {
      const on = l.getAttribute('href') === `#${id}`;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'location');
      else l.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
sections.forEach((s) => io.observe(s));
