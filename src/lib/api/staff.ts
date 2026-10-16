import { apiFetch } from "./client";
import type {
  CreateStaffBody,
  CreateStaffResponse,
  ResetPasswordResponse,
  StaffDto,
  UpdateStaffBody,
} from "./types";
import type { StaffMember } from "@/lib/staff";

export function getStaff(): Promise<StaffDto[]> {
  return apiFetch<StaffDto[]>("/api/admin/staff");
}

export function createStaff(
  body: CreateStaffBody,
  idempotencyKey: string,
): Promise<CreateStaffResponse> {
  return apiFetch<CreateStaffResponse>("/api/admin/staff", { method: "POST", body, idempotencyKey });
}

export function updateStaff(id: string, body: UpdateStaffBody): Promise<StaffDto> {
  return apiFetch<StaffDto>(`/api/admin/staff/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export function resetStaffPassword(id: string): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>(`/api/admin/staff/${encodeURIComponent(id)}/reset-password`, {
    method: "POST",
  });
}

export function toStaffMember(dto: StaffDto): StaffMember {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    permissions: dto.permissions,
    active: dto.active,
    createdAt: dto.createdAt,
  };
}
