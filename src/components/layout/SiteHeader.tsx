import Link from "next/link";
import { SITE } from "@/lib/constants";
import { MainNav } from "@/components/layout/MainNav";
import { CartIconButton } from "@/components/layout/CartIconButton";
import { IconButton } from "@/components/ui/IconButton";
import { SearchIcon, HeartIcon, UserIcon } from "@/components/ui/icons";

export function SiteHeader() {
  return (
    <header className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-wide text-primary">
          {SITE.name}
        </Link>

        <MainNav />

        <div className="flex items-center gap-1">
          <IconButton icon={<SearchIcon />} label="Search" />
          <IconButton icon={<HeartIcon />} label="Wishlist" />
          <IconButton icon={<UserIcon />} label="Account" />
          <CartIconButton />
        </div>
      </div>
    </header>
  );
}
