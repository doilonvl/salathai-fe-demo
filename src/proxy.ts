/* eslint-disable @typescript-eslint/no-explicit-any */
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/request";
import { pathnames } from "@/i18n/navigation";

const intl = createMiddleware({
  locales: [...locales],
  defaultLocale,
  pathnames,
  localePrefix: "as-needed",
  // Force default locale when no explicit selection; avoid Accept-Language choosing English first.
  localeDetection: false,
});

export default async function proxy(req: NextRequest) {
  const res = intl(req);
  if (!req.cookies.get("NEXT_LOCALE")) {
    res.cookies.set("NEXT_LOCALE", defaultLocale, {
      path: "/",
      sameSite: "lax",
    });
  }

  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/(?:(vi|en)\/)?admin(\/|$)/);
  if (match) {
    const locale = (match[1] as "vi" | "en") ?? defaultLocale;
    const accessToken =
      req.cookies.get("access_token")?.value ||
      req.cookies.get("access_token_public")?.value;
    const refreshToken =
      req.cookies.get("refresh_token")?.value ||
      req.cookies.get("refresh_token_public")?.value;
    const loginPath = locale === defaultLocale ? "/login" : `/${locale}/login`;

    const redirectToLogin = () => {
      const url = req.nextUrl.clone();
      url.pathname = loginPath;
      url.searchParams.set("next", pathname);
      const redirectRes = NextResponse.redirect(url);
      const isProd = process.env.NODE_ENV === "production";
      const clear = (name: string, httpOnly: boolean) =>
        redirectRes.cookies.set(name, "", {
          httpOnly,
          secure: isProd,
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
      clear("access_token", true);
      clear("access_token_public", false);
      clear("refresh_token", true);
      clear("refresh_token_public", false);
      if (!req.cookies.get("NEXT_LOCALE")) {
        redirectRes.cookies.set("NEXT_LOCALE", locale, {
          path: "/",
          sameSite: "lax",
        });
      }
      return redirectRes;
    };

    // Try to refresh on the server if access is missing but refresh is present
    if (!accessToken && refreshToken) {
      try {
        const refreshRes = await fetch(
          `${req.nextUrl.origin}/api/auth/refresh`,
          {
            method: "POST",
            headers: {
              cookie: req.headers.get("cookie") ?? "",
            },
          }
        );

        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => null);
          const newAccess =
            (data as any)?.accessToken ||
            (data as any)?.access_token ||
            (data as any)?.token;
          const newRefresh =
            (data as any)?.refreshToken ||
            (data as any)?.refresh_token ||
            (data as any)?.refresh ||
            refreshToken;

          if (newAccess) {
            const isProd = process.env.NODE_ENV === "production";
            res.cookies.set("access_token", newAccess, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 15,
            });
            res.cookies.set("access_token_public", newAccess, {
              httpOnly: false,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 15,
            });
            res.cookies.set("refresh_token", newRefresh, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });
            res.cookies.set("refresh_token_public", newRefresh, {
              httpOnly: false,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });
            return res;
          }
        }
      } catch (err) {
        // swallow and redirect to login below
      }
    }

    if (accessToken) {
      try {
        const meRes = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
          method: "GET",
          headers: {
            cookie: req.headers.get("cookie") ?? "",
          },
          cache: "no-store",
        });
        if (!meRes.ok) {
          return redirectToLogin();
        }
      } catch (err) {
        return redirectToLogin();
      }
    } else {
      return redirectToLogin();
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
