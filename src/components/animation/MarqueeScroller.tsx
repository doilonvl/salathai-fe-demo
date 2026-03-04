/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Locale } from "@/types/content";
import { useGetMarqueeSlidesQuery } from "@/services/api";
import type { MarqueeImage, MarqueeSlide } from "@/types/marquee";
import "./MarqueeScroller.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-salathai-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-salathai-display",
  display: "swap",
});

const FALLBACK_MARQUEE_SLIDES: MarqueeSlide[] = [
  {
    id: "fallback-slide-1",
    tag: "Warm up",
    tag_i18n: { vi: "Warm up", en: "Warm up" },
    text: "Khai v ¯< nh §1 nhAÿng Ž` ¯Ÿ Ž`A­nh th ¯cc v ¯< giA­c.",
    text_i18n: {
      vi: "Khai v ¯< nh §1 nhAÿng Ž` ¯Ÿ Ž`A­nh th ¯cc v ¯< giA­c.",
      en: "Light starters to wake up your palate.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447128/salathai/marquee-slides/slide-4.jpg",
    orderIndex: 1,
    isActive: true,
    createdAt: "2025-12-11T10:04:16.095Z",
    updatedAt: "2025-12-11T10:04:16.095Z",
  },
  {
    id: "fallback-slide-2",
    tag: "Signature",
    tag_i18n: { vi: "Signature", en: "Signature" },
    text: "CA­c mA3n signature v ¯>i h’ø’­ng v ¯< Ž` §úc tr’øng.",
    text_i18n: {
      vi: "CA­c mA3n signature v ¯>i h’ø’­ng v ¯< Ž` §úc tr’øng.",
      en: "Signature dishes with our distinctive flavors.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447127/salathai/marquee-slides/slide-1.jpg",
    orderIndex: 2,
    isActive: true,
    createdAt: "2025-12-11T09:59:12.270Z",
    updatedAt: "2025-12-11T10:01:14.865Z",
  },
  {
    id: "fallback-slide-3",
    tag: "Refresh",
    tag_i18n: { vi: "Refresh", en: "Refresh" },
    text: "MA3n nh §1, t’ø’­i mA­t cho bu ¯i chi ¯?u.",
    text_i18n: {
      vi: "MA3n nh §1, t’ø’­i mA­t cho bu ¯i chi ¯?u.",
      en: "Light, refreshing bites for the afternoon.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447127/salathai/marquee-slides/slide-2.jpg",
    orderIndex: 3,
    isActive: true,
    createdAt: "2025-12-11T10:02:15.818Z",
    updatedAt: "2025-12-11T10:02:15.818Z",
  },
  {
    id: "fallback-slide-4",
    tag: "Dessert",
    tag_i18n: { vi: "Dessert", en: "Dessert" },
    text: "K §¨t thA§c ng ¯?t ngAÿo v ¯>i cA­c mA3n trA­ng mi ¯Øng.",
    text_i18n: {
      vi: "K §¨t thA§c ng ¯?t ngAÿo v ¯>i cA­c mA3n trA­ng mi ¯Øng.",
      en: "Sweet endings to finish your meal.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447129/salathai/marquee-slides/slide-7.jpg",
    orderIndex: 4,
    isActive: true,
    createdAt: "2025-12-11T10:04:51.284Z",
    updatedAt: "2025-12-11T10:04:51.284Z",
  },
];

function optimizeCloudinaryUrl(url: string, width = 1200): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

function pickLocalized(
  value: { vi?: string; en?: string } | undefined,
  locale: Locale,
  fallback = "",
) {
  if (!value) return fallback;
  if (locale === "en") {
    return value.en || value.vi || fallback;
  }
  return value.vi || value.en || fallback;
}

export function MarqueeScroller({
  initialImages = [],
  initialSlides = [],
}: {
  initialImages?: MarqueeImage[];
  initialSlides?: MarqueeSlide[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("home.marquee");
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: marqueeSlidesData } = useGetMarqueeSlidesQuery(undefined, {
    skip: initialSlides.length > 0,
  });

  const slides = useMemo(() => {
    const items = (
      marqueeSlidesData?.items?.length
        ? marqueeSlidesData.items
        : initialSlides.length
          ? initialSlides
          : FALLBACK_MARQUEE_SLIDES
    ) as MarqueeSlide[];
    const localized = items.map((item) => ({
      ...item,
      tag: pickLocalized(item.tag_i18n, locale, item.tag),
      text: pickLocalized(item.text_i18n, locale, item.text),
    }));
    if (localized.length >= 3) return localized;
    const padded = [...localized];
    let idx = 0;
    while (padded.length < 3 && localized.length > 0) {
      const src = localized[idx % localized.length];
      padded.push({
        ...src,
        id: `${src.id}-dup-${padded.length}`,
        orderIndex: src.orderIndex + padded.length,
      });
      idx++;
    }
    return padded;
  }, [locale, marqueeSlidesData]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slides.length) return;
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const safeIndex = slides.length
    ? Math.min(activeIndex, slides.length - 1)
    : 0;
  const isFirst = safeIndex === 0;
  const isLast = slides.length ? safeIndex === slides.length - 1 : true;
  const translatePercent = slides.length
    ? (safeIndex * 100) / slides.length
    : 0;
  const stackHeight = slides.length ? `${slides.length * 100}%` : "100%";
  const slideHeight = slides.length ? `${100 / slides.length}%` : "100%";

  const handlePrev = () => {
    if (!slides.length) return;
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    if (!slides.length) return;
    setActiveIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  return (
    <div
      ref={containerRef}
      className={`wjy-shell ${plusJakarta.variable} ${playfair.variable}`}
      style={{
        ["--wjy-light" as string]: "#edf1e8",
        ["--wjy-dark" as string]: "#0e0b09",
      }}
    >
      <div className="mx-auto w-full md:w-[80%]">
        <section className="wjy-mobile-journey md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div className="wjy-mobile-copy md:flex md:flex-col md:justify-center md:space-y-6">
            

            <div className="wjy-mobile-info md:h-auto">
              <div
                className="wjy-mobile-info-stack"
                style={{
                  height: stackHeight,
                  transform: `translateY(-${translatePercent}%)`,
                }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id ?? slide.imageUrl}
                    className="wjy-mobile-info-slide md:space-y-3"
                    style={{ height: slideHeight }}
                  >
                    <span className="wjy-mobile-count">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(slides.length).padStart(2, "0")}
                    </span>
                    <h1 className="wjy-mobile-title md:text-4xl">
                      {slide.tag}
                    </h1>
                    <h2 className="wjy-mobile-text text-stone-900 font-serif lowercase italic text-base md:text-5xl">
                      {slide.text}
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="wjy-mobile-outro">{t("outro")}</h3>

            <div className="wjy-mobile-actions pt-4 md:flex md:flex-row md:gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirst}
                className="wjy-mobile-btn wjy-mobile-btn--light"
                aria-label="Up"
              >
                <ChevronUp className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isLast}
                className="wjy-mobile-btn wjy-mobile-btn--dark"
                aria-label="Down"
              >
                <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>
          <div className="wjy-mobile-image mt-6 md:mt-0">
            <div
              className="wjy-mobile-image-stack"
              style={{
                height: stackHeight,
                transform: `translateY(-${translatePercent}%)`,
              }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.id ?? slide.imageUrl}
                  className="wjy-mobile-image-slide"
                  style={{ height: slideHeight }}
                >
                  <Image
                    src={optimizeCloudinaryUrl(slide.imageUrl)}
                    alt={slide.tag || "Slide"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}

export default MarqueeScroller;
