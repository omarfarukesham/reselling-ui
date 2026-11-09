import Image from "next/image";
import type { SingleProduct } from "@/lib/landings/types";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

// Size photo + a plain spec table
export default function Specs({ p }: { p: SingleProduct }) {
  return (
    <Section id="size" className="bg-white py-14 sm:py-20">
      <SectionTitle eyebrow="Size & Details" title="মাপ ও বিস্তারিত" subtitle="অর্ডারের আগে মাপটা মিলিয়ে নিন" />

      <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
          <Image src={p.specs.image} alt="র‍্যাকের মাপ" fill sizes="(max-width: 768px) 100vw, 440px" className="object-contain" />
        </div>

        <dl className="divide-y divide-brand-100 overflow-hidden rounded-3xl bg-brand-50/70 ring-1 ring-brand-100">
          {p.specs.rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-5 py-3.5 text-[15px]">
              <dt className="text-slate-600">{r.label}</dt>
              <dd className="text-right font-semibold text-neutral-900">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
