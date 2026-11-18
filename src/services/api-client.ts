import { getPublicConfig } from "@/config/public-env";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ApiRequestOptions = RequestInit & {
  /**
   * Verified NestJS access requires a Supabase access token.
   * A frontend cookie session alone does not authorize API calls.
   */
  accessToken?: string | null;
};

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
    if (
      typeof window !== "undefined" &&
      error.status === 401 &&
      !window.location.pathname.startsWith("/sign-in") &&
      window.location.pathname !== "/session-expired"
    ) {
      const next = `${window.location.pathname}${window.location.search}`;
      // Full navigation is intentional: clear client query caches after auth loss.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- session expiry hard redirect
      window.location.assign(
        `/session-expired?next=${encodeURIComponent(next || "/societies")}`,
      );
    }
    throw error;
  }

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
      };
      if (typeof parsed.message === "string" && parsed.message.length > 0) {
        message = parsed.message;
      }
      if (typeof parsed.code === "string" && parsed.code.length > 0) {
        code = parsed.code;
      }
    } catch {
      message = body;
    }
  }

  return new ApiError(message, response.status, code);
}
