"use client";

import { useState } from "react";
import {
  getPagesContent,
  saveStaticPage,
  saveFaqs,
  type StaticPage,
  type FaqItem,
} from "@/lib/pages-content";
import { logAction } from "@/lib/audit-log";
import { Button } from "@/components/ui/Button";
import { StaticPageBody } from "@/components/storefront/StaticPageBody";

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

function StaticPageForm({
  pageKey,
  page,
}: {
  pageKey: "about" | "shipping" | "returns" | "terms" | "privacy";
  page: StaticPage;
}) {
  const [draft, setDraft] = useState<StaticPage>(page);
  const [saved, setSaved] = useState(true);

  function handleSave() {
    saveStaticPage(pageKey, draft);
    logAction(`Updated "${draft.title}" page`);
    setSaved(true);
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <label className={labelClasses}>
            Page Title
            <input
              value={draft.title}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, title: e.target.value }));
                setSaved(false);
              }}
              className={inputClasses}
            />
          </label>
          <label className={`${labelClasses} mt-3`}>
            Body (leave a blank line between paragraphs)
            <textarea
              rows={5}
              value={draft.body}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, body: e.target.value }));
                setSaved(false);
              }}
              className={inputClasses}
            />
          </label>
        </div>

        <div>
          <PreviewLabel />
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border-subtle bg-muted/40">
            <div className="[&>div]:px-4 [&>div]:py-5">
              <StaticPageBody page={draft} />
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={saved}
        onClick={handleSave}
        className="mt-3"
      >
        {saved ? "Saved" : "Save Page"}
      </Button>
    </div>
  );
}

function FaqsEditor({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [saved, setSaved] = useState(true);

  function updateFaq(id: string, updates: Partial<FaqItem>) {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    setSaved(false);
  }

  function removeFaq(id: string) {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setSaved(false);
  }

  function addFaq() {
    setFaqs((prev) => [
      ...prev,
      { id: `faq-${Date.now().toString(36)}`, question: "", answer: "" },
    ]);
    setSaved(false);
  }

  function handleSave() {
    saveFaqs(faqs);
    logAction("Updated FAQs");
    setSaved(true);
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <p className="text-sm font-semibold text-foreground">FAQs</p>

      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-lg border border-border-subtle p-4">
              <div className="flex items-start justify-between gap-3">
                <input
                  value={faq.question}
                  onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
                  placeholder="Question"
                  className={`${inputClasses} font-medium`}
                />
                <button
                  type="button"
                  onClick={() => removeFaq(faq.id)}
                  className="mt-1 shrink-0 text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
                placeholder="Answer"
                className={`${inputClasses} mt-2`}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addFaq}
            className="self-start text-sm font-medium text-primary hover:underline"
          >
            + Add FAQ
          </button>

          <Button
            type="button"
            variant="outline"
            disabled={saved}
            onClick={handleSave}
            className="self-start"
          >
            {saved ? "Saved" : "Save FAQs"}
          </Button>
        </div>

        <div>
          <PreviewLabel />
          <div className="max-h-112 overflow-y-auto rounded-lg border border-border-subtle bg-muted/40 px-4 py-3">
            <div className="flex flex-col divide-y divide-border-subtle">
              {faqs.map((faq) => (
                <div key={faq.id} className="py-3">
                  <p className="text-sm font-medium text-foreground">
                    {faq.question || "Question"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer || "Answer"}
                  </p>
                </div>
              ))}
              {faqs.length === 0 && (
                <p className="py-3 text-sm text-muted-foreground">No FAQs yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PagesFaqsEditor() {
  const content = getPagesContent();

  return (
    <div className="mt-4 flex flex-col gap-5">
      <StaticPageForm pageKey="about" page={content.about} />
      <StaticPageForm pageKey="shipping" page={content.shipping} />
      <StaticPageForm pageKey="returns" page={content.returns} />
      <StaticPageForm pageKey="terms" page={content.terms} />
      <StaticPageForm pageKey="privacy" page={content.privacy} />
      <FaqsEditor initialFaqs={content.faqs} />
    </div>
  );
}
