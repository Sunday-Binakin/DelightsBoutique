"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/lib/constants";
import { adminSignOut, canAccess, getAdminSession } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit-log";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Staff & Permissions", href: "/admin/staff" },
  { label: "Content", href: "/admin/content" },
  { label: "Reports", href: "/admin/reports" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = getAdminSession();
  const visibleItems = NAV_ITEMS.filter((item) => canAccess(item.href));

  function handleSignOut() {
    logAction("Signed out");
    adminSignOut();
    router.push("/admin/login");
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border-subtle bg-background">
      <div className="border-b border-border-subtle px-6 py-5">
        <p className="font-serif text-lg font-semibold text-primary">{SITE.name}</p>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
        {session && (
          <p className="mt-2 text-xs text-foreground/70">
            Signed in as <span className="font-medium">{session.name}</span>
            {session.role === "staff" && " (Staff)"}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border-subtle px-3 py-4">
        <Link
          href="/"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
        >
          View Storefront
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-muted"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
