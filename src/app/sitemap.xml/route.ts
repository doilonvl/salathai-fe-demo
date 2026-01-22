import { getSiteUrl } from "@/lib/env";
import { fetchPublicBlogs } from "@/lib/api/blogs.public";
import { resolveSlug } from "@/lib/blogs";
import type { Locale } from "@/types/content";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const STATIC_PATHS = ["", "menu", "contact", "blog", "privacy-policy", "signature"];
const LOCALES: Locale[] = ["vi", "en"];

async function fetchAllBlogSlugs(locale: Locale) {
  const slugs = new Set<string>();
  let page = 1;
  const limit = 50;
  while (true) {
    try {
      const data = await fetchPublicBlogs({
        locale,
        page,
        limit,
        sort: "-publishedAt",
      });
      const items = data?.items ?? [];
      items.forEach((item) => {
        const slug = item.slug || resolveSlug(item.slug_i18n, locale);
        if (slug) slugs.add(slug);
      });
      if (items.length < limit) break;
      page += 1;
      if (page > 20) break;
    } catch {
      break;
    }
  }
  return Array.from(slugs);
}

export async function GET() {
  const base = getSiteUrl();
  const lastmod = new Date().toISOString();

  const urls: string[] = [];
  LOCALES.forEach((locale) => {
    const prefix = locale === "en" ? "/en" : "";
    STATIC_PATHS.forEach((path) => {
      const full = `${base}${prefix}/${path}`.replace(/\/+$/, "/");
      urls.push(full);
    });
  });

  const blogSlugsByLocale = await Promise.all(
    LOCALES.map(async (locale) => ({
      locale,
      slugs: await fetchAllBlogSlugs(locale),
    }))
  );

  blogSlugsByLocale.forEach(({ locale, slugs }) => {
    const prefix = locale === "en" ? "/en" : "";
    slugs.forEach((slug) => {
      urls.push(`${base}${prefix}/blog/${slug}`.replace(/\/+$/, "/"));
    });
  });

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((loc) => {
        const escaped = xmlEscape(loc);
        return `  <url>\n    <loc>${escaped}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`;
      })
      .join("\n") +
    "\n</urlset>\n";

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
