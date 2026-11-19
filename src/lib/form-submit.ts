import type { FormEvent } from "react";

export function fieldErrorMap(
  flattened: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flattened)) {
    if (value && value.length > 0) {
      next[key] = value;
    }
  }
  return next;
}

export function focusFirstInvalid(
  form: HTMLFormElement,
  errors: Record<string, string[] | undefined>,
) {
  const name = Object.keys(errors).find((key) => (errors[key]?.length ?? 0) > 0);
  if (!name || typeof CSS === "undefined" || typeof CSS.escape !== "function") {
    return;
  }
  const escaped = CSS.escape(name);
  const field =
    form.querySelector<HTMLElement>(`[name="${escaped}"]`) ??
    form.querySelector<HTMLElement>(`#${escaped}`);
  if (!field) return;
  field.focus({ preventScroll: true });
  field.scrollIntoView({ block: "center", behavior: "smooth" });
}

/**
 * React 19 form actions call requestFormReset as soon as the action starts.
 * A normal submit handler keeps the values until the caller resets the form.
 */
export function preservedSubmit(
  handler: (formData: FormData, form: HTMLFormElement) => void,
) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.locked === "1") return;
    handler(new FormData(form), form);
  };
}

export function lockForm(form: HTMLFormElement) {
  form.dataset.locked = "1";
}

export function unlockForm(form: HTMLFormElement) {
  delete form.dataset.locked;
}

/** Ignore a second click or Enter press until the in-flight request settles. */
export function runExclusive(
  gate: { current: boolean },
  startTransition: (callback: () => void) => void,
  work: () => Promise<void>,
): boolean {
  if (gate.current) return false;
  gate.current = true;
  startTransition(() => {
    void work().finally(() => {
      gate.current = false;
    });
  });
  return true;
}

export function rejectFields(
  form: HTMLFormElement,
  errors: Record<string, string[] | undefined>,
) {
  focusFirstInvalid(form, errors);
}
