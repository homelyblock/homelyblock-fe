"use client";

import { controlClassName } from "@/components/ui/control";
import { useI18n } from "@/i18n/provider";

type OptionSearchProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  total?: number;
  shown?: number;
};

/** Search box for a capped option list. The parent refetches with the typed text. */
export function OptionSearch({
  id,
  label,
  value,
  onChange,
  total,
  shown,
}: OptionSearchProps) {
  const { t } = useI18n();
  const truncated = total !== undefined && shown !== undefined && total > shown;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className={controlClassName}
        autoComplete="off"
      />
      {truncated ? (
        <p className="text-xs text-muted-foreground">
          {t("directory.showing", { shown, total })}
        </p>
      ) : null}
    </div>
  );
}
