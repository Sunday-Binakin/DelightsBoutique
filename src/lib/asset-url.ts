import { API_BASE_URL } from "@/lib/api/config";

/** Uploaded photos come back as paths on the API host; photos saved before uploads existed are data URLs. */
export function resolveAssetUrl(url: string): string {
  return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}
