import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Cookie,
  FileSearch,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/types/content";
import { getSiteUrl } from "@/lib/env";
import LandingHeader from "@/components/shared/LandingHeader";

type PageParams = {
  params: Promise<{ locale: Locale }>;
};

type QuickPoint = { title: string; description: string; icon: string };
type Section = {
  id: string;
  title: string;
  summary?: string;
  items: string[];
  icon: string;
};

const ICONS: Record<string, LucideIcon> = {
  Bell,
  CheckCircle2,
  Cookie,
  FileSearch,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
};

const BASE_URL = getSiteUrl();
const DEFAULT_OG_IMAGE = `${BASE_URL}/Logo/Logo1.png`;

const PRIVACY_META = {
  vi: {
    title: "Chính sách bảo mật | SalaThai",
    description:
      "Chính sách bảo mật của SalaThai giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu khi bạn truy cập salathai.com.vn hoặc liên hệ đặt bàn.",
  },
  en: {
    title: "Privacy Policy | SalaThai",
    description:
      "SalaThai's privacy policy explains how we collect, use, store, and protect your data when you visit salathai.com.vn or contact us for reservations.",
  },
} as const;

function getLocalePrefix(locale: Locale) {
  return locale === "en" ? "/en" : "";
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const meta = PRIVACY_META[locale === "en" ? "en" : "vi"];
  const prefix = getLocalePrefix(locale);
  const canonical = prefix
    ? `${BASE_URL}${prefix}/privacy-policy`
    : `${BASE_URL}/privacy-policy`;

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}/privacy-policy`,
        en: `${BASE_URL}/en/privacy-policy`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PrivacyPolicyPage({ params }: PageParams) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const heroHighlights = (t.raw("heroHighlights") as string[]) ?? [];
  const quickPoints = (t.raw("quickPoints") as QuickPoint[]) ?? [];
  const sections = (t.raw("sections") as Section[]) ?? [];
  const contact = t.raw("contact") as {
    eyebrow: string;
    title: string;
    description: string;
    address: string;
    phone: string;
    email: string;
  };
  const rightsBullets = (t.raw("rightsBullets") as string[]) ?? [];

  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 md:px-6 md:pt-28 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-600 via-rose-500 to-amber-400 text-white shadow-xl">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_40%)]"
            aria-hidden
          />
          <div className="relative space-y-4 px-6 py-10 md:px-10 md:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-50/80">
              SalaThai
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-3xl text-base text-amber-50/95 md:text-lg">
              {t("tagline")}
            </p>
            <p className="text-sm text-amber-50/80">{t("updated")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {heroHighlights.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/35 bg-white/20 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {quickPoints.map((item) => {
          const Icon = ICONS[item.icon] ?? ShieldCheck;
          return (
            <div
              key={item.title}
              className="flex gap-3 rounded-2xl border border-amber-100/70 bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {sections.map((section, index) => {
          const Icon = ICONS[section.icon] ?? ShieldCheck;
          return (
            <article
              key={section.id}
              className="h-full rounded-2xl border border-neutral-100 bg-white/95 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600/80">
                      {t("sectionEyebrow")}
                    </p>
                    <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 ring-1 ring-neutral-200 md:flex">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {section.summary ? (
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  {section.summary}
                </p>
              ) : null}

              <ul className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-neutral-800"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

        <section className="mt-12 grid gap-4 rounded-2xl border border-amber-100 bg-amber-50/80 p-6 shadow-inner md:grid-cols-2 md:p-7">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-700">
            {contact.eyebrow}
          </p>
          <h3 className="text-xl font-semibold text-neutral-900 md:text-2xl">
            {contact.title}
          </h3>
          <p className="text-sm leading-relaxed text-neutral-700">
            {contact.description}
          </p>

          <div className="mt-4 space-y-2 text-sm text-neutral-800">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-700" />
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                className="font-semibold text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-amber-700"
              >
                {contact.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-700" />
              <a
                href={`mailto:${contact.email}`}
                className="font-semibold text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-amber-700"
              >
                {contact.email}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-amber-700" />
              <span>{contact.address}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/80 bg-white/95 p-5 shadow-sm">
          <h4 className="text-base font-semibold text-neutral-900">
            {t("rightsTitle")}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            {t("rightsCopy")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-800">
            {rightsBullets.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Link
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <Mail className="h-4 w-4" />
              {contact.email}
            </Link>
          </div>
        </div>
        </section>
      </main>
    </>
  );
}
