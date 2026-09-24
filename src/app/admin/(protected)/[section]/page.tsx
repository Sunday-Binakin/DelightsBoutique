"use client";

import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

export default function AdminSectionComingSoonPage() {
  const { section } = useParams<{ section: string }>();
  const title = "This section";

  return (
    <div className="flex h-full flex-col">
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: title }]} />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          &ldquo;{section}&rdquo; doesn&apos;t exist yet.
        </p>
      </div>
    </div>
  );
}
