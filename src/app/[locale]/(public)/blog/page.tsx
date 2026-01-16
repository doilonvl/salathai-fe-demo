import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/types/content";
import { getSiteUrl } from "@/lib/env";
import { getLocalePrefix } from "@/lib/routes";
import { fetchPublicBlogs } from "@/lib/api/blogs.public";
import { formatDate, resolveI18nValue, resolveSlug } from "@/lib/blogs";
import type { Blog } from "@/types/blog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlogListMotion from "@/components/blog/BlogListMotion";
import LandingHeader from "@/components/shared/LandingHeader";

const BASE_URL = getSiteUrl();
const DEFAULT_OG_IMAGE = `${BASE_URL}/Marquee/slide-4.jpg`;

type PageParams = {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ page?: string; tag?: string }>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const prefix = getLocalePrefix(locale);
  const canonical = prefix ? `${BASE_URL}${prefix}/blog` : `${BASE_URL}/blog`;

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}/blog`,
        en: `${BASE_URL}/en/blog`,
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: canonical,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function buildDetailHref(locale: Locale, slug: string) {
  const prefix = getLocalePrefix(locale);
  return `${prefix}/blog/${slug}` || `/blog/${slug}`;
}

function buildPageHref(locale: Locale, page: number, tag: string | undefined) {
  const prefix = getLocalePrefix(locale);
  const base = `${prefix}/blog` || "/blog";
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (tag) params.set("tag", tag);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function getCoverAlt(blog: Blog, locale: Locale) {
  return resolveI18nValue(blog.coverImage?.alt_i18n, locale, "");
}

export default async function BlogPage({ params, searchParams }: PageParams) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(sp.page || 1));
  const tag = sp.tag?.trim() || undefined;
  const limit = 6;
  const t = await getTranslations({ locale, namespace: "blog" });

  let listData: { items: Blog[]; total: number } | null = null;
  let latestData: { items: Blog[] } | null = null;

  try {
    const [listRes, latestRes] = await Promise.all([
      fetchPublicBlogs({
        locale,
        page,
        limit,
        sort: "-publishedAt",
        tag,
      }),
      fetchPublicBlogs({
        locale,
        page: 1,
        limit: 5,
        sort: "-publishedAt",
      }),
    ]);
    listData = listRes;
    latestData = latestRes;
  } catch (error) {
    console.error("FETCH_BLOGS_FAILED", error);
  }

  const items = listData?.items ?? [];
  const latest = latestData?.items ?? [];
  const total = listData?.total ?? 0;
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  return (
    <main className="relative overflow-hidden bg-slate-50/70">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.08),transparent_55%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.08),transparent_50%)]"
        aria-hidden
      />
      <LandingHeader />
      <BlogListMotion>
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-24 md:px-6 md:pt-28 lg:px-8">
          <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/85 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] md:p-10">
            <div
              className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.7),rgba(15,23,42,0.25)),url('/Marquee/slide-4.jpg')] bg-cover bg-center"
              aria-hidden
            />
            <div className="relative">
              <p
                data-hero
                className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200/90"
              >
                Salathai
              </p>
              <h1
                data-hero
                className="mt-3 text-3xl font-semibold text-white md:text-4xl"
              >
                {t("title")}
              </h1>
              <p
                data-hero
                className="mt-3 max-w-2xl text-sm text-white/85 md:text-base"
              >
                {t("subtitle")}
              </p>
              {tag ? (
                <div
                  data-hero
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {t("tagLabel")} {tag}
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6">
              {items.length === 0 ? (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {t("emptyTitle")}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("emptyBody")}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const slug =
                      item.slug || resolveSlug(item.slug_i18n, locale);
                    const title = resolveI18nValue(item.title_i18n, locale);
                    const excerpt = resolveI18nValue(
                      item.excerpt_i18n,
                      locale,
                      ""
                    );
                    const cover = item.coverImage?.url;
                    const detailHref = buildDetailHref(locale, slug);
                    const dateLabel = formatDate(
                      item.publishedAt || item.createdAt,
                      locale
                    );

                    return (
                      <Card
                        key={item._id}
                        data-card
                        className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 p-0 shadow-[0_30px_70px_-60px_rgba(15,23,42,0.6)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_-60px_rgba(15,23,42,0.75)]"
                      >
                        <Link
                          href={detailHref}
                          className="block overflow-hidden"
                        >
                          <div className="relative aspect-[4/3] w-full bg-muted">
                            {cover ? (
                              <Image
                                src={cover}
                                alt={getCoverAlt(item, locale) || title}
                                fill
                                sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
                                className="object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                {t("noCover")}
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="space-y-2 px-4 pb-4">
                          <Link href={detailHref}>
                            <h2 className="text-lg font-semibold leading-snug text-neutral-900 line-clamp-2">
                              {title}
                            </h2>
                          </Link>
                          {excerpt ? (
                            <p className="text-sm leading-relaxed text-neutral-600 line-clamp-3">
                              {excerpt}
                            </p>
                          ) : null}
                          <div className="text-xs text-neutral-500">
                            {dateLabel}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {items.length > 0 ? (
                <div
                  data-pagination
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm shadow-sm"
                >
                  <span className="text-muted-foreground">
                    {t("pageLabel", {
                      page,
                      total: Math.max(1, Math.ceil(total / limit)),
                    })}
                  </span>
                  {hasPrev || hasNext ? (
                    <div className="flex items-center gap-2">
                      {hasPrev ? (
                        <Button asChild variant="outline">
                          <Link href={buildPageHref(locale, page - 1, tag)}>
                            {t("previous")}
                          </Link>
                        </Button>
                      ) : null}
                      <div className="rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        {page}/{Math.max(1, Math.ceil(total / limit))}
                      </div>
                      {hasNext ? (
                        <Button asChild variant="outline">
                          <Link href={buildPageHref(locale, page + 1, tag)}>
                            {t("next")}
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)]">
                <p
                  data-hero
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/80"
                >
                  {t("latestTitle")}
                </p>
                <div className="mt-4 space-y-3">
                  {latest.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("empty")}
                    </p>
                  ) : (
                    latest.map((item) => {
                      const slug =
                        item.slug || resolveSlug(item.slug_i18n, locale);
                      const title = resolveI18nValue(item.title_i18n, locale);
                      const cover = item.coverImage?.url;
                      const detailHref = buildDetailHref(locale, slug);
                      return (
                        <Link
                          key={item._id}
                          href={detailHref}
                          data-latest-item
                          className="flex items-center gap-3 rounded-2xl border border-transparent p-2 transition hover:border-slate-200/70 hover:bg-muted/40"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                            {cover ? (
                              <Image
                                src={cover}
                                alt={getCoverAlt(item, locale) || title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 line-clamp-2">
                              {title}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatDate(
                                item.publishedAt || item.createdAt,
                                locale
                              )}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </BlogListMotion>
    </main>
  );
}
