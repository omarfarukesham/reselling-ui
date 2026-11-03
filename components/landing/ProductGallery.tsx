"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { colorById, product, productImage, type ColorId } from "@/lib/product";
import { useOrderSelection } from "./OrderSelection";

// Swipeable photo gallery (baby / front / back) + colour swatches.
export default function ProductGallery({ discount }: { discount: number }) {
  const { color, setColor } = useOrderSelection();
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const views = product.views;

  function goTo(i: number) {
    const el = scroller.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function selectColor(id: ColorId) {
    setColor(id);
    setActive(0);
    scroller.current?.scrollTo({ left: 0 });
  }

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-brand-200/40 ring-1 ring-black/5">
        <div
          ref={scroller}
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {views.map((v, i) => (
            <div key={v.id} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={productImage(color, v.id)}
                alt={`${product.name} — ${colorById(color).name}, ${v.label}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow">
          -{discount}% ছাড়
        </span>

        {/* Mobile: dots + current view label */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 sm:hidden">
          {views.map((v, i) => (
            <span
              key={v.id}
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-brand-600" : "w-2 bg-black/20"}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails (tablet/desktop) */}
      <div className="mt-3 hidden grid-cols-2 gap-3 sm:grid">
        {views.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={v.label}
            className={`relative aspect-square overflow-hidden rounded-2xl bg-white ring-2 transition ${
              i === active ? "ring-brand-600" : "ring-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={productImage(color, v.id)} alt="" fill sizes="180px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Colour swatches */}
      <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
        <span className="text-[15px] font-medium text-slate-600">
          রং: <span className="font-bold text-neutral-900">{colorById(color).name}</span>
        </span>
        <div className="flex gap-2.5" role="radiogroup" aria-label="রং বেছে নিন">
          {product.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={color === c.id}
              aria-label={c.name}
              onClick={() => selectColor(c.id)}
              className={`grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 transition ${
                color === c.id ? "ring-brand-600" : "ring-transparent hover:ring-slate-300"
              }`}
            >
              <span className="h-9 w-9 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c.hex }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
