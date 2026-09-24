import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

export default function AdminNewProductPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Add Product" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Add Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This shows up on the storefront immediately once saved.
      </p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
