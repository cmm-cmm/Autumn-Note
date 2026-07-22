import type { Context, AsnOptions } from 'autumnnote';
import type { DefineComponent } from 'vue';

export interface AutumnNoteEditorProps {
  /** Editor configuration object. All AsnOptions fields are accepted. */
  options?: AsnOptions;
  /** Controlled HTML value used by v-model. */
  modelValue?: string;
  /** Initial HTML value for uncontrolled usage. */
  defaultValue?: string;
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
 * Supports `v-model` and applies runtime-safe option changes without remounting.
 */
declare const AutumnNoteEditor: DefineComponent<
  AutumnNoteEditorProps,
  AutumnNoteEditorExpose
>;

export { AutumnNoteEditor };
export default AutumnNoteEditor;
