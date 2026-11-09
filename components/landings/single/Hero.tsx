import { BadgeCheck, CheckCircle2, Truck, Wallet } from "lucide-react";
import type { SingleProduct } from "@/lib/landings/types";
import { fmt } from "@/lib/utils";
import OrderButton from "@/components/ui/OrderButton";
import Gallery from "./Gallery";

const trustIcons = [Wallet, Truck, BadgeCheck];

export default function Hero({ p }: { p: SingleProduct }) {
  const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);

  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-brand-50 via-brand-50 to-cream px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pt-14"
    >
      {/* soft background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute -left-24 top-1/2 h-64 w-64 rounded-full bg-amber-50 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-7 lg:grid-cols-2 lg:gap-14">
        <Gallery p={p} discount={discount} />

        <div className="text-center lg:text-left">
          <span className="rounded-full bg-white px-3.5 py-1 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            {p.badge}
          </span>

          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{p.name}</p>
          <h1 className="mt-2 text-[1.75rem] font-extrabold leading-[1.3] tracking-tight text-neutral-900 sm:text-[2.5rem] sm:leading-[1.2]">
            {p.headline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{p.subtitle}</p>

          {/* Price */}
          <div className="mt-5 flex items-end justify-center gap-3 lg:justify-start">
            <span className="text-4xl font-extrabold leading-none text-neutral-900">
              {fmt(p.price)}
              <span className="text-2xl">{p.currency}</span>
            </span>
            <span className="text-xl leading-none text-slate-400 line-through">
              {fmt(p.oldPrice)}
              {p.currency}
            </span>
            <span className="text-sm font-semibold text-red-600">{fmt(p.oldPrice - p.price)}৳ কম</span>
          </div>

          {p.freeDelivery && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-white/80 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm">
              <Truck className="h-5 w-5 shrink-0" />
              সারা বাংলাদেশে ডেলিভারি চার্জ ফ্রি
            </p>
          )}

          {/* block wrapper keeps the centred list and the CTA on separate lines */}
          <div className="mt-5">
            <ul className="inline-flex flex-col items-start gap-2.5 text-left text-[15px] text-slate-700 sm:text-base">
              {p.heroBullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <OrderButton className="mt-6 w-full sm:w-auto" />

          {/* Trust strip */}
          <ul className="mt-7 grid grid-cols-3 gap-2 sm:gap-4">
            {p.trust.map((t, i) => {
              const Icon = trustIcons[i % trustIcons.length];
              return (
                <li key={t} className="flex flex-col items-center gap-2 text-center">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-brand-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium leading-snug text-slate-700 sm:text-sm">{t}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
