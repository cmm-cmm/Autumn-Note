<script setup>
import { ref, shallowRef, onMounted, onUnmounted, watch } from 'vue';
import AutumnNote from 'autumnnote';

const props = defineProps({
  options: { type: Object, default: () => ({}) },
  modelValue: { type: String, default: undefined },
  defaultValue: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue', 'change']);

const container = ref(null);
// Context is an imperative class instance; avoid proxying its DOM-heavy state.
// Vue unwraps this shallow ref on the public instance exposed to parent refs.
const editor    = shallowRef(null);
let externalHTML = null;
const handleChange = (html) => {
  props.options.onChange?.(html);
  emit('change', html);
  if (html === externalHTML) { externalHTML = null; return; }
  emit('update:modelValue', html);
};

onMounted(() => {
  editor.value = AutumnNote.create(container.value, {
    ...props.options,
    onChange: handleChange,
  });
  const initialValue = props.modelValue ?? props.defaultValue;
  if (initialValue) {
    if (props.modelValue != null) externalHTML = props.modelValue;
    editor.value.setHTML(initialValue);
    editor.value.clearHistory();
  }
});

watch(() => props.options, (options) => editor.value?.updateOptions({ ...options, onChange: handleChange }), { deep: true });
watch(() => props.modelValue, (value) => {
  if (value == null || !editor.value || editor.value.getHTML() === value) return;
  externalHTML = value;
  editor.value.setHTML(value);
  editor.value.clearHistory();
});

onUnmounted(() => {
  editor.value?.destroy();
  editor.value = null;
});

defineExpose({ editor });
</script>

<template>
  <div ref="container" />
</template>
