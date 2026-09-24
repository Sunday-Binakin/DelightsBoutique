import Link from "next/link";
import { SITE } from "@/lib/constants";
import { MainNav } from "@/components/layout/MainNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { WishlistIconButton } from "@/components/layout/WishlistIconButton";
import { CartIconButton } from "@/components/layout/CartIconButton";
import { UserIcon } from "@/components/ui/icons";

export function SiteHeader() {
  return (
    <header className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/" className="font-serif text-xl font-semibold tracking-wide text-primary">
            {SITE.name}
          </Link>
        </div>

        <MainNav />

        <div className="flex items-center gap-1">
          <SearchOverlay />
          <WishlistIconButton />
          <Link
            href="/orders"
            aria-label="Track my order"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <CartIconButton />
        </div>
      </div>
    </header>
  );
}
