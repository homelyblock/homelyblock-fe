/**
 * Turn API / runtime failures into short, resident-friendly copy.
 * Keep specific validation sentences that already read as human guidance.
 */

const HUMAN_OK =
  /^(please |enter |select |choose |check |use |password |name |title |content |phone |email |amount |date |code |unit |building |society |confirm |passwords |discount |comment |resolution |purpose |category |description |visitor )/i;

const TECHNICAL =
  /prisma|econnrefused|etimedout|enotfound|econnreset|stack trace|exception|internal server|bad gateway|gateway timeout|service unavailable|fetch failed|failed to fetch|networkerror|network error|not readable|unauthorized|forbidden|not found|request failed|sign in required|validation failed|jwt|supabase|sqlstate|aggregateerror|typeerror|referenceerror|cannot read|undefined is not|unexpected token|http error|status code|axios|nestjs|digest/i;

export function userFacingMessage(
  message: string | null | undefined,
  options: { status?: number; code?: string; details?: string[]; fallback?: string } = {},
): string {
  const fallback = options.fallback ?? messageForStatus(options.status);
  const trimmed = (message ?? "").trim();
  const details = (options.details ?? []).map((item) => item.trim()).filter(Boolean);

  if (details.length > 0) {
    const humanDetails = details.filter((item) => !looksTechnical(item));
    if (humanDetails.length > 0 && humanDetails.every((item) => item.length <= 120)) {
      return humanDetails.slice(0, 3).join(" ");
    }
  }

  if (trimmed && !looksTechnical(trimmed) && (HUMAN_OK.test(trimmed) || isPlainSentence(trimmed))) {
    return trimSentence(trimmed);
  }

  if (options.code) {
    const fromCode = messageForCode(options.code);
    if (fromCode) return fromCode;
  }

  return fallback;
}

export function userFacingError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      status?: unknown;
      code?: unknown;
      details?: unknown;
    };
    const message = typeof candidate.message === "string" ? candidate.message : "";
    const status = typeof candidate.status === "number" ? candidate.status : undefined;
    const code = typeof candidate.code === "string" ? candidate.code : undefined;
    const details = Array.isArray(candidate.details)
      ? candidate.details.filter((item): item is string => typeof item === "string")
      : undefined;
    return userFacingMessage(message, { status, code, details, fallback });
  }
  if (typeof error === "string" && error.trim()) {
    return userFacingMessage(error, { fallback });
  }
  return fallback;
}

function messageForStatus(status?: number): string {
  switch (status) {
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You don’t have permission to do that.";
    case 404:
      return "We couldn’t find what you were looking for.";
    case 409:
      return "That change conflicts with existing information. Refresh and try again.";
    case 422:
      return "Please check the details and try again.";
    case 429:
      return "Too many attempts. Wait a moment and try again.";
    case 502:
    case 503:
    case 504:
      return "HomelyBlock is busy right now. Please try again shortly.";
    default:
      if (status && status >= 500) {
        return "Something went wrong on our side. Please try again.";
      }
      return "Something went wrong. Please try again.";
  }
}

function messageForCode(code: string): string | null {
  switch (code.toUpperCase()) {
    case "UNAUTHORIZED":
      return "Please sign in to continue.";
    case "FORBIDDEN":
      return "You don’t have permission to do that.";
    case "NOT_FOUND":
      return "We couldn’t find what you were looking for.";
    case "CONFLICT":
      return "That change conflicts with existing information. Refresh and try again.";
    case "VALIDATION_FAILED":
    case "BAD_REQUEST":
      return "Please check the details and try again.";
    case "RATE_LIMITED":
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Wait a moment and try again.";
    case "SERVICE_UNAVAILABLE":
      return "HomelyBlock is busy right now. Please try again shortly.";
    default:
      return null;
  }
}

function looksTechnical(message: string): boolean {
  if (!message) return true;
  if (message.length > 160) return true;
  if (TECHNICAL.test(message)) return true;
  if (/^[A-Z0-9_]{3,}$/.test(message)) return true;
  if (/[{}\[\]\\]/.test(message) && /:/.test(message)) return true;
  if (/\bat\s+\S+\s*\(/.test(message)) return true; // stack frames
  return false;
}

function isPlainSentence(message: string): boolean {
  if (message.length < 3 || message.length > 140) return false;
  if (/https?:\/\//i.test(message)) return false;
  return (/[a-z]/i.test(message) && / /.test(message)) || /[.!?]$/.test(message);
}

function trimSentence(message: string): string {
  return message.replace(/\s+/g, " ").trim();
}
