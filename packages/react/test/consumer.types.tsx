import { createRef } from 'react';
import type { Context } from 'autumnnote';
import AutumnNoteEditor from '../index.js';

const editorRef = createRef<Context>();
const component = <AutumnNoteEditor ref={editorRef} options={{ height: 320 }} className="editor" />;
editorRef.current?.getHTML();

void component;
