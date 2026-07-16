import { ref } from 'vue';
import AutumnNoteEditor, { type AutumnNoteEditorExpose } from '../index.js';

const exposed: AutumnNoteEditorExpose = { editor: null };
exposed.editor?.getHTML();

const component = ref<InstanceType<typeof AutumnNoteEditor> | null>(null);
component.value?.editor?.getHTML();
