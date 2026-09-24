"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/lib/use-products";
import { CatalogView } from "@/components/catalog/CatalogView";

export default function SearchPage() {
  const products = useProducts();
  const [query, setQuery] = useState<string | null>(null);

  useEffect(() => {
    // Read once on mount — avoids the Suspense boundary useSearchParams()
    // would otherwise require, same as the Orders admin page's ?highlight=.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);

  if (query === null) return null;

  const q = query.trim().toLowerCase();
  const results = q
    ? products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
      )
    : [];

  return (
    <CatalogView
      title={query ? `Search results for "${query}"` : "Search"}
      subtitle={`${results.length} product${results.length === 1 ? "" : "s"} found.`}
      products={results}
    />
  );
}
