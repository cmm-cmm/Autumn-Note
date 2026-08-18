/**
 * Bidirectional HTML ↔ Markdown conversion.
 *
 * Exposed on the package entry point so the conversion can run without an
 * editor instance — a server, a build step, or a test — since the editor's
 * `getMarkdown()` / `setMarkdown()` need a live DOM.
 *
 * `markdownToHTML()` output is NOT sanitised. Anything that will be inserted
 * into a document must be passed through `sanitiseHTML()` first.
 */

/**
 * Converts a Markdown string to HTML.
 *
 * Handles ATX and setext headings, fenced code (backtick and tilde, any fence
 * length, indented) and four-space indented code, blockquotes, ordered and
 * unordered lists including task lists and code blocks nested in items, GFM
 * tables with or without outer pipes and with column alignment, links and
 * images with titles, reference links, footnotes, autolinks, character
 * references, YAML frontmatter, and a leading UTF-8 byte-order mark.
 *
 * @param text Markdown source. A leading BOM is stripped; CRLF is normalised.
 * @returns HTML. Pass through `sanitiseHTML()` before inserting it anywhere.
 */
export declare function markdownToHTML(text: string | null | undefined): string;

/**
 * Converts an HTML string to Markdown.
 *
 * Markdown syntax appearing in ordinary prose is backslash-escaped, so text
 * round-trips as text rather than being re-read as formatting. Code spans and
 * code blocks are emitted literally, with line breaks read from `<br>` as well
 * as newlines — which is how `contenteditable` stores them.
 *
 * @param html HTML source.
 * @returns Markdown.
 */
export declare function htmlToMarkdown(html: string | null | undefined): string;

/**
 * Reports whether a string looks like Markdown.
 *
 * Used to decide whether pasted plain text should be converted. Deliberately
 * conservative: a bare URL or a parenthetical aside is prose, and a link alone
 * is too weak a signal without a second marker.
 *
 * @param rawText Text to inspect. A leading BOM is ignored.
 */
export declare function isMarkdown(rawText: string | null | undefined): boolean;
