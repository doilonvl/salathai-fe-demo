import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/request";

export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

type RootLocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLocaleLayout({
  children,
  params,
}: RootLocaleLayoutProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const resolvedLocale = locale as Locale;
  setRequestLocale(resolvedLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
