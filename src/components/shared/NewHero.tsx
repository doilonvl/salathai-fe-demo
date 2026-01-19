"use client";
import React from "react";
import { useTranslations } from "next-intl";

const NewHero: React.FC = () => {
  const heroImage = "/Marquee/slide-1.jpg";
  const logoImage = "/Logo/Logo1.png";
  const t = useTranslations("home.hero");

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="animate-fade-in absolute inset-0">
          <img
            src={heroImage}
            alt="SalaThai Restaurant Ambiance"
            className="w-full h-full object-cover transition-transform duration-[20s] scale-100 hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-black/70 transition-colors duration-1000"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-5xl">
        <span className="text-sala-accent tracking-[0.6em] uppercase text-[10px] mb-8 block font-black transition-colors">
          Authentic Thai Cuisine
        </span>
        <h1 className="text-6xl md:text-9xl font-serif mb-12 leading-[0.9] tracking-tighter">
          SalaThai
        </h1>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
          <a
            href="#menu"
            className="px-12 py-5 bg-sala-accent text-stone-900 tracking-[0.4em] uppercase text-[10px] font-black hover:bg-white hover:text-stone-900 transition-all duration-500 shadow-2xl"
          >
            {t("ctaPrimary")}
          </a>
          <a
            href="#reservation"
            className="px-12 py-5 border border-white/30 text-white tracking-[0.4em] uppercase text-[10px] font-black hover:bg-white hover:text-stone-900 transition-all duration-500"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-30">
        <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
};

export default NewHero;
