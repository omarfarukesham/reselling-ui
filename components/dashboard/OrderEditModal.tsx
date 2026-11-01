"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import type { IOrder, TDeliveryArea, TOrderStatus } from "@/lib/types";
import { fmt, isValidPhone } from "@/lib/utils";

interface OrderEditModalProps {
  order: IOrder | null;
  onClose: () => void;
  onSave: (orderId: string, updatedData: Partial<IOrder>) => Promise<void>;
}

export default function OrderEditModal({
  order,
  onClose,
  onSave,
}: OrderEditModalProps) {
  const [userName, setUserName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<TDeliveryArea>("insideDhaka");
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const [deliveryCharge, setDeliveryCharge] = useState(80);
  const [productColors, setProductColors] = useState("");
  const [orderStatus, setOrderStatus] = useState<TOrderStatus>("pending");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setUserName(order.userName || "");
      setMobileNumber(order.mobileNumber || "");
      setEmail(order.email || "");
      setDeliveryAddress(order.deliveryAddress || "");
      setDeliveryArea(order.deliveryArea || "insideDhaka");
      setPrice(order.price || 0);
      setQty(order.qty || 1);
      setDeliveryCharge(
        order.deliveryCharged !== undefined
          ? order.deliveryCharged
          : order.deliveryArea === "outsideDhaka"
          ? 120
          : 80
      );
      setProductColors((order.productColors || []).join(", "));
      setOrderStatus(order.orderStatus || "pending");
      setError(null);
    }
  }, [order]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handleDeliveryAreaChange = (newArea: TDeliveryArea) => {
    setDeliveryArea(newArea);
    // Auto set delivery charge recommendation
    setDeliveryCharge(newArea === "outsideDhaka" ? 120 : 80);
  };

  const calculatedTotal = price * qty + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!mobileNumber.trim() || !isValidPhone(mobileNumber.trim())) {
      setError("Please provide a valid 11-digit Bangladeshi mobile number (e.g. 01XXXXXXXXX).");
      return;
    }
    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }
    if (price < 0 || qty < 1) {
      setError("Please enter a valid price and quantity.");
      return;
    }

    setSaving(true);
    try {
      const colorsArray = productColors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload: Partial<IOrder> = {
        userName: userName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim() ? email.trim() : undefined,
        deliveryAddress: deliveryAddress.trim(),
        deliveryArea,
        deliveryCharged: deliveryCharge,
        deliveryCharge: deliveryCharge,
        price: Number(price),
        qty: Number(qty),
        productColors: colorsArray,
        orderStatus,
      };

      await onSave(order._id || order.orderId, payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8 border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Edit Order</h2>
            <p className="text-xs text-slate-500">
              Editing order ID: <span className="font-mono font-bold text-brand-700">{order.orderId || order._id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Customer Details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className={inputClass}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className={inputClass}
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              className={`${inputClass} resize-none`}
              placeholder="House, Road, Area, District"
            />
          </div>

          {/* Area & Status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Delivery Area</label>
              <select
                value={deliveryArea}
                onChange={(e) => handleDeliveryAreaChange(e.target.value as TDeliveryArea)}
                className={inputClass}
              >
                <option value="insideDhaka">Inside Dhaka (80৳)</option>
                <option value="outsideDhaka">Outside Dhaka (120৳)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as TOrderStatus)}
                className={inputClass}
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

          {/* Pricing & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Price (৳)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Delivery Charge (৳)</label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Product Colors (Comma separated)
            </label>
            <input
              type="text"
              value={productColors}
              onChange={(e) => setProductColors(e.target.value)}
              className={inputClass}
              placeholder="e.g. Red, Brown"
            />
          </div>

          {/* Total Preview */}
          <div className="rounded-2xl bg-brand-50/60 border border-brand-200/80 p-3.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Estimated Total (Recalculated on Server):</span>
            <span className="font-extrabold text-base text-brand-700">{fmt(calculatedTotal)}৳</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-xs"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

