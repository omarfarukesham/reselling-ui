import { ArrowRight } from "lucide-react";

/* "Order now" CTA that scrolls to the order form */
export default function OrderButton({
  label = "এখনই অর্ডার করুন",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <a
      href="#order"
      className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 text-lg font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${className}`}
    >
      {label}
      <ArrowRight className="h-5 w-5" />
    </a>
  );
}
