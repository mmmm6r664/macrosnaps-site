// Search boxes accept plain words only: letters (any language), numbers, spaces and basic punctuation.
// Anything that looks like code (HTML, scripts, SQL, template syntax) is stripped on the client and refused on the server.
const ALLOWED = /[^\p{L}\p{N}\s.,'&()\-/#+]/gu;
const CODE = /<|>|\{|\}|`|\$\(|javascript:|data:|vbscript:|on\w+\s*=|<\/?script|\bselect\b.+\bfrom\b|\bunion\b.+\bselect\b|\bdrop\s+table\b|--|;|\/\*/i;

export const MAX_QUERY = 200;
/** Remove disallowed characters as the visitor types. */
export const cleanTyped = (s: string) => s.replace(ALLOWED, "").slice(0, MAX_QUERY);
/** True when the text looks like code rather than a request. */
export const looksLikeCode = (s: string) => CODE.test(s);
/** Server-side: normalized, length-limited, code-free text, or null if it must be refused. */
export function safeQuery(raw: string | null | undefined): string | null {
  const s = String(raw ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, MAX_QUERY);
  if (looksLikeCode(s)) return null;
  return s.replace(ALLOWED, "").replace(/\s+/g, " ").trim();
}
