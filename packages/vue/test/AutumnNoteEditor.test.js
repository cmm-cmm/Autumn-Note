import { createApp, h, nextTick, ref } from 'vue';
import AutumnNote from 'autumnnote';
import AutumnNoteEditor from '../src/AutumnNote.vue';

vi.mock('autumnnote', () => ({
  default: { create: vi.fn() },
}));

describe('AutumnNoteEditor', () => {
  let host;
  let app;
  let editor;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    editor = { destroy: vi.fn() };
    AutumnNote.create.mockReturnValue(editor);
  });

  afterEach(() => {
    app?.unmount();
    app = null;
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('mounts with options and exposes the Context ref', async () => {
    const componentRef = ref(null);
    const options = { height: 320 };
    app = createApp({
      render: () => h(AutumnNoteEditor, { ref: componentRef, options }),
    });

    app.mount(host);
    await nextTick();

    expect(AutumnNote.create).toHaveBeenCalledWith(expect.any(HTMLDivElement), options);
    expect(componentRef.value.editor).toBe(editor);
  });

  it('destroys the editor when unmounted', () => {
    app = createApp(AutumnNoteEditor);
    app.mount(host);
    app.unmount();
    app = null;
    expect(editor.destroy).toHaveBeenCalledOnce();
  });
});
