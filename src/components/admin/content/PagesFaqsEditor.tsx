"use client";

import { useState } from "react";
import { useMarkUnsaved } from "@/lib/unsaved-changes";
import { usePage } from "@/lib/use-pages-content";
import { useFaqs } from "@/lib/use-faqs";
import { useUpdatePage, useCreateFaq, useUpdateFaq, useDeleteFaq } from "@/lib/use-admin-content";
import type { PageKey } from "@/lib/api/types";
import type { FaqDto } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";
import { StaticPageBody } from "@/components/storefront/StaticPageBody";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { useToast } from "@/components/ui/ToastProvider";

const PAGE_KEYS: { key: PageKey; label: string }[] = [
  { key: "about", label: "About Us" },
  { key: "shipping", label: "Shipping & Delivery" },
  { key: "returns", label: "Return Policy" },
  { key: "terms", label: "Terms of Service" },
  { key: "privacy", label: "Privacy Policy" },
];

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

function PreviewLabel() {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Live Preview
    </p>
  );
}

function StaticPageForm({ pageKey }: { pageKey: PageKey }) {
  const { page, isLoading, isError, refetch } = usePage(pageKey);
  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="this page" onRetry={refetch} />;
  if (!page) return null;
  return <StaticPageFormInner pageKey={pageKey} initialPage={page} />;
}

function StaticPageFormInner({
  pageKey,
  initialPage,
}: {
  pageKey: PageKey;
  initialPage: { title: string; body: string };
}) {
  const [draft, setDraft] = useState(initialPage);
  const [saved, setSaved] = useState(true);
  useMarkUnsaved(!saved);
  const updatePage = useUpdatePage();
  const toast = useToast();

  async function handleSave() {
    try {
      await updatePage.mutateAsync({ key: pageKey, page: draft });
      setSaved(true);
      toast.success("Page saved.");
    } catch {
      toast.error("Couldn't save this page. Try again.");
    }
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
        disabled={saved || updatePage.isPending}
        onClick={handleSave}
        className="mt-3"
      >
        {updatePage.isPending ? "Saving…" : saved ? "Saved" : "Save Page"}
      </Button>
    </div>
  );
}

function FaqRow({ faq }: { faq: FaqDto }) {
  const [draft, setDraft] = useState({ question: faq.question, answer: faq.answer });
  const [saved, setSaved] = useState(true);
  useMarkUnsaved(!saved);
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();
  const toast = useToast();

  async function handleSave() {
    try {
      await updateFaq.mutateAsync({ id: faq.id, body: draft });
      setSaved(true);
    } catch {
      toast.error("Couldn't save this FAQ. Try again.");
    }
  }

  async function handleRemove() {
    if (!confirm("Remove this FAQ? This can't be undone.")) return;
    try {
      await deleteFaq.mutateAsync(faq.id);
      toast.success("FAQ removed.");
    } catch {
      toast.error("Couldn't remove this FAQ. Try again.");
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle p-4">
      <div className="flex items-start justify-between gap-3">
        <input
          value={draft.question}
          onChange={(e) => {
            setDraft((prev) => ({ ...prev, question: e.target.value }));
            setSaved(false);
          }}
          placeholder="Question"
          className={`${inputClasses} font-medium`}
        />
        <button
          type="button"
          onClick={handleRemove}
          disabled={deleteFaq.isPending}
          className="mt-1 shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {deleteFaq.isPending ? "Removing…" : "Remove"}
        </button>
      </div>
      <textarea
        rows={2}
        value={draft.answer}
        onChange={(e) => {
          setDraft((prev) => ({ ...prev, answer: e.target.value }));
          setSaved(false);
        }}
        placeholder="Answer"
        className={`${inputClasses} mt-2`}
      />
      <Button
        type="button"
        variant="outline"
        disabled={saved || updateFaq.isPending}
        onClick={handleSave}
        className="mt-2"
      >
        {updateFaq.isPending ? "Saving…" : saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

function FaqsEditor() {
  const { faqs, isLoading, isError, refetch } = useFaqs();
  const createFaq = useCreateFaq();
  const toast = useToast();

  function addFaq() {
    createFaq.mutate(
      { question: "", answer: "" },
      { onError: () => toast.error("Couldn't add a new FAQ. Try again.") },
    );
  }

  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="FAQs" onRetry={refetch} />;

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <p className="text-sm font-semibold text-foreground">FAQs</p>

      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <FaqRow key={faq.id} faq={faq} />
          ))}

          <button
            type="button"
            onClick={addFaq}
            disabled={createFaq.isPending}
            className="self-start text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {createFaq.isPending ? "Adding…" : "+ Add FAQ"}
          </button>
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
  return (
    <div className="mt-4 flex flex-col gap-5">
      {PAGE_KEYS.map(({ key }) => (
        <StaticPageForm key={key} pageKey={key} />
      ))}
      <FaqsEditor />
    </div>
  );
}
