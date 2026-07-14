# autumnnote-react

[![npm version](https://img.shields.io/npm/v/autumnnote-react?color=e8751a)](https://www.npmjs.com/package/autumnnote-react)
[![npm downloads](https://img.shields.io/npm/dm/autumnnote-react?color=e8751a)](https://www.npmjs.com/package/autumnnote-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official **React wrapper** for [Autumn Note](https://autumn.konexforge.com/) — the zero-dependency WYSIWYG rich-text editor built with vanilla JavaScript.

## Installation

```bash
npm install autumnnote autumnnote-react
```

Import the stylesheet once in your app:

```js
import 'autumnnote/dist/autumnnote.css';
```

## Quick Start

```jsx
import { useRef } from 'react';
import AutumnNoteEditor from 'autumnnote-react';
import 'autumnnote/dist/autumnnote.css';

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
import type { Context } from 'autumnnote';

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
import AutumnNote from 'autumnnote';

// Register globally before any create()
AutumnNote.use(MyPlugin, { limit: 500 });

<AutumnNoteEditor options={{ toolbar: [[boldBtn, 'myButton']] }} />
```

## TypeScript

The package ships hand-crafted TypeScript declarations (`index.d.ts`). No `@types` package needed:

```tsx
import type { Context, AsnOptions } from 'autumnnote';
import AutumnNoteEditor from 'autumnnote-react';

const options: AsnOptions = { height: 300, bubbleToolbar: true };
const editorRef = useRef<Context>(null);

<AutumnNoteEditor ref={editorRef} options={options} />;
```

## Links

- [Documentation](https://autumn.konexforge.com/docs.html)
- [Playground](https://autumn.konexforge.com/playground.html)
- [GitHub](https://github.com/cmm-cmm/Autumn-Note)
- [npm — autumnnote](https://www.npmjs.com/package/autumnnote)
- [npm — autumnnote-vue](https://www.npmjs.com/package/autumnnote-vue)

## License

MIT © [Minh Pham](https://github.com/cmm-cmm)
