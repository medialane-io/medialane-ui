/**
 * Thin fetch helper for backend `/v1/*` routes that are not yet exposed via
 * `@medialane/sdk`'s `ApiClient`. Takes `{ baseUrl, apiKey }` as an explicit
 * config rather than reading env vars directly — each app's own
 * `MEDIALANE_BACKEND_URL` resolution is environment-aware (server gets the
 * real backend URL + key; the browser gets a same-origin BFF proxy that
 * injects the real key server-side) and that routing/security logic stays
 * app-local, same as `getMedialaneClient`.
 *
 * Error model:
 *   `ApiError` carries the HTTP `status` so callers can special-case auth
 *   states (401/403) without a generic error toast.
 *
 * Headers:
 *   - `x-api-key` is injected when `apiKey` is non-empty.
 *   - `Authorization: Bearer <token>` is forwarded if the caller passes
 *     `bearer` — used for SIWS-gated routes.
 *   - `Content-Type: application/json` is set automatically when a body is
 *     present.
 */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiFetchConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Bearer token (SIWS) for identity-aware routes. */
  bearer?: string | null;
  signal?: AbortSignal;
}

export async function apiFetch<T = unknown>(
  config: ApiFetchConfig,
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { method = "GET", body, bearer, signal } = options;
  const url = `${config.baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (config.apiKey) headers["x-api-key"] = config.apiKey;
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = text || `Request failed with HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string") {
        message = parsed.error;
      }
    } catch {
      /* response wasn't JSON — keep the text as the message */
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content shows up on some PATCH/DELETE paths — return undefined as T.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
