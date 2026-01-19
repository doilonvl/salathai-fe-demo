/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Locale } from "@/types/content";
import {
  useGetMarqueeImagesQuery,
  useGetMarqueeSlidesQuery,
} from "@/services/api";
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

const FALLBACK_MARQUEE_IMAGES: MarqueeImage[] = [
  {
    id: "local-marquee-1",
    imageUrl: "/Marquee/img-1.jpg",
    altText: "marquee-1",
    altText_i18n: { vi: "marquee-1", en: "marquee-1" },
    orderIndex: 1,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-2",
    imageUrl: "/Marquee/img-2.jpg",
    altText: "marquee-2",
    altText_i18n: { vi: "marquee-2", en: "marquee-2" },
    orderIndex: 2,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-3",
    imageUrl: "/Marquee/img-3.jpg",
    altText: "marquee-3",
    altText_i18n: { vi: "marquee-3", en: "marquee-3" },
    orderIndex: 3,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-4",
    imageUrl: "/Marquee/img-4.jpg",
    altText: "marquee-4",
    altText_i18n: { vi: "marquee-4", en: "marquee-4" },
    orderIndex: 4,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-5",
    imageUrl: "/Marquee/img-5.jpg",
    altText: "marquee-5",
    altText_i18n: { vi: "marquee-5", en: "marquee-5" },
    orderIndex: 5,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-6",
    imageUrl: "/Marquee/img-6.jpeg",
    altText: "marquee-6",
    altText_i18n: { vi: "marquee-6", en: "marquee-6" },
    orderIndex: 6,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-7",
    imageUrl: "/Marquee/img-7.jpg",
    altText: "marquee-7",
    altText_i18n: { vi: "marquee-7", en: "marquee-7" },
    orderIndex: 7,
    isPinned: true,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-8",
    imageUrl: "/Marquee/img-8.png",
    altText: "marquee-8",
    altText_i18n: { vi: "marquee-8", en: "marquee-8" },
    orderIndex: 8,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-9",
    imageUrl: "/Marquee/img-9.jpg",
    altText: "marquee-9",
    altText_i18n: { vi: "marquee-9", en: "marquee-9" },
    orderIndex: 9,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-10",
    imageUrl: "/Marquee/img-10.jpg",
    altText: "marquee-10",
    altText_i18n: { vi: "marquee-10", en: "marquee-10" },
    orderIndex: 10,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-11",
    imageUrl: "/Marquee/img-11.jpg",
    altText: "marquee-11",
    altText_i18n: { vi: "marquee-11", en: "marquee-11" },
    orderIndex: 11,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-12",
    imageUrl: "/Marquee/img-12.png",
    altText: "marquee-12",
    altText_i18n: { vi: "marquee-12", en: "marquee-12" },
    orderIndex: 12,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-13",
    imageUrl: "/Marquee/img-13.png",
    altText: "marquee-13",
    altText_i18n: { vi: "marquee-13", en: "marquee-13" },
    orderIndex: 13,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];
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
  const [isMobile, setIsMobile] = useState(false);
  const [hasMeasuredViewport, setHasMeasuredViewport] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: marqueeImagesData } = useGetMarqueeImagesQuery(undefined, {
    skip: initialImages.length > 0,
  });
  const { data: marqueeSlidesData } = useGetMarqueeSlidesQuery(undefined, {
    skip: initialSlides.length > 0,
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setIsMobile(mq.matches);
      setHasMeasuredViewport(true);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const marqueeItems = useMemo(() => {
    const items = (
      marqueeImagesData?.items?.length
        ? marqueeImagesData.items
        : initialImages.length
          ? initialImages
          : FALLBACK_MARQUEE_IMAGES
    ) as MarqueeImage[];
    if (!isMobile) {
      return items.map((item, idx) => ({
        ...item,
        altText: pickLocalized(
          item.altText_i18n,
          locale,
          item.altText || `marquee-${idx + 1}`,
        ),
      }));
    }

    const limit = 6;
    const pinIdx = items.findIndex((item) => item.isPinned);
    const centerIdx = pinIdx >= 0 ? pinIdx : 2;

    let subset: typeof items;
    if (items.length <= limit) {
      subset = items;
    } else {
      const half = Math.floor(limit / 2); // 3 when limit=6
      const start = Math.max(
        0,
        Math.min(items.length - limit, centerIdx - (half - 2)),
      );
      const end = start + limit;
      subset = items.slice(start, end);
      // Ensure pinned included; if not, append and trim.
      if (pinIdx >= 0 && !subset.some((item) => item.isPinned)) {
        subset = [...subset.slice(0, limit - 1), items[pinIdx]];
      }
    }

    return subset.map((item, idx) => ({
      ...item,
      altText: pickLocalized(
        item.altText_i18n,
        locale,
        item.altText || `marquee-${idx + 1}`,
      ),
    }));
  }, [isMobile, locale, marqueeImagesData]);
  const pinnedIndex = useMemo(() => {
    if (!marqueeItems.length) return -1;
    const idx = marqueeItems.findIndex((item) => item.isPinned);
    if (idx >= 0) return idx;
    return Math.min(6, marqueeItems.length - 1);
  }, [marqueeItems]);
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
  const totalPanels = slides.length + 1; // spacer + slides
  const maxTranslate =
    totalPanels > 0 ? ((totalPanels - 1) / totalPanels) * 100 : 0; // wrapper shift %
  const maxImageShift = Math.max(totalPanels - 1, 0) * 100; // pinned image shift %
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedCloneRef = useRef<HTMLImageElement | null>(null);
  const flipRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

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
                  <img
                    src={slide.imageUrl}
                    alt={slide.tag || "Slide"}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="hidden">
        

        <section className="wjy-marquee">
          <div className="wjy-marquee-wrapper">
            <div className="wjy-marquee-images">
              {marqueeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`wjy-marquee-img${
                    idx === pinnedIndex ? " pin" : ""
                  }`}
                >
                  <img src={item.imageUrl} alt={item.altText} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wjy-horizontal">
          <div
            className="wjy-horizontal-wrapper"
            style={{
              ["--wjy-slide-count" as string]: totalPanels,
            }}
          >
            <div className="wjy-horizontal-slide wjy-horizontal-spacer" />
            {slides.map((slide, idx) => (
              <div
                key={slide.id ?? slide.imageUrl}
                className="wjy-horizontal-slide"
              >
                <div className="wjy-slide-tag">{slide.tag}</div>
                <div className="col text">
                  <h3>{slide.text}</h3>
                </div>
                <div className="col image">
                  <img
                    src={slide.imageUrl}
                    alt={slide.tag || `slide-${idx + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="wjy-progress">
            <div ref={progressRef} className="bar" />
          </div>
        </section>

        <section className="wjy-outro">
          <h1>{t("outro")}</h1>
        </section>
      </div>
    </div>
  );
}

export default MarqueeScroller;
