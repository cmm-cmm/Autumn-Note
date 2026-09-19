/**
 * clipboard.js - Writing to the system clipboard through the async Clipboard
 * API, which replaced `document.execCommand('copy' | 'cut')`.
 *
 * Browsers only expose `navigator.clipboard` in secure contexts (HTTPS and
 * localhost). Where it is missing these functions reject rather than pretend:
 * a cut must not delete text that never reached the clipboard.
 */

/**
 * Writes text — and HTML, when the browser can take both — to the clipboard.
 * @param {{ text: string, html?: string }} data
 * @returns {Promise<void>}
 */
export async function writeClipboard({ text, html }) {
  const clipboard = globalThis.navigator?.clipboard;
  if (!clipboard) throw new Error('Clipboard API unavailable');
  if (html && typeof clipboard.write === 'function' && typeof globalThis.ClipboardItem === 'function') {
    try {
      await clipboard.write([new globalThis.ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      })]);
      return;
    } catch (_) {
      void _; // some engines refuse text/html — fall back to plain text
    }
  }
  if (typeof clipboard.writeText !== 'function') throw new Error('Clipboard API unavailable');
  await clipboard.writeText(text);
}

/**
 * The selected content as clipboard data, or null when nothing is selected.
 * @returns {{ text: string, html: string, range: Range }|null}
 */
export function selectionData() {
  const sel = globalThis.getSelection?.();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  const box = document.createElement('div');
  box.appendChild(range.cloneContents());
  return { text: sel.toString(), html: box.innerHTML, range };
}

/**
 * Copies the selection.
 * @returns {Promise<boolean>} false when nothing is selected or the write failed
 */
export async function copySelection() {
  const data = selectionData();
  if (!data) return false;
  try {
    await writeClipboard(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cuts the selection: copies it, then deletes it once the copy succeeded.
 * @param {() => void} [afterDelete] - called after the content is removed
 * @returns {Promise<boolean>}
 */
export async function cutSelection(afterDelete) {
  const data = selectionData();
  if (!data) return false;
  try {
    await writeClipboard(data);
  } catch {
    return false;
  }
  data.range.deleteContents();
  afterDelete?.();
  return true;
}
