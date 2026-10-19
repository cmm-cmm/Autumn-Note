# autumnnote-plus-vue

[![npm version](https://img.shields.io/npm/v/autumnnote-plus-vue?color=e8751a)](https://www.npmjs.com/package/autumnnote-plus-vue)
[![npm downloads](https://img.shields.io/npm/dm/autumnnote-plus-vue?color=e8751a)](https://www.npmjs.com/package/autumnnote-plus-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Vue 3 wrapper** for [`autumnnote-plus`](https://github.com/habibiahmada/Autumn-Note), an unofficial fork of [Autumn Note](https://github.com/cmm-cmm/Autumn-Note) (the zero-dependency WYSIWYG rich-text editor) with security fixes. Not published or endorsed by the Autumn Note author. Use it with `autumnnote-plus` 4.x; the original `autumnnote-vue` works with `autumnnote` 3.x.

## Installation

```bash
npm install autumnnote-plus autumnnote-plus-vue
```

Import the stylesheet once in your app:

```js
import 'autumnnote-plus/dist/autumnnote.css';
```

## Quick Start

```vue
<script setup>
import { ref } from 'vue';
import AutumnNoteEditor from 'autumnnote-plus-vue';
import 'autumnnote-plus/dist/autumnnote.css';

const editorRef = ref(null);

function handleSave() {
  const html = editorRef.value.editor?.getHTML();
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
| `options` | `AsnOptions` | Editor configuration. See [all options](https://autumn.konexforge.com/docs.html#options). |

## Accessing the editor instance

The component exposes the current `Context` as `editor`. Vue automatically unwraps the internal shallow ref on the public component instance:

```js
editorRef.value.editor?.getHTML();
editorRef.value.editor?.setHTML('<p>Hello <strong>world</strong></p>');
editorRef.value.editor?.getMarkdown();
editorRef.value.editor?.invoke('toolbar.rebuild');
editorRef.value.editor?.on('change', (html) => console.log(html));
```

The exposed `editor` property is `null` before mount — use it inside `onMounted` or after the component is mounted.

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
import AutumnNote from 'autumnnote-plus';

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
import type { Context, AsnOptions } from 'autumnnote-plus';
import AutumnNoteEditor from 'autumnnote-plus-vue';

const editorRef = ref<{ editor: { value: Context | null } } | null>(null);
const options: AsnOptions = { height: 300, bubbleToolbar: true };
</script>

<template>
  <AutumnNoteEditor ref="editorRef" :options="options" />
</template>
```

## Links

- [Documentation](https://autumn.konexforge.com/docs.html)
- [Playground](https://autumn.konexforge.com/playground.html)
- [GitHub](https://github.com/cmm-cmm/Autumn-Note)
- [npm — autumnnote](https://www.npmjs.com/package/autumnnote-plus)
- [npm — autumnnote-plus-react](https://www.npmjs.com/package/autumnnote-plus-react)

## License

MIT © [Minh Pham](https://github.com/cmm-cmm)
