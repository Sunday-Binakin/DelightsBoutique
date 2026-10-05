"use client";

import { usePage } from "@/lib/use-pages-content";
import { StaticPageBody } from "@/components/storefront/StaticPageBody";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

export default function ReturnsPage() {
  const { page, isLoading, isError, refetch } = usePage("returns");
  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="this page" onRetry={refetch} />;
  if (!page) return null;
  return <StaticPageBody page={page} />;
}
