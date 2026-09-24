import { SparkleIcon, CalendarIcon, RulerIcon, TagIcon } from "@/components/ui/icons";

const FILTERS = [
  { label: "Shop by Style", href: "/shop?filter=style", icon: SparkleIcon },
  { label: "Shop by Occasion", href: "/shop?filter=occasion", icon: CalendarIcon },
  { label: "Shop by Size", href: "/shop?filter=size", icon: RulerIcon },
  { label: "Shop by Budget", href: "/shop?filter=budget", icon: TagIcon },
];

export function ShopByFilters() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
        {FILTERS.map(({ label, href, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 text-center text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            <Icon className="h-6 w-6" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
