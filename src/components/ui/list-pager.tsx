"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

type ListPagerProps = {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPage: (page: number) => void;
};

export function ListPager({
  page,
  pageSize,
  total,
  disabled = false,
  onPage,
}: ListPagerProps) {
  const { t } = useI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3" aria-busy={disabled}>
      <p className="text-sm text-muted-foreground">
        {t("common.pageOf", { page, pages, total })}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {t("common.previous")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page >= pages}
          onClick={() => onPage(page + 1)}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
