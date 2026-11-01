import { Baby, CircleDot, Cloud, Footprints, Layers, ShieldCheck, type LucideIcon } from "lucide-react";
import { product } from "@/lib/product";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoPlayer from "@/components/landing/VideoPlayer";
import ColorCards from "@/components/landing/ColorCards";

const featureIcons: Record<string, LucideIcon> = {
  hood: Baby,
  fleece: Cloud,
  lining: Layers,
  wrap: ShieldCheck,
  feet: Footprints,
  snap: CircleDot,
};

export default function ProductDetails() {
  const { video, features } = product;

  return (
    <Section id="details" className="py-14 sm:py-20">
      <SectionTitle
        eyebrow="Product Details"
        title="কেন এই র‍্যাপটি বাবুর জন্য সেরা?"
        subtitle="শীতে নবজাতককে উষ্ণ, নিরাপদ ও আরামে রাখার জন্য বিশেষভাবে তৈরি"
      />

      {/* Video + features */}
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12">
        <div>
          <VideoPlayer src={video.src} poster={video.poster} title={video.title} duration={video.duration} />
          <p className="mt-3 text-center text-sm text-slate-500">{video.caption}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {features.map((f) => {
            const Icon = featureIcons[f.icon] ?? Baby;
            return (
              <li key={f.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-[15px] font-bold leading-snug text-neutral-900 sm:text-base">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Colours */}
      <div className="mt-14 sm:mt-20">
        <h3 className="text-center text-xl font-bold text-neutral-900 sm:text-2xl">
          {product.colors.length}টি রঙে পাওয়া যাচ্ছে
        </h3>
        <p className="mb-6 mt-1 text-center text-[15px] text-slate-600">পছন্দের রঙে ট্যাপ করে সরাসরি অর্ডার করুন</p>
        <div className="mx-auto max-w-3xl">
          <ColorCards />
        </div>
      </div>
    </Section>
  );
}
