"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// middleware.ts already redirects to /admin/login when there's no session
// cookie at all; if we got this far there's a cookie, so head for the
// dashboard — the protected layout bounces back to login if it turns out
// to be stale.
export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return null;
}
