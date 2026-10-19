# autumnnote-plus-react

[![npm version](https://img.shields.io/npm/v/autumnnote-plus-react?color=e8751a)](https://www.npmjs.com/package/autumnnote-plus-react)
[![npm downloads](https://img.shields.io/npm/dm/autumnnote-plus-react?color=e8751a)](https://www.npmjs.com/package/autumnnote-plus-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**React wrapper** for [`autumnnote-plus`](https://github.com/habibiahmada/Autumn-Note), an unofficial fork of [Autumn Note](https://github.com/cmm-cmm/Autumn-Note) (the zero-dependency WYSIWYG rich-text editor) with security fixes. Not published or endorsed by the Autumn Note author. Use it with `autumnnote-plus` 4.x; the original `autumnnote-react` works with `autumnnote` 3.x.

## Installation

```bash
npm install autumnnote-plus autumnnote-plus-react
```

Import the stylesheet once in your app:

```js
import 'autumnnote-plus/dist/autumnnote.css';
```

## Quick Start

```jsx
import { useRef } from 'react';
import AutumnNoteEditor from 'autumnnote-plus-react';
import 'autumnnote-plus/dist/autumnnote.css';

function MyEditor() {
  const editorRef = useRef(null);

  function handleSave() {
    const html = editorRef.current.getHTML();
    console.log(html);
  }

  return (
    <>
      <AutumnNoteEditor
        ref={editorRef}
        options={{
          placeholder: 'Start typing…',
          height: 300,
          bubbleToolbar: true,
          onChange: (html) => console.log('changed:', html),
        }}
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

## Props

| Prop | Type | Description |
|---|---|---|
| `options` | `AsnOptions` | Editor configuration. See [all options](https://autumn.konexforge.com/docs.html#options). |
| `className` | `string` | CSS class applied to the wrapper `<div>`. |
| `style` | `CSSProperties` | Inline styles applied to the wrapper `<div>`. |
| `ref` | `React.Ref<Context>` | Forwarded ref — exposes the `Context` instance after mount. |

## Accessing the editor instance

The component uses `forwardRef` + `useImperativeHandle` to expose the underlying `Context` object. All [instance methods](https://autumn.konexforge.com/docs.html#instance-api) are available via the ref:

```tsx
import { useRef } from 'react';
import type { Context } from 'autumnnote-plus';

const editorRef = useRef<Context>(null);

// After mount:
editorRef.current?.getHTML();
editorRef.current?.setHTML('<p>Hello <strong>world</strong></p>');
editorRef.current?.getMarkdown();
editorRef.current?.invoke('toolbar.rebuild');
editorRef.current?.on('change', (html) => console.log(html));
```

## Reinitialising with new options

The editor initialises once on mount. To reinitialise with a new configuration, change the `key` prop — React will unmount and remount the component:

```jsx
const [optionsKey, setOptionsKey] = useState(0);
const [options, setOptions] = useState({ theme: 'light' });

function switchToDark() {
  setOptions({ theme: 'dark' });
  setOptionsKey((k) => k + 1); // triggers remount
}

<AutumnNoteEditor key={optionsKey} options={options} />
```

## Dark mode

```jsx
<AutumnNoteEditor
  options={{ theme: 'dark', placeholder: 'Start typing…' }}
/>
```

## Using plugins

```jsx
import AutumnNote from 'autumnnote-plus';

// Register globally before any create()
AutumnNote.use(MyPlugin, { limit: 500 });

<AutumnNoteEditor options={{ toolbar: [[boldBtn, 'myButton']] }} />
```

## TypeScript

The package ships hand-crafted TypeScript declarations (`index.d.ts`). No `@types` package needed:

```tsx
import type { Context, AsnOptions } from 'autumnnote-plus';
import AutumnNoteEditor from 'autumnnote-plus-react';

const options: AsnOptions = { height: 300, bubbleToolbar: true };
const editorRef = useRef<Context>(null);

<AutumnNoteEditor ref={editorRef} options={options} />;
```

## Links

- [Documentation](https://autumn.konexforge.com/docs.html)
- [Playground](https://autumn.konexforge.com/playground.html)
- [GitHub](https://github.com/cmm-cmm/Autumn-Note)
- [npm — autumnnote](https://www.npmjs.com/package/autumnnote-plus)
- [npm — autumnnote-plus-vue](https://www.npmjs.com/package/autumnnote-plus-vue)

## License

MIT © [Minh Pham](https://github.com/cmm-cmm)
