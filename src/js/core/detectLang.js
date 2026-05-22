/**
 * detectLang.js — Heuristic programming-language detection for code snippets.
 *
 * Returns a Prism.js language identifier or null when no language can be
 * determined with reasonable confidence.
 *
 * Detection order (conflicts in parentheses):
 *   TypeScript → Rust → PHP → Java → Kotlin → Swift → Go
 *   → JavaScript → HTML → CSS → JSON → SQL → Python → Ruby
 *   → Bash → C++ → C# → C → XML
 *
 * @param {string} code
 * @returns {string|null}
 */
export function detectLang(code) {
  if (!code || !code.trim()) return null;
  const s = code.trim();

  // ── TypeScript ─────────────────────────────────────────────────────────────
  // Must be first — TS is a JS superset; its markers are specific.
  if (/(:\s*(string|number|boolean|void|never|any|unknown)\b|interface\s+\w+\s*\{|type\s+\w+\s*[=<(]|<\w+>\s*[;,)]|readonly\s+\w|enum\s+\w+\s*\{|\?\s*:\s*\w|as\s+\w+\s*[;,)\]])/.test(s)) return 'typescript';

  // ── Rust ────────────────────────────────────────────────────────────────────
  // Before JavaScript — both have `let`. `!` macros and `pub fn` are unique.
  if (/\bprintln!\s*\(|\bprint!\s*\(|\bfn\s+\w+\s*(<[^>]*>)?\s*\(|\blet\s+mut\s|\bpub\s+fn\s|\buse\s+std::|\bimpl\s+\w+|\bOption<|\bResult<\w+/.test(s)) return 'rust';

  // ── PHP ─────────────────────────────────────────────────────────────────────
  // Before Bash — both have `echo`. `<?php` and `$var` are unique to PHP.
  if (/(<\?php\b|<\?=|\becho\s+.*\$\w|\$this->|\$\w+\s*=\s*\w|\bforeach\s*\(\s*\$|Illuminate\\)/.test(s)) return 'php';

  // ── Java ────────────────────────────────────────────────────────────────────
  // Before Kotlin — `System.out.println()` would otherwise match Kotlin's
  // `println\s*\(` pattern.
  if (/\bpublic\s+(class|static|void|int|String)\s+\w|System\.out\.(print|println)\s*\(|@(Override|Autowired|Component|Service|Controller)\b|import\s+java\.(util|io|lang|net)\.|throws\s+\w+Exception/.test(s)) return 'java';

  // ── Kotlin ──────────────────────────────────────────────────────────────────
  // Kotlin uses `val` (immutable) unlike Swift/JS which use `let`.
  // `fun`, `data class`, `companion object`, `println()` are Kotlin-specific.
  if (/\bfun\s+\w+\s*\(|\bdata\s+class\s+\w+|\bcompanion\s+object\b|\bval\s+\w+\s*:\s*\w|\bprintln\s*\(/.test(s)) return 'kotlin';

  // ── Swift ───────────────────────────────────────────────────────────────────
  // Swift uses `let` for constants (Kotlin uses `val`). `guard let`, `protocol`,
  // `extension`, `func ... -> ReturnType`, and `let x: UppercaseType` are signals.
  if (/\bguard\s+(let|var)\b|\bprotocol\s+\w+\s*\{|\bextension\s+\w+|\bfunc\s+\w+[^(]*\([^)]*\)\s*->\s*\w|\blet\s+\w+\s*:\s*[A-Z]\w*|\bSwiftUI\b/.test(s)) return 'swift';

  // ── Go ──────────────────────────────────────────────────────────────────────
  // `package`, `:=` short assignment, `fmt.Print*`, `chan`, `goroutine`.
  if (/\bpackage\s+\w+\b|\bfmt\.(Print|Println|Sprintf|Errorf|Fprintf)\s*\(|:=\s*\w|\bgoroutine\b|\bchan\s+\w|\bgo\s+func\b/.test(s)) return 'go';

  // ── JavaScript ──────────────────────────────────────────────────────────────
  // Before HTML to handle JSX (`<div/>` would otherwise trigger HTML).
  // `var\s+\w+\s*=` (not just `var\s+\w`) to avoid matching Swift `var x: Int`.
  if (/\b(const\s+\w|let\s+\w+\s*=|var\s+\w+\s*=|function\s+\w|\=>\s*[{(]|import\s+.*\bfrom\b\s*['"]|require\s*\(|console\.(log|error|warn|info)|document\.\w|window\.\w|async\s+function|\bPromise\b|React\.|useState\s*\(|\.then\s*\()/.test(s)) return 'javascript';

  // ── HTML ────────────────────────────────────────────────────────────────────
  if (/^<!DOCTYPE html/i.test(s) || /<(html|head|body|div|section|article|nav|p|a|img|ul|ol|li|table|form|input|button|script|style)\b[^>]*>/i.test(s)) return 'html';

  // ── SCSS ─────────────────────────────────────────────────────────────────────
  // Before CSS — SCSS is a superset. Unique markers: `//` line comments,
  // `&` nesting, `$variable`, `@mixin/@include/@extend`, `#{interpolation}`.
  if (/(^|\n)\s*(\/\/\s+\S|&[:.[\w]|\$\w+\s*:|@(mixin|include|extend|each|if|for|use|forward)\b|#\{)/.test(s) && /[\w#.*&[\]:(),>+~ -]+\s*\{/.test(s)) return 'scss';

  // ── CSS ──────────────────────────────────────────────────────────────────────
  if (/(^|\n)\s*[\w#.*:[\]&, +-]+\s*\{[^}]*[\w-]+\s*:[^{}:;]+[;}\n]/m.test(s) && !/<\w|function\s|def\s|:\s*(string|number)/.test(s)) return 'css';

  // ── JSON ────────────────────────────────────────────────────────────────────
  if (/^\s*[{[]/.test(s) && /"\w[\w\s-]*"\s*:/.test(s) && !/\bfunction\b|\bdef\b/.test(s)) return 'json';

  // ── SQL ─────────────────────────────────────────────────────────────────────
  if (/(^|\n)\s*(SELECT\s|INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM|CREATE\s+(TABLE|DATABASE|INDEX|VIEW)|DROP\s+(TABLE|DATABASE)|ALTER\s+TABLE|WITH\s+\w+\s+AS\s*\()/im.test(s)) return 'sql';

  // ── Python ──────────────────────────────────────────────────────────────────
  // `def` requires trailing `:` (Python rule); `class` checked at line start.
  if (/\bdef\s+\w+\s*\([^)]*\)\s*:|(^|\n)\s*class\s+\w+.*:\s*$|(^|\n)\s*import\s+\w|(^|\n)\s*from\s+\w+\s+import\s+|\bprint\s*\(|if\s+__name__\s*==\s*['"]__main__['"]/m.test(s)) return 'python';

  // ── Ruby ────────────────────────────────────────────────────────────────────
  // `.each do |x|`, `attr_*`, `puts` with value, multi-line `def...end`.
  if (/\bputs\s+\S|\battr_(accessor|reader|writer)\s|\.each\s+do\s*\|\w+\s*\||\bdo\s*\|\w+\s*\|.*\bend\b|\bdef\s+\w+[^:]*\n[\s\S]*?\bend\b/.test(s)) return 'ruby';

  // ── Bash / Shell ─────────────────────────────────────────────────────────────
  if (/^#!.*\/(ba|z|da|fi|k)?sh\b/m.test(s) || /\b(echo\s+["']|grep\s+|awk\s+|sed\s+['"\\/-]|chmod\s+|sudo\s+|apt(-get)?\s+install|brew\s+install|npm\s+(install|run|start|build)|pip\s+(install|3\s)|docker\s+(run|build|compose)|kubectl\s+|git\s+(clone|add|commit|push|pull|checkout))\b/.test(s)) return 'bash';

  // ── C++ ─────────────────────────────────────────────────────────────────────
  // Before C and C# — `cout<<`, `using namespace std`, `std::`, `template<>`.
  if (/\bcout\s*<<|\bcin\s*>>|using\s+namespace\s+std\b|std::\w|\btemplate\s*<\w|\b#include\s*<(iostream|vector|map|set|algorithm|string|memory)>/.test(s)) return 'cpp';

  // ── C# ──────────────────────────────────────────────────────────────────────
  // After C++ to avoid matching C++'s `using namespace std`.
  if (/\busing\s+System\b|Console\.(Write|WriteLine)\s*\(|\bget;\s*set;|\basync\s+Task[<\s]|IEnumerable<|\bLINQ\b|\.Select\s*\(|\.Where\s*\(/.test(s)) return 'csharp';

  // ── C ───────────────────────────────────────────────────────────────────────
  if (/\b#include\s*<(stdio|stdlib|string|math|time|ctype)\.h>|\bprintf\s*\(|\bscanf\s*\(|int\s+main\s*\(\s*(void|int\s+argc)|\bmalloc\s*\(|\bfree\s*\(/.test(s) && !/namespace|cout|cin|std::/.test(s)) return 'c';

  // ── XML ─────────────────────────────────────────────────────────────────────
  if (/^<\?xml\s/i.test(s) || /xmlns:|<\/[\w:]+>/.test(s)) return 'xml';

  return null;
}
