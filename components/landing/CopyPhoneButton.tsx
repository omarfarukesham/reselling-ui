"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Phone } from "lucide-react";

// Click copies the number to the clipboard. Icon-only on mobile, full number from `sm` up.
export default function CopyPhoneButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // Clipboard API needs a secure context — fall back for plain-http previews
      const el = document.createElement("textarea");
      el.value = phone;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copy}
        aria-label={`নম্বর কপি করুন ${phone}`}
        title="ক্লিক করে নম্বর কপি করুন"
        className="group grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 sm:flex sm:w-auto sm:gap-1.5 sm:bg-transparent sm:px-2 sm:text-sm sm:font-medium sm:text-slate-600 sm:hover:bg-transparent sm:hover:text-brand-600"
      >
        {copied ? <Check className="h-5 w-5 text-emerald-600 sm:h-4 sm:w-4" /> : <Phone className="h-5 w-5 sm:h-4 sm:w-4" />}
        <span className="hidden tabular-nums sm:inline">{phone}</span>
        <Copy className="hidden h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 sm:block" />
      </button>

      <span
        role="status"
        className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg transition-opacity ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        {copied ? "নম্বর কপি হয়েছে!" : ""}
      </span>
    </div>
  );
}
