import {
  BadgeCheck,
  ExternalLink,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { SingleProduct } from "@/lib/landings/types";

// Same structure and look as the main (hoodie) landing footer, driven by the product data.
export default function Footer({ p }: { p: SingleProduct }) {
  const [first, second] = p.brand.split(" ");
  const fbLabel = p.contact.facebook.replace(/^https?:\/\/(www\.)?/, "");

  const highlights: { icon: LucideIcon; tone: string; title: string; desc: string }[] = [
    {
      icon: ShieldCheck,
      tone: "bg-brand-500/10 text-brand-400 ring-brand-500/20",
      title: "ক্যাশ অন ডেলিভারি",
      desc: "হাতে পেয়ে টাকা দিন",
    },
    {
      icon: Truck,
      tone: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
      title: p.freeDelivery ? "ডেলিভারি ফ্রি" : "সারা দেশে ডেলিভারি",
      desc: "৬৪ জেলাতেই পাঠাই",
    },
    {
      icon: BadgeCheck,
      tone: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
      title: "অরিজিনাল পণ্য",
      desc: "কোয়ালিটির গ্যারান্টি",
    },
    {
      icon: Headphones,
      tone: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
      title: "যেকোনো দরকারে",
      desc: "কল বা মেসেজ দিন",
    },
  ];

  const links = [
    { label: "অর্ডার করুন", href: "#order" },
    { label: "বৈশিষ্ট্য", href: "#features" },
    ...(p.specs ? [{ label: "মাপ ও বিস্তারিত", href: "#size" }] : []),
    { label: "কাস্টমার রিভিউ", href: "#reviews" },
  ];

  return (
    <footer className="w-full border-t border-white/5 bg-ink pb-28 text-slate-400 md:pb-12">
      {/* Trust highlights strip */}
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${h.tone}`}>
                  <h.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{h.title}</p>
                  <p className="text-xs text-slate-400">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand & description */}
          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-black text-white shadow-lg shadow-brand-600/30">
                {first?.[0]}
                {second?.[0]}
              </span>
              <span className="text-2xl font-black tracking-tight text-white">{p.brand}</span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-slate-300">
              {p.shortName}: {p.subtitle}
            </p>

            {/* Facebook page card */}
            <div className="pt-2">
              <a
                href={p.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1877F2] text-white shadow-md shadow-[#1877F2]/30 transition-transform group-hover:scale-105">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-xs font-bold text-white transition-colors group-hover:text-blue-400">
                    আমাদের অফিসিয়াল ফেসবুক পেজ
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </p>
                  <p className="truncate text-[11px] text-slate-400">{fbLabel}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3 md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">প্রয়োজনীয় লিংক</p>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-block transition-colors hover:text-brand-400">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 md:col-span-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white">যোগাযোগ ও সহায়তা</p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${p.contact.phone}`}
                className="group flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-brand-400 transition-colors group-hover:bg-brand-500/20">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="font-semibold">{p.contact.phone}</span>
              </a>

              <a
                href={`mailto:${p.contact.email}`}
                className="group flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-blue-400 transition-colors group-hover:bg-blue-500/20">
                  <Mail className="h-4 w-4" />
                </span>
                <span>{p.contact.email}</span>
              </a>

              <div className="flex items-start gap-2.5 text-slate-400">
                <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-xs leading-relaxed">ঢাকা, বাংলাদেশ। সারা দেশে হোম ডেলিভারি দেওয়া হয়।</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {p.brand}. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>•</span>
            <span>হাতে পেয়ে টাকা</span>
            <span>•</span>
            <a
              href={p.contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-blue-400 hover:underline"
            >
              Facebook Page
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
