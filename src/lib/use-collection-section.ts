"use client";

import { useQuery } from "@tanstack/react-query";
import { getCollectionSection } from "@/lib/api/content";
import { toProduct } from "@/lib/api/products";
import type { Product } from "@/lib/types";

export interface CollectionSectionView {
  eyebrow: string;
  title: string;
  newArrivalsLabel: string;
  bestSellersLabel: string;
  wholesalePicksLabel: string;
  newArrivals: Product[];
  bestSellers: Product[];
  wholesalePicks: Product[];
  newArrivalsCurated: boolean;
  bestSellersCurated: boolean;
  wholesalePicksCurated: boolean;
}

const EMPTY: CollectionSectionView = {
  eyebrow: "",
  title: "",
  newArrivalsLabel: "New Arrivals",
  bestSellersLabel: "Best Sellers",
  wholesalePicksLabel: "Wholesale Picks",
  newArrivals: [],
  bestSellers: [],
  wholesalePicks: [],
  newArrivalsCurated: false,
  bestSellersCurated: false,
  wholesalePicksCurated: false,
};

function toView(data: Awaited<ReturnType<typeof getCollectionSection>> | undefined): CollectionSectionView {
  if (!data) return EMPTY;
  return {
    ...data,
    newArrivals: data.newArrivals.map(toProduct),
    bestSellers: data.bestSellers.map(toProduct),
    wholesalePicks: data.wholesalePicks.map(toProduct),
  };
}

/** Live "Shop the Collection" tabbed section — the backend resolves each tab's
 * products server-side (curated picks, or its badge/wholesale fallback). */
export function useCollectionSection(): CollectionSectionView {
  const query = useQuery({
    queryKey: ["collection-section"],
    queryFn: getCollectionSection,
  });

  return toView(query.data);
}

/** Same data plus loading/error state — for the admin editor's initial draft
 * seeding, and for pages that need to distinguish "still loading" from "empty." */
export function useCollectionSectionQuery() {
  const query = useQuery({
    queryKey: ["collection-section"],
    queryFn: getCollectionSection,
  });

  return { ...query, collectionSection: toView(query.data) };
}
