"use client";

import { useRef, useState } from "react";
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
  const tFooter = useTranslations("footer");
  const locale = useLocale() as Locale;
  const localePrefix = locale === "vi" ? "" : `/${locale}`;
  const resolvedHomeHref = homeHref ?? `${localePrefix}/`;
  const blogHref = `${localePrefix}/blog`;
  const menuHref = `${localePrefix}/menu`;
  const contactHref = `${localePrefix}/contact`;
  const showcaseHref = `${localePrefix}/showcase`;
  const resolvedReservationHref =
    reservationHref ?? `${localePrefix}/#reservation`;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lastNavToggleRef = useRef(0);
  const closeMobileNav = () => {
    lastNavToggleRef.current = Date.now();
    setMobileNavOpen(false);
  };
  const toggleMobileNav = () => {
    const now = Date.now();
    if (now - lastNavToggleRef.current < 300) return;
    setMobileNavOpen((prev) => !prev);
  };

  const navPill =
    "nav-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10";

  const blogLabel = tHeader("blog");
  const menuLabel = tHeader("menu");
  const reservationLabel = tHeader("reservations");
  const isReservationButton = Boolean(onOpenReservation);
  const contactAddress = tFooter("addressLine2");
  const contactPhone = tFooter("phone");
  const contactEmail = "salathaivietnam@gmail.com";

  return (
    <div className={`${plusJakarta.variable} landing-reveal`}>
      <nav
        className={`absolute md:fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-4 md:px-8 pt-4 md:pt-6 pb-2 transition-all duration-300 ease-out ${
          mobileNavOpen ? "pointer-events-none md:pointer-events-auto" : ""
        } ${visibilityClass}`}
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
            <div className="lr-nav-item">
              <ReservationAction
                className={navPill}
                label={reservationLabel}
                href={resolvedReservationHref}
                asButton={isReservationButton}
                onClick={onOpenReservation}
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="lr-nav-item">
              <a href={blogHref} className={navPill}>
                {blogLabel}
              </a>
            </div>
            <div className="lr-nav-item">
              <a href={menuHref} className={navPill}>
                {menuLabel}
              </a>
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
          <div
            className={`flex md:hidden w-full items-center justify-between gap-2 transition-opacity duration-200 ${
              mobileNavOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
              className="lr-nav-item nav-pill inline-flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10"
              onClick={toggleMobileNav}
            >
              <span className="block h-[2px] w-5 bg-neutral-800 rounded-sm"></span>
              <span className="block h-[2px] w-5 bg-neutral-800 rounded-sm"></span>
              <span className="block h-[2px] w-5 bg-neutral-800 rounded-sm"></span>
            </button>
            <div className="flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-900">
              Salathai
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="h-8 px-2 text-[10px]" />
              <ReservationAction
                className="nav-pill inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-900 shadow-sm"
                label={reservationLabel}
                href={resolvedReservationHref}
                asButton={isReservationButton}
                onClick={onOpenReservation}
              />
            </div>
          </div>
        </>
      </nav>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-200 ${
          mobileNavOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onPointerDown={closeMobileNav}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[65%] max-w-[260px] bg-[radial-gradient(circle_at_30%_20%,#fff6e9_0%,#ffe1c6_50%,#f0c1a2_100%)] shadow-2xl relative transition-transform duration-300 ease-out ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            aria-label="Close menu"
            onPointerDown={(event) => {
              event.stopPropagation();
              closeMobileNav();
            }}
            onClick={(event) => {
              event.stopPropagation();
              closeMobileNav();
            }}
            className="absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-sm font-semibold text-neutral-900 shadow-sm"
          >
            X
          </button>
          <div
            className="flex flex-col gap-3 px-4 pt-16 pb-6"
          >
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
              href={blogHref}
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {blogLabel}
            </a>
            <a
              href={menuHref}
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {menuLabel}
            </a>
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
            <div className="mt-2 border-t border-black/10 pt-4 text-[11px] text-neutral-700">
              <p className="font-semibold uppercase tracking-[0.2em] text-neutral-800">
                Salathai
              </p>
              <p className="mt-2 leading-snug">{contactAddress}</p>
              <a
                href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                className="mt-2 block font-semibold text-neutral-900"
              >
                {contactPhone}
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 block text-neutral-900 underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
