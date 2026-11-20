"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

/** One in-flight mutation per component, including Enter and double-clicks. */
export function useSubmitGuard() {
  const gate = useRef(false);
  const [pending, setPending] = useState(false);
  const guard = useCallback((work: () => Promise<void>) => {
    if (gate.current) return false;
    gate.current = true;
    setPending(true);
    void work().finally(() => {
      gate.current = false;
      setPending(false);
    });
    return true;
  }, []);
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
