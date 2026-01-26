"use client";

import { useTranslations } from "next-intl";

const IntroReels = () => {
  const t = useTranslations("home.introReels");

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
          ].map((reel, index) => (
            <div
              key={reel.src}
              className={`group relative aspect-[9/16] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] ${
                index === 1 ? "md:translate-y-10" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/50 opacity-90" />
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={reel.src} type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    {reel.title}
                  </p>
                  <p className="mt-2 text-lg font-serif text-white">
                    {reel.label}
                  </p>
                </div>
                <span className="rounded-full border border-white/20 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.25em]">
                  Play
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroReels;
