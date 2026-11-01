"use client";

import { useEffect, useState } from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Printer,
  Copy,
  Check,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Ban,
  Tag,
} from "lucide-react";
import type { IOrder, TOrderStatus } from "@/lib/types";
import { fmt } from "@/lib/utils";

interface OrderDetailsModalProps {
  order: IOrder | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: TOrderStatus) => Promise<void>;
  onEdit: (order: IOrder) => void;
}

const statusBadgeStyles: Record<TOrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", label: "Pending" },
  confirm: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", label: "Confirmed" },
  onWay: { bg: "bg-sky-50 text-sky-700 border-sky-200", text: "text-sky-700", label: "On Way" },
  delivered: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", label: "Delivered" },
  return: { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700", label: "Returned" },
  cancel: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-700", label: "Cancelled" },
};

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  onEdit,
}: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const total =
    order.totalPrice ?? order.price * order.qty + (order.deliveryCharged ?? 0);
  const deliveryCharge =
    order.deliveryCharged !== undefined
      ? order.deliveryCharged
      : order.deliveryArea === "outsideDhaka"
      ? 120
      : 80;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderId || order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TOrderStatus;
    if (newStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(order._id || order.orderId, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8 border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-neutral-900">Order Details</h2>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                title="Click to copy order ID"
              >
                {order.orderId || order._id}
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
              </button>
            </div>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              Placed on {new Date(order.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Control Bar */}
        <div className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                statusBadgeStyles[order.orderStatus]?.bg || "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {statusBadgeStyles[order.orderStatus]?.label || order.orderStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="modal-status-select" className="text-xs font-medium text-slate-600">
              Change:
            </label>
            <select
              id="modal-status-select"
              value={order.orderStatus}
              onChange={handleStatusChange}
              disabled={updating}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="confirm">Confirm</option>
              <option value="onWay">On Way</option>
              <option value="delivered">Delivered</option>
              <option value="return">Return</option>
              <option value="cancel">Cancel</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Customer Information */}
          <div className="rounded-2xl border border-slate-200/80 p-5 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Customer Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs text-slate-400">Name</span>
                <span className="font-semibold text-neutral-900">{order.userName}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Phone Number</span>
                <a
                  href={`tel:${order.mobileNumber}`}
                  className="font-medium text-brand-600 hover:underline inline-flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-500" />
                  {order.mobileNumber}
                </a>
              </div>
              {order.email && (
                <div>
                  <span className="block text-xs text-slate-400">Email</span>
                  <a
                    href={`mailto:${order.email}`}
                    className="font-medium text-slate-700 hover:text-brand-600 inline-flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {order.email}
                  </a>
                </div>
              )}
              <div>
                <span className="block text-xs text-slate-400">Delivery Address</span>
                <p className="mt-0.5 text-slate-700 leading-snug flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </p>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Delivery Zone</span>
                <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {order.deliveryArea === "insideDhaka" ? "Inside Dhaka (80৳)" : "Outside Dhaka (120৳)"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Products */}
          <div className="rounded-2xl border border-slate-200/80 p-5 bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Order Summary
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Unit Price</span>
                  <span>{fmt(order.price)}৳</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity</span>
                  <span className="font-semibold text-neutral-900">{order.qty} pcs</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{fmt(order.price * order.qty)}৳</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span>{fmt(deliveryCharge)}৳</span>
                </div>

                {order.productColors && order.productColors.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-xs text-slate-400 mb-1.5">Selected Colors</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.productColors.map((c, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-semibold text-brand-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-base">
              <span className="font-bold text-neutral-900">Total Bill</span>
              <span className="font-extrabold text-xl text-brand-600">{fmt(total)}৳</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Order
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(order)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Edit Order
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

