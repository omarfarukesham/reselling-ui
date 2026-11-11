"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Clock, Info, Loader2, PackageSearch, RefreshCw, Search, Star, X, XCircle } from "lucide-react";
import { getMyOrders } from "@/lib/api/orders";
import type { TReviewStatus, TrackedOrder, TrackedOrderStatus } from "@/lib/types";
import ReviewModal from "./ReviewModal";
import { product } from "@/lib/product";
import { fmt, isValidPhone, normalizePhone } from "@/lib/utils";

const statusLabel: Record<TrackedOrderStatus, string> = {
  pending: "অপেক্ষমাণ",
  confirm: "কনফার্মড",
  onWay: "পথে আছে",
  delivered: "ডেলিভারি সম্পন্ন",
  return: "রিটার্ন",
  cancel: "বাতিল",
};

const statusStyles: Record<TrackedOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirm: "bg-blue-100 text-blue-700",
  onWay: "bg-sky-100 text-sky-700",
  delivered: "bg-emerald-100 text-emerald-700",
  return: "bg-violet-100 text-violet-700",
  cancel: "bg-red-100 text-red-700",
};

// Pending → Confirm → On Way → Delivered. "cancel" / "return" leave this path and are shown as a note.
const steps: { status: TrackedOrderStatus; label: string }[] = [
  { status: "pending", label: "অপেক্ষমাণ" },
  { status: "confirm", label: "কনফার্ম" },
  { status: "onWay", label: "পথে আছে" },
  { status: "delivered", label: "ডেলিভারি" },
];

const offPathNote: Partial<Record<TrackedOrderStatus, string>> = {
  cancel: "এই অর্ডারটি বাতিল করা হয়েছে। কোনো প্রশ্ন থাকলে আমাদের কল করুন।",
  return: "এই অর্ডারটি রিটার্ন করা হয়েছে। বিস্তারিত জানতে আমাদের কল করুন।",
};

const areaLabel = {
  insideDhaka: product.delivery.inside.label,
  outsideDhaka: product.delivery.outside.label,
};

// Shown on an order card once the customer has reviewed it
const reviewStatusInfo: Record<TReviewStatus, { label: string; style: string }> = {
  pending: { label: "আপনার রিভিউ যাচাই করা হচ্ছে", style: "bg-amber-50 text-amber-700" },
  published: { label: "আপনার রিভিউ সাইটে প্রকাশিত হয়েছে", style: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "আপনার রিভিউটি প্রকাশ করা হয়নি", style: "bg-slate-100 text-slate-600" },
};

const NO_ORDER_MSG = "এই মোবাইল নম্বরে আপনার কোনো অর্ডার পাওয়া যায়নি";
const REFRESHED_MSG = "অর্ডারের সর্বশেষ অবস্থা দেখানো হচ্ছে";

const formatTime = (d: Date) => d.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });

// Some records come back without totalPrice — rebuild it from price, qty and delivery charge
const orderTotal = (o: TrackedOrder) => o.totalPrice ?? (o.price ?? 0) * (o.qty ?? 1) + (o.deliveryCharged ?? 0);

