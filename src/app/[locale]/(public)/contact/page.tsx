import type { Metadata } from "next";
import NfContact from "@/components/contact/NfContact";
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
    ? `${BASE_URL}${prefix}/contact`
    : `${BASE_URL}/contact`;

  const meta =
    locale === "en"
      ? {
          title: "Contact | Salathai",
          description:
            "Get in touch with SalaThai for reservations, private events, or menu questions.",
        }
      : {
          title: "Liên hệ | SalaThai",
          description:
            "Liên hệ SalaThai để đặt bàn, tổ chức sự kiện riêng hoặc hỏi thông tin thực đơn.",
        };

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}/contact`,
        en: `${BASE_URL}/en/contact`,
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

export default function ContactPage() {
  return <NfContact />;
}
