"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { breadcrumbItems } from "./breadcrumb-model";

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = breadcrumbItems(pathname);
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden text-sm text-muted-foreground">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.href} className="flex min-w-0 items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden className="text-border">
                  /
                </span>
              ) : null}
              {current ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="truncate hover:text-foreground">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
