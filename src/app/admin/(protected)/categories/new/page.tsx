import { CategoryForm } from "@/components/admin/CategoryForm";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

export default function AdminNewCategoryPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Add Category" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Add Category</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        New categories appear immediately in the product filters and on the storefront.
      </p>

      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
