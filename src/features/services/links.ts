/** Digits-only number for tel:/wa.me links. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function telHref(phone: string): string {
  const digits = digitsOnlyPhone(phone);
  return digits ? `tel:+${digits}` : `tel:${phone}`;
}

export function whatsappHref(phone: string): string | null {
  const digits = digitsOnlyPhone(phone);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function filterServicesByName<T extends { name: string }>(
  items: T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => item.name.toLowerCase().includes(needle));
}
