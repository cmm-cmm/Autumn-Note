/**
 * detectLang.js — Heuristic programming-language detection for code snippets.
 *
 * Returns a Prism.js language identifier, or null when nothing scores clearly
 * enough to be worth guessing.
 *
 * ## Why scoring rather than an ordered if-chain
 *
 * The previous version returned on the first pattern that matched, so the
 * answer depended on the order the languages happened to be listed in. Every
 * new pattern risked stealing snippets from a language checked later, and a
 * snippet carrying signals for two languages was decided by position instead of
 * by strength of evidence — `export default { data() { … } }` came back as CSS
 * because the JavaScript rules did not cover `export default` and the CSS rule
 * happily read `a: 1` as a declaration.
 *
 * Instead every rule contributes weight to its language and the highest total
 * wins, so adding a signal makes one language more likely rather than
 * reshuffling the rest. Weights are roughly:
 *
 *   10  unmistakable — `<?php`, `#!/bin/bash`, `println!`, `fmt.Println`
 *    5  characteristic — `def f(...):`, `interface X {`, `val x: T`
 *    2  suggestive — shared with other languages, only useful to break a tie
 *
 * A language needs MIN_SCORE overall and a MIN_MARGIN lead over the runner-up;
 * otherwise the snippet is ambiguous and null is the honest answer.
 */

/** Minimum winning score. Below this the evidence is one weak signal at most. */
const MIN_SCORE = 5;
/** The winner must beat the runner-up by this much, or the snippet is ambiguous. */
const MIN_MARGIN = 2;

/**
 * `[superset, base]` pairs. Valid base-language code is also valid in the
 * superset, so the superset inherits the base's score once it has shown a
 * marker of its own — `$var` + `&:hover` is SCSS even though everything around
 * it reads as ordinary CSS.
 * @type {Array<[string, string]>}
 */
const SUPERSETS = [
  ['typescript', 'javascript'],
  ['scss', 'css'],
  ['cpp', 'c'],
];

/**
 * @typedef {object} Rule
 * @property {string} lang - Prism language id this rule votes for.
 * @property {RegExp} re - Pattern to look for.
 * @property {number} w - Weight added when it matches.
 */

/**
 * Every language this module can return. Exported so the code tooltip's picker
 * can be checked against it — a language the detector produces but the picker
 * cannot show leaves the select reading "Plain text" on a highlighted block.
 * @type {string[]}
 */
export const SUPPORTED_LANGS = [
  'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'csharp', 'kotlin',
  'swift', 'cpp', 'c', 'ruby', 'php', 'html', 'xml', 'json', 'yaml', 'markdown',
  'sql', 'scss', 'css', 'bash',
];

