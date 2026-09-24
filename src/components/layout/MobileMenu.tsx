"use client";

import Link from "next/link";
import { useState } from "react";
import { useCategories } from "@/lib/use-categories";
import { UTILITY_LINKS } from "@/lib/constants";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

const linkClasses = "block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted";

export function MobileMenu() {
  const categories = useCategories();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-background p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-serif text-lg font-semibold text-primary">Menu</p>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              <Link href="/new-arrivals" onClick={close} className={linkClasses}>
                New Arrivals
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={close}
                  className={linkClasses}
                >
                  {category.name}
                </Link>
              ))}

              <div className="my-2 border-t border-border-subtle" />

              {UTILITY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={close} className={linkClasses}>
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-border-subtle" />

              <Link href="/wishlist" onClick={close} className={linkClasses}>
                Wishlist
              </Link>
              <Link href="/orders" onClick={close} className={linkClasses}>
                Track My Order
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
