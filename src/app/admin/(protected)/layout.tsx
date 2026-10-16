"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { canAccess } from "@/lib/admin-auth";
import { useUnsavedChangesGuard } from "@/lib/unsaved-changes";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LoadingBlock } from "@/components/ui/Spinner";
import { SkipLink } from "@/components/ui/SkipLink";

export default function AdminProtectedLayout({ children }: LayoutProps<"/">) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading, isError } = useSession();
  useUnsavedChangesGuard();

  useEffect(() => {
    // Covers both "never logged in" and "deactivated/expired mid-session" —
    // either way the session endpoint stops returning a session and we bounce
    // back to login, same as middleware.ts does for the no-cookie case.
    if (!isLoading && (isError || session === null)) {
      router.replace("/admin/login");
    }
  }, [isLoading, isError, session, router]);

  if (isLoading) return <LoadingBlock label="Checking your session…" />;
  if (!session) return null;

  return (
    <div className="flex min-h-screen">
      <SkipLink />
      <AdminSidebar session={session} />
      <main id="main-content" className="flex-1 bg-background p-6 lg:p-10">
        {canAccess(session, pathname) ? (
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
