import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { product } from "@/lib/product";
import FacebookPixel from "@/components/FacebookPixel";

// TODO: replace with your real domain
const SITE_URL = "https://example.com";

const TITLE = `${product.nameBn} — দাম ${product.price}৳ | ${product.brand}`;
const DESCRIPTION = `${product.subtitle} সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: SITE_URL,
    siteName: product.brand,
    title: TITLE,
    description: DESCRIPTION,
    // Shown when the link is shared on Facebook / WhatsApp / Messenger
    images: [{ url: "/assets/products/og.jpg", width: 1200, height: 630, alt: product.name }],
  },
};

// viewportFit "cover" lets the sticky bottom bar respect the iPhone home-indicator area.
// No maximumScale — users must still be able to pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff8f1",
};

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

// Root layout: only <html>/<body> + font. Each area (public site, dashboard)
// adds its own chrome in its own layout.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${hindSiliguri.variable} font-bn bg-white text-neutral-900`}
        suppressHydrationWarning
      >
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
