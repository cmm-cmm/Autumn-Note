import AutumnNote from '../../src/js/index.js';

const budget = (elapsed, milliseconds, operation) => {
  expect(elapsed, `${operation} exceeded its ${milliseconds}ms browser budget`).toBeLessThan(milliseconds);
};

describe('browser performance budgets', () => {
  const mounted = [];

  afterEach(async () => {
    await Promise.all(mounted.splice(0).map((editor) => editor.destroy()));
    document.querySelectorAll('[data-perf-host]').forEach((host) => host.remove());
  });

  const host = () => {
    const el = document.createElement('textarea');
    el.dataset.perfHost = '';
    document.body.appendChild(el);
    return el;
  };

  it('mounts a full editor within a regression budget', () => {
    const start = performance.now();
    const editor = AutumnNote.create(host());
    const elapsed = performance.now() - start;
    mounted.push(editor);

    budget(elapsed, 500, 'create()');
  });

  it('sets and reads a realistic large document within a regression budget', () => {
    const editor = AutumnNote.create(host());
    mounted.push(editor);
    const html = Array.from({ length: 400 }, (_, i) =>
      `<p>Paragraph ${i} with <strong>formatting</strong> and enough text for status counts.</p>`,
    ).join('');

    const start = performance.now();
    editor.setHTML(html);
    const output = editor.getHTML();
    const elapsed = performance.now() - start;

    expect(output).toContain('Paragraph 399');
    budget(elapsed, 1000, 'setHTML()/getHTML() for 400 blocks');
  });

  it('survives repeated mount/destroy without leaking editor containers', async () => {
    const start = performance.now();
    for (let i = 0; i < 25; i++) {
      const target = host();
      const editor = AutumnNote.create(target);
      await editor.destroy();
      target.remove();
    }
    const elapsed = performance.now() - start;

    expect(document.querySelectorAll('.an-container')).toHaveLength(0);
    budget(elapsed, 3000, '25 create()/destroy() cycles');
  });
});
