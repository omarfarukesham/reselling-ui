"use client";

import Link from "next/link";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { clientLogout, getClientEmail, getClientRole } from "@/lib/auth";
import { product } from "@/lib/product";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getClientEmail());
    setRole(getClientRole());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-lg text-neutral-900 tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm shadow-sm">
              EB
            </span>
            <span>
              {product.brand} <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Admin</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
          >
            Visit Store <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {email && (
            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-medium text-slate-700">{email}</span>
              {role && (
                <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  {role}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={clientLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-xs"
            title="Log out of admin dashboard"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
