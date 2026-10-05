"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";

export function subscribeToNewsletter(email: string): Promise<void> {
  return apiFetch<void>("/api/newsletter/subscribe", { method: "POST", body: { email } });
}

/** Admin-only; the count comes from the paginated list's `total`. */
export function useNewsletterSubscriberCount() {
  const query = useQuery({
    queryKey: ["newsletter-subscribers", "count"],
    queryFn: () =>
      apiFetch<Paginated<{ email: string; subscribedAt: string }>>(
        "/api/admin/newsletter/subscribers",
        { query: { limit: 1 } },
      ),
  });
  return { total: query.data?.total ?? 0, isError: query.isError };
}
