# autumnnote-vue

[![npm version](https://img.shields.io/npm/v/autumnnote-vue?color=e8751a)](https://www.npmjs.com/package/autumnnote-vue)
[![npm downloads](https://img.shields.io/npm/dm/autumnnote-vue?color=e8751a)](https://www.npmjs.com/package/autumnnote-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official **Vue 3 wrapper** for [AutumnNote](https://cmm-cmm.github.io/Autumn-Note/) — the zero-dependency WYSIWYG rich-text editor built with vanilla JavaScript.

## Installation

```bash
npm install autumnnote autumnnote-vue
```

Import the stylesheet once in your app:

```js
import 'autumnnote/dist/autumnnote.css';
```

## Quick Start

```vue
<script setup>
import { ref } from 'vue';
import AutumnNoteEditor from 'autumnnote-vue';
import 'autumnnote/dist/autumnnote.css';

const editorRef = ref(null);

function handleSave() {
  const html = editorRef.value.editor.value.getHTML();
  console.log(html);
}
</script>

<template>
  <AutumnNoteEditor
    ref="editorRef"
    :options="{
      placeholder: 'Start typing…',
      height: 300,
      bubbleToolbar: true,
    }"
  />
  <button @click="handleSave">Save</button>
</template>
```

## Props

| Prop | Type | Description |
|---|---|---|
| `options` | `AsnOptions` | Editor configuration. See [all options](https://cmm-cmm.github.io/Autumn-Note/docs.html#options). |

## Accessing the editor instance

The component uses `defineExpose({ editor })` where `editor` is a Vue `ref<Context | null>`. Access the instance via:

```js
editorRef.value.editor.value.getHTML();
editorRef.value.editor.value.setHTML('<p>Hello <strong>world</strong></p>');
editorRef.value.editor.value.getMarkdown();
editorRef.value.editor.value.invoke('toolbar.rebuild');
editorRef.value.editor.value.on('change', (html) => console.log(html));
```

The `editor` ref is `null` before mount — use it inside `onMounted` or after the component is mounted.

## Reinitialising with new options

The editor initialises once in `onMounted`. To reinitialise with a new configuration, toggle `v-if` — Vue will unmount and remount the component:

```vue
<script setup>
import { ref } from 'vue';

const ready = ref(true);
const options = ref({ theme: 'light' });

async function switchToDark() {
  options.value = { theme: 'dark' };
  ready.value = false;
  await nextTick();
  ready.value = true;
}
</script>

<template>
  <AutumnNoteEditor v-if="ready" :options="options" />
</template>
```

## Dark mode

```vue
<AutumnNoteEditor :options="{ theme: 'dark', placeholder: 'Start typing…' }" />
```

## Using plugins

```js
import AutumnNote from 'autumnnote';

// Register globally before any component mounts
AutumnNote.use(MyPlugin, { limit: 500 });
```

```vue
<AutumnNoteEditor :options="{ toolbar: [[boldBtn, 'myButton']] }" />
```

## TypeScript

The package ships hand-crafted TypeScript declarations (`index.d.ts`). No `@types` package needed:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { Context, AsnOptions } from 'autumnnote';
import AutumnNoteEditor from 'autumnnote-vue';

const editorRef = ref<{ editor: { value: Context | null } } | null>(null);
const options: AsnOptions = { height: 300, bubbleToolbar: true };
</script>

<template>
  <AutumnNoteEditor ref="editorRef" :options="options" />
</template>
```

## Links

- [Documentation](https://cmm-cmm.github.io/Autumn-Note/docs.html)
- [Playground](https://cmm-cmm.github.io/Autumn-Note/playground.html)
- [GitHub](https://github.com/cmm-cmm/Autumn-Note)
- [npm — autumnnote](https://www.npmjs.com/package/autumnnote)
- [npm — autumnnote-react](https://www.npmjs.com/package/autumnnote-react)

## License

MIT © [Minh Pham](https://github.com/cmm-cmm)
