"use client";

import { createContext, useContext, useState } from "react";

// Colour + quantity picked anywhere on the page (hero swatches, order form) stay in sync.
type Selection = {
  colorId: string;
  setColorId: (id: string) => void;
  qty: number;
  setQty: (n: number) => void;
};

const SelectionContext = createContext<Selection | null>(null);

export function SingleSelectionProvider({
  defaultColorId,
  children,
}: {
  defaultColorId: string;
  children: React.ReactNode;
}) {
  const [colorId, setColorId] = useState(defaultColorId);
  const [qty, setQty] = useState(1);
  return (
    <SelectionContext.Provider value={{ colorId, setColorId, qty, setQty }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSingleSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSingleSelection must be used inside <SingleSelectionProvider>");
  return ctx;
}
