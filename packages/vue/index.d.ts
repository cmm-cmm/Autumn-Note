import type { Context, AsnOptions } from 'autumnnote';
import type { DefineComponent, Ref } from 'vue';

export interface AutumnNoteEditorProps {
  /** Editor configuration object. All AsnOptions fields are accepted. */
  options?: AsnOptions;
}

export interface AutumnNoteEditorExpose {
  /** Reactive ref holding the AutumnNote Context instance (available after mount). */
  editor: Ref<Context | null>;
}

/**
 * Vue 3 component that mounts an AutumnNote WYSIWYG editor.
 *
 * Access the editor instance via the exposed `editor` ref:
 * ```vue
 * <AutumnNoteEditor ref="editorRef" :options="{ height: 300 }" />
 * // editorRef.value.editor.value?.getHTML()
 * ```
 * Use `v-if` to force remount on options change.
 */
declare const AutumnNoteEditor: DefineComponent<
  AutumnNoteEditorProps,
  AutumnNoteEditorExpose
>;

export { AutumnNoteEditor };
export default AutumnNoteEditor;
