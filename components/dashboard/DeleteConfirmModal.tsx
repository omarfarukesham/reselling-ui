"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { IOrder } from "@/lib/types";
import { fmt } from "@/lib/utils";

interface DeleteConfirmModalProps {
  order: IOrder | null;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void>;
}

export default function DeleteConfirmModal({
  order,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(order._id || order.orderId);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Delete Order?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="my-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/60 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-bold text-neutral-900">{order.orderId || order._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-neutral-900">{order.userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone:</span>
            <span className="text-neutral-900">{order.mobileNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total:</span>
            <span className="font-bold text-brand-600">{fmt(total)}৳</span>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-xs"
          >
            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {deleting ? "Deleting..." : "Yes, Delete Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

