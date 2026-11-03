import { Quote, Star } from "lucide-react";
import { product } from "@/lib/product";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Reviews() {
  return (
    <Section id="reviews" className="py-14 sm:py-20">
      <SectionTitle eyebrow="Customer Reviews" title="যারা নিয়েছেন, তারা কী বলছেন" />

      {/* Mobile: swipeable row (next card peeks in). Desktop: 3-column grid. */}
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {product.reviews.map((r) => (
          <li
            key={r.name}
            className="relative w-[85%] shrink-0 snap-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:w-auto"
          >
            <Quote aria-hidden className="absolute right-5 top-5 h-8 w-8 text-brand-100" />
            <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="mt-4 text-base leading-relaxed text-slate-700">“{r.text}”</blockquote>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                {r.name.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-neutral-900">{r.name}</p>
                <p className="text-sm text-slate-500">{r.location}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-xs text-slate-400 md:hidden">← পাশে সরিয়ে আরও দেখুন →</p>
    </Section>
  );
}
