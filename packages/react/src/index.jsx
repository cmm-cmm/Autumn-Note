import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import AutumnNote from 'autumnnote';

/**
 * React wrapper for AutumnNote WYSIWYG editor.
 * Exposes the editor Context instance via ref.
 *
 * @example
 * const editorRef = useRef(null);
 * <AutumnNoteEditor ref={editorRef} options={{ placeholder: 'Type here…' }} />
 * editorRef.current.invoke('editor.getHTML')
 */
/**
 * @param {{ options?: Record<string,unknown>, className?: string, style?: import('react').CSSProperties }} props
 * @param {import('react').ForwardedRef<unknown>} ref
 */
const AutumnNoteEditor = forwardRef(function AutumnNoteEditor(
  { options = {}, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const editorRef    = useRef(null);

  useEffect(() => {
    editorRef.current = AutumnNote.create(containerRef.current, options);
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []); // mount-once; use key prop to remount on options change

  useImperativeHandle(ref, () => editorRef.current, []);

  return <div ref={containerRef} className={className} style={style} />;
});

export { AutumnNoteEditor };
export default AutumnNoteEditor;
