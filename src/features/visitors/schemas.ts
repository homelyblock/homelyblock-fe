import { z } from "zod";
import { INDIAN_PHONE_MESSAGE, INDIAN_PHONE_PATTERN } from "../../lib/indian-phone.ts";

const phoneSchema = z
  .string()
  .trim()
  .min(10, INDIAN_PHONE_MESSAGE)
  .max(20)
  .regex(INDIAN_PHONE_PATTERN, INDIAN_PHONE_MESSAGE);

export const expectedVisitorSchema = z.object({
  visitorName: z.string().trim().min(1, "Name is required").max(120),
  visitorPhone: phoneSchema,
  purpose: z.string().trim().min(1, "Purpose is required").max(200),
  expectedAt: z.string().min(1, "Expected date/time is required"),
  vehicleNumber: z.string().trim().max(32).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const walkInVisitorSchema = z.object({
  unitId: z.string().uuid("Select a unit"),
  visitorName: z.string().trim().min(1, "Name is required").max(120),
  visitorPhone: phoneSchema,
  purpose: z.string().trim().min(1, "Purpose is required").max(200),
  expectedAt: z.string().optional().or(z.literal("")),
  vehicleNumber: z.string().trim().max(32).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