// Navbar "My Order" button + the lookup modal it opens. The modal widens once orders are found.
export default function MyOrdersModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [found, setFound] = useState<{ mobile: string; orders: TrackedOrder[]; fetchedAt: Date } | null>(null);
  const [toast, setToast] = useState("");
  const [reviewing, setReviewing] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const open = () => {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  };
  const close = () => dialogRef.current?.close();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      inputRef.current?.focus();
      return;
    }
    lookup(normalizePhone(phone));
  }

  // Shared by the search form and the refresh button
  async function lookup(mobile: string, isRefresh = false) {
    setLoading(true);
    setRefreshing(isRefresh);
    setFailed(false);
    setToast("");
    try {
      const orders = await getMyOrders(mobile);
      if (orders.length > 0) {
        setFound({ mobile, orders, fetchedAt: new Date() });
        if (isRefresh) setToast(REFRESHED_MSG);
      } else {
        setFound(null);
        setToast(NO_ORDER_MSG);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // After a successful review, show it on the card without reloading
  function markReviewed(orderId: string, rating: number, comment: string) {
    setFound((f) =>
      f && {
        ...f,
        orders: f.orders.map((o) =>
          o.orderId === orderId ? { ...o, isReviewed: true, review: { rating, comment, status: "pending" } } : o,
        ),
      },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 sm:flex sm:w-auto sm:gap-1.5 sm:px-4 sm:text-sm sm:font-semibold sm:text-brand-700"
      >
        <PackageSearch className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only">আমার অর্ডার</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="my-orders-title"
        // click on the dimmed backdrop closes it
        onClick={(e) => e.target === e.currentTarget && close()}
        className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-3xl bg-white p-0 text-neutral-900 shadow-2xl transition-[max-width] duration-300 backdrop:bg-neutral-900/50 backdrop:backdrop-blur-sm ${
          found ? "max-w-3xl" : "max-w-md"
        }`}
      >
        {/* Toast — fixed to the viewport, rendered inside the dialog so it sits above the backdrop */}
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed inset-x-4 top-4 z-20 mx-auto flex max-w-sm items-start gap-2.5 rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-xl transition-all duration-300 ${
            toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          {toast}
        </div>

        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-start gap-3 border-b border-slate-100 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <PackageSearch className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="my-orders-title" className="text-lg font-bold">
                আমার অর্ডার
              </h2>
              <p className="text-sm text-slate-500">অর্ডার করার সময় দেওয়া মোবাইল নম্বরটি দিন</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="বন্ধ করুন"
              className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="overflow-y-auto p-5">
            <form onSubmit={handleSubmit} noValidate className={found ? "sm:max-w-md" : undefined}>
              <label htmlFor="track-phone" className="mb-1.5 block text-sm font-semibold text-neutral-900">
                মোবাইল নম্বর
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="track-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "track-phone-error" : undefined}
                  className={`block h-12 min-w-0 flex-1 rounded-xl border bg-white px-4 text-base outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
                    error
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                      : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/15"
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-4 font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
                >
                  {loading && !refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  খুঁজুন
                </button>
              </div>
              {error && (
                <p id="track-phone-error" className="mt-1.5 text-sm text-red-600">
                  {error}
                </p>
              )}
            </form>

            {failed && (
              <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                কিছু একটা সমস্যা হয়েছে, একটু পরে আবার চেষ্টা করুন।
              </p>
            )}

            {found && (
              <section aria-label="অর্ডারের তালিকা" className={`mt-5 transition-opacity ${loading ? "opacity-50" : ""}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 text-sm text-slate-500">
                    <p>
                      <span className="font-semibold text-neutral-900">{found.mobile}</span> নম্বরে {found.orders.length}টি
                      অর্ডার পাওয়া গেছে
                    </p>
                    <p className="text-xs text-slate-400">সর্বশেষ আপডেট: {formatTime(found.fetchedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => lookup(found.mobile, true)}
                    disabled={loading}
                    aria-label="অর্ডারের অবস্থা রিফ্রেশ করুন"
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 transition-colors hover:bg-brand-100 disabled:opacity-60"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    রিফ্রেশ
                  </button>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {found.orders.map((o) => (
                    <OrderCard key={o._id} order={o} onReview={() => setReviewing(o)} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Review form opens on top of this dialog */}
        <ReviewModal
          key={reviewing?.orderId ?? "closed"}
          order={reviewing}
          mobile={found?.mobile ?? ""}
          onClose={() => setReviewing(null)}
          onSubmitted={markReviewed}
        />
      </dialog>
    </>
  );
}

function OrderCard({ order: o, onReview }: { order: TrackedOrder; onReview: () => void }) {
  const current = steps.findIndex((s) => s.status === o.orderStatus);
  const canReview = o.orderStatus === "delivered" && !o.isReviewed;
  const reviewInfo = o.isReviewed ? reviewStatusInfo[o.review?.status ?? "pending"] : null;
  const colors = o.productColors ?? [];
  const note = offPathNote[o.orderStatus];

  return (
    <li className="flex flex-col rounded-2xl p-4 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">#{o.orderId}</p>
          {o.createdAt && <p className="text-xs text-slate-500">{formatDate(o.createdAt)}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusStyles[o.orderStatus] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {statusLabel[o.orderStatus] ?? o.orderStatus}
        </span>
      </div>

      {current >= 0 ? (
        <ol className="mt-4 flex items-start">
          {steps.map((s, i) => {
            const done = i <= current;
            return (
              <li key={s.status} className="relative flex flex-1 flex-col items-center text-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${done ? "bg-brand-500" : "bg-slate-200"}`}
                  />
                )}
                <span
                  className={`relative z-10 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                    done ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`mt-1.5 text-xs ${done ? "font-semibold text-neutral-900" : "text-slate-400"}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        note && (
          <p
            className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${
              o.orderStatus === "cancel" ? "bg-red-50 text-red-700" : "bg-violet-50 text-violet-700"
            }`}
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {note}
          </p>
        )
      )}

      <dl className="mb-3 mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
        <Row label="নাম" value={o.userName} />
        <Row
          label={colors.length > 0 ? "রং × পরিমাণ" : "পরিমাণ"}
          value={`${colors.length > 0 ? `${colors.join(", ")} × ` : ""}${o.qty}`}
        />
        <Row label="দাম" value={`${fmt(o.price)}${product.currency} × ${o.qty}`} />
        <Row
          label="ডেলিভারি"
          value={`${areaLabel[o.deliveryArea] ?? o.deliveryArea}${
            o.deliveryCharged === 0
              ? " (ফ্রি)"
              : o.deliveryCharged != null
                ? ` (${fmt(o.deliveryCharged)}${product.currency})`
                : ""
          }`}
        />
        <Row label="ঠিকানা" value={o.deliveryAddress} />
      </dl>
      <div className="mt-auto flex justify-between gap-4 border-t border-slate-100 pt-3 text-sm">
        <span className="font-semibold text-neutral-900">সর্বমোট</span>
        <span className="text-base font-bold text-brand-600">
          {fmt(orderTotal(o))}
          {product.currency}
        </span>
      </div>

      {/* Review: only delivered orders, once per order */}
      {canReview && (
        <button
          type="button"
          onClick={onReview}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-sm font-bold text-neutral-900 transition-colors hover:bg-amber-300"
        >
          <Star className="h-4 w-4 fill-current" />
          রিভিউ লিখুন
        </button>
      )}
      {reviewInfo && (
        <p className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${reviewInfo.style}`}>
          {o.review?.status === "published" ? <Check className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
          {reviewInfo.label}
        </p>
      )}
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}
