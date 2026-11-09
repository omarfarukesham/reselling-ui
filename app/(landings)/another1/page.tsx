import type { Metadata } from "next";
import { kitchenRack as p } from "@/lib/landings/kitchenRack";
import { SingleSelectionProvider } from "@/components/landings/single/Selection";
import Header from "@/components/landings/single/Header";
import Hero from "@/components/landings/single/Hero";
import Features from "@/components/landings/single/Features";
import Specs from "@/components/landings/single/Specs";
import OrderForm from "@/components/landings/single/OrderForm";
import Footer from "@/components/landings/single/Footer";
import StickyOrderBar from "@/components/landings/single/StickyOrderBar";

// URL: /another1 — 2 Layer Kitchen Organizer Rack (single product, no combo)
// All text, prices and photos live in lib/landings/kitchenRack.ts
const title = `${p.name} — দাম ${p.price}৳ | ${p.brand}`;
const description = `${p.subtitle} সারা বাংলাদেশে ফ্রি ডেলিভারি, ক্যাশ অন ডেলিভারি।`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    // Shown when the link is shared on Facebook / WhatsApp / Messenger
    images: [{ url: p.images[0].src, alt: p.name }],
  },
};

export default function Another1Page() {
  return (
    <SingleSelectionProvider defaultColorId={p.colors[0].id}>
      <Header p={p} />
      <Hero p={p} />
      <Features p={p} />
      <Specs p={p} />
      <OrderForm p={p} />
      <Footer p={p} />
      <StickyOrderBar p={p} />
    </SingleSelectionProvider>
  );
}
