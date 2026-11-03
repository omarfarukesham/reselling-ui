import { product } from "@/lib/product";
import Section from "@/components/ui/Section";

// Overlaps the bottom of the hero for a layered look.
export default function Stats() {
  return (
    <Section className="relative z-10 -mt-8 bg-cream sm:-mt-10" innerClassName="max-w-4xl">
      <dl className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white py-5 text-center shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 sm:py-7">
        {product.stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse gap-1 px-2">
            <dt className="text-xs leading-snug text-slate-500 sm:text-sm">{s.label}</dt>
            <dd className="text-2xl font-extrabold text-brand-600 sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
