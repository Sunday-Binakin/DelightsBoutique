import type { PromoBannerContent } from "@/lib/types";
import { MediaSwatch } from "@/components/ui/MediaSwatch";
import { getCategoryArt } from "@/components/ui/category-art";
import { LinkButton } from "@/components/ui/Button";

interface PromoBannerProps {
  content: PromoBannerContent;
  size?: "large" | "small";
}

// One banner component drives both the large hero and the two stacked side
// banners on the homepage — only the size prop changes the layout.
export function PromoBanner({ content, size = "small" }: PromoBannerProps) {
  const isLarge = size === "large";

  return (
    <MediaSwatch
      imageUrl={content.imageUrl}
      icon={getCategoryArt(content.artCategorySlug)}
      label={content.title}
      tone={content.tone}
      overlay
      iconClassName={isLarge ? "h-1/2 w-1/2" : "h-2/5 w-2/5"}
      className={`rounded-2xl ${isLarge ? "min-h-105 p-10" : "min-h-50 p-6"}`}
    >
      <div
        style={{ color: content.textColor || "#ffffff" }}
        className={`relative flex flex-col ${isLarge ? "items-start gap-4" : "items-start gap-2"}`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
          {content.eyebrow}
        </span>
        <h3 className={`font-serif ${isLarge ? "text-4xl" : "text-xl"} font-semibold leading-tight`}>
          {content.title}
        </h3>
        <LinkButton href={content.href} variant="outline" className="mt-2 border-current">
          {content.ctaLabel}
        </LinkButton>
      </div>
    </MediaSwatch>
  );
}
