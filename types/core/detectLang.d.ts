/**
 * Heuristic programming-language detection for code snippets.
 *
 * Every rule that matches adds weight to its language and the highest total
 * wins; the winner must also clear a minimum score and beat the runner-up by a
 * margin. A snippet that could be two things returns null rather than being
 * guessed at, and prose is never reported as code.
 */

/** Every language `detectLang()` can return, as Prism language ids. */
export declare const SUPPORTED_LANGS: readonly string[];

/**
 * Detects the language of a code snippet.
 *
 * Only the first few kilobytes are examined — a language is identifiable from
 * its opening lines, and bounding the input keeps the cost independent of file
 * size.
 *
 * @param code Snippet to inspect.
 * @returns A Prism language id from {@link SUPPORTED_LANGS}, or null when the
 *   evidence is too weak or too evenly split to commit to an answer.
 */
export declare function detectLang(code: string | null | undefined): string | null;
