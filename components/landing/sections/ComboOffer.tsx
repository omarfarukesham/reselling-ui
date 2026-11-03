"use client";

import Image from "next/image";
import { Check, Truck } from "lucide-react";
import { product, productImage, regularPrice } from "@/lib/product";
import { fmt } from "@/lib/utils";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { scrollToOrder, useOrderSelection } from "@/components/landing/OrderSelection";

// Combo cards. Tapping one sets the quantity and jumps to the order form.
export default function ComboOffer() {
  const { qty, setQty } = useOrderSelection();
  const { combos, colors, currency } = product;

  return (
    <Section id="offer" className="bg-gradient-to-b from-cream via-brand-50 to-brand-100/70 py-14 sm:py-20">
      <SectionTitle
        eyebrow="Combo Offer"
        title="একসাথে বেশি নিলে খরচ কম"
        subtitle="২টা নিলে ডেলিভারি চার্জ লাগবে না, আর ৩টা পাবেন মাত্র ৯৯০ টাকায়"
      />

      <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3 sm:gap-5">
        {combos.map((c) => {
          const selected = qty === c.qty;
          const saved = regularPrice(c.qty) - c.price;
          const best = c.qty === combos[combos.length - 1].qty;
          return (
            <li key={c.qty}>
              <button
                type="button"
                onClick={() => {
                  setQty(c.qty);
                  scrollToOrder();
                }}
                className={`relative flex h-full w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-md shadow-brand-200/40 ring-2 transition sm:flex-col sm:p-6 sm:text-center ${
                  selected ? "ring-brand-600" : best ? "ring-brand-200 hover:ring-brand-400" : "ring-transparent hover:ring-brand-200"
                }`}
              >
                {c.tag && (
                  <span
                    className={`absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm sm:right-1/2 sm:translate-x-1/2 ${
                      best ? "bg-brand-600 text-white" : "bg-emerald-500 text-white"
                    }`}
                  >
                    {c.tag}
                  </span>
                )}

                {/* one small photo per piece, overlapping */}
                <span className="flex shrink-0 -space-x-5 sm:justify-center">
                  {Array.from({ length: c.qty }).map((_, i) => (
                    <span
                      key={i}
                      className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white ring-2 ring-white shadow-sm sm:h-20 sm:w-20"
                    >
                      <Image
                        src={productImage(colors[i % colors.length].id, "baby")}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-neutral-900">{c.title} নিলে</span>
                  <span className="mt-0.5 flex items-baseline gap-2 sm:justify-center">
                    <span className="text-2xl font-extrabold text-brand-600">
                      {fmt(c.price)}
                      {currency}
                    </span>
                    {saved > 0 && (
                      <span className="text-sm text-slate-400 line-through">
                        {fmt(regularPrice(c.qty))}
                        {currency}
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:justify-center">
                    {c.freeDelivery ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <Truck className="h-4 w-4" /> ডেলিভারি ফ্রি
                      </span>
                    ) : (
                      <span className="text-slate-500">+ ডেলিভারি চার্জ</span>
                    )}
                    {saved > 0 && <span className="font-semibold text-red-600">{fmt(saved)}৳ কম</span>}
                  </span>
                </span>

                <span
                  className={`hidden h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-bold sm:mt-auto sm:inline-flex ${
                    selected ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {selected && <Check className="h-4 w-4" />}
                  {selected ? "বাছাই করা হয়েছে" : "এটা নিব"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
