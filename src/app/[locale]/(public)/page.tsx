import type { LandingMenuItem } from "@/types/landing";
import type { MarqueeImage, MarqueeSlide } from "@/types/marquee";
import type { Metadata } from "next";
import { LandingReveal } from "@/components/animation/LandingReveal";
import { MarqueeScroller } from "@/components/animation/MarqueeScroller";
import ScrollStrokePage from "@/components/animation/ScrollStrokePage";
import SocialEmbeds from "@/components/social/SocialEmbeds";
import { ReservationForm } from "@/components/shared/reservation-form";
import { getApiBaseUrl, getSiteUrl } from "@/lib/env";
import NewHero from "@/components/shared/NewHero";
import NewMenu from "@/components/shared/NewMenu";
import OurStory from "@/components/shared/OurStory";

export const revalidate = 300;

const API_BASE = getApiBaseUrl();
const SITE_NAME = "Salathai";
const OG_IMAGE_PATH = "/Marquee/slide-1.jpg";

function toAbsoluteUrl(url: string, base: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return new URL(url, base).toString();
}

function getSeoCopy(locale: string) {
  if (locale === "en") {
    return {
      title: "Authentic Thai Cuisine in Hanoi",
      description:
        "Salathai serves authentic Thai cuisine with fresh ingredients, balanced flavors, and a warm dining atmosphere in Hanoi.",
    };
  }
  return {
    title: "Ẩm thực Thái Lan chuẩn vị tại Hà Nội",
    description:
      "SalaThai mang đến ẩm thực Thái Lan chuẩn vị với nguyên liệu tươi, hương vị cân bằng và không gian ấm cúng ngay tại Hà Nội.",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = getSeoCopy(locale);
  const siteUrl = getSiteUrl();
  const canonicalPath = locale === "vi" ? "/" : `/${locale}`;
  const canonicalUrl = new URL(canonicalPath, siteUrl).toString();
  const ogImageUrl = new URL(OG_IMAGE_PATH, siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: new URL("/", siteUrl).toString(),
        en: new URL("/en", siteUrl).toString(),
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} Thai cuisine`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

async function fetchJson<T>(
  path: string,
  revalidateSeconds = 300,
  timeoutMs = 8000
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: revalidateSeconds },
      cache: "force-cache",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

async function getLandingMenuSSR(): Promise<LandingMenuItem[]> {
  try {
    const data = await fetchJson<{ items?: LandingMenuItem[] }>(
      "/landing-menu",
      300
    );
    const items = Array.isArray(data?.items) ? data.items : [];
    return items
      .filter((i) => i?.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  } catch {
    return [];
  }
}

async function getMarqueeSSR(): Promise<{
  images: MarqueeImage[];
  slides: MarqueeSlide[];
}> {
  try {
    const [imagesRes, slidesRes] = await Promise.all([
      fetchJson<{ items?: MarqueeImage[] }>("/marquee-images", 300).catch(
        () => ({ items: [] as MarqueeImage[] })
      ),
      fetchJson<{ items?: MarqueeSlide[] }>("/marquee-slides", 300).catch(
        () => ({ items: [] as MarqueeSlide[] })
      ),
    ]);
    const images = (imagesRes.items ?? []).filter((i) => i?.isActive);
    const slides = (slidesRes.items ?? []).filter((i) => i?.isActive);
    return {
      images,
      slides: slides.sort((a, b) => a.orderIndex - b.orderIndex),
    };
  } catch {
    return { images: [], slides: [] };
  }
}

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [landingMenu, marquee] = await Promise.all([
    getLandingMenuSSR(),
    getMarqueeSSR(),
  ]);
  const siteUrl = getSiteUrl();
  const canonicalPath = locale === "vi" ? "/" : `/${locale}`;
  const canonicalUrl = new URL(canonicalPath, siteUrl).toString();
  const ogImageUrl = new URL(OG_IMAGE_PATH, siteUrl).toString();

  const menuItems = landingMenu.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "MenuItem",
      name: item.altText || `Menu item ${index + 1}`,
      image: toAbsoluteUrl(item.imageUrl, siteUrl),
    },
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        alternateName: ["Sala Thai", "SalaThai", "Sala Thai Restaurant"],
        inLanguage: locale === "vi" ? "vi-VN" : "en-US",
      },
      {
        "@type": "Restaurant",
        "@id": `${siteUrl}/#restaurant`,
        name: SITE_NAME,
        alternateName: ["Sala Thai", "SalaThai"],
        url: siteUrl,
        image: new URL(OG_IMAGE_PATH, siteUrl).toString(),
        servesCuisine: "Thai",
        priceRange: "$$",
        acceptsReservations: "True",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: canonicalUrl,
          },
        ],
      },
      ...(menuItems.length
        ? [
            {
              "@type": "CollectionPage",
              "@id": `${siteUrl}/#menu`,
              name: "Menu",
              url: canonicalUrl,
              mainEntity: {
                "@type": "ItemList",
                itemListElement: menuItems,
              },
            },
          ]
        : []),
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <NewHero />
      <NewMenu />
      <OurStory />

      <section className="py-16 md:py-24">
        <MarqueeScroller
          initialImages={marquee.images}
          initialSlides={marquee.slides}
        />
      </section>

      {/* Hidden Stroke svg */}
      <section className="hidden">
        <ScrollStrokePage />
      </section>

      {/* Reservation form - Now with new styles */}
      <section id="reservation" className="py-16 md:py-32">
        <ReservationForm />
      </section>

      <section className="py-16 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-0">
        <SocialEmbeds />
      </section>
    </main>
  );
}
