<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AutumnNote from 'autumnnote';

const props = defineProps({
  options: { type: Object, default: () => ({}) },
});

const container = ref(null);
const editor    = ref(null);

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
