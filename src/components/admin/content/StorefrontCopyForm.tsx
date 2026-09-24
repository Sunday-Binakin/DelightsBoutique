"use client";

import { useState, type ReactNode } from "react";
import {
  getStorefrontCopy,
  saveStorefrontCopy,
  type StorefrontCopy,
  type TrustBadgeCopy,
} from "@/lib/storefront-copy";
import { getSubscribers } from "@/lib/newsletter";
import { logAction } from "@/lib/audit-log";
import { Button } from "@/components/ui/Button";
import { QuestionIcon, WhatsAppIcon, TruckIcon, MailIcon } from "@/components/ui/icons";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

function PreviewLabel() {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Live Preview
    </p>
  );
}

function PreviewBox({ children }: { children: ReactNode }) {
  return (
    <div>
      <PreviewLabel />
      <div className="rounded-lg border border-border-subtle bg-muted/40 p-4">{children}</div>
    </div>
  );
}

interface SectionProps<T> {
  title: string;
  value: T;
  onSave: (value: T) => void;
  logMessage: string;
  preview: (draft: T) => ReactNode;
  children: (draft: T, update: (updates: Partial<T>) => void) => ReactNode;
}

function CopySection<T>({ title, value, onSave, logMessage, preview, children }: SectionProps<T>) {
  const [draft, setDraft] = useState<T>(value);
  const [saved, setSaved] = useState(true);

  function update(updates: Partial<T>) {
    setDraft((prev) => ({ ...prev, ...updates }));
    setSaved(false);
  }

  function handleSave() {
    onSave(draft);
    logAction(logMessage);
    setSaved(true);
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-3">{children(draft, update)}</div>
        <PreviewBox>{preview(draft)}</PreviewBox>
      </div>
      <Button type="button" variant="outline" disabled={saved} onClick={handleSave} className="mt-4">
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

function TrustBadgesSection({
  badges,
  onSave,
}: {
  badges: StorefrontCopy["trustBadges"];
  onSave: (badges: StorefrontCopy["trustBadges"]) => void;
}) {
  const [draft, setDraft] = useState(badges);
  const [saved, setSaved] = useState(true);
  const icons = [QuestionIcon, WhatsAppIcon, TruckIcon];

  function updateBadge(index: number, updates: Partial<TrustBadgeCopy>) {
    setDraft((prev) => {
      const next = [...prev] as StorefrontCopy["trustBadges"];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    setSaved(false);
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <p className="text-sm font-semibold text-foreground">
        Trust Badges <span className="font-normal text-muted-foreground">(homepage strip)</span>
      </p>

      <PreviewLabel />
      <div className="grid gap-3 rounded-lg border border-border-subtle bg-muted/40 p-4 sm:grid-cols-3">
        {draft.map((badge, index) => {
          const Icon = icons[index];
          return (
            <div key={index} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">{badge.title || "Title"}</p>
              <p className="text-xs text-muted-foreground">{badge.description || "Description"}</p>
              <span className="mt-1 rounded-full border border-current px-3 py-1 text-[11px] font-medium text-primary">
                {badge.ctaLabel || "Button"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {draft.map((badge, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border border-border-subtle p-3">
            <input
              value={badge.title}
              onChange={(e) => updateBadge(index, { title: e.target.value })}
              className={inputClasses}
              placeholder="Title"
            />
            <textarea
              rows={2}
              value={badge.description}
              onChange={(e) => updateBadge(index, { description: e.target.value })}
              className={inputClasses}
              placeholder="Description"
            />
            <input
              value={badge.ctaLabel}
              onChange={(e) => updateBadge(index, { ctaLabel: e.target.value })}
              className={inputClasses}
              placeholder="Button label"
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={saved}
        onClick={() => {
          onSave(draft);
          logAction("Updated trust badges");
          setSaved(true);
        }}
        className="mt-4"
      >
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

export function StorefrontCopyForm() {
  const [copy, setCopy] = useState<StorefrontCopy>(() => getStorefrontCopy());
  const [subscriberCount] = useState(() => getSubscribers().length);

  function persist(updates: Partial<StorefrontCopy>) {
    saveStorefrontCopy(updates);
    setCopy((prev) => ({ ...prev, ...updates }));
  }

  return (
    <div className="mt-4 flex flex-col gap-5">
      <TrustBadgesSection
        badges={copy.trustBadges}
        onSave={(trustBadges) => persist({ trustBadges })}
      />

      <CopySection
        title="Contact Page"
        value={{ contactHeading: copy.contactHeading, contactSubtext: copy.contactSubtext }}
        onSave={persist}
        logMessage="Updated contact page copy"
        preview={(draft) => (
          <div className="text-center">
            <p className="font-serif text-lg font-semibold text-foreground">
              {draft.contactHeading || "Heading"}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {draft.contactSubtext || "Subtext"}
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Heading
              <input
                value={draft.contactHeading}
                onChange={(e) => update({ contactHeading: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Subtext
              <textarea
                rows={2}
                value={draft.contactSubtext}
                onChange={(e) => update({ contactSubtext: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="Wholesale Page"
        value={{
          wholesaleIntro: copy.wholesaleIntro,
          wholesaleWhatsappMessage: copy.wholesaleWhatsappMessage,
        }}
        onSave={persist}
        logMessage="Updated wholesale page copy"
        preview={(draft) => (
          <div>
            <p className="font-serif text-sm font-semibold text-foreground">
              Wholesale &amp; Bulk Orders
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {draft.wholesaleIntro || "Intro text"}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-medium text-white">
              <WhatsAppIcon className="h-3 w-3" />
              Ask About Wholesale
            </span>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Opens WhatsApp pre-filled with &ldquo;{draft.wholesaleWhatsappMessage || "…"}&rdquo;
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Intro Text
              <textarea
                rows={3}
                value={draft.wholesaleIntro}
                onChange={(e) => update({ wholesaleIntro: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              &ldquo;Ask About Wholesale&rdquo; WhatsApp Message
              <input
                value={draft.wholesaleWhatsappMessage}
                onChange={(e) => update({ wholesaleWhatsappMessage: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="New Arrivals Page"
        value={{ newArrivalsTitle: copy.newArrivalsTitle, newArrivalsSubtitle: copy.newArrivalsSubtitle }}
        onSave={persist}
        logMessage="Updated New Arrivals page copy"
        preview={(draft) => (
          <div>
            <p className="font-serif text-lg font-semibold text-foreground">
              {draft.newArrivalsTitle || "Title"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {draft.newArrivalsSubtitle || "Subtitle"}
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Title
              <input
                value={draft.newArrivalsTitle}
                onChange={(e) => update({ newArrivalsTitle: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Subtitle
              <textarea
                rows={2}
                value={draft.newArrivalsSubtitle}
                onChange={(e) => update({ newArrivalsSubtitle: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="Best Sellers Page"
        value={{ bestSellersTitle: copy.bestSellersTitle, bestSellersSubtitle: copy.bestSellersSubtitle }}
        onSave={persist}
        logMessage="Updated Best Sellers page copy"
        preview={(draft) => (
          <div>
            <p className="font-serif text-lg font-semibold text-foreground">
              {draft.bestSellersTitle || "Title"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {draft.bestSellersSubtitle || "Subtitle"}
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Title
              <input
                value={draft.bestSellersTitle}
                onChange={(e) => update({ bestSellersTitle: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Subtitle
              <textarea
                rows={2}
                value={draft.bestSellersSubtitle}
                onChange={(e) => update({ bestSellersSubtitle: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="Newsletter Signup"
        value={{
          newsletterHeading: copy.newsletterHeading,
          newsletterSubtext: copy.newsletterSubtext,
          newsletterSuccessMessage: copy.newsletterSuccessMessage,
        }}
        onSave={persist}
        logMessage="Updated newsletter signup copy"
        preview={(draft) => (
          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <MailIcon className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1.5 font-serif text-sm font-semibold text-foreground">
              {draft.newsletterHeading || "Heading"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {draft.newsletterSubtext || "Subtext"}
            </p>
            <p className="mt-2 text-[10px] font-medium text-primary">
              On success: {draft.newsletterSuccessMessage || "…"}
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <p className="text-xs text-muted-foreground">
              {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"} so far.
            </p>
            <label className={labelClasses}>
              Heading
              <input
                value={draft.newsletterHeading}
                onChange={(e) => update({ newsletterHeading: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Subtext
              <textarea
                rows={2}
                value={draft.newsletterSubtext}
                onChange={(e) => update({ newsletterSubtext: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Success Message
              <input
                value={draft.newsletterSuccessMessage}
                onChange={(e) => update({ newsletterSuccessMessage: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="Cart & Checkout Disclaimers"
        value={{ cartDisclaimer: copy.cartDisclaimer, checkoutDisclaimer: copy.checkoutDisclaimer }}
        onSave={persist}
        logMessage="Updated cart & checkout disclaimers"
        preview={(draft) => (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border-subtle p-3">
              <p className="text-xs font-semibold text-foreground">Cart — Order Summary</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{draft.cartDisclaimer}</p>
            </div>
            <div className="rounded-lg border border-border-subtle p-3">
              <p className="text-xs font-semibold text-foreground">Checkout — Order Summary</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{draft.checkoutDisclaimer}</p>
            </div>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Cart Page
              <textarea
                rows={2}
                value={draft.cartDisclaimer}
                onChange={(e) => update({ cartDisclaimer: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Checkout Page
              <textarea
                rows={2}
                value={draft.checkoutDisclaimer}
                onChange={(e) => update({ checkoutDisclaimer: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="Track My Order Page"
        value={{ trackOrderHeading: copy.trackOrderHeading, trackOrderSubtext: copy.trackOrderSubtext }}
        onSave={persist}
        logMessage="Updated Track My Order page copy"
        preview={(draft) => (
          <div className="text-center">
            <p className="font-serif text-base font-semibold text-foreground">
              {draft.trackOrderHeading || "Heading"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {draft.trackOrderSubtext || "Subtext"}
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Heading
              <input
                value={draft.trackOrderHeading}
                onChange={(e) => update({ trackOrderHeading: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Subtext
              <textarea
                rows={2}
                value={draft.trackOrderSubtext}
                onChange={(e) => update({ trackOrderSubtext: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>

      <CopySection
        title="Homepage Category Grid"
        value={{
          categoryGridEyebrow: copy.categoryGridEyebrow,
          categoryGridTitle: copy.categoryGridTitle,
        }}
        onSave={persist}
        logMessage="Updated homepage category grid heading"
        preview={(draft) => (
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              {draft.categoryGridEyebrow || "Eyebrow"}
            </span>
            <p className="mt-1 font-serif text-base font-semibold text-foreground">
              {draft.categoryGridTitle || "Title"}
            </p>
          </div>
        )}
      >
        {(draft, update) => (
          <>
            <label className={labelClasses}>
              Eyebrow
              <input
                value={draft.categoryGridEyebrow}
                onChange={(e) => update({ categoryGridEyebrow: e.target.value })}
                className={inputClasses}
              />
            </label>
            <label className={labelClasses}>
              Title
              <input
                value={draft.categoryGridTitle}
                onChange={(e) => update({ categoryGridTitle: e.target.value })}
                className={inputClasses}
              />
            </label>
          </>
        )}
      </CopySection>
    </div>
  );
}
