import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import AutumnNote from 'autumnnote';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
 * @param {{ options?: Record<string,unknown>, value?: string, defaultValue?: string, onChange?: (html:string) => void, className?: string, style?: import('react').CSSProperties }} props
 * @param {import('react').ForwardedRef<unknown>} ref
 */
const AutumnNoteEditor = forwardRef(function AutumnNoteEditor(
  { options = {}, value, defaultValue, onChange, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const editorRef    = useRef(null);
  const callbacksRef = useRef({ onChange, optionOnChange: options.onChange });
  const externalHTMLRef = useRef(null);
  const changeHandlerRef = useRef(null);
  callbacksRef.current = { onChange, optionOnChange: options.onChange };
  if (!changeHandlerRef.current) {
    changeHandlerRef.current = (html) => {
      callbacksRef.current.optionOnChange?.(html);
      if (html === externalHTMLRef.current) { externalHTMLRef.current = null; return; }
      callbacksRef.current.onChange?.(html);
    };
  }

  useIsomorphicLayoutEffect(() => {
    editorRef.current = AutumnNote.create(containerRef.current, {
      ...options,
      onChange: changeHandlerRef.current,
    });
    const initialValue = value ?? defaultValue;
    if (initialValue != null) {
      if (value != null) externalHTMLRef.current = value;
      editorRef.current.setHTML(initialValue);
      editorRef.current.clearHistory();
    }
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    editorRef.current?.updateOptions({ ...options, onChange: changeHandlerRef.current });
  }, [options]);

  useEffect(() => {
    const editor = editorRef.current;
    if (value == null || !editor || editor.getHTML() === value) return;
    externalHTMLRef.current = value;
    editor.setHTML(value);
    editor.clearHistory();
  }, [value]);

  useImperativeHandle(ref, () => editorRef.current, []);

  return <div ref={containerRef} className={className} style={style} />;
});

export { AutumnNoteEditor };
export default AutumnNoteEditor;
