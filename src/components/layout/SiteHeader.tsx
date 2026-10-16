import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";
import { MainNav } from "@/components/layout/MainNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { WishlistIconButton } from "@/components/layout/WishlistIconButton";
import { CartIconButton } from "@/components/layout/CartIconButton";
import { SettingsIcon, UserIcon } from "@/components/ui/icons";

export function SiteHeader() {
  return (
    <header className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/" aria-label={SITE.name} className="flex items-center">
            <Image
              src="/logo-gradient.png"
              alt={SITE.name}
              width={392}
              height={340}
              priority
              className="h-11 w-auto"
            />
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
          <Link
            href="/admin"
            aria-label="Admin panel"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
