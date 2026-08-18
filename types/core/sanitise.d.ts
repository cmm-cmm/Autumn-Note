export interface SanitiseHTMLOptions {
  allowIframes?: boolean;
}
export interface SanitiseURLOptions {
  allowData?: boolean;
  media?: boolean;
}
export function sanitiseHTML(html: string, options?: SanitiseHTMLOptions): string;
/**
 * The same sanitisation as `sanitiseHTML`, returning the parsed `<body>` of a
 * detached document instead of its serialisation. Adopt its children when the
 * result is going straight into the DOM: it skips a serialise and a re-parse,
 * and never re-parses a sanitised string.
 */
export function sanitiseToBody(html: string, options?: SanitiseHTMLOptions): HTMLElement;
export function sanitiseUrl(url: string | null | undefined, options?: SanitiseURLOptions): string | null;
