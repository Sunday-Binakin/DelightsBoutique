"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, logout as apiLogout } from "@/lib/api/auth";
import type { SessionDto } from "@/lib/api/types";

export const SESSION_QUERY_KEY = ["session"] as const;

export function useSession() {
  return useQuery<SessionDto | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getSession,
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });
}
