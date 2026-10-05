import { apiFetch } from "./client";
import type { SessionDto } from "./types";

export interface ProfileDto {
  name: string;
  email: string;
  phone: string | null;
  role: SessionDto["role"];
}

export interface UpdateProfileBody {
  name?: string;
  phone?: string;
}

export function getProfile(): Promise<ProfileDto> {
  return apiFetch<ProfileDto>("/api/account");
}

export function updateProfile(body: UpdateProfileBody): Promise<ProfileDto> {
  return apiFetch<ProfileDto>("/api/account/profile", { method: "PATCH", body });
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return apiFetch<void>("/api/account/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}
