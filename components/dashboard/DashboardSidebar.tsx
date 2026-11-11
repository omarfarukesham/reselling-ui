"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquareText, ShoppingBag, type LucideIcon } from "lucide-react";
import { getClientToken } from "@/lib/auth";
import { REVIEWS_CHANGED_EVENT, getAdminReviews } from "@/lib/api/reviews";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

// Left sidebar on desktop, a scrollable tab row on mobile.
export default function DashboardSidebar() {
  const pathname = usePathname();
  const [pending, setPending] = useState(0);

  // Pending-review badge: refresh on navigation and whenever the reviews page changes something
  useEffect(() => {
    const load = () => {
      const token = getClientToken();
      if (!token) return;
      getAdminReviews(token, { status: "pending", page: 1, limit: 1 })
        .then((r) => setPending(r.meta.total))
        .catch(() => {});
    };
    load();
    window.addEventListener(REVIEWS_CHANGED_EVENT, load);
    return () => window.removeEventListener(REVIEWS_CHANGED_EVENT, load);
  }, [pathname]);

  const items: NavItem[] = [
    { href: "/dashboard", label: "Orders Management", icon: ShoppingBag },
    { href: "/dashboard/reviews", label: "Customer Reviews", icon: MessageSquareText, badge: pending },
  ];

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* Mobile / tablet: tab row under the header */}
      <nav aria-label="Dashboard" className="no-scrollbar flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
        {items.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} compact />
        ))}
      </nav>

      {/* Desktop: sticky left sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <nav aria-label="Dashboard" className="sticky top-20 space-y-1 p-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Manage</p>
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2.5 rounded-xl font-semibold transition-colors ${
        compact ? "px-3 py-2 text-xs" : "px-3 py-2.5 text-sm"
      } ${active ? "bg-neutral-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
      {!!item.badge && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
            active ? "bg-amber-400 text-neutral-900" : "bg-amber-100 text-amber-800"
          }`}
          title={`${item.badge} pending`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
