"use client";

import { createContext, useContext, useState } from "react";
import { product, type ColorId } from "@/lib/product";

// Colour picked anywhere on the page (hero, colour cards, order form) stays in sync,
// so a customer who chose "Brown" in the hero finds it pre-selected in the form.
type Selection = { color: ColorId; setColor: (c: ColorId) => void };

const SelectionContext = createContext<Selection | null>(null);

export function OrderSelectionProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState<ColorId>(product.colors[0].id);
  return <SelectionContext.Provider value={{ color, setColor }}>{children}</SelectionContext.Provider>;
}

export function useOrderSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useOrderSelection must be used inside <OrderSelectionProvider>");
  return ctx;
}

export function scrollToOrder() {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
