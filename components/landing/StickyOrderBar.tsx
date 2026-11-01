"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { product } from "@/lib/product";
import { fmt } from "@/lib/utils";

// Mobile-only bottom bar. Slides away while the order form is on screen.
export default function StickyOrderBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("order");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "0px 0px -25% 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={hidden}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex gap-3">
        <a
          href={`https://wa.me/${product.contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp এ মেসেজ করুন"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white active:scale-95"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        <a
          href="#order"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 text-base font-bold text-white active:scale-[0.98]"
        >
          <ShoppingBag className="h-5 w-5" />
          অর্ডার করুন — {fmt(product.price)}
          {product.currency}
        </a>
      </div>
    </div>
  );
}
