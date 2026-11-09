"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { SingleProduct } from "@/lib/landings/types";
import { useSingleSelection } from "./Selection";

// Swipeable photo gallery + colour swatches. Picking a colour jumps to its photo.
export default function Gallery({ p, discount }: { p: SingleProduct; discount: number }) {
  const { colorId, setColorId } = useSingleSelection();
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const color = p.colors.find((c) => c.id === colorId) ?? p.colors[0];

  function goTo(i: number) {
    const el = scroller.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function selectColor(id: string) {
    setColorId(id);
    const img = p.colors.find((c) => c.id === id)?.image;
    const i = p.images.findIndex((x) => x.src === img);
    if (i >= 0) goTo(i);
  }

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-brand-200/40 ring-1 ring-black/5">
        <div
          ref={scroller}
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {p.images.map((img, i) => (
            <div key={img.src} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow">
            -{discount}% ছাড়
          </span>
        )}

        {/* Mobile: dots */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 sm:hidden">
          {p.images.map((img, i) => (
            <span
              key={img.src}
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-brand-600" : "w-2 bg-black/20"}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails (tablet/desktop) */}
      <div className="mt-3 hidden grid-cols-3 gap-3 sm:grid">
        {p.images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={img.alt}
            className={`relative aspect-square overflow-hidden rounded-2xl bg-white ring-2 transition ${
              i === active ? "ring-brand-600" : "ring-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={img.src} alt="" fill sizes="180px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Colour swatches */}
      <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
        <span className="text-[15px] font-medium text-slate-600">
          রং: <span className="font-bold text-neutral-900">{color.name}</span>
        </span>
        <div className="flex gap-2.5" role="radiogroup" aria-label="রং বেছে নিন">
          {p.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={colorId === c.id}
              aria-label={c.name}
              onClick={() => selectColor(c.id)}
              className={`grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 transition ${
                colorId === c.id ? "ring-brand-600" : "ring-transparent hover:ring-slate-300"
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
