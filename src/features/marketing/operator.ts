export type OperatorIdentity = {
  legalName: string | null;
  address: string | null;
  supportEmail: string | null;
  grievanceEmail: string | null;
};

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function cleanEmail(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || trimmed.length > 254) {
    return null;
  }
  return trimmed;
}

/** Reads only values the operator has actually set. Never invents an identity. */
export function readOperatorIdentity(
  env: Record<string, string | undefined> = process.env,
): OperatorIdentity {
  return {
    legalName: clean(env.NEXT_PUBLIC_LEGAL_NAME),
    address: clean(env.NEXT_PUBLIC_LEGAL_ADDRESS),
    supportEmail: cleanEmail(env.NEXT_PUBLIC_SUPPORT_EMAIL),
    grievanceEmail: cleanEmail(env.NEXT_PUBLIC_GRIEVANCE_EMAIL),
  };
}
