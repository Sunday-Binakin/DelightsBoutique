"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { SiteSettingsForm } from "@/components/admin/content/SiteSettingsForm";
import { BannersEditor } from "@/components/admin/content/BannersEditor";
import { CollectionSectionForm } from "@/components/admin/content/CollectionSectionForm";
import { FlashSaleForm } from "@/components/admin/content/FlashSaleForm";
import { PagesFaqsEditor } from "@/components/admin/content/PagesFaqsEditor";
import { StorefrontCopyForm } from "@/components/admin/content/StorefrontCopyForm";

const TAB_SETTINGS = "Site Settings";
const TAB_BANNERS = "Homepage Banners";
const TAB_COLLECTION = "Collection Section";
const TAB_FLASH_SALE = "Flash Sale";
const TAB_PAGES = "Pages & FAQs";
const TAB_STOREFRONT_COPY = "Other Pages";

export default function AdminContentPage() {
  const [tab, setTab] = useState(TAB_SETTINGS);

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Site Content" }]} />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Site Content</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit what shows up on the storefront — no developer needed.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            TAB_SETTINGS,
            TAB_BANNERS,
            TAB_COLLECTION,
            TAB_FLASH_SALE,
            TAB_PAGES,
            TAB_STOREFRONT_COPY,
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === TAB_SETTINGS && <SiteSettingsForm />}
      {tab === TAB_BANNERS && <BannersEditor />}
      {tab === TAB_COLLECTION && <CollectionSectionForm />}
      {tab === TAB_FLASH_SALE && <FlashSaleForm />}
      {tab === TAB_PAGES && <PagesFaqsEditor />}
      {tab === TAB_STOREFRONT_COPY && <StorefrontCopyForm />}
    </div>
  );
}
