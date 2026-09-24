"use client";

import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

const TITLES: Record<string, string> = {
  content: "Content",
  reports: "Reports",
};

export default function AdminSectionComingSoonPage() {
  const { section } = useParams<{ section: string }>();
  const title = TITLES[section] ?? "This section";

  return (
    <div className="flex h-full flex-col">
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: title }]} />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {title} management is coming in a follow-up step. Products, Orders, Customers, and
          Staff & Permissions are ready now.
        </p>
      </div>
    </div>
  );
}
