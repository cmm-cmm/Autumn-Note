<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import AutumnNote from 'autumnnote';

const props = defineProps({
  options: { type: Object, default: () => ({}) },
});

const container = ref(null);
// Context is an imperative class instance; avoid proxying its DOM-heavy state.
// Vue unwraps this shallow ref on the public instance exposed to parent refs.
const editor    = shallowRef(null);

onMounted(() => {
  editor.value = AutumnNote.create(container.value, props.options);
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
