/** Same rule as the API: optional +91 or trunk 0, then 10 digits. */
export const INDIAN_PHONE_PATTERN =
  /^(?:\+91[\s-]?|91[\s-]?|0)?[1-9](?:[\s-]?[0-9]){9}$/;

export const INDIAN_PHONE_MESSAGE =
  "Enter an Indian phone number, such as +91 98765 43210";

/** Display a stored Indian number as +91 XXXXX XXXXX. Unknown shapes stay as entered. */
export function formatIndianPhone(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const digits = value.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("91") && local.length === 12) local = local.slice(2);
  else if (local.startsWith("0") && local.length === 11) local = local.slice(1);
  if (!/^[1-9][0-9]{9}$/.test(local)) return value.trim();
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}
