"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Gift, Loader2, Star, X } from "lucide-react";
import { submitReview } from "@/lib/api/reviews";
import type { TrackedOrder } from "@/lib/types";

const ratingLabel: Record<number, string> = {
  1: "একদম ভালো লাগেনি",
  2: "ভালো লাগেনি",
  3: "মোটামুটি",
  4: "ভালো লেগেছে",
  5: "অসাধারণ!",
};

const MIN_COMMENT = 10;
const MAX_COMMENT = 500;

// Small dialog for reviewing one delivered order. Opens on top of the "আমার অর্ডার" dialog.
export default function ReviewModal({
  order,
  mobile,
  onClose,
  onSubmitted,
}: {
  order: TrackedOrder | null;
  mobile: string;
  onClose: () => void;
  onSubmitted: (orderId: string, rating: number, comment: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // Open/close the native dialog when an order is passed in.
  // The parent gives this component a new `key` per order, so the form starts fresh each time.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (order && !d.open) d.showModal();
    if (!order && d.open) d.close();
  }, [order]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    if (!rating) return setError("কয়টা স্টার দিবেন সেটা বেছে নিন");
    if (comment.trim().length < MIN_COMMENT) {
      textRef.current?.focus();
      return setError(`দুই-এক লাইন লিখে দিন (অন্তত ${MIN_COMMENT} অক্ষর)`);
    }

    setSending(true);
    setError("");
    try {
      await submitReview({ mobileNumber: mobile, orderId: order.orderId, rating, comment: comment.trim() });
      setDone(true);
      onSubmitted(order.orderId, rating, comment.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "রিভিউ জমা দেওয়া যায়নি, একটু পরে আবার চেষ্টা করুন।");
    } finally {
      setSending(false);
    }
  }

  const shown = hover || rating;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="review-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-900/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="review-title" className="text-lg font-bold">
              {done ? "ধন্যবাদ! 💛" : "আপনার অভিজ্ঞতা জানান"}
            </h2>
            {order && !done && <p className="text-sm text-slate-500">অর্ডার #{order.orderId} কেমন লেগেছে?</p>}
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="বন্ধ করুন"
            className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!done && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            <Gift className="h-4 w-4 shrink-0" />
            রিভিউ দিলেই পরের অর্ডারে ডেলিভারি ফ্রি!
          </p>
        )}

        {done ? (
          <div className="mt-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              আপনার রিভিউটি আমরা পেয়েছি। যাচাই করে শীঘ্রই সাইটে প্রকাশ করা হবে।
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
              <Gift className="h-4 w-4 shrink-0" />
              আপনার পরের অর্ডারে ডেলিভারি চার্জ ফ্রি 🎁
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="mt-5 h-12 w-full rounded-xl bg-brand-600 font-bold text-white hover:bg-brand-700"
            >
              ঠিক আছে
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-4">
            {/* Stars */}
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">রেটিং দিন</legend>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="রেটিং" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} স্টার`}
                    onClick={() => {
                      setRating(n);
                      setError("");
                    }}
                    onMouseEnter={() => setHover(n)}
                    className="grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        n <= shown ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 h-5 text-sm font-medium text-amber-600">{shown ? ratingLabel[shown] : ""}</p>
            </fieldset>

            {/* Comment */}
            <label htmlFor="review-comment" className="mb-1.5 mt-3 block text-sm font-semibold">
              আপনার মতামত
            </label>
            <textarea
              ref={textRef}
              id="review-comment"
              rows={4}
              maxLength={MAX_COMMENT}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError("");
              }}
              placeholder="পণ্যের কোয়ালিটি, ডেলিভারি, যা মনে হয় লিখুন…"
              className="block w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {comment.length}/{MAX_COMMENT}
            </p>

            {error && (
              <p role="alert" className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
            >
              {sending && <Loader2 className="h-5 w-5 animate-spin" />}
              রিভিউ জমা দিন
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              আপনার নাম সহ রিভিউটি সাইটে দেখানো হতে পারে, মোবাইল নম্বর নয়।
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}
