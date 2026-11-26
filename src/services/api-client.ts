import { getPublicConfig } from "@/config/public-env";
import { userFacingMessage } from "@/lib/user-facing-message";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details: string[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details: string[] = [],
  ) {
    super(
      userFacingMessage(message, {
        status,
        code,
        details,
      }),
    );
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const ATTENTION_REFRESH = "hb-attention-refresh";

function notifyAttentionRefresh(method: string | undefined) {
  if (typeof window === "undefined") return;
  const verb = (method ?? "GET").toUpperCase();
  if (verb === "GET" || verb === "HEAD") return;
  window.dispatchEvent(new Event(ATTENTION_REFRESH));
}

export type ApiRequestOptions = RequestInit & {
  /**
   * Verified NestJS access requires a Supabase access token.
   * A frontend cookie session alone does not authorize API calls.
   */
  accessToken?: string | null;
};

export function redirectIfSessionExpired(status: number) {
  if (
    typeof window === "undefined" ||
    status !== 401 ||
    window.location.pathname.startsWith("/sign-in") ||
    window.location.pathname.startsWith("/admin/sign-in") ||
    window.location.pathname === "/session-expired"
  ) {
    return;
  }
  const next = `${window.location.pathname}${window.location.search}`;
  // Full navigation is intentional: clear client query caches after auth loss.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- session expiry hard redirect
  window.location.assign(
    `/session-expired?next=${encodeURIComponent(next || "/societies")}`,
  );
}

export async function apiRequest<T>(
  path: string,
  init: ApiRequestOptions = {},
): Promise<T> {
  const { apiUrl } = getPublicConfig();
  const url = new URL(path, `${apiUrl}/`);
  const { accessToken, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  headers.set("Accept", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    const error = await toApiError(response);
    redirectIfSessionExpired(error.status);
    throw error;
  }

  notifyAttentionRefresh(rest.method);

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await response.text();
  let message = response.statusText || "Request failed";
  let code: string | undefined;

  if (body) {
    try {
      const parsed = JSON.parse(body) as {
        message?: unknown;
        code?: unknown;
        details?: unknown;
      };
      const details = Array.isArray(parsed.details)
        ? parsed.details.filter(
            (item): item is string => typeof item === "string" && item.length > 0,
          )
        : [];
      if (typeof parsed.message === "string" && parsed.message.length > 0) {
        message = parsed.message;
      }
      if (
        details.length > 0 &&
        (message === "Validation failed" ||
          message === "Request failed" ||
          message === response.statusText)
      ) {
        message = details.join(" ");
      }
      if (typeof parsed.code === "string" && parsed.code.length > 0) {
        code = parsed.code;
      }
      return new ApiError(message, response.status, code, details);
    } catch {
      message = body;
    }
  }

  return new ApiError(message, response.status, code);
}
