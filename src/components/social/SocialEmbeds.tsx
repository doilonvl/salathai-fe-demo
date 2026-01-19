/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: { process: () => void };
    };
  }
}

const FACEBOOK_PAGE = "https://www.facebook.com/salathaihn";
const INSTAGRAM_PROFILE = "https://www.instagram.com/salathaihn/";
const INSTAGRAM_POSTS = [
  "https://www.instagram.com/p/DSbuoJwkU4I/",
  "https://www.instagram.com/reel/DSTvODhEajE/",
];
const FB_BASIC_HEIGHT = 520;
const MIN_FB_WIDTH = 280;
const DEFAULT_FB_WIDTH = 360;
const IG_HEADER_CROP = 56;

export default function SocialEmbeds() {
  const fbWrapRef = useRef<HTMLDivElement | null>(null);
  const [fbWidth, setFbWidth] = useState<number | null>(null);

  useEffect(() => {
    const wrapper = fbWrapRef.current;
    if (!wrapper || typeof ResizeObserver === "undefined") return;

    let frameId: number | null = null;

    const updateWidth = () => {
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width) return;
      const nextWidth = Math.max(MIN_FB_WIDTH, Math.round(rect.width));
      setFbWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };

    const observer = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateWidth);
    });

    observer.observe(wrapper);
    updateWidth();

    const handleResize = () => updateWidth();
    window.addEventListener("resize", handleResize);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.instgrm?.Embeds?.process?.();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const resolvedFbWidth = fbWidth ?? DEFAULT_FB_WIDTH;
  const resolvedFbHeight = resolvedFbWidth <= 420 ? 320 : FB_BASIC_HEIGHT;
  const fbSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    FACEBOOK_PAGE
  )}&tabs=&width=${resolvedFbWidth}&height=${resolvedFbHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;

  return (
    <div className="w-full">
      <Script
        id="instagram-embed"
        strategy="afterInteractive"
        src="https://www.instagram.com/embed.js"
        onLoad={() => window.instgrm?.Embeds?.process?.()}
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <div
          ref={fbWrapRef}
          className="w-full max-w-full mx-auto lg:mx-0 lg:max-w-[360px]"
        >
          <div
            className="relative overflow-hidden"
            style={{ height: resolvedFbHeight }}
          >
            <iframe
              title="SalaThai Facebook"
              src={fbSrc}
              className="block h-full w-full"
              style={{ border: "none" }}
              scrolling="no"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {INSTAGRAM_POSTS.map((permalink) => (
            <div key={permalink} className="overflow-hidden">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/Logo/Logo1.png"
                    alt="SalaThai"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-neutral-900">
                      salathaihn
                    </div>
                    <div className="text-xs text-neutral-500">Instagram</div>
                  </div>
                </div>
                <a
                  href={INSTAGRAM_PROFILE}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                >
                  Follow
                </a>
              </div>
              <div className="overflow-hidden">
                <div
                  style={{
                    transform: `translateY(-${IG_HEADER_CROP}px)`,
                    marginBottom: `-${IG_HEADER_CROP}px`,
                  }}
                >
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={permalink}
                    data-instgrm-version="14"
                    style={{
                      background: "#fff",
                      border: 0,
                      margin: 0,
                      width: "100%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
