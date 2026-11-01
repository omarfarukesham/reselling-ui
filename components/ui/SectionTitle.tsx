export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
      {eyebrow && (
        <span className="inline-block rounded-full bg-brand-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-[1.625rem] font-bold leading-snug text-neutral-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">{subtitle}</p>}
    </div>
  );
}
