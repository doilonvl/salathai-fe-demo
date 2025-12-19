import type { LandingMenuItem } from "@/types/landing";
import type { MarqueeImage, MarqueeSlide } from "@/types/marquee";
import { LandingReveal } from "@/components/animation/LandingReveal";
import { MarqueeScroller } from "@/components/animation/MarqueeScroller";
import ScrollStrokePage from "@/components/animation/ScrollStrokePage";
import { ReservationForm } from "@/components/shared/reservation-form";

export const revalidate = 300;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

async function fetchJson<T>(path: string, revalidateSeconds = 300) {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: revalidateSeconds },
    cache: "force-cache",
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json() as Promise<T>;
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

export default async function HomePage() {
  const [landingMenu, marquee] = await Promise.all([
    getLandingMenuSSR(),
    getMarqueeSSR(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Landing Reveal */}
      <section>
        <LandingReveal initialItems={landingMenu} />
      </section>

      {/* Marquee scroller */}
      <section>
        <MarqueeScroller
          initialImages={marquee.images}
          initialSlides={marquee.slides}
        />
      </section>

      {/* Stroke svg */}
      <section>
        <ScrollStrokePage />
      </section>

      {/* Reservation form */}
      <section className="mb-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-0">
        <div className="w-full max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto">
          <ReservationForm />
        </div>
      </section>
    </main>
  );
}
