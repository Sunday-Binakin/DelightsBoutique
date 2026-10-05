"use client";

import { useQuery } from "@tanstack/react-query";
import { getReports, type ReportsParams } from "@/lib/api/reports";

export function useReports(params: ReportsParams = {}) {
  const query = useQuery({
    queryKey: ["admin-reports", params],
    queryFn: () => getReports(params),
  });

  return query;
}
