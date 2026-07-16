import React, { createRef } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import AutumnNote from 'autumnnote';
import AutumnNoteEditor from '../src/index.jsx';

vi.mock('autumnnote', () => ({
  default: { create: vi.fn() },
}));

describe('AutumnNoteEditor', () => {
  let host;
  let root;
  let editor;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    editor = { destroy: vi.fn() };
    AutumnNote.create.mockReturnValue(editor);
  });

  afterEach(async () => {
    if (root) await act(async () => root.unmount());
    document.body.innerHTML = '';
    vi.clearAllMocks();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it('mounts with options and exposes the Context through its ref', async () => {
    const ref = createRef();
    const options = { height: 320 };

    await act(async () => {
      root.render(<AutumnNoteEditor ref={ref} options={options} className="host" />);
    });

    expect(AutumnNote.create).toHaveBeenCalledWith(expect.any(HTMLDivElement), options);
    expect(ref.current).toBe(editor);
    expect(host.querySelector('.host')).not.toBeNull();
  });

  it('destroys the editor when unmounted', async () => {
    await act(async () => root.render(<AutumnNoteEditor />));
    await act(async () => root.unmount());
    root = null;
    expect(editor.destroy).toHaveBeenCalledOnce();
  });
});
