"use client";

import { useProducts } from "@/lib/use-products";
import { buildWhatsAppLink } from "@/lib/constants";
import { CatalogView } from "@/components/catalog/CatalogView";
import { WhatsAppIcon } from "@/components/ui/icons";

export default function WholesalePage() {
  const products = useProducts().filter((product) => product.wholesalePrice);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl bg-muted px-6 py-8">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Wholesale &amp; Bulk Orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every item below ships at a discounted wholesale price once you order at or above its
            minimum order quantity (MOQ), shown on each product. Wholesale accounts are set up by
            our team — message us on WhatsApp with what you&apos;re looking to stock and we&apos;ll
            get you set up.
          </p>
          <a
            href={buildWhatsAppLink("Hello Delight's Boutique, I'd like to ask about wholesale pricing.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask About Wholesale
          </a>
        </div>
      </div>

      <CatalogView
        title="Wholesale-Eligible Products"
        subtitle="Retail price is shown on each card — wholesale price and MOQ appear on the product page."
        products={products}
      />
    </div>
  );
}
