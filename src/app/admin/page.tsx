"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAdminAuthenticated() ? "/admin/dashboard" : "/admin/login");
  }, [router]);

  return null;
}
