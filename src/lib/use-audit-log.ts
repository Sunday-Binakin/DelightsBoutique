"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuditLog, type AuditLogParams } from "@/lib/api/audit-log";

export function useAuditLog(params: AuditLogParams = {}) {
  const query = useQuery({
    queryKey: ["admin-audit-log", params],
    queryFn: () => getAuditLog(params),
    placeholderData: keepPreviousData,
  });

  return { ...query, entries: query.data?.data ?? [], total: query.data?.total ?? 0 };
}
