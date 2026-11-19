"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ApiError, apiRequest } from "@/services/api-client";
import { checkboxClassName, controlClassName, fieldErrorClassName, fieldLabelClassName, textareaClassName } from "@/components/ui/control";
import { validateContact, type ContactDraft } from "@/features/marketing/contact-schema";
import { translateKnown } from "@/i18n/known-messages.ts";
import { useI18n } from "@/i18n/provider";

const empty: ContactDraft = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
  societyName: "",
  privacyAcknowledged: false,
};

export function ContactForm() {
  const { t } = useI18n();
  const [draft, setDraft] = useState<ContactDraft>(empty);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDraft, string>>>({});
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const flight = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (flight.current) return;
    const nextErrors = validateContact(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setMessage(null);
      return;
    }

    flight.current = true;
    setStatus("pending");
    setMessage(null);
    try {
      await apiRequest<{ data: { received: boolean } }>("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: draft.fullName.trim(),
          email: draft.email.trim(),
          subject: draft.subject.trim(),
          message: draft.message.trim(),
          societyName: draft.societyName.trim() || undefined,
          privacyAcknowledged: true,
          website: website || undefined,
        }),
      });
      setDraft(empty);
      setWebsite("");
      setStatus("sent");
      setMessage("Your message has been received. Society issues should still go to your society administrator.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof ApiError && error.status === 429
          ? "Too many messages were sent from this network. Wait a few minutes and try again."
          : "The message could not be sent. Check your connection and try again.",
      );
    } finally {
      flight.current = false;
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <Field
        id="fullName"
        label="Full name"
        required
        autoComplete="name"
        value={draft.fullName}
        error={errors.fullName}
        onChange={(value) => setDraft((current) => ({ ...current, fullName: value }))}
      />
      <Field
        id="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={draft.email}
        error={errors.email}
        onChange={(value) => setDraft((current) => ({ ...current, email: value }))}
      />
      <Field
        id="societyName"
        label="Society name"
        hint="Optional. Add it if the message is about a particular society."
        value={draft.societyName}
        error={errors.societyName}
        onChange={(value) => setDraft((current) => ({ ...current, societyName: value }))}
      />
      <Field
        id="subject"
        label="Subject"
        required
        value={draft.subject}
        error={errors.subject}
        onChange={(value) => setDraft((current) => ({ ...current, subject: value }))}
      />
      <div className="space-y-1.5">
        <label htmlFor="message" className={fieldLabelClassName}>
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          className={textareaClassName}
          value={draft.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
        />
        {errors.message ? (
          <p id="message-error" className={fieldErrorClassName} role="alert">
            {errors.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="privacyAcknowledged" className="flex items-start gap-3 text-sm leading-6">
          <input
            id="privacyAcknowledged"
            name="privacyAcknowledged"
            type="checkbox"
            className={`${checkboxClassName} mt-1`}
            checked={draft.privacyAcknowledged}
            onChange={(event) =>
              setDraft((current) => ({ ...current, privacyAcknowledged: event.target.checked }))
            }
          />
          <span>
            I have read the{" "}
            <Link href="/privacy-policy" className="font-medium underline-offset-4 hover:underline">
              privacy policy
            </Link>{" "}
            and agree to HomelyBlock using this message to respond.
          </span>
        </label>
        {errors.privacyAcknowledged ? (
          <p className={fieldErrorClassName} role="alert">
            {errors.privacyAcknowledged}
          </p>
        ) : null}
      </div>
      {message ? (
        <p role="status" className={status === "error" ? fieldErrorClassName : "text-sm leading-6"}>
          {translateKnown(message, t)}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "pending"}
        className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {status === "pending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={fieldLabelClassName}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClassName}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className={fieldErrorClassName} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
