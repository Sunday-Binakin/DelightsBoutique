"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine {
  slug: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  addItem: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeLine: (slug: string, size?: string, color?: string) => void;
  setQuantity: (slug: string, quantity: number, size?: string, color?: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "delight-boutique-cart";

function sameLine(a: CartLine, b: { slug: string; size?: string; color?: string }) {
  return a.slug === b.slug && a.size === b.size && a.color === b.color;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage, deliberately deferred to an
    // effect so the client's first render matches the server's (empty)
    // render before swapping in the persisted cart.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Ignore corrupt/blocked storage — cart just starts empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage may be full or blocked (private browsing) — cart still works in-memory.
    }
  }, [lines, hydrated]);

  const addItem: CartContextValue["addItem"] = ({ quantity = 1, ...rest }) => {
    setLines((prev) => {
      const existing = prev.find((line) => sameLine(line, rest));
      if (existing) {
        return prev.map((line) =>
          sameLine(line, rest) ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }
      return [...prev, { ...rest, quantity }];
    });
  };

  const removeLine: CartContextValue["removeLine"] = (slug, size, color) => {
    setLines((prev) => prev.filter((line) => !sameLine(line, { slug, size, color })));
  };

  const setQuantity: CartContextValue["setQuantity"] = (slug, quantity, size, color) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((line) => !sameLine(line, { slug, size, color }));
      return prev.map((line) =>
        sameLine(line, { slug, size, color }) ? { ...line, quantity } : line,
      );
    });
  };

  const clear = () => setLines([]);

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, itemCount, addItem, removeLine, setQuantity, clear }),
    [lines, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
