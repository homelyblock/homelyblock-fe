"use client";

import { Button } from "@/components/ui/button";

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
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pages} · {total} records
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
