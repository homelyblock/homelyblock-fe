import { z } from "zod";
import { INDIAN_PHONE_MESSAGE, INDIAN_PHONE_PATTERN } from "../../lib/indian-phone.ts";

const phoneSchema = z
  .string()
  .trim()
  .min(10, INDIAN_PHONE_MESSAGE)
  .max(20, "Phone number is too long")
  .regex(INDIAN_PHONE_PATTERN, INDIAN_PHONE_MESSAGE);

export const serviceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  category: z.enum([
    "PLUMBING",
    "ELECTRICAL",
    "CARPENTRY",
    "HOUSEKEEPING",
    "PEST_CONTROL",
    "INTERNET_CABLE",
    "APPLIANCE_REPAIR",
    "OTHER",
  ]),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  contactPerson: z
    .string()
    .trim()
    .max(120, "Contact person is too long")
    .optional(),
  phone: phoneSchema,
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || phoneSchema.safeParse(value).success,
      "Enter a valid WhatsApp number",
    ),
  address: z.string().trim().max(300, "Address is too long").optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
