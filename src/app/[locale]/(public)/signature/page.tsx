import type { Metadata } from "next";
import NfWorkSlider from "@/components/work/NfWorkSlider";
import "@/styles/nf-work.css";
import type { Locale } from "@/types/content";
import { getSiteUrl } from "@/lib/env";
import { getLocalePrefix } from "@/lib/routes";

const BASE_URL = getSiteUrl();

type PageParams = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const prefix = getLocalePrefix(locale);
  const canonical = prefix
    ? `${BASE_URL}${prefix}/signature`
    : `${BASE_URL}/signature`;

  const meta =
    locale === "en"
      ? {
          title: "Signature Dishes | Salathai",
          description:
            "Explore SalaThai signature dishes crafted with authentic Thai flavors and fresh ingredients.",
        }
      : {
          title: "Món đặc trưng | SalaThai",
          description:
            "Khám phá các món đặc trưng SalaThai với hương vị Thái chuẩn và nguyên liệu tươi ngon.",
        };

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}/signature`,
        en: `${BASE_URL}/en/signature`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function WorkPage() {
  return <NfWorkSlider />;
}
