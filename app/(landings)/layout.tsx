import ErrorBoundary from "@/components/ErrorBoundary";

// Layout for the extra landing pages (/another1, /another2, ...).
// The (landings) folder is a route group: it does not appear in the URL.
// Kept separate from (public) so these pages don't inherit the teddy wrap's
// navbar, footer and sticky order bar. Each page brings its own sections.
export default function LandingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ErrorBoundary>
      <main className="min-h-screen overflow-x-clip">{children}</main>
    </ErrorBoundary>
  );
}
