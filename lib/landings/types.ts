import type { Theme } from "./theme";

// Data shape for a single-product landing page (no combos).
// Each landing page under app/(landings) gets one of these in lib/landings/.

export type SingleProductColor = {
  id: string;
  name: string; // shown to the customer and sent to the API as productColors
  hex: string; // swatch colour
  image: string; // photo shown when this colour is picked
};

export type SingleProduct = {
  slug: string; // URL: /products/<slug>  (lowercase, words joined with -)
  brand: string;
  name: string; // English product name
  shortName: string; // short Bangla name, e.g. on the order confirmation
  featuresTitle: string;
  badge: string;
  headline: string;
  subtitle: string;

  price: number;
  oldPrice?: number; // regular price; leave out if there is no real discount
  currency: string;
  freeDelivery: boolean;
  maxQty: number;

  colors: SingleProductColor[];
  // Gallery order. Colour photos should be included here too.
  images: { src: string; alt: string }[];

  heroBullets: string[];
  trust: string[];
  guarantee: string;

  features: { icon: string; title: string; desc: string }[];

  // Optional "story" section: a relatable problem → solution block with a photo
  story?: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
    image: string;
    imageAlt: string;
  };

  // Optional "Size & Details" section; leave out to hide it (and its menu links)
  specs?: {
    image?: string; // size photo; the table is shown alone without it
    rows: { label: string; value: string }[];
  };

  delivery: {
    inside: { label: string; charge: number };
    outside: { label: string; charge: number };
  };

  contact: { phone: string; whatsapp: string; email: string; facebook: string };

  theme?: Theme; // colour palette; default is the main site's caramel
};
