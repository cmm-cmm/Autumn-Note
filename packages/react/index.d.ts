import type { Context, AsnOptions } from 'autumnnote';
import type { CSSProperties, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface AutumnNoteEditorProps {
  /** Editor configuration object. All AsnOptions fields are accepted. */
  options?: AsnOptions;
  /** Controlled HTML value. */
  value?: string;
  /** Initial HTML value for uncontrolled usage. */
  defaultValue?: string;
  /** Called when editor HTML changes. */
  onChange?: (html: string) => void;
  /** CSS class applied to the container <div>. */
  className?: string;
  /** Inline styles applied to the container <div>. */
  style?: CSSProperties;
}

/**
 * React component that mounts an AutumnNote WYSIWYG editor.
 *
 * Access the editor instance via a forwarded ref:
 * ```tsx
 * const editorRef = useRef<Context>(null);
 * <AutumnNoteEditor ref={editorRef} options={{ height: 300 }} />
 * editorRef.current?.getHTML();
 * ```
 * Runtime-safe option changes are applied without remounting.
 */
declare const AutumnNoteEditor: ForwardRefExoticComponent<
  AutumnNoteEditorProps & RefAttributes<Context>
>;

export { AutumnNoteEditor };
export default AutumnNoteEditor;
