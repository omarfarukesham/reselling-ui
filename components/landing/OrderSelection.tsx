"use client";

import { createContext, useContext, useState } from "react";
import { MAX_QTY, product, type ColorId } from "@/lib/product";

// Shared order state, so choices made anywhere on the page (gallery colour,
// combo cards) show up pre-selected in the order form.
//  - color:  colour shown in the hero gallery
//  - qty:    number of pieces (= chosen combo)
//  - pieces: colour of each piece, length === qty
type Selection = {
  color: ColorId;
  setColor: (c: ColorId) => void;
  qty: number;
  setQty: (n: number) => void;
  pieces: ColorId[];
  setPieceColor: (index: number, c: ColorId) => void;
};

const SelectionContext = createContext<Selection | null>(null);

// When a piece is added, suggest a colour the customer hasn't picked yet.
function nextColor(taken: ColorId[]): ColorId {
  return product.colors.find((c) => !taken.includes(c.id))?.id ?? taken[taken.length - 1];
}

export function OrderSelectionProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ColorId>(product.colors[0].id);
  const [pieces, setPieces] = useState<ColorId[]>([product.colors[0].id]);

  function setColor(c: ColorId) {
    setColorState(c);
    setPieces((p) => [c, ...p.slice(1)]);
  }

  function setQty(n: number) {
    const target = Math.min(Math.max(1, n), MAX_QTY);
    setPieces((p) => {
      const next = p.slice(0, target);
      while (next.length < target) next.push(nextColor(next));
      return next;
    });
  }

  function setPieceColor(index: number, c: ColorId) {
    setColorState(c);
    setPieces((p) => p.map((old, i) => (i === index ? c : old)));
  }

  return (
    <SelectionContext.Provider
      value={{ color, setColor, qty: pieces.length, setQty, pieces, setPieceColor }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useOrderSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useOrderSelection must be used inside <OrderSelectionProvider>");
  return ctx;
}

export function scrollToOrder() {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
