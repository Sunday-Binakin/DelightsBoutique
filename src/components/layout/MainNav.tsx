"use client";

import Link from "next/link";
import { useCategories } from "@/lib/use-categories";
import { UTILITY_LINKS } from "@/lib/constants";
import { ChevronDownIcon } from "@/components/ui/icons";

// Category links are never a fixed list — they follow whatever the admin
// has set up under Products > Categories. The first few show inline; the
// rest fall into "More" alongside the fixed utility links.
const INLINE_CATEGORY_COUNT = 5;

export function MainNav() {
  const categories = useCategories();
  const inlineCategories = categories.slice(0, INLINE_CATEGORY_COUNT);
  const overflowCategories = categories.slice(INLINE_CATEGORY_COUNT);

  return (
    <nav className="hidden items-center gap-6 lg:flex">
      <Link
        href="/new-arrivals"
        className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
      >
        New Arrivals
      </Link>
      {inlineCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
        >
          {category.name}
        </Link>
      ))}
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
          More
          <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-lg border border-border-subtle bg-background py-2 shadow-lg">
          {overflowCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="block px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
          {UTILITY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
