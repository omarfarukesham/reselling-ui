import MyOrdersModal from "@/components/landing/MyOrdersModal";
import ProductsMenu from "@/components/landing/ProductsMenu";
import type { SingleProduct } from "@/lib/landings/types";
import { landingHref } from "@/lib/landings";
import { productMenuItems } from "@/lib/landings/menu";

// Same look as the main site's navbar, with the "আরও পণ্য" menu to move between product pages.
export default function Header({ p }: { p: SingleProduct }) {
  const [first, ...rest] = p.brand.split(" ");
  const current = landingHref(p);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/70 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* "E Buy" → "E" inside the brand square, rest of the name beside it */}
        <a href="#home" aria-label={p.brand} className="flex shrink-0 items-center gap-1.5">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-xl font-black text-white shadow-md shadow-brand-600/25 sm:h-10 sm:w-10 sm:text-2xl"
          >
            {first}
          </span>
          <span aria-hidden className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
            {rest.join(" ")}
          </span>
        </a>

        <ul className="hidden items-center gap-8 text-[15px] font-medium text-slate-600 lg:flex">
          <li>
            <a href="#features" className="transition-colors hover:text-brand-600">
              বৈশিষ্ট্য
            </a>
          </li>
          <li>
            <ProductsMenu items={productMenuItems} currentHref={current} variant="desktop" />
          </li>
          {p.specs && (
            <li>
              <a href="#size" className="transition-colors hover:text-brand-600">
                মাপ
              </a>
            </li>
          )}
          <li>
            <a href="#reviews" className="transition-colors hover:text-brand-600">
              রিভিউ
            </a>
          </li>
        </ul>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="lg:hidden">
            <ProductsMenu items={productMenuItems} currentHref={current} variant="mobile" />
          </div>
          <MyOrdersModal />
          <a
            href="#order"
            className="inline-flex h-9 items-center rounded-full bg-brand-600 px-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-700 sm:h-11 sm:px-5 sm:text-sm"
          >
            অর্ডার করুন
          </a>
        </div>
      </nav>
    </header>
  );
}
