// @vitest-environment node
import React from 'react';
import { renderToString } from 'react-dom/server';
import AutumnNoteEditor from '../src/index.jsx';

describe('AutumnNoteEditor SSR', () => {
  it('renders without a useLayoutEffect warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(renderToString(<AutumnNoteEditor />)).toBe('<div></div>');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
