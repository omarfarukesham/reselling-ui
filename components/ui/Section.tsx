/* Centered max-width section wrapper */
export default function Section({
  children,
  className = "",
  innerClassName = "max-w-6xl",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`mx-auto ${innerClassName}`}>{children}</div>
    </section>
  );
}
