"use client";

import { Building2, House } from "lucide-react";
import { useState } from "react";
import { Field } from "./field";

const roles = [
  {
    value: "SOCIETY_ADMIN",
    title: "Society admin",
    description:
      "Create a new society and manage its residents, notices, and records.",
    icon: Building2,
  },
  {
    value: "RESIDENT_USER",
    title: "Resident",
    description:
      "Register your login. A society admin connects you to your home before you can see society records.",
    icon: House,
  },
] as const;

type RoleSetupFieldsProps = {
  fieldErrors?: Record<string, string[]>;
};

export function RoleSetupFields({ fieldErrors }: RoleSetupFieldsProps) {
  const [role, setRole] = useState("");
  const roleError = fieldErrors?.accountType;

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3" aria-invalid={Boolean(roleError?.length)}>
        <legend className="text-sm font-medium text-foreground">
          How will you use HomelyBlock?
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
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
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
                  {option.title}
                </span>
                <span className="text-sm leading-6 text-muted-foreground">
                  {option.description}
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
            label="Society name"
            type="text"
            autoComplete="organization"
            required
            error={fieldErrors?.societyName}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="city"
              name="city"
              label="City"
              type="text"
              autoComplete="address-level2"
              required
              error={fieldErrors?.city}
            />
            <Field
              id="state"
              name="state"
              label="State"
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
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="Optional"
          error={fieldErrors?.phone}
        />
      ) : null}
    </div>
  );
}
