"use client";

import { Clock, CheckCircle2, Truck, Package, DollarSign, AlertCircle } from "lucide-react";
import type { IOrder, TOrderStatus } from "@/lib/types";
import { fmt } from "@/lib/utils";

interface OrderStatsCardsProps {
  orders: IOrder[];
  totalFromMeta?: number;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export default function OrderStatsCards({
  orders,
  totalFromMeta,
  activeStatus,
  onSelectStatus,
}: OrderStatsCardsProps) {
  // Aggregate stats from current set of orders
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const inProgressCount = orders.filter(
    (o) => o.orderStatus === "confirm" || o.orderStatus === "onWay"
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;
  const cancelReturnCount = orders.filter(
    (o) => o.orderStatus === "cancel" || o.orderStatus === "return"
  ).length;

  // Calculate revenue from delivered or confirmed orders
  const totalRevenue = orders.reduce((acc, curr) => {
    if (curr.orderStatus !== "cancel") {
      const sum =
        curr.totalPrice ?? (curr.price * curr.qty + (curr.deliveryCharged ?? 0));
      return acc + (Number(sum) || 0);
    }
    return acc;
  }, 0);

  const stats = [
    {
      id: "all",
      label: "Total Orders",
      value: totalFromMeta !== undefined ? totalFromMeta : orders.length,
      icon: Package,
      color: "text-slate-700 bg-slate-100",
      activeRing: "ring-2 ring-slate-800",
      filterValue: "",
    },
    {
      id: "pending",
      label: "Pending Orders",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      activeRing: "ring-2 ring-amber-500",
      filterValue: "pending",
    },
    {
      id: "inProgress",
      label: "In Progress",
      value: inProgressCount,
      icon: Truck,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      activeRing: "ring-2 ring-blue-500",
      filterValue: "confirm",
    },
    {
      id: "delivered",
      label: "Delivered",
      value: deliveredCount,
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      activeRing: "ring-2 ring-emerald-500",
      filterValue: "delivered",
    },
    {
      id: "revenue",
      label: "Est. Revenue",
      value: `${fmt(totalRevenue)}৳`,
      icon: DollarSign,
      color: "text-brand-700 bg-brand-50 border-brand-200",
      activeRing: "",
      filterValue: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-6">
      {stats.map((s) => {
        const Icon = s.icon;
        const isSelected = s.filterValue !== null && activeStatus === s.filterValue;

        return (
          <button
            key={s.id}
            type="button"
            disabled={s.filterValue === null}
            onClick={() => {
              if (s.filterValue !== null) {
                onSelectStatus(isSelected ? "" : s.filterValue);
              }
            }}
            className={`relative flex flex-col justify-between rounded-2xl bg-white p-4 text-left shadow-xs transition-all border border-slate-200/80 hover:shadow-sm ${
              isSelected ? s.activeRing : ""
            } ${s.filterValue === null ? "cursor-default" : "cursor-pointer hover:border-slate-300"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {s.label}
              </span>
              <span className={`grid h-8 w-8 place-items-center rounded-xl ${s.color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {s.value}
              </div>
              {s.filterValue !== null && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {isSelected ? "Filter active (click to clear)" : "Click to filter"}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

