"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function LazyVideo({
  src,
  className,
  isMuted,
  isPlaying,
  onTap,
  onScrollOut,
}: {
  src: string;
  className: string;
  isMuted: boolean;
  isPlaying: boolean;
  onTap: () => void;
  onScrollOut: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [showIcon, setShowIcon] = useState<"play" | "pause" | null>(null);
  const iconTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadObserver.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    loadObserver.observe(video);
    return () => loadObserver.disconnect();
  }, []);

  // Auto-mute & pause when scrolled out
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const muteObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          onScrollOut();
        }
      },
      { threshold: 0.3 }
    );

    muteObserver.observe(video);
    return () => muteObserver.disconnect();
  }, [onScrollOut]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Sync play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, shouldLoad]);

  // Initial autoplay (muted)
  useEffect(() => {
    if (shouldLoad && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [shouldLoad]);

  const handleTap = () => {
    onTap();
    // Show the icon briefly
    const nextIcon = isPlaying ? "pause" : "play";
    setShowIcon(nextIcon);
    if (iconTimer.current) clearTimeout(iconTimer.current);
    iconTimer.current = setTimeout(() => setShowIcon(null), 600);
  };

  return (
    <div className="relative h-full w-full cursor-pointer" onClick={handleTap}>
      <video
        ref={videoRef}
        className={className}
        muted
        loop
        playsInline
        preload="none"
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>

      {/* Instagram-style play/pause overlay icon */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showIcon ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded-full bg-black/50 p-5">
          {showIcon === "pause" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

const IntroReels = () => {
  const t = useTranslations("home.introReels");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pausedSet, setPausedSet] = useState<Set<number>>(new Set());

  const handleTap = useCallback((index: number) => {
    const isPaused = pausedSet.has(index);
    const isActive = activeIndex === index;

    if (isPaused) {
      // Resume playing with sound
      setPausedSet((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      setActiveIndex(index);
    } else if (!isActive) {
      // First tap: unmute this, mute others
      setActiveIndex(index);
    } else {
      // Already active: pause
      setPausedSet((prev) => new Set(prev).add(index));
      setActiveIndex(null);
    }
  }, [activeIndex, pausedSet]);

  const handleScrollOut = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? null : prev));
  }, []);

  return (
    <section className="relative overflow-hidden bg-neutral-950 py-16 text-white md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-serif leading-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-200/80 md:text-base">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.25em]">
              Reel
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.25em]">
              Vertical
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.25em]">
              Signature
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          {[
            {
              src: "/video/intro1.mp4",
              title: t("reelOne.title"),
              label: t("reelOne.label"),
            },
            {
              src: "/video/intro2.mp4",
              title: t("reelTwo.title"),
              label: t("reelTwo.label"),
            },
          ].map((reel, index) => {
            const isActive = activeIndex === index;
            const isPaused = pausedSet.has(index);
            return (
              <div
                key={reel.src}
                className={`group relative aspect-[9/16] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] ${
                  index === 1 ? "md:translate-y-10" : ""
                }`}
              >
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-transparent to-black/50 opacity-90" />
                <LazyVideo
                  src={reel.src}
                  className="h-full w-full object-cover"
                  isMuted={!isActive}
                  isPlaying={!isPaused}
                  onTap={() => handleTap(index)}
                  onScrollOut={() => handleScrollOut(index)}
                />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                      {reel.title}
                    </p>
                    <p className="mt-2 text-lg font-serif text-white">
                      {reel.label}
                    </p>
                  </div>
                  {/* Sound indicator */}
                  <span className="flex items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-3 py-2 text-white">
                    {isActive ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="animate-pulse" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IntroReels;
