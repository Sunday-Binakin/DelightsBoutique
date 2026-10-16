import { apiFetch } from "./client";
import type { AuditEntryDto, Paginated } from "./types";

export interface AuditLogParams {
  search?: string;
  page?: number;
  limit?: number;
}

export function getAuditLog(params: AuditLogParams = {}): Promise<Paginated<AuditEntryDto>> {
  return apiFetch<Paginated<AuditEntryDto>>("/api/admin/audit-log", { query: { ...params } });
}
