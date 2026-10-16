"use client";

import { useParams } from "next/navigation";
import { useCategoriesQuery } from "@/lib/use-categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { LinkButton } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

export default function AdminEditCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, isLoading, isError, refetch } = useCategoriesQuery();

  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="this category" onRetry={refetch} />;

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Category not found</h1>
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
          { label: "Edit Category" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Edit Category</h1>
      <p className="mt-1 text-sm text-muted-foreground">{category.name}</p>

      <div className="mt-6">
        <CategoryForm initialCategory={category} />
      </div>
    </div>
  );
}
