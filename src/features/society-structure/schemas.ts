import { z } from "zod";

export const createBuildingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(32, "Code is too long")
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, _ or - only"),
});

export const createUnitSchema = z.object({
  buildingId: z.string().uuid("Select a building"),
  unitNumber: z
    .string()
    .trim()
    .min(1, "Unit number is required")
    .max(32, "Unit number is too long"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const createMembershipSchema = z.object({
  userId: z.string().uuid("Select a registered user"),
  role: z.enum(["SOCIETY_ADMIN", "RESIDENT_USER"]),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED", "REMOVED"]).default("INVITED"),
  primaryUnitId: z.string().uuid().optional().or(z.literal("")),
});

export const updateMembershipSchema = z.object({
  role: z.enum(["SOCIETY_ADMIN", "RESIDENT_USER"]),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED", "REMOVED"]),
  primaryUnitId: z.string().uuid().optional().or(z.literal("")),
});
