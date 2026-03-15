"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d105.8438914!3d21.0322739!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab14cf45d9c9%3A0x3609bf2b7bb2d4e8!2sSalaThai!5e0!3m2!1sen!2s!4v1710000000000";

const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/place/SalaThai/@21.0322739,105.8438914,17z/data=!3m1!4b1!4m6!3m5!1s0x3135ab14cf45d9c9:0x3609bf2b7bb2d4e8!8m2!3d21.0322739!4d105.8464717";

export default function ContactMap() {
  const tFooter = useTranslations("footer");
  const tReservation = useTranslations("reservation");
  const tContact = useTranslations("contactMap");

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative bg-black py-16 md:py-24"
    >
      {/* Gradient seam from hero */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-16 bg-gradient-to-b from-black to-transparent" />

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-[1.4fr_1fr] md:gap-12">
        {/* Map */}
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src={GOOGLE_MAPS_EMBED_URL}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 360 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SalaThai location"
            className="grayscale-[0.3] contrast-[1.1]"
          />
        </div>

        {/* Info Card */}
        <div className="flex flex-col justify-center gap-6 text-[#e3e4d8]">
          <h3
            className="text-3xl font-medium md:text-4xl"
            style={{ fontFamily: "var(--font-playfair-display, 'Playfair Display', serif)" }}
          >
            {tContact("heading")}
          </h3>

          <div className="space-y-4 text-sm leading-relaxed md:text-base">
            {/* Address */}
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0 text-[#fe0100]"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <p className="font-medium">{tFooter("addressLine1")}</p>
                <p className="text-white/60">{tFooter("addressLine2")}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#fe0100]"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href="tel:+84868555057" className="hover:text-white transition-colors">{tFooter("phone")}</a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#fe0100]"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <a href="mailto:salathaivietnam@gmail.com" className="hover:text-white transition-colors">salathaivietnam@gmail.com</a>
            </div>

            {/* Hours */}
            <div className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#fe0100]"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p>
                {tReservation("openingHourLabel")}: 10:00 – 22:00
              </p>
            </div>
          </div>

          {/* Get Directions Button */}
          <a
            href={GOOGLE_MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-[#fe0100]/50 px-6 py-3 text-sm font-medium text-[#fe0100] transition-colors hover:bg-[#fe0100]/10"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            {tContact("getDirections")}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
