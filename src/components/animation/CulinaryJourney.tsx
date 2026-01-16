"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";
import { useGetMarqueeSlidesQuery } from "@/services/api";
import type { MarqueeSlide } from "@/types/marquee";

const FALLBACK_SLIDES: MarqueeSlide[] = [
  {
    id: "fallback-1",
    tag: "Signature",
    tag_i18n: { vi: "Đặc sắc", en: "Signature" },
    text: "Signature dishes with bold Thai flavors.",
    text_i18n: {
      vi: "Món đặc sắc đậm đà hương vị Thái.",
      en: "Signature dishes with bold Thai flavors.",
    },
    imageUrl: "/Marquee/slide-1.jpg",
    orderIndex: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-2",
    tag: "Fresh",
    tag_i18n: { vi: "Tươi mát", en: "Fresh" },
    text: "Refreshing plates for light, vibrant moments.",
    text_i18n: {
      vi: "Những món tươi mát cho khoảnh khắc nhẹ nhàng.",
      en: "Refreshing plates for light, vibrant moments.",
    },
    imageUrl: "/Marquee/slide-2.jpg",
    orderIndex: 2,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-3",
    tag: "Dessert",
    tag_i18n: { vi: "Tráng miệng", en: "Dessert" },
    text: "Sweet endings to complete the journey.",
    text_i18n: {
      vi: "Kết thúc ngọt ngào cho hành trình ẩm thực.",
      en: "Sweet endings to complete the journey.",
    },
    imageUrl: "/Marquee/slide-7.jpg",
    orderIndex: 3,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

function pickLocalized(
  value: { vi?: string; en?: string } | undefined,
  locale: Locale,
  fallback = ""
) {
  if (!value) return fallback;
  if (locale === "en") {
    return value.en || value.vi || fallback;
  }
  return value.vi || value.en || fallback;
}

export function CulinaryJourney({
  initialSlides = [],
}: {
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
        : FALLBACK_SLIDES
    ) as MarqueeSlide[];
    const activeItems = items.filter((item) => item?.isActive !== false);
    const sorted = activeItems.sort((a, b) => a.orderIndex - b.orderIndex);
    return sorted.map((item) => ({
      ...item,
      tag: pickLocalized(item.tag_i18n, locale, item.tag),
      text: pickLocalized(item.text_i18n, locale, item.text),
    }));
  }, [initialSlides, locale, marqueeSlidesData]);

  useEffect(() => {
    if (!slides.length) return;
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setActiveIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  if (!slides.length) return null;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === slides.length - 1;
  const translatePercent = slides.length
    ? (activeIndex * 100) / slides.length
    : 0;
  const stackHeight = slides.length ? `${slides.length * 100}%` : "100%";
  const slideHeight = slides.length ? `${100 / slides.length}%` : "100%";

  return (
    <section className="relative w-full bg-[#f5efe7] py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid items-stretch gap-8 md:grid-cols-[1.05fr,0.95fr]">
          <div className="order-2 md:order-1">
            <div className="relative h-[420px] overflow-hidden rounded-[28px] shadow-[0_28px_80px_rgba(25,15,8,0.35)] sm:h-[480px] md:h-[520px] lg:h-[600px]">
              <div
                className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
                style={{
                  height: stackHeight,
                  transform: `translateY(-${translatePercent}%)`,
                }}
              >
                {slides.map((slide) => (
                  <div
                    key={slide.id ?? slide.imageUrl}
                    className="h-full w-full"
                    style={{ height: slideHeight }}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.tag || "Culinary journey"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex flex-col gap-5">
              <p className="text-sm text-neutral-500 md:text-base">
                {t("intro")}
              </p>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isFirst}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-neutral-900/20 bg-white text-neutral-900 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40`}
                    aria-label="Previous"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLast}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-neutral-900/20 bg-neutral-900 text-white shadow-sm transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40`}
                    aria-label="Next"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative h-[260px] overflow-hidden sm:h-[300px] md:h-[320px] lg:h-[360px]">
                  <div
                    className="flex h-full flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
                    style={{
                      height: stackHeight,
                      transform: `translateY(-${translatePercent}%)`,
                    }}
                  >
                    {slides.map((slide, index) => (
                      <div
                        key={slide.id ?? slide.imageUrl}
                        className="flex h-full flex-col justify-center gap-4"
                        style={{ height: slideHeight }}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                          {String(index + 1).padStart(2, "0")} /{" "}
                          {String(slides.length).padStart(2, "0")}
                        </span>
                        <h2 className="text-3xl font-semibold text-neutral-900 md:text-4xl">
                          {slide.tag}
                        </h2>
                        <p className="text-base text-neutral-600 md:text-lg">
                          {slide.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-500">{t("outro")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CulinaryJourney;
