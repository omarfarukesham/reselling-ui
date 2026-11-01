"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

// Shows the poster with a big play button; the video is only downloaded once tapped
// (preload="none") so it never slows down the first page load on mobile data.
export default function VideoPlayer({
  src,
  poster,
  title,
  duration,
}: {
  src: string;
  poster: string;
  title: string;
  duration?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    ref.current?.play().catch(() => {});
  }

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-[1.75rem] bg-neutral-900 shadow-xl sm:max-w-[320px]">
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls={started}
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      />
      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={`ভিডিও চালান: ${title}`}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white/95 shadow-xl transition group-hover:scale-105 group-active:scale-95">
            <Play className="ml-1 h-9 w-9 fill-brand-600 text-brand-600" />
          </span>
          <span className="absolute bottom-5 left-0 right-0 text-center text-base font-semibold text-white">
            {title} {duration && <span className="font-normal opacity-80">· {duration}</span>}
          </span>
        </button>
      )}
    </div>
  );
}
