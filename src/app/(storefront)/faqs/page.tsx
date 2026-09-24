"use client";

import { usePagesContent } from "@/lib/use-pages-content";

export default function FaqsPage() {
  const { faqs } = usePagesContent();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-semibold text-foreground">
        Frequently Asked Questions
      </h1>

      <div className="mt-6 flex flex-col divide-y divide-border-subtle">
        {faqs.map((faq) => (
          <details key={faq.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
              {faq.question}
              <span className="text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
