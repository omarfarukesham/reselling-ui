import { product, productImage } from "@/lib/product";
import { landingHref, landings } from "./index";

export type MenuItem = {
  href: string;
  title: string; // short Bangla name
  subtitle: string; // English product name
  image: string;
  price: number;
  currency: string;
};

// Every product page for the "আরও পণ্য" menu: the main page (/) first,
// then each /products/<slug> page from lib/landings/index.ts.
export const productMenuItems: MenuItem[] = [
  {
    href: "/",
    title: product.nameBn,
    subtitle: product.name,
    image: productImage(product.colors[0].id, "baby"),
    price: product.price,
    currency: product.currency,
  },
  ...landings.map((p) => ({
    href: landingHref(p),
    title: p.shortName,
    subtitle: p.name,
    image: p.images[0].src,
    price: p.price,
    currency: p.currency,
  })),
];
