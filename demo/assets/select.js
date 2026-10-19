/*
 * select.js: a styled listbox in front of each native <select> on the site.
 *
 * The native element stays in the DOM as the source of truth: page scripts
 * keep reading `select.value` and listening for `change`, and setting
 * `select.value` from code updates the button. The editor's own selects are
 * left alone (they belong to the library).
 *
 * Keyboard: the button opens with Enter, Space or the arrow keys; in the list,
 * arrows and Home/End move, typing jumps to a matching option, Enter or Space
 * picks, Escape and Tab close.
 */

let uid = 0;
/** @type {(() => void) | null} */
let closeOpen = null;

function optionLabel(option) {
  return option.label || option.textContent || '';
}

/** @param {HTMLSelectElement} select */
export function enhanceSelect(select) {
  if (select.dataset.enhanced) return;
  select.dataset.enhanced = 'true';
  const id = `sel-${++uid}`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `select-btn ${select.dataset.buttonClass || ''}`.trim();
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${id}-list`);
  const labelEl = select.id ? document.querySelector(`label[for="${select.id}"]`) : null;
  if (labelEl) {
    if (!labelEl.id) labelEl.id = `${id}-label`;
    button.setAttribute('aria-labelledby', `${labelEl.id} ${id}-value`);
    labelEl.addEventListener('click', (e) => { e.preventDefault(); button.focus(); });
  }
  const value = document.createElement('span');
  value.className = 'select-btn__value';
  value.id = `${id}-value`;
  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.setAttribute('aria-hidden', 'true');
  chevron.classList.add('i', 'i--sm', 'select-btn__chevron');
  chevron.innerHTML = '<path d="M7 10l5 5 5-5"/>';
  button.append(value, chevron);
  // Without a <label>, the select's aria-label names the button, read with
  // the current value ("Editor language: English").
  const ariaLabel = !labelEl && select.getAttribute('aria-label');
  if (ariaLabel) {
    const hint = document.createElement('span');
    hint.className = 'sr-only';
    hint.textContent = `${ariaLabel}: `;
    button.prepend(hint);
  }

  const list = document.createElement('ul');
  list.className = 'select-list';
  list.id = `${id}-list`;
  list.setAttribute('role', 'listbox');
  list.tabIndex = -1;
  list.hidden = true;
  list.dataset.lenisPrevent = '';
  if (labelEl) list.setAttribute('aria-labelledby', labelEl.id);
  else if (select.getAttribute('aria-label')) list.setAttribute('aria-label', select.getAttribute('aria-label'));

  select.hidden = true;
  select.tabIndex = -1;
  select.after(button);
  document.body.appendChild(list);

  const options = () => [...select.options];
  let active = select.selectedIndex;

  function render() {
    list.replaceChildren(...options().map((opt, i) => {
      const li = document.createElement('li');
      li.id = `${id}-opt-${i}`;
      li.className = 'select-list__option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === select.selectedIndex));
      if (opt.lang) li.lang = opt.lang;
      li.textContent = optionLabel(opt);
      li.addEventListener('click', () => { choose(i); close(); });
      li.addEventListener('mousemove', () => setActive(i, { scroll: false }));
      return li;
    }));
  }

  function sync() {
    value.textContent = optionLabel(select.options[select.selectedIndex] ?? { textContent: '' });
  }

  function setActive(i, { scroll = true } = {}) {
    const items = list.children;
    if (!items.length) return;
    active = Math.max(0, Math.min(items.length - 1, i));
    [...items].forEach((el, n) => el.classList.toggle('is-active', n === active));
    list.setAttribute('aria-activedescendant', items[active].id);
    if (scroll) items[active].scrollIntoView({ block: 'nearest' });
  }

  function choose(i) {
    if (i === select.selectedIndex) return;
    select.selectedIndex = i;
    sync();
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function place() {
    const r = button.getBoundingClientRect();
    const gap = 6;
    const width = Math.max(r.width, 200);
    list.style.minWidth = `${width}px`;
    const below = globalThis.innerHeight - r.bottom - gap;
    const height = Math.min(list.scrollHeight, 360);
    const up = below < height && r.top > below;
    list.style.maxHeight = `${Math.max(120, Math.min(360, (up ? r.top : below) - 12))}px`;
    const left = Math.min(Math.max(8, r.right - width), globalThis.innerWidth - width - 8);
    list.style.left = `${Math.max(8, r.width >= 200 ? r.left : left)}px`;
    list.style.top = up ? '' : `${r.bottom + gap}px`;
    list.style.bottom = up ? `${globalThis.innerHeight - r.top + gap}px` : '';
  }

  function onOutside(e) {
    if (!list.contains(e.target) && !button.contains(e.target)) close();
  }
  function onViewportChange(e) {
    if (e?.type === 'scroll' && list.contains(e.target)) return;
    close();
  }

  function open() {
    if (!list.hidden) return;
    closeOpen?.();
    render();
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    place();
    setActive(select.selectedIndex);
    list.focus({ preventScroll: true });
    closeOpen = close;
    document.addEventListener('pointerdown', onOutside, true);
    globalThis.addEventListener('resize', onViewportChange);
    globalThis.addEventListener('scroll', onViewportChange, true);
  }

  function close({ focus = false } = {}) {
    if (list.hidden) return;
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    list.removeAttribute('aria-activedescendant');
    if (closeOpen === close) closeOpen = null;
    document.removeEventListener('pointerdown', onOutside, true);
    globalThis.removeEventListener('resize', onViewportChange);
    globalThis.removeEventListener('scroll', onViewportChange, true);
    if (focus) button.focus();
  }

  button.addEventListener('click', () => (list.hidden ? open() : close({ focus: true })));
  button.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      open();
    }
  });

  let typed = '';
  let typedAt = 0;
  list.addEventListener('keydown', (e) => {
    const n = list.children.length;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive(active + 1); return;
      case 'ArrowUp': e.preventDefault(); setActive(active - 1); return;
      case 'Home': e.preventDefault(); setActive(0); return;
      case 'End': e.preventDefault(); setActive(n - 1); return;
      case 'PageDown': e.preventDefault(); setActive(active + 5); return;
      case 'PageUp': e.preventDefault(); setActive(active - 5); return;
      case 'Enter':
      case ' ':
        e.preventDefault(); choose(active); close({ focus: true }); return;
      case 'Escape': e.preventDefault(); close({ focus: true }); return;
      case 'Tab': close(); button.focus(); return;
      default:
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
        typed = (Date.now() - typedAt > 600 ? '' : typed) + e.key.toLowerCase();
        typedAt = Date.now();
        {
          const opts = options();
          const start = typed.length === 1 ? active + 1 : active;
          for (let k = 0; k < opts.length; k++) {
            const i = (start + k) % opts.length;
            if (optionLabel(opts[i]).toLowerCase().startsWith(typed)) { setActive(i); break; }
          }
        }
    }
  });

  // Code that sets select.value (saved settings, share links) updates the button.
  const proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const protoIndex = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
  Object.defineProperty(select, 'value', {
    configurable: true,
    get() { return proto.get.call(this); },
    set(v) { proto.set.call(this, v); sync(); },
  });
  Object.defineProperty(select, 'selectedIndex', {
    configurable: true,
    get() { return protoIndex.get.call(this); },
    set(v) { protoIndex.set.call(this, v); sync(); },
  });
  select.addEventListener('change', sync);
  sync();
}

/** Enhances every site <select>; the editors' own selects stay native. */
export function enhanceSelects(scope = document) {
  scope.querySelectorAll('select').forEach((el) => {
    if (!el.closest('.an-container, .an-portal')) enhanceSelect(/** @type {HTMLSelectElement} */ (el));
  });
}
