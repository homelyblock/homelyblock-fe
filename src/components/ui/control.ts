const controlBase =
  "rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-60";

/** Full-width text fields and selects. */
export const controlClassName = `h-11 w-full ${controlBase}`;

/** Filters and inline controls that sit beside other actions. */
export const filterControlClassName = `h-11 ${controlBase}`;

/** Multi-line fields. Height comes from rows, not a single-line control. */
export const textareaClassName = `min-h-28 w-full py-2.5 ${controlBase}`;

export const checkboxClassName =
  "size-4 rounded border border-input bg-card accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60";

export const fieldLabelClassName = "block text-sm font-medium text-foreground";

export const fieldHintClassName = "text-sm leading-5 text-muted-foreground";

export const fieldErrorClassName = "text-sm text-destructive";
