"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";

export type ReviewCard = { key: string; name: string; meta: string; rating: number; text: string };

const SPEED = 28; // pixels per second: slow, easy to read
const RESUME_AFTER = 2000; // ms after the visitor stops interacting

// Each card gets an accent colour, in rotation (full class names so Tailwind keeps them)
const ACCENTS = [
  { border: "border-amber-200", active: "border-amber-400 ring-amber-100 shadow-amber-200/60", soft: "bg-amber-50 text-amber-700", quote: "text-amber-200" },
  { border: "border-rose-200", active: "border-rose-400 ring-rose-100 shadow-rose-200/60", soft: "bg-rose-50 text-rose-700", quote: "text-rose-200" },
  { border: "border-emerald-200", active: "border-emerald-400 ring-emerald-100 shadow-emerald-200/60", soft: "bg-emerald-50 text-emerald-700", quote: "text-emerald-200" },
  { border: "border-sky-200", active: "border-sky-400 ring-sky-100 shadow-sky-200/60", soft: "bg-sky-50 text-sky-700", quote: "text-sky-200" },
  { border: "border-violet-200", active: "border-violet-400 ring-violet-100 shadow-violet-200/60", soft: "bg-violet-50 text-violet-700", quote: "text-violet-200" },
];

// Slow, endless auto-scrolling row of review cards.
// - The list is rendered twice; when the first copy has scrolled past, we jump back by its width (seamless loop).
// - Pauses on hover, touch, keyboard focus, when off-screen or the tab is hidden; visitors can still swipe/scroll.
// - Stays still for visitors who prefer reduced motion, or when the cards already fit on screen.
export default function ReviewCarousel({ cards }: { cards: ReviewCard[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const firstCopy = useRef<HTMLUListElement>(null);
  const [loop, setLoop] = useState(false); // true once we know the cards overflow the screen
  // Tapped/clicked card: shown bigger with its full text; the carousel waits while one is selected
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
    if (!selected) return;
    // tap anywhere outside a card, or Esc, releases it
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-review-card]")) setSelected(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  // Decide whether there's enough content to scroll (re-checked on resize)
  useEffect(() => {
    const el = scroller.current;
    const list = firstCopy.current;
    if (!el || !list) return;
    const check = () => setLoop(list.scrollWidth > el.clientWidth + 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cards.length]);

  useEffect(() => {
    const el = scroller.current;
    const list = firstCopy.current;
    if (!el || !list || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pos = el.scrollLeft; // float position (scrollLeft alone rounds to whole pixels)
    let last = 0;
    let frame = 0;
    let hovering = false;
    let pausedUntil = 0;

    // Width of one copy incl. the gap before the second copy. Measured once and on resize,
    // not every frame (reading layout each frame would force a re-layout 60 times a second).
    let loopWidth = 0;
    const measure = () => {
      loopWidth = list.offsetWidth + parseFloat(getComputedStyle(list).marginRight || "0");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);

    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 64) : 0;
      last = t;
      const paused =
        hovering || document.hidden || t < pausedUntil || selectedRef.current !== null || el.contains(document.activeElement);
      if (paused) {
        pos = el.scrollLeft; // pick up wherever the visitor left it
      } else {
        pos += (SPEED * dt) / 1000;
        if (loopWidth > 0 && pos >= loopWidth) pos -= loopWidth;
        el.scrollLeft = pos;
      }
      frame = requestAnimationFrame(tick);
    };

    // Only animate while the carousel is on screen; no work at all otherwise.
    const start = () => {
      if (frame) return;
      last = 0;
      pos = el.scrollLeft;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const pauseForInteraction = () => {
      pausedUntil = performance.now() + RESUME_AFTER;
    };
    const onEnter = () => (hovering = true);
    const onLeave = () => {
      hovering = false;
      pauseForInteraction();
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", pauseForInteraction);
    el.addEventListener("touchmove", pauseForInteraction, { passive: true });
    el.addEventListener("wheel", pauseForInteraction, { passive: true });

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", pauseForInteraction);
      el.removeEventListener("touchmove", pauseForInteraction);
      el.removeEventListener("wheel", pauseForInteraction);
    };
  }, [loop]);

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:mx-0">
      {/* soft fade at both edges */}
      {loop && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white sm:w-16" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white sm:w-16" />
        </>
      )}

      <div
        ref={scroller}
        role="region"
        aria-label="কাস্টমার রিভিউ"
        tabIndex={0}
        // extra vertical padding leaves room for the enlarged (selected) card
        className={`no-scrollbar flex overflow-x-auto px-4 py-6 outline-none sm:px-6 lg:px-3 ${loop ? "" : "justify-center"}`}
      >
        <ul ref={firstCopy} className="mr-4 flex shrink-0 gap-4 sm:mr-5 sm:gap-5">
          {cards.map((r, i) => (
            <Card
              key={r.key}
              r={r}
              accent={ACCENTS[i % ACCENTS.length]}
              selected={selected === r.key}
              onToggle={() => setSelected((s) => (s === r.key ? null : r.key))}
            />
          ))}
        </ul>
        {/* second copy makes the loop seamless; hidden from screen readers and keyboard */}
        {loop && (
          <ul aria-hidden className="mr-4 flex shrink-0 gap-4 sm:mr-5 sm:gap-5">
            {cards.map((r, i) => (
              <Card
                key={`dup-${r.key}`}
                r={r}
                accent={ACCENTS[i % ACCENTS.length]}
                selected={selected === `dup-${r.key}`}
                onToggle={() => setSelected((s) => (s === `dup-${r.key}` ? null : `dup-${r.key}`))}
                hidden
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Card({
  r,
  accent,
  selected,
  onToggle,
  hidden,
}: {
  r: ReviewCard;
  accent: (typeof ACCENTS)[number];
  selected: boolean;
  onToggle: () => void;
  hidden?: boolean;
}) {
  return (
    <li
      data-review-card
      role="button"
      tabIndex={hidden ? -1 : 0}
      aria-pressed={selected}
      aria-label={`${r.name} এর রিভিউ`}
      onClick={(e) => {
        // bring a newly selected card fully into view (horizontally only, no page jump)
        if (!selected) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!selected) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          onToggle();
        }
      }}
      className={`relative flex w-[78vw] max-w-[22rem] shrink-0 cursor-pointer select-none flex-col rounded-2xl border-2 bg-white p-6 outline-none transition-all duration-300 sm:w-[22rem] ${
        selected
          ? `z-10 scale-105 shadow-xl ring-4 ${accent.active}`
          : `${accent.border} shadow-sm hover:-translate-y-1 hover:shadow-md focus-visible:ring-4 focus-visible:ring-brand-100`
      }`}
    >
      <Quote aria-hidden className={`absolute right-5 top-5 h-8 w-8 ${accent.quote}`} />
      <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
          />
        ))}
      </div>
      <blockquote
        className={`mt-4 whitespace-pre-line break-words text-base leading-relaxed text-slate-700 ${selected ? "" : "line-clamp-5"}`}
      >
        “{r.text}”
      </blockquote>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${accent.soft}`}>
          {r.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-900">{r.name}</p>
          <p className="text-sm text-slate-500">{r.meta}</p>
        </div>
      </div>
    </li>
  );
}
