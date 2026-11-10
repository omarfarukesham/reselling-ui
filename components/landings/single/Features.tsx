import {
  Eye,
  Gem,
  Grid3x3,
  House,
  Layers,
  Minimize2,
  Palette,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { SingleProduct } from "@/lib/landings/types";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

const icons: Record<string, LucideIcon> = {
  frame: ShieldCheck,
  finish: Sparkles,
  design: Palette,
  layers: Layers,
  home: House,
  space: Minimize2,
  grid: Grid3x3,
  view: Eye,
  premium: Gem,
};

export default function Features({ p }: { p: SingleProduct }) {
  return (
    <Section id="features" className="bg-gradient-to-b from-cream to-white py-14 sm:py-20">
      <SectionTitle eyebrow="Features" title={p.featuresTitle} />

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {p.features.map((f) => {
          const Icon = icons[f.icon] ?? Sparkles;
          return (
            <li key={f.title} className="rounded-2xl bg-brand-50/70 p-4 ring-1 ring-brand-100 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-[15px] font-bold leading-snug text-neutral-900 sm:text-base">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </li>
          );
        })}
      </ul>

      <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100 sm:text-base">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        {p.guarantee}
      </p>
    </Section>
  );
}
