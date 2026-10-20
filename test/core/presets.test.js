/**
 * test/core/presets.test.js
 * The module tables behind the `autumnnote-plus` and `autumnnote-plus/core` entries.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CORE_MODULES } from '../../src/js/presets/core.js';
import { FULL_MODULES } from '../../src/js/presets/full.js';
import { Context, setModuleDefs, getModuleDefs } from '../../src/js/Context.js';

const names = (defs) => defs.map((d) => d.name);

afterEach(() => {
  document.body.innerHTML = '';
  setModuleDefs(FULL_MODULES);
});

describe('module presets', () => {
  it('gives the core preset only what a usable editor needs', () => {
    expect(names(CORE_MODULES)).toEqual(['editor', 'toolbar', 'statusbar', 'clipboard', 'placeholder']);
  });

  it('builds the full preset on top of the core one, in order', () => {
    expect(names(FULL_MODULES).slice(0, CORE_MODULES.length)).toEqual(names(CORE_MODULES));
    expect(names(FULL_MODULES).length).toBeGreaterThan(CORE_MODULES.length);
  });

  it('leaves every heavy module out of the core preset', () => {
    // These are what make `autumnnote-plus/core` worth importing.
    const omitted = ['tableTooltip', 'emojiDialog', 'iconDialog', 'imageCropOverlay',
      'findReplace', 'codeTooltip', 'contextMenu', 'videoDialog'];
    for (const name of omitted) {
      expect(names(CORE_MODULES)).not.toContain(name);
      expect(names(FULL_MODULES)).toContain(name);
    }
  });

  it('declares no duplicate names in either table', () => {
    for (const table of [CORE_MODULES, FULL_MODULES]) {
      expect(new Set(names(table)).size).toBe(table.length);
    }
  });

  it('gives every entry a constructible class', () => {
    for (const { name, Class } of FULL_MODULES) {
      expect(typeof Class, name).toBe('function');
    }
  });

  it('keeps the option-gated modules gated in the full preset', () => {
    const gated = FULL_MODULES.filter((d) => typeof d.enabled === 'function').map((d) => d.name);
    expect(gated).toEqual(['autoSaveRestore', 'markdownShortcuts', 'bubbleToolbar', 'mention', 'slashMenu']);
  });
});

describe('Context module table', () => {
  let target;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  it('registers exactly what the installed table lists', () => {
    setModuleDefs(CORE_MODULES);
    const ctx = new Context(target, {}).initialize();
    expect(ctx._modules.has('editor')).toBe(true);
    expect(ctx._modules.has('toolbar')).toBe(true);
    // Absent because core never imported it, not merely switched off.
    expect(ctx._modules.has('tableTooltip')).toBe(false);
    expect(ctx._modules.has('emojiDialog')).toBe(false);
    ctx.destroy();
  });

  it('registers the whole set under the full table', () => {
    setModuleDefs(FULL_MODULES);
    const ctx = new Context(target, {}).initialize();
    expect(ctx._modules.has('tableTooltip')).toBe(true);
    expect(ctx._modules.has('emojiDialog')).toBe(true);
    ctx.destroy();
  });

  it('warns rather than throwing when a missing module is invoked', () => {
    setModuleDefs(CORE_MODULES);
    const ctx = new Context(target, {}).initialize();
    expect(() => ctx.invoke('emojiDialog.show')).not.toThrow();
    expect(ctx.invoke('emojiDialog.show')).toBeUndefined();
    ctx.destroy();
  });

  it('formats a code block without the code tooltip and without a warning', () => {
    setModuleDefs(CORE_MODULES);
    const ctx = new Context(target, {}).initialize();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editable = ctx.layoutInfo.editable;
    editable.innerHTML = '<p>const x = 1;\nconsole.log(x);</p>';
    const range = document.createRange();
    range.selectNodeContents(editable.querySelector('p'));
    getSelection().removeAllRanges();
    getSelection().addRange(range);

    ctx.invoke('editor.formatBlock', 'pre');

    const pre = editable.querySelector('pre');
    expect(pre).not.toBeNull();
    // Detection belongs to CodeTooltip, which core leaves out.
    expect(pre.dataset.language).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    ctx.destroy();
  });

  it('exposes the installed table', () => {
    setModuleDefs(CORE_MODULES);
    expect(getModuleDefs()).toBe(CORE_MODULES);
  });

  it('tolerates a table that is not an array', () => {
    setModuleDefs(/** @type {any} */ (null));
    const ctx = new Context(target, {}).initialize();
    expect(ctx._modules.size).toBe(0);
    ctx.destroy();
  });
});
