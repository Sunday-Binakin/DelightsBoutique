import Link from "next/link";
import { NAV_LINKS, MORE_LINKS } from "@/lib/constants";
import { ChevronDownIcon } from "@/components/ui/icons";

export function MainNav() {
  return (
    <nav className="hidden items-center gap-6 lg:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
          More
          <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-lg border border-border-subtle bg-background py-2 shadow-lg">
          {MORE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
