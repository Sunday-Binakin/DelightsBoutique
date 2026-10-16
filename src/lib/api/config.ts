const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawBaseUrl && process.env.NODE_ENV !== "production") {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set — copy .env.example to .env.local and point it at the backend.",
  );
}

/** Backend base URL, no trailing slash. Swap via NEXT_PUBLIC_API_URL — never hardcode it elsewhere. */
export const API_BASE_URL = (rawBaseUrl ?? "").replace(/\/+$/, "");
