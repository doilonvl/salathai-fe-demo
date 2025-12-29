"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus_Jakarta_Sans } from "next/font/google";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import type { Locale } from "@/i18n/request";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-landing-sans",
});

type LandingHeaderProps = {
  visibilityClass?: string;
  homeHref?: string;
  reservationHref?: string;
  onOpenReservation?: () => void;
};

type ReservationActionProps = {
  className: string;
  label: string;
  href: string;
  onClick?: () => void;
  asButton?: boolean;
};

function ReservationAction({
  className,
  label,
  href,
  onClick,
  asButton,
}: ReservationActionProps) {
  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {label}
      </button>
    );
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {label}
    </a>
  );
}

export default function LandingHeader({
  visibilityClass = "opacity-100 translate-y-0 pointer-events-auto",
  homeHref,
  reservationHref,
  onOpenReservation,
}: LandingHeaderProps) {
  const tHeader = useTranslations("header");
  const locale = useLocale() as Locale;
  const localePrefix = locale === "vi" ? "" : `/${locale}`;
  const resolvedHomeHref = homeHref ?? `${localePrefix}/`;
  const contactHref = `${localePrefix}/contact`;
  const showcaseHref = `${localePrefix}/showcase`;
  const resolvedReservationHref =
    reservationHref ?? `${localePrefix}/#reservation`;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  const navPill =
    "nav-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10";

  const reservationLabel = tHeader("reservations");
  const isReservationButton = Boolean(onOpenReservation);

  return (
    <div className={`${plusJakarta.variable} landing-reveal`}>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-4 md:px-8 pt-4 md:pt-6 pb-2 transition-all duration-300 ease-out ${visibilityClass}`}
      >
        <style>
          {`
            .nav-pill {
              background: rgba(255,255,255,0.9);
              border: 1px solid rgba(0,0,0,0.08);
            }
          `}
        </style>
        <>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <div className="lr-nav-item">
              <a href={resolvedHomeHref} className={navPill}>
                {tHeader("home")}
              </a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="lr-nav-item">
              <ReservationAction
                className={navPill}
                label={reservationLabel}
                href={resolvedReservationHref}
                asButton={isReservationButton}
                onClick={onOpenReservation}
              />
            </div>
            <div className="lr-nav-item">
              <a href={contactHref} className={navPill}>
                {tHeader("contact")}
              </a>
            </div>
            <div className="lr-nav-item">
              <a href={showcaseHref} className={navPill}>
                {tHeader("showcase")}
              </a>
            </div>
            <div className="lr-nav-item">
              <LanguageSwitcher className={navPill} />
            </div>
          </div>

          {/* Mobile nav trigger */}
          <div className="flex md:hidden w-full justify-between items-center">
            <div className="lr-nav-item">
              <a href={resolvedHomeHref} className={navPill}>
                {tHeader("home")}
              </a>
            </div>
            <button
              type="button"
              aria-label="Toggle menu"
              className="lr-nav-item nav-pill inline-flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <span className="block h-[2px] w-6 bg-neutral-800 rounded-sm"></span>
              <span className="block h-[2px] w-6 bg-neutral-800 rounded-sm"></span>
              <span className="block h-[2px] w-6 bg-neutral-800 rounded-sm"></span>
            </button>
          </div>
        </>
      </nav>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileNavOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={closeMobileNav}
        />
        <div
          className={`absolute right-0 top-0 h-full w-4/5 max-w-xs bg-[radial-gradient(circle_at_30%_20%,#fff6e9_0%,#ffe1c6_50%,#f0c1a2_100%)] shadow-2xl transition-transform duration-300 ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
            <span className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Menu
            </span>
          </div>
          <div className="flex flex-col gap-3 px-4 py-6">
            <a
              href={resolvedHomeHref}
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {tHeader("home")}
            </a>
            <ReservationAction
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
              label={reservationLabel}
              href={resolvedReservationHref}
              asButton={isReservationButton}
              onClick={() => {
                onOpenReservation?.();
                closeMobileNav();
              }}
            />
            <a
              href={contactHref}
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {tHeader("contact")}
            </a>
            <a
              href={showcaseHref}
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {tHeader("showcase")}
            </a>
            <LanguageSwitcher
              className="w-full justify-between px-4 py-3 text-sm h-auto"
              onLocaleChange={closeMobileNav}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
