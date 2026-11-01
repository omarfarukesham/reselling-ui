"use client";

import Image from "next/image";
import { product, productImage } from "@/lib/product";
import { scrollToOrder, useOrderSelection } from "./OrderSelection";

// "Available in 3 colours" — tapping a card pre-selects that colour and jumps to the form.
export default function ColorCards() {
  const { color, setColor } = useOrderSelection();

  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:gap-5">
      {product.colors.map((c) => {
        const selected = color === c.id;
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                setColor(c.id);
                scrollToOrder();
              }}
              className={`group w-full overflow-hidden rounded-2xl bg-white text-center shadow-sm ring-2 transition ${
                selected ? "ring-brand-600" : "ring-slate-100 hover:ring-brand-200"
              }`}
            >
              <span className="relative block aspect-square">
                <Image
                  src={productImage(c.id, "front")}
                  alt={`${product.name} — ${c.name}`}
                  fill
                  sizes="(max-width: 640px) 33vw, 300px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </span>
              <span className="block px-1 pb-3 pt-2">
                <span className="flex items-center justify-center gap-1.5 text-[15px] font-bold text-neutral-900">
                  <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c.hex }} />
                  {c.nameBn}
                </span>
                <span className="mt-1.5 inline-block rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white sm:px-4 sm:text-sm">
                  অর্ডার করুন
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
