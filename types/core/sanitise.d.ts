export interface SanitiseHTMLOptions {
  allowIframes?: boolean;
}
export interface SanitiseURLOptions {
  allowData?: boolean;
  media?: boolean;
}
export function sanitiseHTML(html: string, options?: SanitiseHTMLOptions): string;
export function sanitiseUrl(url: string | null | undefined, options?: SanitiseURLOptions): string | null;
