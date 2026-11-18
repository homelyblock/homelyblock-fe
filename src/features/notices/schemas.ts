import { z } from "zod";

export const noticeFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title is too long"),
    body: z
      .string()
      .trim()
      .min(1, "Content is required")
      .max(10000, "Content is too long"),
    category: z.enum([
      "GENERAL",
      "MAINTENANCE",
      "EVENT",
      "EMERGENCY",
      "IMPORTANT",
    ]),
    audienceType: z.enum(["SOCIETY", "BUILDING", "UNIT"]),
    targetBuildingId: z.string().uuid().optional().or(z.literal("")),
    targetUnitId: z.string().uuid().optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.audienceType === "BUILDING" && !value.targetBuildingId) {
      ctx.addIssue({
        code: "custom",
        path: ["targetBuildingId"],
        message: "Select a building",
      });
    }
    if (value.audienceType === "UNIT" && !value.targetUnitId) {
      ctx.addIssue({
        code: "custom",
        path: ["targetUnitId"],
        message: "Select a unit",
      });
    }
  });
