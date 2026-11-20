"use client";

import { Building2, House } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Field } from "./field";

const roles = [
  {
    value: "SOCIETY_ADMIN",
    titleKey: "work.societyAdminTitle",
    descriptionKey: "work.societyAdminHelp",
    icon: Building2,
  },
  {
    value: "RESIDENT_USER",
    titleKey: "work.residentTitle",
    descriptionKey: "work.residentHelp",
    icon: House,
  },
] as const;

type RoleSetupFieldsProps = {
  fieldErrors?: Record<string, string[]>;
};

export function RoleSetupFields({ fieldErrors }: RoleSetupFieldsProps) {
  const { t } = useI18n();
  const [role, setRole] = useState("");
  const roleError = fieldErrors?.accountType;

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3" aria-invalid={Boolean(roleError?.length)}>
        <legend className="text-sm font-medium text-foreground">
          {t("work.useAs")}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((option) => {
            const selected = role === option.value;
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition ${
                  selected
                    ? "border-primary bg-accent ring-1 ring-primary"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="accountType"
                  value={option.value}
                  checked={selected}
                  required
                  onChange={() => setRole(option.value)}
                />
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {t(option.titleKey)}
                </span>
                <span className="text-sm leading-6 text-muted-foreground">
                  {t(option.descriptionKey)}
                </span>
              </label>
            );
          })}
        </div>
        {roleError?.length ? (
          <p role="alert" className="text-sm text-destructive">
            {roleError[0]}
          </p>
        ) : null}
      </fieldset>

      {role === "SOCIETY_ADMIN" ? (
        <div className="space-y-4">
          <Field
            id="societyName"
            name="societyName"
            label={t("societyForm.name")}
            type="text"
            autoComplete="organization"
            required
            error={fieldErrors?.societyName}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="city"
              name="city"
              label={t("societyForm.city")}
              type="text"
              autoComplete="address-level2"
              required
              error={fieldErrors?.city}
            />
            <Field
              id="state"
              name="state"
              label={t("societyForm.state")}
              type="text"
              autoComplete="address-level1"
              error={fieldErrors?.state}
            />
          </div>
        </div>
      ) : null}

      {role ? (
        <Field
          id="phone"
          name="phone"
          label={t("profile.phone")}
          type="tel"
          autoComplete="tel"
          placeholder={t("work.optional")}
          error={fieldErrors?.phone}
        />
      ) : null}
    </div>
  );
}
