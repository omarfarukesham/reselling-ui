import type { Metadata } from "next";
import ComingSoon from "@/components/landings/ComingSoon";

// URL: /another2
// TODO: set the real title/description and remove `robots` when the page goes live.
export const metadata: Metadata = {
  title: "Another 2",
  robots: { index: false, follow: false },
};

export default function Another2Page() {
  // Replace <ComingSoon /> with this page's sections, e.g.
  // components/landings/another2/Hero.tsx, ...
  return <ComingSoon title="Another 2" />;
}
