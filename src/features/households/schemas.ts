import { z } from "zod";
import { INDIAN_PHONE_MESSAGE, INDIAN_PHONE_PATTERN } from "../../lib/indian-phone.ts";

const phoneSchema = z
  .string()
  .trim()
  .min(10, INDIAN_PHONE_MESSAGE)
  .max(20, "Phone number is too long")
  .regex(INDIAN_PHONE_PATTERN, INDIAN_PHONE_MESSAGE);

export const householdMemberFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  relationship: z.enum([
    "SPOUSE",
    "CHILD",
    "PARENT",
    "SIBLING",
    "RELATIVE",
    "OTHER",
  ]),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.union([phoneSchema, z.undefined()])),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.union([z.string().email("Enter a valid email"), z.undefined()])),
});

export type HouseholdMemberFormValues = z.infer<
  typeof householdMemberFormSchema
>;

export function filterOccupancyByQuery<
  T extends { displayName: string; email: string | null },
>(items: T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter(
    (item) =>
      item.displayName.toLowerCase().includes(needle) ||
      (item.email?.toLowerCase().includes(needle) ?? false),
  );
}
