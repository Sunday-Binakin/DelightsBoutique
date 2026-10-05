import { apiFetch, ApiError } from "./client";
import type { LoginResponse, SessionDto } from "./types";

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: { email, password } });
}

export function verifyOtp(loginToken: string, code: string): Promise<SessionDto> {
  return apiFetch<SessionDto>("/api/auth/verify-otp", { method: "POST", body: { loginToken, code } });
}

export function resendOtp(loginToken: string): Promise<void> {
  return apiFetch<void>("/api/auth/resend-otp", { method: "POST", body: { loginToken } });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

/** Resolves to null (not an ApiError) when not logged in — callers don't need to catch 401 themselves. */
export async function getSession(): Promise<SessionDto | null> {
  try {
    return await apiFetch<SessionDto>("/api/auth/session");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
