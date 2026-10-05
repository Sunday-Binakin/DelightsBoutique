"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/lib/use-products";
import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { LinkButton } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

export default function AdminEditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, isLoading, isError, notFound, refetch } = useProduct(slug);

  if (isLoading) return <LoadingBlock />;
  if (isError && !notFound) return <QueryError label="this product" onRetry={refetch} />;

  if (!product) {
    return (
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Product not found</h1>
        <LinkButton href="/admin/products" className="mt-6">
          Back to Products
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit Product" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Edit Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      <div className="mt-6">
        <ProductForm initialProduct={product} />
      </div>
    </div>
  );
}
