"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminAuthenticated, canAccess } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({ children }: LayoutProps<"/">) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Session lives in localStorage, unreadable during SSR — check after
    // mount rather than during render, same pattern as cart-context.tsx.
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 lg:p-10">
        {canAccess(pathname) ? (
          children
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h1 className="font-serif text-2xl font-semibold text-foreground">Access Denied</h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              You don&apos;t have permission to view this section. Ask the owner to grant it if
              you need access.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
