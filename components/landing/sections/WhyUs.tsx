import { RefreshCw, Sparkles, Truck, Wallet, type LucideIcon } from "lucide-react";
import { product } from "@/lib/product";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

const icons: Record<string, LucideIcon> = {
  quality: Sparkles,
  cod: Wallet,
  delivery: Truck,
  exchange: RefreshCw,
};

export default function WhyUs() {
  return (
    <Section id="why-us" className="bg-brand-50 py-14 sm:py-20">
      <SectionTitle eyebrow="Why Us" title="কেন আমাদের থেকে কিনবেন?" />

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {product.whyUs.map((w) => {
          const Icon = icons[w.icon] ?? Sparkles;
          return (
            <li key={w.title} className="rounded-2xl bg-white p-4 text-center shadow-sm sm:p-6">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-600">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-[15px] font-bold leading-snug text-neutral-900 sm:text-base">{w.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{w.desc}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
