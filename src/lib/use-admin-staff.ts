"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStaff,
  createStaff,
  updateStaff,
  resetStaffPassword,
  toStaffMember,
} from "@/lib/api/staff";
import type { CreateStaffBody, StaffDto, UpdateStaffBody } from "@/lib/api/types";

export function useStaffList({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: ["admin-staff"],
    queryFn: getStaff,
    enabled,
  });

  return { ...query, staff: query.data ? query.data.map(toStaffMember) : [] };
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: CreateStaffBody; idempotencyKey: string }) =>
      createStaff(body, idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-staff"] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStaffBody }) => updateStaff(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-staff"] });
      const previous = queryClient.getQueryData<StaffDto[]>(["admin-staff"]);
      queryClient.setQueryData<StaffDto[]>(["admin-staff"], (old) =>
        old?.map((member) => (member.id === id ? { ...member, ...body } : member)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["admin-staff"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-staff"] }),
  });
}

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: (id: string) => resetStaffPassword(id),
  });
}
