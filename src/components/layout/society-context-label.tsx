"use client";

import { useEffect, useState } from "react";
import {
  SOCIETY_CONTEXT_EVENT,
  type SocietyContextDetail,
} from "@/features/shell/society-context-events";

export function SocietyContextLabel() {
  const [context, setContext] = useState<SocietyContextDetail>(null);

  useEffect(() => {
    function onContext(event: Event) {
      const detail = (event as CustomEvent<SocietyContextDetail>).detail ?? null;
      setContext(detail);
    }
    window.addEventListener(SOCIETY_CONTEXT_EVENT, onContext);
    return () => window.removeEventListener(SOCIETY_CONTEXT_EVENT, onContext);
  }, []);

  if (!context?.name) return null;

  return (
    <p
      className="min-w-0 max-w-[10rem] truncate text-sm font-medium text-foreground sm:max-w-[14rem] md:hidden"
      title={context.name}
    >
      {context.name}
    </p>
  );
}
