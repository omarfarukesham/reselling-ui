import Link from "next/link";
import {
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { product } from "@/lib/product";

export default function Footer() {
  const fbUrl = product.contact.facebook;

  return (
    <footer className="w-full bg-neutral-950 text-slate-400 pb-28 md:pb-12 border-t border-white/5">
      {/* Trust Highlights Strip */}
      <div className="border-b border-white/10 bg-neutral-900/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-white text-sm">ক্যাশ অন ডেলিভারি</p>
                <p className="text-xs text-slate-400">হাতে পেয়ে টাকা দিন</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-white text-sm">সারা দেশে ডেলিভারি</p>
                <p className="text-xs text-slate-400">৬৪ জেলাতেই পাঠাই</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <RotateCcw className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-white text-sm">সহজ এক্সচেঞ্জ</p>
                <p className="text-xs text-slate-400">সাইজ না মিললে বদলে নিন</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-white text-sm">যেকোনো দরকারে</p>
                <p className="text-xs text-slate-400">কল বা মেসেজ দিন</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand & Description */}
          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-black text-white text-base shadow-lg shadow-brand-600/30">
                EB
              </span>
              <span className="text-2xl font-black tracking-tight text-white">
                {product.brand}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-300 max-w-sm">
              {product.nameBn} — {product.subtitle}
            </p>

            {/* Official Facebook Page Card */}
            <div className="pt-2">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:border-blue-500/40 hover:bg-blue-500/10 max-w-sm"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1877F2] text-white shadow-md shadow-[#1877F2]/30 group-hover:scale-105 transition-transform">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                    আমাদের অফিসিয়াল ফেসবুক পেজ
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    facebook.com/profile.php?id=61568012606229
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              প্রয়োজনীয় লিংক
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#order"
                  className="hover:text-brand-400 transition-colors inline-block"
                >
                  অর্ডার করুন (Order Now)
                </Link>
              </li>
              <li>
                <Link
                  href="#offer"
                  className="hover:text-brand-400 transition-colors inline-block"
                >
                  কম্বো অফার
                </Link>
              </li>
              <li>
                <Link
                  href="#reviews"
                  className="hover:text-brand-400 transition-colors inline-block"
                >
                  কাস্টমার রিভিউ
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/login"
                  className="hover:text-brand-400 transition-colors inline-block text-slate-500"
                >
                  এডমিন লগইন
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 md:col-span-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              যোগাযোগ ও সহায়তা
            </p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${product.contact.phone}`}
                className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors group"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-brand-400 group-hover:bg-brand-500/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="font-semibold">{product.contact.phone}</span>
              </a>

              <a
                href={`mailto:${product.contact.email}`}
                className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors group"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </span>
                <span>{product.contact.email}</span>
              </a>

              <div className="flex items-start gap-2.5 text-slate-400">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-emerald-400 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-xs leading-relaxed">
                  ঢাকা, বাংলাদেশ। সারা দেশে হোম ডেলিভারি দেওয়া হয়।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {product.brand}. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>•</span>
            <span>হাতে পেয়ে টাকা</span>
            <span>•</span>
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Facebook Page
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
