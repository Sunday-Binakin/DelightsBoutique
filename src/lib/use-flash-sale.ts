"use client";

import { useQuery } from "@tanstack/react-query";
import { getFlashSale } from "@/lib/api/content";
import { toProduct } from "@/lib/api/products";
import type { Product } from "@/lib/types";

export interface FlashSaleView {
  eyebrow: string;
  title: string;
  endsAt: string;
  products: Product[];
  isCurated: boolean;
}

const EMPTY: FlashSaleView = {
  eyebrow: "",
  title: "",
  endsAt: new Date().toISOString(),
  products: [],
  isCurated: false,
};

function toView(data: Awaited<ReturnType<typeof getFlashSale>> | undefined): FlashSaleView {
  if (!data) return EMPTY;
  return { ...data, products: data.products.map(toProduct) };
}

/** Live "Flash Sale" section — the backend resolves which products show server-side. */
export function useFlashSale(): FlashSaleView {
  const query = useQuery({
    queryKey: ["flash-sale"],
    queryFn: getFlashSale,
  });

  return toView(query.data);
}

/** Same data plus loading/error state, for the admin editor's initial draft seeding. */
export function useFlashSaleQuery() {
  const query = useQuery({
    queryKey: ["flash-sale"],
    queryFn: getFlashSale,
  });

  return { ...query, flashSale: toView(query.data) };
}
