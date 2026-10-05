"use client";

import { useState } from "react";
import { BADGE_LABELS, type Product } from "@/lib/types";
import { useCategories } from "@/lib/use-categories";
import { PRODUCT_PAGE_SIZE, useProductsList } from "@/lib/use-products";
import { usePagedState } from "@/lib/use-paged-state";
import { useDeleteProduct, useCategoryProductCounts, useTotalProductCount } from "@/lib/use-admin-catalog";
import { formatPrice } from "@/lib/format";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { Pagination } from "@/components/ui/Pagination";
import { StockBadge } from "@/components/ui/StockBadge";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { useToast } from "@/components/ui/ToastProvider";

const ALL = "all";

function ProductTable({
  products,
  selectedSlug,
  onSelect,
  onDelete,
  isLoading,
  isError,
  onRetry,
}: {
  products: Product[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onDelete: (slug: string, name: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="products" onRetry={onRetry} />;

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
        No products here yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Retail</th>
            <th className="px-4 py-3">Wholesale</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.slug}
              onClick={() => onSelect(product.slug)}
              className={`cursor-pointer border-b border-border-subtle last:border-0 hover:bg-muted/60 ${
                selectedSlug === product.slug ? "bg-muted" : ""
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <ProductVisual
                    product={product}
                    className="h-10 w-10 shrink-0 rounded-lg"
                    iconClassName="h-1/2 w-1/2"
                  />
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    {product.badge && (
                      <p className="text-xs text-primary">{BADGE_LABELS[product.badge]}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{formatPrice(product.retailPrice)}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {product.wholesalePrice ? formatPrice(product.wholesalePrice) : "—"}
              </td>
              <td className="px-4 py-3">
                <StockBadge status={product.stockStatus} />
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/products/${product.slug}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    title="Edit"
                    aria-label={`Edit ${product.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                  >
                    <EditIcon className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(product.slug, product.name);
                    }}
                    title="Delete"
                    aria-label={`Delete ${product.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminProductsPage() {
  const categories = useCategories();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const trimmedSearch = search.trim();
  const [page, setPage] = usePagedState(`${selectedCategory}|${trimmedSearch}`);

  const {
    products: visible,
    total: listTotal,
    isLoading: loadingProducts,
    isError: productsErrored,
    refetch: refetchProducts,
  } = useProductsList({
    category: selectedCategory === ALL ? undefined : selectedCategory,
    search: trimmedSearch || undefined,
    page,
    limit: PRODUCT_PAGE_SIZE,
  });
  const categoryCounts = useCategoryProductCounts(categories.map((c) => c.slug));
  const { total: totalCount } = useTotalProductCount();

  const deleteProduct = useDeleteProduct();
  const toast = useToast();

  function handleDelete(slug: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    deleteProduct.mutate(slug, {
      onSuccess: () => {
        if (selectedSlug === slug) setSelectedSlug(null);
        toast.success(`"${name}" deleted.`);
      },
      onError: () => toast.error(`Couldn't delete "${name}". Try again.`),
    });
  }

  function selectCategory(slug: string) {
    setSelectedCategory(slug);
    setSelectedSlug(null);
  }

  const selectedCategoryName =
    selectedCategory === ALL
      ? "All Products"
      : categories.find((c) => c.slug === selectedCategory)?.name ?? "All Products";

  const selectedProduct = visible.find((p) => p.slug === selectedSlug) ?? null;

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Products" }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} products in the catalog.
          </p>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/admin/products/bulk" variant="outline">
            Bulk Upload
          </LinkButton>
          <LinkButton href="/admin/categories/new" variant="outline">
            + Add Category
          </LinkButton>
          <LinkButton href="/admin/products/new">+ Add Product</LinkButton>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr_320px]">
        <aside className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => selectCategory(ALL)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedCategory === ALL ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
            }`}
          >
            All Products
            <span className={selectedCategory === ALL ? "text-white/80" : "text-muted-foreground"}>
              {totalCount}
            </span>
          </button>
          {categories.map((category) => {
            const count = categoryCounts.get(category.slug) ?? 0;
            const active = selectedCategory === category.slug;
            return (
              <div
                key={category.slug}
                className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectCategory(category.slug)}
                  className="flex flex-1 items-center justify-between px-3 py-2 text-left"
                >
                  {category.name}
                  <span className={active ? "text-white/80" : "text-muted-foreground"}>
                    {count}
                  </span>
                </button>
                <Link
                  href={`/admin/categories/${category.slug}/edit`}
                  title={`Edit ${category.name}`}
                  aria-label={`Edit ${category.name}`}
                  className={`mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    active ? "text-white/80 hover:bg-white/20" : "text-foreground/50 hover:bg-border-subtle hover:text-primary"
                  }`}
                >
                  <EditIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </aside>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              {selectedCategoryName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {listTotal}
              </span>
            </h2>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedSlug(null);
              }}
              aria-label="Search products"
              placeholder="Search products..."
              className="w-full max-w-xs rounded-lg border border-input-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="mt-3">
            <ProductTable
              products={visible}
              selectedSlug={selectedSlug}
              onSelect={setSelectedSlug}
              onDelete={handleDelete}
              isLoading={loadingProducts}
              isError={productsErrored}
              onRetry={refetchProducts}
            />
            <Pagination
              page={page}
              pageSize={PRODUCT_PAGE_SIZE}
              total={listTotal}
              onPageChange={setPage}
            />
          </div>
        </div>

        <ProductPreview product={selectedProduct} onDelete={handleDelete} />
      </div>
    </div>
  );
}
