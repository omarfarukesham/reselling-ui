import {
  RefreshCw,
  Sparkles,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
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
    <Section id="why-us" className="bg-white py-14 sm:py-20">
      <SectionTitle eyebrow="Why Us" title="কেন আমাদের থেকে নিবেন?" />

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {product.whyUs.map((w) => {
          const Icon = icons[w.icon] ?? Sparkles;
          return (
            <li
              key={w.title}
              className="rounded-2xl bg-brand-50/70 p-4 text-center ring-1 ring-brand-100 sm:p-6"
            >
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-[15px] font-bold leading-snug text-neutral-900 sm:text-base">
                {w.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {w.desc}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
