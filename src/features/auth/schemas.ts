import { z } from "zod";
import { INDIAN_PHONE_MESSAGE, INDIAN_PHONE_PATTERN } from "../../lib/indian-phone.ts";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const optionalText = z.string().trim().optional();

type OnboardingFields = {
  accountType: string;
  societyName?: string;
  city?: string;
  state?: string;
  phone?: string;
};

function addOnboardingIssues(
  value: OnboardingFields,
  context: z.RefinementCtx,
): void {
  if (
    value.accountType !== "SOCIETY_ADMIN" &&
    value.accountType !== "RESIDENT_USER"
  ) {
    context.addIssue({
      code: "custom",
      path: ["accountType"],
      message: "Choose Society Admin or Resident.",
    });
    return;
  }

  if (value.phone && !INDIAN_PHONE_PATTERN.test(value.phone.trim())) {
    context.addIssue({
      code: "custom",
      path: ["phone"],
      message: INDIAN_PHONE_MESSAGE,
    });
  }

  if (value.accountType === "SOCIETY_ADMIN") {
    if (!value.societyName || value.societyName.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["societyName"],
        message: "Enter the society name.",
      });
    }
    if (!value.city || value.city.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["city"],
        message: "Enter the city.",
      });
    }
  }
}

export const onboardingSchema = z
  .object({
    accountType: z.string().trim(),
    societyName: optionalText,
    city: optionalText,
    state: optionalText,
    phone: optionalText,
  })
  .superRefine(addOnboardingIssues);

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your name")
      .max(80, "Name is too long"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    accountType: z.string().trim(),
    societyName: optionalText,
    city: optionalText,
    state: optionalText,
    phone: optionalText,
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    addOnboardingIssues(value, context);
  });

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordUpdateSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
export type PasswordResetRequestValues = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;
