import { product } from "@/lib/product";
import CopyPhoneButton from "@/components/landing/CopyPhoneButton";
import MyOrdersModal from "@/components/landing/MyOrdersModal";

const links = [
  { label: "কম্বো অফার", href: "#offer" },
  { label: "কেন আমরা", href: "#why-us" },
  { label: "রিভিউ", href: "#reviews" },
];

// "E Buy" → "E" inside the brand square, rest of the name beside it
function Logo() {
  const [first, ...rest] = product.brand.split(" ");
  return (
    <a href="#home" aria-label={product.brand} className="flex shrink-0 items-center gap-1.5">
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
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/70 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-8 text-[15px] font-medium text-slate-600 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-brand-600">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <CopyPhoneButton phone={product.contact.phone} />
          <MyOrdersModal />
          {/* Compact on phones, full size from `sm` up */}
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
