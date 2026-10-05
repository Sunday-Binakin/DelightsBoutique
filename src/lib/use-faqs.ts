"use client";

import { useQuery } from "@tanstack/react-query";
import { getFaqs } from "@/lib/api/content";

export function useFaqs() {
  const query = useQuery({
    queryKey: ["faqs"],
    queryFn: getFaqs,
  });

  return { ...query, faqs: query.data ?? [] };
}
