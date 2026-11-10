// Data shape for a single-product landing page (no combos).
// Each landing page under app/(landings) gets one of these in lib/landings/.

export type SingleProductColor = {
  id: string;
  name: string; // shown to the customer and sent to the API as productColors
  hex: string; // swatch colour
  image: string; // photo shown when this colour is picked
};

export type SingleProduct = {
  brand: string;
  name: string; // English product name
  shortName: string; // short Bangla name, e.g. on the order confirmation
  featuresTitle: string;
  badge: string;
  headline: string;
  subtitle: string;

  price: number;
  oldPrice: number;
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
  specs: {
    image: string;
    rows: { label: string; value: string }[];
  };

  delivery: {
    inside: { label: string; charge: number };
    outside: { label: string; charge: number };
  };

  contact: { phone: string; whatsapp: string; email: string; facebook: string };
};
