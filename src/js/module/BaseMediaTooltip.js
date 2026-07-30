/**
 * BaseMediaTooltip.js — Shared hover-tooltip behaviour for media embeds.
 *
 * ImageTooltip and VideoTooltip duplicated their button factory, show/hide
 * timers and viewport-aware positioning (~22% of both files). Those pieces live
 * here; each subclass keeps only what genuinely differs — which element counts
 * as the target, which buttons the bar contains, and the actions behind them.
 *
 * Mirrors the existing BaseDialog / BaseResizer pattern.
 */

import { createElement, on } from '../core/dom.js';

/** Delay before a hovered target shows its tooltip. */
export const SHOW_DELAY = 100;
/** Grace period before a tooltip hides after the pointer leaves. */
export const HIDE_DELAY = 180;

export class BaseMediaTooltip {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    /** @type {HTMLElement|null} The tooltip bar */
    this._el = null;
    /** @type {HTMLElement|null} Currently hovered target */
    this._active = null;
    this._showTimer = null;
    this._hideTimer = null;
    this._disposers = [];
  }

  // ---------------------------------------------------------------------------
  // Subclass hooks
  // ---------------------------------------------------------------------------

  /**
   * Whether `_scheduleHide` is allowed to start the hide countdown. Subclasses
   * override to pin the tooltip open (e.g. while a video preview is playing).
   * @returns {boolean}
   */
  _canHide() { return true; }

  /** Runs just before the tooltip is hidden, for subclass-specific teardown. */
  _beforeHide() {}

  // ---------------------------------------------------------------------------
  // Buttons
  // ---------------------------------------------------------------------------

  /**
   * Builds a tooltip button and registers its click disposer.
   * @param {string} icon - inline SVG markup
   * @param {string} title
   * @param {() => void} handler
   * @param {boolean} [isDanger]
   * @returns {HTMLElement}
   */
  _makeBtn(icon, title, handler, isDanger = false) {
    const btn = createElement('button', {
      type: 'button',
      class: isDanger ? 'an-link-tooltip-btn an-link-tooltip-btn--danger' : 'an-link-tooltip-btn',
      title,
    });
    btn.innerHTML = icon;
    this._disposers.push(on(btn, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handler();
    }));
    return btn;
  }

  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------

  _scheduleShow(target) {
    if (this._active === target && this._el.style.display !== 'none') return;
    clearTimeout(this._hideTimer);
    this._hideTimer = null;
    clearTimeout(this._showTimer);
    this._showTimer = setTimeout(() => {
      this._active = target;
      this._show(target);
    }, SHOW_DELAY);
  }

  _scheduleHide() {
    if (!this._canHide()) return;
    clearTimeout(this._showTimer);
    this._showTimer = null;
    // Always reset the hide timer so rapid mouseout→mouseover sequences
    // don't leave a stale timer that hides the tooltip prematurely.
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this._hide(), HIDE_DELAY);
  }

  _show(_target) {
    this._el.style.display = 'flex';
    // Defer positioning: offsetWidth on a newly-visible element forces layout
    requestAnimationFrame(() => {
      if (this._active) this._positionNear(this._active);
    });
  }

  _hide() {
    this._beforeHide();
    this._el.style.display = 'none';
    this._active = null;
    this._clearTimers();
  }

  _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = null;
    this._hideTimer = null;
  }

  /**
   * Places the tooltip under the target, flipping above and clamping
   * horizontally when it would leave the viewport.
   * @param {HTMLElement} target
   */
  _positionNear(target) {
    const rect   = target.getBoundingClientRect();
    const tipW   = this._el.offsetWidth  || 220;
    const tipH   = this._el.offsetHeight || 32;
    const margin = 6;

    let top  = rect.bottom + margin;
    let left = rect.left + (rect.width - tipW) / 2;

    if (top + tipH > globalThis.innerHeight - margin) top = rect.top - tipH - margin;
    if (left + tipW > globalThis.innerWidth  - margin) left = globalThis.innerWidth - tipW - margin;
    if (left < margin) left = margin;

    this._el.style.top  = `${top}px`;
    this._el.style.left = `${left}px`;
  }
}
