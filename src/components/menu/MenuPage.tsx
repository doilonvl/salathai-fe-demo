"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";

import type { Locale } from "@/i18n/request";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const MENU_PAGES = Array.from({ length: 15 }, (_, index) => ({
  src: `/Menu/menu${index + 1}.jpg`,
  label: `Menu page ${index + 1}`,
}));

type MenuCategory = {
  id: string;
  labelKey: string;
  indices: number[];
};

// Merged categories for a more compact view as requested
const MENU_CATEGORIES: MenuCategory[] = [
  { id: "appetizers", labelKey: "categories.appetizers", indices: [3, 12, 13] }, // Was: Soup, Salad
  { id: "main", labelKey: "categories.main", indices: [4, 5, 6, 7, 11] }, // Was: Main, Curry
  {
    id: "noodlesRiceHotpot",
    labelKey: "categories.noodlesRiceHotpot",
    indices: [2, 8, 9],
  }, // Was: Hotpot, Noodles & Rice
  {
    id: "vegetarian",
    labelKey: "categories.vegetarian",
    indices: [1, 10],
  }, // Was: Vegetable, Vegetarian
  {
    id: "drinksDessert",
    labelKey: "categories.drinksDessert",
    indices: [14, 15],
  }, // Was: Bottled Drinks, Drink & Dessert
];

export default function MenuPage() {
  const tMenu = useTranslations("menuPage");
  const locale = useLocale() as Locale;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const activeItem = activeIndex !== null ? MENU_PAGES[activeIndex] : null;
  const categories = MENU_CATEGORIES.map((category) => ({
    ...category,
    label: tMenu(category.labelKey),
    items: category.indices
      .map((index) => MENU_PAGES[index - 1])
      .filter(Boolean),
  })).filter((category) => category.items.length > 0);
  const categoryTabs = [
    {
      id: "all",
      label: tMenu("categories.all"),
      items: MENU_PAGES,
    },
    ...categories,
  ];
  const visibleSections =
    activeCategory === "all"
      ? categories
      : categories.filter((category) => category.id === activeCategory);

  const closeLightbox = () => setActiveIndex(null);
  const goNext = () =>
    setActiveIndex((prev) =>
      prev === null ? 0 : (prev + 1) % MENU_PAGES.length
    );
  const goPrev = () =>
    setActiveIndex((prev) =>
      prev === null
        ? MENU_PAGES.length - 1
        : (prev - 1 + MENU_PAGES.length) % MENU_PAGES.length
    );
  const prevIndex =
    activeIndex === null
      ? 0
      : (activeIndex - 1 + MENU_PAGES.length) % MENU_PAGES.length;
  const nextIndex =
    activeIndex === null ? 0 : (activeIndex + 1) % MENU_PAGES.length;
  const prevItem = activeIndex !== null ? MENU_PAGES[prevIndex] : null;
  const nextItem = activeIndex !== null ? MENU_PAGES[nextIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex]);

  return (
    <div
      className={`${plusJakarta.className} relative min-h-screen w-full overflow-hidden bg-white text-neutral-900`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-24 top-16 h-48 w-48 rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-orange-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-24 md:pt-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-600">
              Salathai
            </p>
            <h1
              className={`${playfair.className} text-4xl md:text-5xl`}
            >
              {tMenu("title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              {tMenu("subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`inline-flex items-baseline justify-center gap-2 px-8 py-3 text-[10px] tracking-widest uppercase font-black transition-all duration-300 border ${
                activeCategory === tab.id
                  ? "bg-neutral-900 border-neutral-900 text-white shadow-md"
                  : "bg-transparent text-stone-600 border-stone-300 hover:border-sala-accent hover:text-sala-accent"
              }`}
            >
              {tab.label}
              <span
                className={`font-mono font-normal transition-colors ${
                  activeCategory === tab.id
                    ? "text-stone-300"
                    : "text-stone-400 group-hover:text-sala-accent"
                }`}
              >
                ({tab.items.length})
              </span>
            </button>
          ))}
        </div>

        {visibleSections.map((section) => (
          <div key={section.id} className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className={`${playfair.className} text-2xl text-neutral-900`}>
                {section.label}
              </h2>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => {
                const index = MENU_PAGES.findIndex(
                  (page) => page.src === item.src
                );
                return (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="group relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white text-left shadow-lg transition-shadow duration-300 hover:shadow-2xl"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activeItem && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div
            className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="fixed right-6 top-6 z-[1300] rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-700 shadow"
            >
              {tMenu("close")}
            </button>

            <div className="relative flex w-full items-center justify-center px-10 md:px-16">
              {prevItem && (
                <img
                  src={prevItem.src}
                  alt={prevItem.label}
                  className="pointer-events-none absolute left-0 hidden md:block h-auto max-h-[66vh] w-auto max-w-[28vw] -translate-x-10 rounded-2xl object-contain opacity-70 blur-[0.3px] shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
                />
              )}
              <img
                src={activeItem.src}
                alt={activeItem.label}
                className="relative z-10 h-auto max-h-[90vh] w-auto max-w-[86vw] rounded-2xl object-contain shadow-[0_22px_60px_rgba(0,0,0,0.45)] md:max-w-[76vw]"
              />
              {nextItem && (
                <img
                  src={nextItem.src}
                  alt={nextItem.label}
                  className="pointer-events-none absolute right-0 hidden md:block h-auto max-h-[66vh] w-auto max-w-[28vw] translate-x-10 rounded-2xl object-contain opacity-70 blur-[0.3px] shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
                />
              )}
            </div>
            <button
              type="button"
              onClick={goPrev}
              className="fixed left-6 top-1/2 z-[1200] -translate-y-1/2 rounded-full border border-white/40 bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-800 shadow"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="fixed right-6 top-1/2 z-[1200] -translate-y-1/2 rounded-full border border-white/40 bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-800 shadow"
            >
              {">"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}