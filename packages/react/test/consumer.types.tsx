import { createRef } from 'react';
import type { AsnOptions, Context, PasteErrorData } from 'autumnnote';
import AutumnNoteEditor from '../index.js';

const editorRef = createRef<Context>();
const component = <AutumnNoteEditor ref={editorRef} options={{ height: 320 }} className="editor" />;
editorRef.current?.getHTML();

const pasteErrorOptions: AsnOptions = {
  onPasteError(error: PasteErrorData) {
    error.message.toUpperCase();
    error.size?.toFixed();
    error.maxBytes?.toFixed();
  },
};

void component;
void pasteErrorOptions;
