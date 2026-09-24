"use client";

import { usePagesContent } from "@/lib/use-pages-content";
import { StaticPageBody } from "@/components/storefront/StaticPageBody";

export default function PrivacyPage() {
  const content = usePagesContent();
  return <StaticPageBody page={content.privacy} />;
}
