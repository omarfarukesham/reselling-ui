import { CheckCircle2, Gift, RefreshCw, Star, Truck, Wallet } from "lucide-react";
import { comboFor, product } from "@/lib/product";
import { getRatingSummary } from "@/lib/api/reviews";
import { fmt } from "@/lib/utils";
import OrderButton from "@/components/ui/OrderButton";
import ProductGallery from "@/components/landing/ProductGallery";

const trustIcons = [Wallet, Truck, RefreshCw];

export default async function Hero() {
  const { price, oldPrice, currency } = product;
  // Real rating from published reviews; the numbers in lib/product.ts until the first one is published
  const real = await getRatingSummary();
  const rating = real ? { value: real.average, count: `${real.total}টি` } : product.rating;
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  const combo3 = comboFor(3);

  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-brand-50 via-brand-50 to-cream px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pt-14"
    >
      {/* soft background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />
        <div className="absolute -left-24 top-1/2 h-64 w-64 rounded-full bg-amber-50 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-7 lg:grid-cols-2 lg:gap-14">
        <ProductGallery discount={discount} />

        <div className="text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start">
            <span className="rounded-full bg-white px-3.5 py-1 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
              {product.badge}
            </span>
            <a href="#reviews" className="inline-flex items-center gap-1 text-sm text-slate-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-neutral-900">{rating.value}</span>({rating.count} রিভিউ)
            </a>
          </div>

          <h1 className="mt-4 text-[1.75rem] font-extrabold leading-[1.3] tracking-tight text-neutral-900 sm:text-[2.75rem] sm:leading-[1.2]">
            {product.tagline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{product.subtitle}</p>

          {/* Price */}
          <div className="mt-5 flex items-end justify-center gap-3 lg:justify-start">
            <span className="text-4xl font-extrabold leading-none text-neutral-900">
              {fmt(price)}
              <span className="text-2xl">{currency}</span>
            </span>
            <span className="text-xl leading-none text-slate-400 line-through">
              {fmt(oldPrice)}
              {currency}
            </span>
            <span className="text-sm font-semibold text-red-600">{fmt(oldPrice - price)}৳ কম</span>
          </div>

          {/* Combo strip */}
          <a
            href="#offer"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-white/80 px-4 py-2.5 text-left text-sm text-slate-700 shadow-sm"
          >
            <Gift className="h-5 w-5 shrink-0 text-brand-600" />
            <span>
              <span className="font-bold text-neutral-900">২টা নিলে ডেলিভারি ফ্রি</span>
              <span className="mx-1.5 text-slate-300">|</span>
              <span className="font-bold text-neutral-900">৩টা মাত্র {fmt(combo3.price)}{currency}</span>
            </span>
          </a>

          {/* block wrapper keeps the centred list and the CTA on separate lines */}
          <div className="mt-5">
            <ul className="inline-flex flex-col items-start gap-2.5 text-left text-[15px] text-slate-700 sm:text-base">
              {product.heroBullets.map((b) => (
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
            {product.trust.map((t, i) => {
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
