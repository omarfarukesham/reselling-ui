import type { Metadata } from "next";
import ReviewsManager from "@/components/dashboard/ReviewsManager";

// URL: /dashboard/reviews — moderate customer reviews (publish / reject / delete).
// Auth is checked by the (protected) layout.
export const metadata: Metadata = { title: "Customer Reviews · Admin Dashboard" };

export default function ReviewsPage() {
  return <ReviewsManager />;
}
