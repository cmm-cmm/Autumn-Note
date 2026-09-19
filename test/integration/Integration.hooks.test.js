/**
 * Host-integration hooks: beforeCommand, linkDefaults, videoProviders /
 * iframeHosts, and localised accessible names.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import AutumnNote from '../../src/js/index.js';
import { vi as viLocale } from '../../src/js/i18n/vi.js';

for (const [name, value] of [
  ['queryCommandState', () => false],
  ['queryCommandValue', () => ''],
  ['execCommand', () => true],
]) {
  if (typeof document[name] !== 'function') {
    Object.defineProperty(document, name, { value, configurable: true, writable: true });
  }
}

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  AutumnNote.resetDefaults();
  vi.restoreAllMocks();
});

const makeEditor = (options = {}) => {
  const ta = document.createElement('textarea');
  ta.value = '<p>Hello world</p>';
  document.body.appendChild(ta);
  return AutumnNote.create(ta, { bubbleToolbar: false, markdownShortcuts: false, ...options });
};

describe('beforeCommand', () => {
  it('reports toolbar commands and cancels them when a handler returns false', () => {
    const action = vi.fn();
    const seen = vi.fn(() => false);
    const editor = makeEditor({
      toolbar: [['stamp']],
      buttons: { stamp: { icon: 'x', tooltip: 'Stamp', action } },
      onBeforeCommand: seen,
    });
    editor.layoutInfo.toolbar.querySelector('[data-btn="stamp"]').click();
    expect(seen).toHaveBeenCalledWith(expect.objectContaining({ name: 'stamp', source: 'toolbar' }));
    expect(action).not.toHaveBeenCalled();
    editor.destroy();
  });

  it('cancels keyboard shortcuts too', () => {
    const editor = makeEditor();
    const bold = vi.spyOn(editor._modules.get('editor'), 'bold');
    editor.on('beforeCommand', ({ name, source }) => (name === 'bold' && source === 'shortcut' ? false : undefined));
    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true });
    editor.layoutInfo.editable.dispatchEvent(event);
    expect(bold).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    editor.destroy();
  });
});

describe('linkDefaults', () => {
  const insertVia = (editor, url) => {
    const dialog = editor._modules.get('linkDialog');
    // spyOn returns the existing spy on repeat calls; start each insert at zero
    const insert = vi.spyOn(editor._modules.get('editor'), 'insertLink').mockImplementation(() => {});
    insert.mockClear();
    dialog.show();
    dialog._urlInput.value = url;
    dialog._onInsert();
    return insert;
  };

  it('pre-ticks "open in new tab" for new links', () => {
    const editor = makeEditor({ linkDefaults: { openInNewTab: true } });
    const dialog = editor._modules.get('linkDialog');
    dialog.show();
    expect(dialog._tabCheckbox.checked).toBe(true);
    editor.destroy();
  });

  it('prefixes bare domains but leaves relative links alone', () => {
    const editor = makeEditor();
    expect(insertVia(editor, 'example.com')).toHaveBeenCalledWith('https://example.com', '', false);
    expect(insertVia(editor, '/docs/start')).toHaveBeenCalledWith('/docs/start', '', false);
    expect(insertVia(editor, '#section-2')).toHaveBeenCalledWith('#section-2', '', false);
    editor.destroy();
  });

  it('uses defaultProtocol, and still rejects unsafe schemes', () => {
    const editor = makeEditor({ linkDefaults: { defaultProtocol: 'http://' } });
    expect(insertVia(editor, 'intranet.local')).toHaveBeenCalledWith('http://intranet.local', '', false);
    const insert = insertVia(editor, 'javascript:alert(1)');
    expect(insert).not.toHaveBeenCalled();
    editor.destroy();
  });

  it('builds rel from linkDefaults.rel and always keeps noopener', () => {
    const editor = makeEditor({ linkDefaults: { rel: 'nofollow' } });
    expect(editor._modules.get('editor')._newTabRel()).toBe('nofollow noopener');
    editor.destroy();
  });
});

describe('videoProviders and iframeHosts', () => {
  const twitch = {
    name: 'Twitch',
    match: /twitch\.tv\/videos\/(\d+)/,
    embed: (m) => `https://player.twitch.tv/?video=${m[1]}&parent=example.com`,
  };

  it('embeds a provider whose host is allowed', () => {
    const editor = makeEditor({ videoProviders: [twitch], iframeHosts: ['player.twitch.tv'] });
    const html = editor._modules.get('videoDialog')._buildEmbedHtml('https://www.twitch.tv/videos/123', 560);
    expect(html).toContain('<iframe src="https://player.twitch.tv/?video=123&amp;parent=example.com"');
    expect(html).toContain('title="Twitch video player"');
    editor.destroy();
  });

  it('ignores a provider whose host is not allowed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = makeEditor({ videoProviders: [twitch] });
    expect(editor._modules.get('videoDialog')._parseVideoUrl('https://www.twitch.tv/videos/123')).toBeNull();
    expect(warn).toHaveBeenCalled();
    editor.destroy();
  });

  it('keeps iframes from iframeHosts through setHTML and strips others', () => {
    const editor = makeEditor({ iframeHosts: ['player.twitch.tv'] });
    editor.setHTML('<iframe src="https://player.twitch.tv/?video=1"></iframe><iframe src="https://evil.example/x"></iframe>');
    const srcs = [...editor.layoutInfo.editable.querySelectorAll('iframe')].map((f) => f.getAttribute('src'));
    expect(srcs).toEqual(['https://player.twitch.tv/?video=1']);
    editor.destroy();
  });

  it('sanitises insertVideo input, keeping allowed iframes', () => {
    const editor = makeEditor({ iframeHosts: ['player.twitch.tv'] });
    const caret = document.createRange();
    caret.selectNodeContents(editor.layoutInfo.editable);
    caret.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(caret);
    editor.invoke('editor.insertVideo',
      '<div class="an-video-wrapper"><iframe src="https://player.twitch.tv/?v=1"></iframe>' +
      '<img src=x onerror="alert(1)"><script>alert(2)</script></div>');
    const html = editor.layoutInfo.editable.innerHTML;
    expect(html).toContain('https://player.twitch.tv/?v=1');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
    editor.destroy();
  });

  it('rejects wildcard or malformed iframeHosts entries', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = makeEditor({ iframeHosts: ['*.example.com', 'https://player.example.com'] });
    editor.setHTML('<iframe src="https://player.example.com/x"></iframe>');
    expect(editor.layoutInfo.editable.querySelector('iframe')).toBeNull();
    expect(warn).toHaveBeenCalled();
    editor.destroy();
  });
});

describe('localised accessible names', () => {
  it('uses the locale for landmark labels', () => {
    AutumnNote.registerLocale('vi', viLocale);
    const editor = makeEditor({ lang: 'vi' });
    expect(editor.layoutInfo.editable.getAttribute('aria-label')).toBe(viLocale.a11y.editor);
    expect(editor.layoutInfo.toolbar.getAttribute('aria-label')).toBe(viLocale.a11y.toolbar);
    expect(editor.layoutInfo.statusbar.querySelector('.an-status-info').getAttribute('aria-label'))
      .toBe(viLocale.a11y.statistics);
    editor.destroy();
  });
});
