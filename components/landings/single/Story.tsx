import Image from "next/image";
import { Heart } from "lucide-react";
import type { SingleProduct } from "@/lib/landings/types";
import Section from "@/components/ui/Section";
import OrderButton from "@/components/ui/OrderButton";

// Optional problem → solution block: photo on one side, a short relatable story on the other.
export default function Story({ p }: { p: SingleProduct }) {
  const s = p.story;
  if (!s) return null;

  return (
    <Section id="story" className="bg-white py-14 sm:py-20">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          {/* soft offset frame behind the photo */}
          <div aria-hidden className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-brand-100" />
          <div className="relative aspect-square overflow-hidden rounded-[1.75rem] shadow-xl shadow-brand-200/50 ring-1 ring-black/5">
            <Image src={s.image} alt={s.imageAlt} fill sizes="(max-width: 768px) 100vw, 540px" className="object-cover" />
          </div>
        </div>

        <div className="text-center md:text-left">
          <span className="inline-block rounded-full bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
            {s.eyebrow}
          </span>
          <h2 className="mt-3 text-[1.625rem] font-bold leading-snug text-neutral-900 sm:text-4xl">{s.title}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{s.body}</p>

          <ul className="mt-5 inline-flex flex-col items-start gap-3 text-left">
            {s.points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-[15px] text-slate-700 sm:text-base">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </span>
                {pt}
              </li>
            ))}
          </ul>

          <div>
            <OrderButton className="mt-7 w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </Section>
  );
}
