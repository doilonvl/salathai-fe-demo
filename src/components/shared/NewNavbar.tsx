import React, { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/request";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

type NewNavbarProps = {
  onOpenReservation: () => void;
  onCloseReservation: () => void;
};

const NewNavbar: React.FC<NewNavbarProps> = ({
  onOpenReservation,
  onCloseReservation,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const locale = useLocale() as Locale;
  const tHeader = useTranslations("header");
  const tFooter = useTranslations("footer");
  const pathname = usePathname();
  const contactEmail = "salathaivietnam@gmail.com";
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    if (isMobileMenuOpen) {
      scrollYRef.current = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
      mobileMenuRef.current?.scrollTo({ top: 0, left: 0 });
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollYRef.current) {
        window.scrollTo(0, scrollYRef.current);
      }
    }
  }, [isMobileMenuOpen]);

  const localePrefix = locale === "vi" ? "" : `/${locale}`;
  const homeHref = `${localePrefix}/`;
  const menuHref = `${localePrefix}/menu`;
  const blogHref = `${localePrefix}/blog`;
  const contactHref = `${localePrefix}/contact`;
  const showcaseHref = `${localePrefix}/signature`;

  const isHomePage = pathname === homeHref;
  // Kiểm tra xem có phải đang ở trang blog không
  const isBlogPage = pathname.includes("/blog");
  const isMenuPage = pathname.includes("/menu");

  const handleReservationClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (isHomePage) {
      e.preventDefault();
      const reservationSection = document.getElementById("reservation");
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      onOpenReservation();
    }
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const linkClass =
    "text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-300";

  // LOGIC QUAN TRỌNG:
  // Chữ sẽ màu ĐEN nếu: Đã cuộn xuống HOẶC Đang ở trang Blog
  // Ngược lại (Chưa cuộn VÀ không phải Blog) thì màu TRẮNG
  const shouldUseDarkText = isScrolled || isBlogPage || isMenuPage;

  const textColor = shouldUseDarkText ? "text-stone-800" : "text-white";
  const buttonBorderClass = shouldUseDarkText
    ? "border-stone-900 text-stone-900"
    : "border-white text-white";

  const accentColor = "text-sala-accent";
  const logoImage = "/Logo/Logo1.png";

  return (
    // Khôi phục lại logic Background và Padding theo isScrolled để giữ animation
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-700 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-6"}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between relative lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="flex flex-col gap-1">
              <span className={`h-[2px] w-5 ${shouldUseDarkText ? "bg-stone-800" : "bg-white"}`} />
              <span className={`h-[2px] w-5 ${shouldUseDarkText ? "bg-stone-800" : "bg-white"}`} />
              <span className={`h-[2px] w-5 ${shouldUseDarkText ? "bg-stone-800" : "bg-white"}`} />
            </span>
          </button>
          <LanguageSwitcher className={`${linkClass} ${textColor} hover:${accentColor}`} />
        </div>
        {/* Left side links */}
        <div className="hidden lg:flex items-center space-x-8 lg:justify-start">
          <a
            href={menuHref}
            className={`${linkClass} ${textColor} hover:${accentColor}`}
          >
            {tHeader("menu")}
          </a>
          <a
            href={blogHref}
            className={`${linkClass} ${textColor} hover:${accentColor}`}
          >
            {tHeader("blog")}
          </a>
          <a
            href={showcaseHref}
            className={`${linkClass} ${textColor} hover:${accentColor}`}
          >
            {tHeader("showcase")}
          </a>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:flex lg:justify-center">
          <a
            href={homeHref}
            className="block transition-transform duration-500 hover:scale-105"
          >
            {/* Khôi phục logic thay đổi kích thước Logo */}
            <div
              className={`relative ${isScrolled ? "w-16 h-16" : "w-24 h-24"} transition-all duration-700`}
            >
              <img
                src={logoImage}
                alt="Salathai Logo"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </a>
        </div>

        {/* Right side links */}
        <div className="hidden lg:flex items-center space-x-6 lg:justify-end">
          <a
            href={contactHref}
            className={`${linkClass} ${textColor} hover:${accentColor}`}
          >
            {tHeader("contact")}
          </a>
          <LanguageSwitcher
            className={`${linkClass} ${textColor} hover:${accentColor}`}
          />
          <button
            onClick={handleReservationClick}
            className={`px-8 py-3 border ${buttonBorderClass} hover:bg-sala-accent hover:border-sala-accent hover:text-stone-900 transition-all text-[9px] tracking-[0.3em] uppercase font-black`}
          >
            {tHeader("reservations")}
          </button>
        </div>

        {/* Mobile Menu Trigger Placeholder */}
        <div className="lg:hidden">
          <button
            onClick={handleReservationClick}
            className={`px-4 py-2 border ${buttonBorderClass} text-[9px] tracking-widest uppercase font-black`}
          >
            {tHeader("reservations")}
          </button>
        </div>
      </div>
      {isMobileMenuOpen ? (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)} />
          <div
            ref={mobileMenuRef}
            className="relative z-[61] h-full w-full overflow-y-auto overscroll-contain"
          >
            <div className="sticky top-0 z-[62] flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm">
              <img
                src={logoImage}
                alt="Salathai Logo"
                className="h-10 w-10 rounded-full object-contain"
              />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow"
                aria-label="Close menu"
              >
                X
              </button>
            </div>
            <div className="px-6 pb-10 pt-6 flex flex-col">
              <div className="grid gap-3">
              <a
                href={menuHref}
                onClick={handleMobileNavClick}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-stone-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]"
              >
                {tHeader("menu")}
              </a>
              <a
                href={blogHref}
                onClick={handleMobileNavClick}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-stone-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]"
              >
                {tHeader("blog")}
              </a>
              <a
                href={showcaseHref}
                onClick={handleMobileNavClick}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-stone-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]"
              >
                {tHeader("showcase")}
              </a>
              <a
                href={contactHref}
                onClick={handleMobileNavClick}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-stone-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]"
              >
                {tHeader("contact")}
              </a>
              </div>
              <div className="mt-8 space-y-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400">
                  {tHeader("contact")}
                </p>
                <p>{tFooter("addressLine1")}</p>
                <p>{tFooter("addressLine2")}</p>
                <p>{tFooter("phone")}</p>
                <p>{contactEmail}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default NewNavbar;
