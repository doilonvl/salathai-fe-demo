import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./request";

export const pathnames = {
  "/": "/",
  "/menu": {
    vi: "/menu",
    en: "/menu",
  },
  "/admin": {
    vi: "/admin",
    en: "/admin",
  },
  "/admin/landing-menu": {
    vi: "/admin/thuc-don",
    en: "/admin/landing-menu",
  },
  "/admin/marquee-slides": {
    vi: "/admin/marquee-slides",
    en: "/admin/marquee-slides",
  },
  "/privacy-policy": {
    vi: "/chinhsach",
    en: "/privacy-policy",
  },
} as const;

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    pathnames,
    localePrefix: "as-needed",
  });
