import type { StaticPage } from "@/lib/pages-content";

export function StaticPageBody({ page }: { page: StaticPage }) {
  const paragraphs = page.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-semibold text-foreground">{page.title}</h1>
      <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