/** @type {Rule[]} */
const RULES = [
  // ── Unmistakable markers ───────────────────────────────────────────────────
  { lang: 'php',        w: 10, re: /<\?php\b|<\?=/ },
  { lang: 'bash',       w: 10, re: /^#!.*\/(?:ba|z|da|fi|k)?sh\b/m },
  { lang: 'rust',       w: 10, re: /\b(?:println!|print!|format!|vec!|panic!)\s*[([]/ },
  { lang: 'go',         w: 10, re: /\bfmt\.(?:Print|Println|Printf|Sprintf|Errorf|Fprintf)\s*\(/ },
  { lang: 'java',       w: 10, re: /\bSystem\.out\.(?:print|println)\s*\(/ },
  { lang: 'csharp',     w: 10, re: /\bConsole\.(?:Write|WriteLine)\s*\(/ },
  { lang: 'cpp',        w: 10, re: /\b(?:cout|cerr)\s*<<|\bcin\s*>>|\busing\s+namespace\s+std\b|\bstd::\w/ },
  { lang: 'python',     w: 10, re: /\bdef[ \t]+\w+[ \t]*\([^)]*\)[ \t]*(?:->[^:\n]*)?:|\bif[ \t]+__name__[ \t]*==[ \t]*['"]__main__['"]/ },
  { lang: 'html',       w: 10, re: /^\s*<!DOCTYPE\s+html/i },
  { lang: 'xml',        w: 10, re: /^\s*<\?xml\s/i },

  // ── JavaScript ─────────────────────────────────────────────────────────────
  { lang: 'javascript', w: 6, re: /\bconsole\.(?:log|error|warn|info|debug)\s*\(/ },
  { lang: 'javascript', w: 6, re: /\b(?:const|let)\s+\w+\s*=|(?:^|\n)\s*var\s+\w+\s*=/ },
  // No other language here spells a module boundary this way, so it carries
  // enough weight on its own — `export default { a: 1 }` used to tie with CSS,
  // which read the object body as a declaration block.
  { lang: 'javascript', w: 8, re: /\bexport\s+(?:default|const|function|class|async|\{|\*)|\bmodule\.exports\b|\brequire\s*\(\s*['"]/ },
  { lang: 'javascript', w: 5, re: /\bfunction(?:[ \t]+\w+)?[ \t]*\([^)]*\)[ \t]*\{|=>[ \t]*[{([`\w'"]/ },
  { lang: 'javascript', w: 5, re: /\bimport\b[^'"\n]*[ \t]from[ \t]*['"]/ },
  { lang: 'javascript', w: 4, re: /\.(?:map|filter|forEach|reduce|then|catch|find|some|every)\s*\(/ },
  // Split rather than alternated: a one-line DOM call chain hits several of
  // these at once, and as a single rule it capped at one rule's weight and
  // scored too low to beat the ambiguity threshold.
  { lang: 'javascript', w: 4, re: /\b(?:document|window|globalThis)\.\w/ },
  { lang: 'javascript', w: 4, re: /\baddEventListener\s*\(|\bquerySelector(?:All)?\s*\(|\bgetElementById\s*\(/ },
  { lang: 'javascript', w: 3, re: /\.(?:innerHTML|textContent|classList|dataset|style)\b|\bJSON\.(?:parse|stringify)\s*\(/ },
  { lang: 'javascript', w: 4, re: /\bawait\s+\w|\basync\s+(?:function|\(|\w+\s*=>)|\bnew\s+Promise\s*\(/ },
  { lang: 'javascript', w: 3, re: /\bReact\.|\buseState\s*\(|\buseEffect\s*\(/ },

  // ── TypeScript — JS plus type syntax, so it also collects the JS points ────
  { lang: 'typescript', w: 8, re: /\binterface\s+\w+(?:<[^>]*>)?\s*(?:extends\s[\w<>, ]+)?\{/ },
  { lang: 'typescript', w: 8, re: /\btype\s+\w+(?:<[^>]*>)?\s*=/ },
  { lang: 'typescript', w: 7, re: /:\s*(?:string|number|boolean|void|never|any|unknown|object)\b/ },
  { lang: 'typescript', w: 6, re: /\benum\s+\w+\s*\{|\breadonly\s+\w|\bimplements\s+\w|\bnamespace\s+\w+\s*\{/ },
  { lang: 'typescript', w: 6, re: /\b(?:private|public|protected)\s+(?:readonly\s+)?\w+\s*[:?]/ },
  { lang: 'typescript', w: 5, re: /\)\s*:\s*[A-Z]\w*(?:<[^>]*>)?\s*(?:\{|=>)|\)\s*:\s*(?:string|number|boolean|void)\b/ },
  { lang: 'typescript', w: 4, re: /\bfunction\s+\w+\s*<[^>]+>\s*\(|\bas\s+(?:const\b|[A-Z]\w*)/ },
  { lang: 'typescript', w: 3, re: /\w\?\s*:\s*\w|\bimport\s+type\b|\bsatisfies\b/ },

  // ── Python ─────────────────────────────────────────────────────────────────
  { lang: 'python',     w: 6, re: /(?:^|\n)\s*(?:from\s+[\w.]+\s+import\s|import\s+\w+(?:\s*,\s*\w+)*\s*$)/m },
  { lang: 'python',     w: 6, re: /(?:^|\n)\s*class\s+\w+(?:\([\w., ]*\))?\s*:/ },
  { lang: 'python',     w: 5, re: /(?:^|\n)\s*(?:with|elif|except|finally|async\s+def)\b[^\n]*:/ },
  { lang: 'python',     w: 5, re: /\bself\.\w|\b__init__\b|\bf["'][^"']*\{/ },
  { lang: 'python',     w: 4, re: /(?:^|\n)[ \t]*for[ \t]+\w+[ \t]+in[ \t][^\n:]*:|\bfor[ \t]+\w+[ \t]+in[ \t]+range[ \t]*\(/ },
  { lang: 'python',     w: 4, re: /\bprint\s*\(|\blen\s*\(|\brange\s*\(/ },
  { lang: 'python',     w: 3, re: /\[[^\]\n]*\bfor\s+\w+\s+in\s[^\]\n]*\]|\bNone\b|\bTrue\b|\bFalse\b/ },
  { lang: 'python',     w: 3, re: /\*\*\w|\bdict[ \t]*\(|\blambda(?:[ \t]+\w+)?[ \t]*:/ },

  // ── Go ─────────────────────────────────────────────────────────────────────
  { lang: 'go',         w: 8, re: /(?:^|\n)\s*package\s+\w+\s*$/m },
  { lang: 'go',         w: 6, re: /\btype\s+\w+\s+struct\s*\{|\btype\s+\w+\s+interface\s*\{/ },
  { lang: 'go',         w: 6, re: /\bfunc(?:[ \t]*\([^)]*\))?(?:[ \t]+\w+)?[ \t]*\([^)]*\)[^\n{]{0,40}\{/ },
  { lang: 'go',         w: 5, re: /\bif\s+err\s*!=\s*nil\b|\berr\s*:=\s|\bdefer\s+\w/ },
  { lang: 'go',         w: 4, re: /\w+\s*:=\s*\S|\bchan\s+\w|\bgo\s+func\b|\bnil\b/ },

  // ── Rust ───────────────────────────────────────────────────────────────────
  { lang: 'rust',       w: 7, re: /\bfn[ \t]+\w+(?:<[^>]*>)?[ \t]*\([^)]*\)[^\n{]{0,40}\{/ },
  { lang: 'rust',       w: 7, re: /\blet\s+mut\s+\w|\bpub\s+(?:fn|struct|enum|mod|use)\b|\bimpl\s+\w/ },
  { lang: 'rust',       w: 5, re: /\buse\s+(?:std|crate|self|super)::|\bmatch\s+\w+\s*\{[^}]*=>/ },
  { lang: 'rust',       w: 4, re: /\b(?:Option|Result|Vec|Box|Rc|Arc|HashMap)\s*<|&(?:mut\s+)?self\b|\b\w+::<|->\s*Result</ },
  { lang: 'rust',       w: 3, re: /\b(?:i8|i16|i32|i64|u8|u16|u32|u64|usize|isize|f32|f64)\b|\bunwrap\s*\(\)|\bderive\s*\(/ },

  // ── Java ───────────────────────────────────────────────────────────────────
  { lang: 'java',       w: 7, re: /\b(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:void|int|long|double|boolean|String|[A-Z]\w*(?:<[^>]*>)?)\s+\w+\s*[({]/ },
  { lang: 'java',       w: 7, re: /\bimport\s+(?:java|javax|org\.springframework)\.[\w.]+;/ },
  { lang: 'java',       w: 6, re: /@(?:Override|Autowired|Component|Service|Controller|RestController|Entity|Test|SpringBootApplication)\b/ },
  { lang: 'java',       w: 5, re: /\bnew\s+(?:ArrayList|HashMap|HashSet|LinkedList|StringBuilder)\s*<[^>]*>\s*\(|\bthrows\s+\w*Exception/ },
  { lang: 'java',       w: 4, re: /\bpublic\s+(?:class|interface|enum)\s+\w|\bextends\s+\w+\s*\{|\bList<\w|\bMap<\w/ },

  // ── C# ─────────────────────────────────────────────────────────────────────
  { lang: 'csharp',     w: 8, re: /\busing\s+System(?:\.[\w.]+)?\s*;|\bnamespace\s+[\w.]+\s*[{;]/ },
  { lang: 'csharp',     w: 8, re: /\{\s*get;\s*(?:private\s+)?set;\s*\}|\b(?:public|private|protected|internal)\s+(?:static\s+)?async\s+Task(?:<[^>]*>)?\s+\w/ },
  { lang: 'csharp',     w: 6, re: /\basync\s+Task(?:<[^>]*>)?\s+\w|\bawait\s+\w+\.\w+Async\s*\(/ },
  { lang: 'csharp',     w: 5, re: /\bIEnumerable<|\bvar\s+\w+\s*=\s*new\s+\w|\bpublic\s+override\b|\[\s*(?:HttpGet|HttpPost|Serializable|Required)\s*\]/ },
  { lang: 'csharp',     w: 3, re: /\.(?:Select|Where|FirstOrDefault|ToList|Any)\s*\(|\bstring\[\]\s+args\b/ },

  // ── Kotlin ─────────────────────────────────────────────────────────────────
  { lang: 'kotlin',     w: 8, re: /\bfun\s+\w+\s*\([^)]*\)\s*(?::\s*[\w<>?.]+\s*)?[={]|\bdata\s+class\s+\w/ },
  { lang: 'kotlin',     w: 6, re: /\bval[ \t]+\w+(?:[ \t]*:[ \t]*[\w<>?.]+)?[ \t]*=|\bcompanion[ \t]+object\b|\bsuspend[ \t]+fun\b/ },
  { lang: 'kotlin',     w: 4, re: /\bprintln\s*\(|\bwhen\s*\([^)]*\)\s*\{|\bobject\s+\w+\s*[:{]|\?:\s*\w/ },

  // ── Swift ──────────────────────────────────────────────────────────────────
  { lang: 'swift',      w: 8, re: /\bguard\s+(?:let|var)\s[^\n]*\belse\b|\bfunc\s+\w+\s*\([^)]*\)\s*(?:async\s+)?(?:throws\s+)?->\s*[\w<>?[\]]/ },
  { lang: 'swift',      w: 6, re: /\bprotocol[ \t]+\w+[^\n{]{0,40}\{|\bextension[ \t]+\w+[^\n{]{0,40}\{|\bimport[ \t]+(?:SwiftUI|UIKit|Foundation)\b/ },
  { lang: 'swift',      w: 6, re: /\b(?:let|var)\s+\w+\s*:\s*(?:Int|String|Double|Float|Bool|Character|Any|\[[A-Z])|@(?:State|Binding|Published|IBOutlet|objc)\b/ },
  { lang: 'swift',      w: 4, re: /\\\(\w|\bif[ \t]+let[ \t]+\w|\bstruct[ \t]+\w+[ \t]*:[ \t]*View\b|\bfunc[ \t]+\w+[ \t]*\([^)]*:[ \t]*[A-Z]/ },
  { lang: 'swift',      w: 3, re: /\?\?\s*\w|\b\w+\?\.\w|\bself\.\w+\s*=/ },

  // ── C / C++ ────────────────────────────────────────────────────────────────
  { lang: 'cpp',        w: 8, re: /#include\s*<(?:iostream|vector|map|set|algorithm|string|memory|utility)>/ },
  { lang: 'cpp',        w: 6, re: /\btemplate\s*<\s*(?:typename|class)\b|\bnullptr\b|\bnamespace\s+\w+\s*\{/ },
  { lang: 'c',          w: 8, re: /#include\s*<(?:stdio|stdlib|string|math|time|ctype|unistd)\.h>/ },
  { lang: 'c',          w: 6, re: /\b(?:printf|scanf|malloc|calloc|free|memcpy|strlen)\s*\(/ },
  { lang: 'c',          w: 4, re: /\bint\s+main\s*\(\s*(?:void|int\s+argc|\)\s*\{)/ },
  { lang: 'c',          w: 3, re: /\btypedef\s+struct\b|\bsizeof\s*\(|\bNULL\b/ },

  // ── Ruby ───────────────────────────────────────────────────────────────────
  { lang: 'ruby',       w: 8, re: /\bdo[ \t]*\|[ \t]*\w[\w, ]*\|/ },
  { lang: 'ruby',       w: 7, re: /\battr_(?:accessor|reader|writer)\s+:|\brequire(?:_relative)?\s+['"]|\bputs\s+\S/ },
  // Split from a single `def … end` span: two independent signals score the
  // same way here, and the span form put a lazy `[\\s\\S]*?` next to `\\s*`,
  // which backtracks super-linearly on input that never closes the block.
  { lang: 'ruby',       w: 4, re: /(?:^|\n)[ \t]*def[ \t]+\w/ },
  { lang: 'ruby',       w: 4, re: /(?:^|\n)[ \t]*end[ \t]*$/m },
  { lang: 'ruby',       w: 4, re: /\bnil\?\b|\b\w+\.new\b|=>\s*['"\w]|\bmodule\s+[A-Z]\w*\s*$/m },
  { lang: 'ruby',       w: 3, re: /:\w+[ \t]*=>|\bend[ \t]*$/m },

  // ── PHP ────────────────────────────────────────────────────────────────────
  { lang: 'php',        w: 7, re: /\$this->\w|\bfunction\s+\w+\s*\([^)]*\$\w/ },
  { lang: 'php',        w: 6, re: /\$\w+\s*=\s*\S|\bforeach\s*\(\s*\$\w+\s+as\s+\$/ },
  { lang: 'php',        w: 5, re: /\becho[ \t][^;\n]*[$'"]|\bnamespace[ \t]+[\w\\]+;|\buse[ \t]+[\w\\]+\\\w+;/ },
  // `public function` is PHP's spelling and nothing else's: Java and C# name a
  // return type in that position, and TypeScript class methods drop `function`
  // entirely. Weighted to clear JavaScript's generic `function name(…) {` rule,
  // which fires on the same line.
  { lang: 'php',        w: 8, re: /\b(?:public|private|protected)\s+(?:static\s+)?function\s+\w/ },
  { lang: 'php',        w: 3, re: /->\w+\s*\(|::\w+\s*\(/ },

  // ── Markup and data ────────────────────────────────────────────────────────
  { lang: 'html',       w: 7, re: /<(?:html|head|body|nav|section|article|header|footer|main|form)\b[^>]*>/i },
  { lang: 'html',       w: 5, re: /<(?:div|p|span|a|img|ul|ol|li|table|tr|td|input|button|h[1-6])\b[^>]*>[\s\S]*<\/(?:div|p|span|a|ul|ol|li|table|tr|td|button|h[1-6])>/i },
  { lang: 'html',       w: 4, re: /<\w+\s+(?:class|id|href|src|type|style)\s*=\s*["']/i },
  { lang: 'xml',        w: 6, re: /\bxmlns(?::\w+)?\s*=\s*["']|<\/\w+:\w+>|<\w+:\w+[\s>]/ },

  { lang: 'json',       w: 8, re: /^\s*[{[][\s\S]*"[\w-]+"\s*:\s*(?:"[^"]*"|-?\d|\{|\[|true|false|null)/ },
  { lang: 'json',       w: 3, re: /^\s*\{[\s\S]*\}\s*$|^\s*\[[\s\S]*\]\s*$/ },

  // ── YAML ───────────────────────────────────────────────────────────────────
  // Common enough in practice (CI configs, compose files, front matter) that
  // its absence made every such snippet fall through to null.
  { lang: 'yaml',       w: 8, re: /^---\s*$/m },
  { lang: 'yaml',       w: 6, re: /^[ \t]*-\s+\w+\s*:\s*\S/m },
  { lang: 'yaml',       w: 5, re: /^[a-z_][\w-]*[ \t]*:(?:[ \t]*$|[ \t]+(?:[|>][-+]?[ \t]*$|['"\w[{]))/im },
  { lang: 'yaml',       w: 4, re: /^[ \t]+[a-z_][\w-]*[ \t]*:[ \t]*\S/im },
  { lang: 'yaml',       w: 3, re: /^[ \t]*-\s+\S/m },

  // ── Markdown ───────────────────────────────────────────────────────────────
  { lang: 'markdown',   w: 7, re: /^#{1,6}\s+\S/m },
  { lang: 'markdown',   w: 6, re: /^```|^\|[^\n|]+\|[^\n]*\n\s*\|[\s:|-]+\|/m },
  { lang: 'markdown',   w: 4, re: /\[[^\]\n]+\]\([^)\n]+\)|!\[[^\]\n]*\]\(/ },
  { lang: 'markdown',   w: 3, re: /\*\*[^*\n]+\*\*|^>\s+\S|^[-*+]\s+\S/m },

  // ── SQL ────────────────────────────────────────────────────────────────────
  { lang: 'sql',        w: 9, re: /(?:^|\n)\s*(?:SELECT\s+[\w*]|INSERT\s+INTO\s|UPDATE\s+\w+\s+SET\s|DELETE\s+FROM\s)/i },
  { lang: 'sql',        w: 8, re: /(?:^|\n)\s*(?:CREATE|ALTER|DROP)\s+(?:TABLE|DATABASE|INDEX|VIEW|SCHEMA)\b/i },
  { lang: 'sql',        w: 4, re: /\b(?:INNER|LEFT|RIGHT|FULL)\s+(?:OUTER\s+)?JOIN\b|\bGROUP\s+BY\b|\bORDER\s+BY\b|\bWITH\s+\w+\s+AS\s*\(/i },

  // ── SCSS before CSS: every SCSS marker is invalid plain CSS ────────────────
  { lang: 'scss',       w: 9, re: /^[ \t]*\$[\w-]+[ \t]*:[^;\n]+;|@(?:mixin|include|extend|use|forward)[ \t]+[\w"'-]/m },
  { lang: 'scss',       w: 7, re: /^[ \t]*&[\s.:[&>+~]|#\{[^}]*\}/m },
  { lang: 'scss',       w: 4, re: /^[ \t]*\/\/[ \t]*\S/m },

  // The leading word must not be a statement keyword from another language:
  // an object or block literal reads exactly like a rule set otherwise.
  { lang: 'css',        w: 6, re: /^[ \t]*(?!(?:export|import|return|function|const|let|var|val|if|else|for|while|switch|case|class|new|public|private|protected|internal|def|func|fun|fn|pub|package|type|interface|enum|struct|impl|trait|mod|use|using|namespace|module|data|object|async|await|guard|extension|protocol|template|typedef)\b)[.#]?[\w-]+[^{}\n]{0,60}\{[^{}:]*:[^{};]+[;}]/m },
  { lang: 'css',        w: 5, re: /@(?:media|supports|keyframes|font-face|import|charset)\b/ },
  { lang: 'css',        w: 4, re: /:\s*(?:#[\da-f]{3,8}|\d+(?:px|rem|em|%|vh|vw)|flex|grid|block|none|absolute|relative)\s*[;}]/i },
  { lang: 'css',        w: 3, re: /::?(?:hover|focus|active|before|after|first-child|last-child|nth-child)\b/ },

  // ── Bash ───────────────────────────────────────────────────────────────────
  { lang: 'bash',       w: 7, re: /(?:^|\n|&&|\|\|)\s*(?:sudo\s+)?(?:apt(?:-get)?|yum|brew|npm|pnpm|yarn|pip3?|docker|kubectl|git|systemctl|curl|wget|chmod|chown|mkdir|rm|cp|mv|tar|ssh|scp)\s+[\w./-]/ },
  { lang: 'bash',       w: 6, re: /^\s*(?:export|source|alias)\s+\w+|^\s*\w+=\S+\s*$/m },
  { lang: 'bash',       w: 6, re: /\bfi[ \t]*$|(?:^|\n)[ \t]*(?:if|for|while)[ \t][^\n]*;[ \t]*(?:then|do)\b|(?:^|\n)[ \t]*done\b/m },
  { lang: 'bash',       w: 5, re: /\$\{?\w+\}?[/:]|"\$\w|\becho\s+["'$]|\$\(\w/ },
  { lang: 'bash',       w: 4, re: /(?:^|\n|\|)\s*(?:grep|awk|sed|cat|ls|cd|pwd|find|xargs|head|tail|sort|uniq|wc)\s+[-\w$'"./]/ },
  { lang: 'bash',       w: 3, re: /\s\|[ \t]*\w|\s&&\s|\s2>&1|\s-[\w-]+\s/ },
];

/**
 * How much of the input the rules actually run over.
 *
 * A language is identifiable from its opening lines, so scanning a whole file
 * buys nothing — and it costs a lot: several rules scan a line looking for a
 * trailing token, which is quadratic in line length. Pasting a minified bundle
 * (one 100 KB line) took over seven seconds before this cap, freezing the
 * editor. Bounding the input makes detection cost independent of file size.
 */
const SAMPLE_LIMIT = 4000;

/**
 * First `SAMPLE_LIMIT` characters, cut back to a line boundary so the `^`/`$`
 * anchored rules do not see a line that the truncation invented.
 * @param {string} s
 * @returns {string}
 */
function _sample(s) {
  if (s.length <= SAMPLE_LIMIT) return s;
  const head = s.slice(0, SAMPLE_LIMIT);
  const lastBreak = head.lastIndexOf('\n');
  return lastBreak > 0 ? head.slice(0, lastBreak) : head;
}

/**
 * Detects the programming language of a code snippet.
 * @param {string} code
 * @returns {string|null} A Prism language id, or null when it is not clear.
 */
export function detectLang(code) {
  if (!code?.trim()) return null;
  const s = _sample(code.trim());

  /** @type {Map<string, number>} */
  const scores = new Map();
  for (const { lang, re, w } of RULES) {
    if (re.test(s)) scores.set(lang, (scores.get(lang) || 0) + w);
  }
  if (scores.size === 0) return null;

  // A superset language legitimately matches its base language's rules, so the
  // evidence would otherwise be split between the two and both fall under the
  // margin — or the base would win outright on shared signals alone. Fold the
  // base's score into the superset, but only once the superset has shown at
  // least one marker of its own.
  for (const [superset, base] of SUPERSETS) {
    const own = scores.get(superset);
    if (own) scores.set(superset, own + (scores.get(base) || 0));
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [winner, top] = ranked[0];
  const runnerUp = ranked[1]?.[1] ?? 0;

  if (top < MIN_SCORE || top - runnerUp < MIN_MARGIN) return null;
  return winner;
}
