import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import StickyOrderBar from "@/components/landing/StickyOrderBar";

// Layout for every public page (landing, policy pages, ...).
// The (public) folder is a route group — it does not appear in the URL.
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ErrorBoundary>
      <Navbar />
      <main className="min-h-screen overflow-x-clip">{children}</main>
      <Footer />
      <StickyOrderBar />
    </ErrorBoundary>
  );
}
