import type { Context, AsnOptions } from 'autumnnote';
import type { DefineComponent } from 'vue';

export interface AutumnNoteEditorProps {
  /** Editor configuration object. All AsnOptions fields are accepted. */
  options?: AsnOptions;
}

export interface AutumnNoteEditorExpose {
  /** AutumnNote Context instance, or null before the component mounts. */
  editor: Context | null;
}

/**
 * Vue 3 component that mounts an AutumnNote WYSIWYG editor.
 *
 * Access the editor instance via the exposed `editor` property:
 * ```vue
 * <AutumnNoteEditor ref="editorRef" :options="{ height: 300 }" />
 * // editorRef.value.editor?.getHTML()
 * ```
 * Use `v-if` to force remount on options change.
 */
declare const AutumnNoteEditor: DefineComponent<
  AutumnNoteEditorProps,
  AutumnNoteEditorExpose
>;

export { AutumnNoteEditor };
export default AutumnNoteEditor;
