import type { SingleProduct } from "./types";
import { kitchenRack } from "./kitchenRack";
import { hijabOrganizer } from "./hijabOrganizer";

// Every product landing page. Each one is served at /products/<slug>
// and appears in the "আরও পণ্য" menu, in this order.
// To add a page: create lib/landings/<name>.ts, then add it here.
export const landings: SingleProduct[] = [kitchenRack, hijabOrganizer];

export const getLanding = (slug: string) => landings.find((l) => l.slug === slug);

export const landingHref = (p: SingleProduct) => `/products/${p.slug}`;
