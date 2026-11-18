import { z } from "zod";
import { INDIAN_PHONE_MESSAGE, INDIAN_PHONE_PATTERN } from "../../lib/indian-phone.ts";

const phoneSchema = z
  .string()
  .trim()
  .min(10, INDIAN_PHONE_MESSAGE)
  .max(20, "Phone number is too long")
  .regex(INDIAN_PHONE_PATTERN, INDIAN_PHONE_MESSAGE);

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
    .pipe(z.union([phoneSchema, z.null()])),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
