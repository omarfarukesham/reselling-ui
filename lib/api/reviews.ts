import type {
  AdminReview,
  AdminReviewsQuery,
  PaginationMeta,
  PublicReview,
  ReviewStats,
  TReviewStatus,
} from "@/lib/types";

const API = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// How often (seconds) the landing page re-reads published reviews.
// An admin's "publish" shows up on the site within this time, no redeploy needed.
export const REVIEWS_REVALIDATE = 60;

async function readBody(res: Response) {
  return res.json().catch(() => null);
}

// ─────────────────────────── Public (customer) ───────────────────────────

/** GET /api/review — published reviews only. Safe to call from a Server Component. */
export async function getPublishedReviews(limit = 10): Promise<PublicReview[]> {
  const url = `${API()}/review?page=1&limit=${limit}&sortBy=createdAt&sortOrder=desc`;
  const res = await fetch(url, { next: { revalidate: REVIEWS_REVALIDATE } });
  if (!res.ok) throw new Error(`Failed to load reviews (${res.status})`);
  const body = await readBody(res);
  return Array.isArray(body?.data) ? body.data : [];
}

/** GET /api/review/stats — average rating + breakdown of published reviews. */
export async function getReviewStats(): Promise<ReviewStats | null> {
  const res = await fetch(`${API()}/review/stats`, { next: { revalidate: REVIEWS_REVALIDATE } });
  if (!res.ok) return null;
  const body = await readBody(res);
  return body?.data ?? null;
}

/**
 * Real average rating + review count for display (hero badge, rating card).
 * Returns null until at least one review is published, or if the API can't be reached,
 * so callers can fall back to the numbers in lib/product.ts.
 */
export async function getRatingSummary(): Promise<{ average: string; total: number } | null> {
  try {
    const s = await getReviewStats();
    if (!s || s.totalReviews <= 0) return null;
    return { average: (Math.round(s.averageRating * 10) / 10).toFixed(1), total: s.totalReviews };
  } catch {
    return null;
  }
}

/** POST /api/review — customer submits a review for a delivered order. */
export async function submitReview(input: {
  mobileNumber: string;
  orderId?: string;
  rating: number;
  comment: string;
}): Promise<{ status: TReviewStatus }> {
  const res = await fetch(`${API()}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readBody(res);
  if (!res.ok || !body?.data) throw new Error(body?.message || "Failed to submit review");
  return body.data;
}

// ─────────────────────────── Admin (needs JWT) ───────────────────────────

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/** GET /api/review/admin — moderation queue with filters + pagination. */
export async function getAdminReviews(
  token: string,
  query: AdminReviewsQuery = {},
): Promise<{ reviews: AdminReview[]; meta: PaginationMeta }> {
  const url = new URL(`${API()}/review/admin`);
  if (query.page) url.searchParams.set("page", String(query.page));
  if (query.limit) url.searchParams.set("limit", String(query.limit));
  if (query.status) url.searchParams.set("status", query.status);
  if (query.search?.trim()) url.searchParams.set("search", query.search.trim());
  if (query.sortBy) url.searchParams.set("sortBy", query.sortBy);
  if (query.sortOrder) url.searchParams.set("sortOrder", query.sortOrder);

  const res = await fetch(url.toString(), { headers: authHeaders(token), cache: "no-store" });
  const body = await readBody(res);
  if (!res.ok) throw new Error(body?.message || `Failed to load reviews (${res.status})`);

  const reviews: AdminReview[] = Array.isArray(body?.data) ? body.data : [];
  return {
    reviews,
    meta: body?.meta ?? { page: query.page ?? 1, limit: query.limit ?? 10, total: reviews.length, totalPage: 1 },
  };
}

/** Number of reviews per status (uses meta.total of a 1-item page per status). */
export async function getAdminReviewCounts(token: string): Promise<Record<TReviewStatus | "all", number>> {
  const statuses: (TReviewStatus | "")[] = ["", "pending", "published", "rejected"];
  const totals = await Promise.all(
    statuses.map((status) =>
      getAdminReviews(token, { status, page: 1, limit: 1 })
        .then((r) => r.meta.total)
        .catch(() => 0),
    ),
  );
  return { all: totals[0], pending: totals[1], published: totals[2], rejected: totals[3] };
}

/** PATCH /api/review/:id/status — publish, reject, or move back to pending. */
export async function updateReviewStatus(token: string, id: string, status: TReviewStatus): Promise<void> {
  const res = await fetch(`${API()}/review/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  const body = await readBody(res);
  if (!res.ok) throw new Error(body?.message || "Failed to update review");
}

/** DELETE /api/review/:id — also lets the customer review that order again. */
export async function deleteReview(token: string, id: string): Promise<void> {
  const res = await fetch(`${API()}/review/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const body = await readBody(res);
  if (!res.ok) throw new Error(body?.message || "Failed to delete review");
}

// Lets the sidebar's pending badge refresh after the reviews page changes something.
export const REVIEWS_CHANGED_EVENT = "admin:reviews-changed";
export const notifyReviewsChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(REVIEWS_CHANGED_EVENT));
};
