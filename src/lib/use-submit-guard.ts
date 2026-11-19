"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { runExclusive } from "./form-submit";

/** One in-flight mutation per component, including Enter and double-clicks. */
export function useSubmitGuard() {
  const gate = useRef(false);
  const [pending, startTransition] = useTransition();
  const guard = useCallback(
    (work: () => Promise<void>) => {
      runExclusive(gate, startTransition, work);
    },
    [startTransition],
  );
  return { pending, guard };
}

/** Holds the gate until a React action's pending flag clears. */
export function useActionGate(pending: boolean) {
  const flight = useRef(false);
  const [, startTransition] = useTransition();
  useEffect(() => {
    if (!pending) flight.current = false;
  }, [pending]);
  return (action: () => void) => {
    if (flight.current || pending) return;
    flight.current = true;
    startTransition(() => {
      action();
    });
  };
}
