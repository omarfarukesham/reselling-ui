"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquareText,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { getClientToken } from "@/lib/auth";
import {
  deleteReview,
  getAdminReviewCounts,
  getAdminReviews,
  notifyReviewsChanged,
  updateReviewStatus,
} from "@/lib/api/reviews";
import type { AdminReview, PaginationMeta, TReviewStatus } from "@/lib/types";

type Filter = TReviewStatus | "";
type Counts = Record<TReviewStatus | "all", number>;

const statusMeta: Record<TReviewStatus, { label: string; badge: string; icon: typeof Clock }> = {
  pending: { label: "Pending", badge: "bg-amber-100 text-amber-800", icon: Clock },
  published: { label: "Published", badge: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", badge: "bg-slate-200 text-slate-700", icon: Ban },
};

const filterTabs: { value: Filter; label: string; countKey: keyof Counts; tone: string }[] = [
  { value: "pending", label: "Pending", countKey: "pending", tone: "text-amber-600" },
  { value: "published", label: "Published", countKey: "published", tone: "text-emerald-600" },
  { value: "rejected", label: "Rejected", countKey: "rejected", tone: "text-slate-500" },
  { value: "", label: "All Reviews", countKey: "all", tone: "text-neutral-900" },
];

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPage: 1 });
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  // Pending first: that's the moderation queue
  const [status, setStatus] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminReview | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast((t) => (t?.message === message ? null : t)), 4000);
  };

  const fetchReviews = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;
    setLoading(true);
    const [sortBy, sortOrder] = sort.split(":") as [string, "asc" | "desc"];
    try {
      const [list, c] = await Promise.all([
        getAdminReviews(token, { status, search: search.trim() || undefined, page, limit, sortBy, sortOrder }),
        getAdminReviewCounts(token),
      ]);
      setReviews(list.reviews);
      setMeta(list.meta);
      setCounts(c);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [status, search, sort, page, limit]);

  // Debounced so typing in search doesn't fire a request per key
  useEffect(() => {
    const t = setTimeout(fetchReviews, 300);
    return () => clearTimeout(t);
  }, [fetchReviews]);

  async function changeStatus(r: AdminReview, next: TReviewStatus) {
    const token = getClientToken();
    if (!token) return;
    setBusyId(r._id);
    try {
      await updateReviewStatus(token, r._id, next);
      showToast(
        next === "published"
          ? `Review by ${r.customerName} is now live on the website`
          : `Review by ${r.customerName} marked as ${statusMeta[next].label.toLowerCase()}`,
      );
      notifyReviewsChanged();
      await fetchReviews();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update review", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    const r = toDelete;
    const token = getClientToken();
    if (!r || !token) return;
    setBusyId(r._id);
    try {
      await deleteReview(token, r._id);
      showToast("Review deleted. The customer can review that order again.");
      setToDelete(null);
      notifyReviewsChanged();
      // Step back a page if this was the last item on it
      if (reviews.length === 1 && page > 1) setPage(page - 1);
      else await fetchReviews();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete review", "error");
    } finally {
      setBusyId(null);
    }
  }

  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);
  const totalPage = Math.max(1, meta.totalPage || 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">Customer Reviews</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Customers review delivered orders from the website. Publish a review to show it on the landing page (it
          appears within about a minute).
        </p>
      </div>

      {toast && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-sm ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status cards double as filters */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filterTabs.map((t) => {
          const active = status === t.value;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setStatus(t.value);
                setPage(1);
              }}
              aria-pressed={active}
              className={`rounded-2xl border bg-white p-4 text-left shadow-xs transition-all ${
                active ? "border-neutral-900 ring-2 ring-neutral-900" : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-semibold text-slate-500">{t.label}</p>
              <p className={`mt-1 text-2xl font-extrabold ${t.tone}`}>{counts ? counts[t.countKey] : "–"}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, order ID or comment…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-neutral-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Sort reviews"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="rating:desc">Rating: High to Low</option>
            <option value="rating:asc">Rating: Low to High</option>
          </select>
          <button
            type="button"
            onClick={fetchReviews}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh reviews"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {loading && reviews.length === 0 ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {search ? "No reviews match your search" : status === "pending" ? "No reviews waiting for approval" : "No reviews here yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Customers can review an order once it is marked as delivered.
            </p>
          </div>
        ) : (
          <ul className={`divide-y divide-slate-100 transition-opacity ${loading ? "opacity-60" : ""}`}>
            {reviews.map((r) => (
              <ReviewRow
                key={r._id}
                review={r}
                busy={busyId === r._id}
                onStatus={(s) => changeStatus(r, s)}
                onDelete={() => setToDelete(r)}
              />
            ))}
          </ul>
        )}

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span>
              Showing <b className="text-slate-700">{start}</b>–<b className="text-slate-700">{end}</b> of{" "}
              <b className="text-slate-700">{meta.total}</b>
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Reviews per page"
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {page} / {totalPage}
            </span>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPage || loading}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {toDelete && (
        <DeleteDialog
          review={toDelete}
          busy={busyId === toDelete._id}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function ReviewRow({
  review: r,
  busy,
  onStatus,
  onDelete,
}: {
  review: AdminReview;
  busy: boolean;
  onStatus: (s: TReviewStatus) => void;
  onDelete: () => void;
}) {
  const s = statusMeta[r.status] ?? statusMeta.pending;
  const StatusIcon = s.icon;

  return (
    <li className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
              />
            ))}
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.badge}`}>
            <StatusIcon className="h-3 w-3" />
            {s.label}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-neutral-900">{r.comment}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{r.customerName}</span>
          <a href={`tel:${r.mobileNumber}`} className="font-mono hover:text-brand-600">
            {r.mobileNumber}
          </a>
          {r.orderId && <span className="font-mono">#{r.orderId}</span>}
          <span>{formatDateTime(r.createdAt)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:w-[19rem] lg:justify-end">
        {busy && <Loader2 className="h-4 w-4 animate-spin text-brand-600" />}
        {r.status !== "published" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus("published")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Publish
          </button>
        )}
        {r.status !== "rejected" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus("rejected")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Ban className="h-3.5 w-3.5" /> {r.status === "published" ? "Unpublish" : "Reject"}
          </button>
        )}
        {r.status === "rejected" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus("pending")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Back to Pending
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          aria-label={`Delete review by ${r.customerName}`}
          title="Delete review"
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function DeleteDialog({
  review,
  busy,
  onCancel,
  onConfirm,
}: {
  review: AdminReview;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 id="del-title" className="mt-4 text-lg font-bold text-neutral-900">
          Delete this review?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The review by <b className="text-slate-700">{review.customerName}</b> will be removed permanently
          {review.status === "published" ? " and disappear from the website" : ""}. The customer will be able to review
          order {review.orderId ? `#${review.orderId}` : "this order"} again.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
