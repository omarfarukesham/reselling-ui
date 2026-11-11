import { Gift } from "lucide-react";
import { product } from "@/lib/product";
import { getPublishedReviews, getReviewStats } from "@/lib/api/reviews";
import type { ReviewStats } from "@/lib/types";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import ReviewCarousel, { type ReviewCard } from "@/components/landing/ReviewCarousel";

type Card = ReviewCard;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" });

// Seller-wide reviews (all products), shown before the footer on every landing page.
// Data refreshes every minute (REVIEWS_REVALIDATE), so a review the admin publishes shows up on its own.
async function loadReviews(showSamples: boolean): Promise<{ cards: Card[]; stats: ReviewStats | null }> {
  let stats: ReviewStats | null = null;
  try {
    const [reviews, s] = await Promise.all([getPublishedReviews(12), getReviewStats()]);
    stats = s && s.totalReviews > 0 ? s : null;
    if (reviews.length > 0) {
      return {
        cards: reviews.map((r) => ({
          key: r._id,
          name: r.customerName,
          meta: formatDate(r.createdAt),
          rating: Math.max(1, Math.min(5, Math.round(r.rating))),
          text: r.comment,
        })),
        stats,
      };
    }
  } catch {
    // API unreachable: fall through
  }
  // No published reviews yet: the main page keeps its built-in reviews (lib/product.ts);
  // product pages show just the rating card.
  return {
    cards: showSamples
      ? product.reviews.map((r) => ({ key: r.name, name: r.name, meta: r.location, rating: r.rating, text: r.text }))
      : [],
    stats,
  };
}

export default async function Reviews({ showSamples = false }: { showSamples?: boolean }) {
  const { cards, stats } = await loadReviews(showSamples);

  // Real numbers once reviews are published; the configured numbers until then.
  const tiles = stats
    ? [
        { value: `${(Math.round(stats.averageRating * 10) / 10).toFixed(1)}★`, label: "গড় রেটিং" },
        { value: String(stats.totalReviews), label: "কাস্টমার রিভিউ" },
        { value: "64", label: "জেলায় ডেলিভারি" },
      ]
    : [product.stats[1], product.stats[0], product.stats[2]];

  return (
    <Section id="reviews" className="bg-white py-14 sm:py-20">
      <SectionTitle
        eyebrow="Customer Reviews"
        title="আমাদের সব পণ্যের কাস্টমার রিভিউ"
        subtitle={`${product.brand} থেকে যারা কিনেছেন, তাদের মতামত`}
      />

      {/* Rating card */}
      <dl className="mx-auto mb-8 grid max-w-4xl grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white py-5 text-center shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 sm:mb-10 sm:py-7">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col-reverse gap-1 px-2">
            <dt className="text-xs leading-snug text-slate-500 sm:text-sm">{t.label}</dt>
            <dd className="text-2xl font-extrabold text-brand-600 sm:text-4xl">{t.value}</dd>
          </div>
        ))}
      </dl>

      {/* Slow auto-scrolling carousel (pauses on hover/touch, swipeable) */}
      {cards.length > 0 && <ReviewCarousel cards={cards} />}

      {/* How to leave a review + the reward for doing it */}
      <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-brand-50 px-4 py-4 ring-1 ring-amber-200 sm:items-center sm:px-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-neutral-900 shadow-sm">
          <Gift className="h-6 w-6" />
        </span>
        <div className="text-left">
          <p className="text-[15px] font-bold text-neutral-900 sm:text-base">রিভিউ দিলেই পরের অর্ডারে ডেলিভারি ফ্রি! 🎁</p>
          <p className="mt-0.5 text-sm text-slate-600">
            অর্ডার হাতে পেয়েছেন? উপরে <span className="font-semibold text-brand-700">&quot;আমার অর্ডার&quot;</span> থেকে আপনার
            মোবাইল নম্বর দিয়ে রিভিউ লিখুন।
          </p>
        </div>
      </div>
    </Section>
  );
}
