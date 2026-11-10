// Temporary placeholder for a landing page whose content isn't ready yet.
// Replace it with the page's real sections.
export default function ComingSoon({ title }: { title: string }) {
  return (
    <section className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-cream px-4 text-center">
      <div>
        <span className="inline-block rounded-full bg-brand-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {title}
        </span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl">শীঘ্রই আসছে</h1>
        <p className="mt-2 text-base text-slate-600">এই পেজের কাজ চলছে।</p>
      </div>
    </section>
  );
}
