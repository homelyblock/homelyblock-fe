import Link from "next/link";
import { formatDateTime } from "@/lib/format-date";
import { EmptyState } from "@/components/layout/status-views";
import { activityHref } from "../links";
import type { DashboardActivityItem } from "../types";

type ActivityListProps = {
  societyId: string;
  items: DashboardActivityItem[];
  emptyMessage: string;
};

export function ActivityList({
  societyId,
  items,
  emptyMessage,
}: ActivityListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const href = activityHref(societyId, item);
        const content = (
          <>
            <p className="text-sm text-foreground">{item.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDateTime(item.occurredAt)}
            </p>
          </>
        );
        return (
          <li key={item.id}>
            {href ? (
              <Link
                href={href}
                className="block rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/60"
              >
                {content}
              </Link>
            ) : (
              <div className="rounded-lg border border-border bg-card px-3 py-2">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
