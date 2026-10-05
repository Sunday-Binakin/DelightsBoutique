import { API_BASE_URL } from "./config";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "STAFF_DEACTIVATED"
  | "RATE_LIMITED"
  | "UNKNOWN";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  fields?: Record<string, string>;
  retryAfterSeconds?: number;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    fields?: Record<string, string>,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isNotFoundError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

export function isRateLimitedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 429;
}

/** Client errors (4xx) won't fix themselves on retry, and retrying a 429 only makes the
 * rate limit worse — so only transient failures (network, 5xx) get retried. */
export function shouldRetryQuery(failureCount: number, err: unknown): boolean {
  if (err instanceof ApiError && err.status >= 400 && err.status < 500) return false;
  return failureCount < 2;
}

/** User-facing message for a failed request, with rate limiting called out explicitly. */
export function describeApiError(err: unknown, fallback: string): string {
  if (isRateLimitedError(err)) {
    const wait = (err as ApiError).retryAfterSeconds;
    return wait
      ? `Too many attempts. Please wait ${wait} second${wait === 1 ? "" : "s"} and try again.`
      : "Too many attempts. Please wait a minute and try again.";
  }
  if (err instanceof ApiError && err.code !== "UNKNOWN") return err.message;
  return fallback;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Multipart upload — mutually exclusive with `body`. Content-Type is left unset so the browser sets the boundary. */
  formData?: FormData;
  query?: Record<string, string | number | boolean | string[] | undefined | null>;
  idempotencyKey?: string;
}

const MUTATING_METHODS: HttpMethod[] = ["POST", "PATCH", "PUT", "DELETE"];

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, item);
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
}

interface ProblemDetails {
  title?: string;
  detail?: string;
}

/** Non-2xx bodies are usually the documented { error: {...} } envelope, but an invalid
 * enum string or an oversized upload short-circuits into a raw ASP.NET ProblemDetails
 * response instead — both are normalized into the same ApiError shape here. */
async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // No/invalid JSON body.
  }

  const envelope = body as ErrorEnvelope | null;
  if (envelope?.error?.code) {
    return new ApiError(
      response.status,
      envelope.error.code as ApiErrorCode,
      envelope.error.message ?? "Request failed.",
      envelope.error.fields,
    );
  }

  const problem = body as ProblemDetails | null;
  if (response.status === 429) {
    const header = Number(response.headers.get("Retry-After"));
    return new ApiError(
      429,
      "RATE_LIMITED",
      problem?.detail ?? "Too many attempts.",
      undefined,
      Number.isFinite(header) && header > 0 ? header : undefined,
    );
  }
  return new ApiError(response.status, "UNKNOWN", problem?.detail ?? problem?.title ?? "Request failed.");
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};

  if (MUTATING_METHODS.includes(method)) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }
  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}
