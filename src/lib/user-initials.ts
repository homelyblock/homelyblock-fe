/**
 * Build compact initials for the account avatar.
 * Prefers first + last name; falls back to first two letters, then email local-part.
 */
export function userInitials(
  name: string | null | undefined,
  email?: string | null,
): string {
  const cleaned = normalizePersonName(name);
  if (cleaned) {
    const parts = cleaned.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      const first = firstGrapheme(parts[0]);
      const last = firstGrapheme(parts[parts.length - 1]);
      if (first && last) return `${first}${last}`.toLocaleUpperCase("en-IN");
    }
    const graphemes = [...cleaned].filter((ch) => ch.trim().length > 0);
    if (graphemes.length >= 2) {
      return `${graphemes[0]}${graphemes[1]}`.toLocaleUpperCase("en-IN");
    }
    if (graphemes.length === 1) return graphemes[0].toLocaleUpperCase("en-IN");
  }

  const local = (email ?? "").trim().split("@")[0] ?? "";
  const emailChars = [...local].filter((ch) => /[a-zA-Z0-9]/.test(ch));
  if (emailChars.length >= 2) {
    return `${emailChars[0]}${emailChars[1]}`.toLocaleUpperCase("en-IN");
  }
  if (emailChars.length === 1) return emailChars[0].toLocaleUpperCase("en-IN");

  return "?";
}

function normalizePersonName(name: string | null | undefined): string {
  if (typeof name !== "string") return "";
  return name.trim().replace(/\s+/g, " ");
}

function firstGrapheme(value: string): string {
  for (const ch of value) {
    if (ch.trim()) return ch;
  }
  return "";
}
