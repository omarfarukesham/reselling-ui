"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { fmt } from "@/lib/utils";
import type { MenuItem } from "@/lib/landings/menu";

// "আরও পণ্য" dropdown listing every product page; the page you're on is marked.
// variant "desktop": text + chevron, sits with the nav links.
// variant "mobile":  icon button, sits with the header actions.
export default function ProductsMenu({
  items,
  currentHref,
  variant,
}: {
  items: MenuItem[];
  currentHref: string;
  variant: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    // Mobile: no `relative` here, so the panel is positioned against the sticky header
    // and spans the screen width instead of hanging off the small icon.
    <div ref={root} className={variant === "desktop" ? "relative" : ""}>
      {variant === "desktop" ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex items-center gap-1 transition-colors hover:text-brand-600 ${open ? "text-brand-600" : ""}`}
        >
          আরও পণ্য
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label="আরও পণ্য"
          onClick={() => setOpen((o) => !o)}
          className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
            open ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
          }`}
        >
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>
      )}

      {open && (
        <div
          id={menuId}
          className={`absolute top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white p-2 text-left shadow-xl shadow-slate-900/10 ring-1 ring-slate-100 ${
            variant === "desktop" ? "left-1/2 mt-3 w-80 -translate-x-1/2" : "inset-x-4"
          }`}
        >
          <p className="px-3 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            আমাদের সব পণ্য
          </p>
          <ul>
            {items.map((item) => {
              const current = item.href === currentHref;
              const body = (
                <>
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-neutral-900">{item.title}</span>
                    <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-600">
                        {fmt(item.price)}
                        {item.currency}
                      </span>
                      {current && (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          এখন দেখছেন
                        </span>
                      )}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={item.href}>
                  {current ? (
                    <div aria-current="page" className="flex items-center gap-3 rounded-xl bg-brand-50/70 p-2">
                      {body}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none"
                    >
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
