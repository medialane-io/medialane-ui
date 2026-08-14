
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

    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
