import type { ReactNode } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/home/ProductCard";

interface ProductGridSectionProps {
  eyebrow?: string;
  title: string;
  /** Renders under the title — tabs, a countdown, or a "View all" link. */
  header?: ReactNode;
  products: Product[];
}

// The one grid layout behind every homepage product section — only the
// header content and the product list change between call sites.
export function ProductGridSection({ eyebrow, title, header, products }: ProductGridSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">{title}</h2>
        {header && <div className="mt-4 flex justify-center">{header}</div>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
