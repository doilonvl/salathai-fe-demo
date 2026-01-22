"use client";

import { useTranslations } from "next-intl";

const OurStory = () => {
  const t = useTranslations("home.story");
  const storyImage = "/Marquee/slide-2.jpg";
  const textureImage = "/Marquee/img-6.jpeg";
  const accentImage = "/Marquee/img-3.jpg";

  return (
    <section
      id="story"
      className="relative overflow-hidden bg-stone-950 text-stone-100"
    >
      <div className="absolute inset-0">
        <img
          src={textureImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-950/90 to-black/70" />
        <div className="absolute -left-36 -top-20 h-80 w-80 rounded-full bg-amber-400/25 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-[160px]" />
        <div className="absolute left-1/2 top-12 h-24 w-[60vw] -translate-x-1/2 rounded-full bg-amber-300/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-20 w-20 border border-white/20" />
            <div className="absolute -bottom-6 -right-6 h-20 w-20 border border-white/10" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <img
                src={storyImage}
                alt={t("imageAlt")}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/70">
                  {t("tagline")}
                </p>
              </div>
            </div>
            <div className="absolute -right-8 top-8 hidden w-36 rotate-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:block">
              <img
                src={accentImage}
                alt="Sala Thai dish"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.6em] text-sala-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-6xl">
              {t("title")}
            </h2>
            <p className="mt-6 border-l border-white/30 pl-5 text-base leading-7 text-white md:text-lg">
              {t("body1")}
            </p>
            <div className="mt-6 space-y-5 text-sm leading-7 text-stone-200 md:text-base">
              <p>{t("body2")}</p>
              <p>{t("body3")}</p>
            </div>
            <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-stone-400">
              <span className="h-px w-12 bg-stone-500/60" />
              <span>{t("tagline")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
