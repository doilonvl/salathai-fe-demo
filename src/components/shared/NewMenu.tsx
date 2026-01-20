/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { SIGNATURE_DISHES_DATA } from "@/data/signature-dishes-data";
import type { Dish } from "@/types/new-menu";
import type { Locale } from "@/i18n/request";

const NewMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations();
  const locale = useLocale() as Locale;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const menuData = useMemo(() => {
    return SIGNATURE_DISHES_DATA.map((dish) => ({
      ...dish,
      name: t(dish.name as any),
      description: t(dish.description as any),
    }));
  }, [t]);

  const categories = useMemo(() => {
    const dishCategories = Array.from(
      new Set(SIGNATURE_DISHES_DATA.map((d) => d.category)),
    );
    return [
      t("menuPage.categories.all"),
      ...dishCategories.map((catId) =>
        t(`menuPage.categories.${catId}` as any),
      ),
    ];
  }, [t]);

  const categoryIdMap = useMemo(() => {
    const dishCategories = Array.from(
      new Set(SIGNATURE_DISHES_DATA.map((d) => d.category)),
    );
    const idMap: { [key: string]: string } = {
      [t("menuPage.categories.all")]: "All",
    };
    dishCategories.forEach((catId) => {
      idMap[t(`menuPage.categories.${catId}` as any)] = catId;
    });
    return idMap;
  }, [t]);

  const finalMenu = useMemo(() => {
    const filtered =
      activeTab === "All"
        ? menuData
        : menuData.filter((dish) => dish.category === activeTab);
    if (isMobile && activeTab === "All") {
      return filtered.slice(0, 3);
    }
    return filtered;
  }, [activeTab, isMobile, menuData]);

  const accentColor = "bg-sala-accent";
  const textAccent = "text-sala-accent";

  return (
    <section
      id="menu"
      className="py-20 bg-white transition-colors duration-700"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
          {t("home.signature.title")}
        </h2>
        <p className="text-stone-500 max-w-2xl mx-auto mb-16">
          {t("home.marquee.outro")}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(categoryIdMap[cat])}
              className={`px-8 py-3 text-[10px] tracking-widest uppercase font-black transition-all duration-300 border ${
                activeTab === categoryIdMap[cat]
                  ? "bg-neutral-900 border-neutral-900 text-white shadow-md"
                  : "bg-transparent text-stone-500 border-stone-200 hover:border-sala-accent hover:text-sala-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 w-full md:max-w-[90%] md:mx-auto">
          {finalMenu.map((dish) => (
            <div key={dish.id} className="group cursor-pointer text-left">
              <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-stone-100">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-sala-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <h3 className="text-xl font-serif transition-colors duration-300 text-sala-primary group-hover:text-sala-accent">
                    {dish.name}
                  </h3>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed mb-4 font-light">
                  {dish.description}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(dish.spiciness)].map((_, i) => (
                    <span key={i} className={`${textAccent} text-[10px]`}>
                      ●
                    </span>
                  ))}
                  {dish.spiciness === 0 && (
                    <span className="text-stone-300 text-[10px]">○</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewMenu;
