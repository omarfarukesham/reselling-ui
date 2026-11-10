import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLanding, landings } from "@/lib/landings";
import { themeStyle } from "@/lib/landings/theme";
import { SingleSelectionProvider } from "@/components/landings/single/Selection";
import Header from "@/components/landings/single/Header";
import Hero from "@/components/landings/single/Hero";
import Features from "@/components/landings/single/Features";
import Story from "@/components/landings/single/Story";
import Specs from "@/components/landings/single/Specs";
import OrderForm from "@/components/landings/single/OrderForm";
import Footer from "@/components/landings/single/Footer";
import StickyOrderBar from "@/components/landings/single/StickyOrderBar";

// URL: /products/<slug>  — one template for every single-product landing page.
// The products themselves are listed in lib/landings/index.ts.

type Props = { params: Promise<{ slug: string }> };

// Build every product page ahead of time; any other slug is a 404.
export function generateStaticParams() {
  return landings.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getLanding((await params).slug);
  if (!p) return {};
  const title = `${p.name} — দাম ${p.price}৳ | ${p.brand}`;
  const description = `${p.subtitle} ${p.freeDelivery ? "সারা বাংলাদেশে ফ্রি ডেলিভারি, " : ""}ক্যাশ অন ডেলিভারি।`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // Shown when the link is shared on Facebook / WhatsApp / Messenger
      images: [{ url: p.images[0].src, alt: p.name }],
    },
  };
}

export default async function ProductLandingPage({ params }: Props) {
  const p = getLanding((await params).slug);
  if (!p) notFound();

  return (
    // The wrapper carries this product's colour theme (CSS variables) to every section.
    <div style={themeStyle(p.theme)}>
      <SingleSelectionProvider defaultColorId={p.colors[0].id}>
        <Header p={p} />
        <Hero p={p} />
        <Story p={p} />
        <Features p={p} />
        <Specs p={p} />
        <OrderForm p={p} />
        <Footer p={p} />
        <StickyOrderBar p={p} />
      </SingleSelectionProvider>
    </div>
  );
}
