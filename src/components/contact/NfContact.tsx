"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ReservationForm } from "@/components/shared/reservation-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNfPixelatedVideo } from "@/components/effects/useNfPixelatedVideo";
import LandingHeader from "@/components/shared/LandingHeader";
import styles from "./NfContact.module.css";

type ScrambleSpan = HTMLSpanElement & {
  nfScrambleInterval?: number;
  nfScrambleTimeout?: number;
  nfStaggerTimeout?: number;
};

type ScrambleInstance = {
  element: HTMLElement;
  chars: ScrambleSpan[];
  revert: () => void;
};

type ScrambleOptions = {
  duration?: number;
  charDelay?: number;
  stagger?: number;
  skipChars?: number;
  maxIterations?: number | null;
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
const DEFAULTS = { duration: 0.25, charDelay: 50, stagger: 50 };
const CHAR_SELECTOR = `.${styles.char} > span`;
const BREAKABLE_WORD_MIN = 18;

function splitToChars(element: HTMLElement): ScrambleInstance {
  const original = element.dataset.nfOriginalText ?? element.textContent ?? "";
  element.dataset.nfOriginalText = original;
  element.dataset.nfSplit = "true";
  element.textContent = "";

  const fragment = document.createDocumentFragment();
  const wordSpans: HTMLSpanElement[] = [];
  const parts = original.split(/(\s+)/);

  parts.forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      fragment.appendChild(document.createTextNode(part));
      return;
    }

    const word = document.createElement("span");
    const isBreakable = part.length >= BREAKABLE_WORD_MIN || part.includes("@");
    word.className = isBreakable
      ? `${styles.word} ${styles.wordBreakable}`
      : styles.word;

    for (const ch of part) {
      const charWrap = document.createElement("span");
      charWrap.className = styles.char;
      const char = document.createElement("span");
      char.textContent = ch;
      charWrap.appendChild(char);
      word.appendChild(charWrap);
    }

    fragment.appendChild(word);
    wordSpans.push(word);
  });

  element.appendChild(fragment);

  wordSpans.forEach((word) => {
    if (word.classList.contains(styles.wordBreakable)) return;
    const { width } = word.getBoundingClientRect();
    if (width > 0) {
      word.style.width = `${width}px`;
    }
  });

  const chars = Array.from(
    element.querySelectorAll<HTMLSpanElement>(CHAR_SELECTOR)
  );

  const revert = () => {
    element.textContent = original;
    element.removeAttribute("data-nf-split");
  };

  return { element, chars, revert };
}

function updateWordWidths(element: HTMLElement) {
  const words = Array.from(
    element.querySelectorAll<HTMLSpanElement>(`.${styles.word}`)
  );
  if (!words.length) return;

  words.forEach((word) => {
    if (word.classList.contains(styles.wordBreakable)) {
      word.style.width = "";
      return;
    }
    word.style.width = "auto";
  });

  words.forEach((word) => {
    if (word.classList.contains(styles.wordBreakable)) return;
    const { width } = word.getBoundingClientRect();
    if (width > 0) {
      word.style.width = `${width}px`;
    }
  });
}

function scrambleChar(
  char: ScrambleSpan,
  showAfter = true,
  duration = DEFAULTS.duration,
  charDelay = DEFAULTS.charDelay,
  maxIterations: number | null = null
) {
  if (!char.dataset.nfOriginalText) {
    char.dataset.nfOriginalText = char.textContent ?? "";
  }
  const originalText = char.dataset.nfOriginalText;
  let iterations = 0;
  const iterationsCount = maxIterations ?? Math.floor(Math.random() * 6) + 3;

  if (showAfter) {
    gsap.to(char, { opacity: 1, duration: 0.2, ease: "power1.out" });
  }

  if (char.nfScrambleInterval) clearInterval(char.nfScrambleInterval);
  if (char.nfScrambleTimeout) clearTimeout(char.nfScrambleTimeout);

  const interval = window.setInterval(() => {
    char.textContent =
      originalText === " "
        ? " "
        : CHARS[Math.floor(Math.random() * CHARS.length)];
    iterations += 1;

    if (iterations >= iterationsCount) {
      clearInterval(interval);
      char.nfScrambleInterval = undefined;
      char.textContent = originalText;
      if (!showAfter) {
        gsap.to(char, { opacity: 0, duration: 0.2, ease: "power1.out" });
      }
    }
  }, charDelay);

  char.nfScrambleInterval = interval;

  const timeout = window.setTimeout(() => {
    clearInterval(interval);
    char.nfScrambleInterval = undefined;
    char.nfScrambleTimeout = undefined;
    char.textContent = originalText;
    if (!showAfter) {
      gsap.to(char, { opacity: 0, duration: 0.2, ease: "power1.out" });
    }
  }, duration * 1000);

  char.nfScrambleTimeout = timeout;
}

function scrambleText(
  chars: ScrambleSpan[],
  showAfter = true,
  duration = DEFAULTS.duration,
  charDelay = DEFAULTS.charDelay,
  stagger = DEFAULTS.stagger,
  skipChars = 0,
  maxIterations: number | null = null
) {
  chars.forEach((char, index) => {
    if (index < skipChars) {
      if (showAfter) gsap.set(char, { opacity: 1 });
      return;
    }

    if (char.nfStaggerTimeout) clearTimeout(char.nfStaggerTimeout);

    const timeout = window.setTimeout(() => {
      scrambleChar(char, showAfter, duration, charDelay, maxIterations);
      char.nfStaggerTimeout = undefined;
    }, (index - skipChars) * stagger);

    char.nfStaggerTimeout = timeout;
  });
}

function scrambleIn(
  element: HTMLElement,
  delay = 0,
  options: ScrambleOptions = {}
): ScrambleInstance {
  if (!element.textContent?.trim()) {
    return { element, chars: [], revert: () => {} };
  }

  const {
    duration = DEFAULTS.duration,
    charDelay = DEFAULTS.charDelay,
    stagger = DEFAULTS.stagger,
    skipChars = 0,
    maxIterations = null,
  } = options;

  const split = splitToChars(element);
  gsap.set(split.chars, { opacity: 0 });

  window.setTimeout(() => {
    scrambleText(
      split.chars,
      true,
      duration,
      charDelay,
      stagger,
      skipChars,
      maxIterations
    );
  }, delay * 1000);

  return split;
}

export default function NfContact() {
  const rootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tHeader = useTranslations("header");
  const tFooter = useTranslations("footer");
  const tReservation = useTranslations("reservation");
  const contactEmail = "salathaivietnam@gmail.com";
  const openingHours = "10:00 - 22:00";
  const [showReservationModal, setShowReservationModal] = useState(false);

  useNfPixelatedVideo(rootRef, videoRef, styles.canvas);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = root.querySelectorAll<HTMLElement>(
      `.${styles.copy} h4, .${styles.footer} p`
    );

    const instances: ScrambleInstance[] = [];
    const baseDelay = 0.35;
    const lineDelay = 0.06;

    elements.forEach((el, index) => {
      if (!el.textContent?.trim()) return;
      const instance = scrambleIn(el, baseDelay + index * lineDelay, {
        duration: 0.35,
        charDelay: 90,
        stagger: 40,
        maxIterations: 2,
      });
      instances.push(instance);
    });

    const updateAllWordWidths = () => {
      elements.forEach((el) => updateWordWidths(el));
    };

    let resizeRaf: number | null = null;
    const handleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(updateAllWordWidths);
    };

    updateAllWordWidths();
    window.addEventListener("resize", handleResize);
    if (document.fonts?.ready) {
      document.fonts.ready.then(updateAllWordWidths);
    }

    return () => {
      instances.forEach((instance) => instance?.revert());
      window.removeEventListener("resize", handleResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <section className={styles.root} ref={rootRef} data-nav-theme="dark">
      <LandingHeader onOpenReservation={() => setShowReservationModal(true)} />
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/contact/contact-hero2.mp4" type="video/mp4" />
      </video>

      <div className={styles.copy}>
        <div className={styles.main}>
          <div className={styles.col}>
            <h4 className={styles.header}>{tHeader("contact")}</h4>
            <h4>{tFooter("title")}</h4>
            <h4>{tFooter("addressLine1")}</h4>
          </div>

          <div className={styles.col}>
            <h4>{tFooter("addressLine2")}</h4>
            <h4>{tFooter("phone")}</h4>
            <h4>{contactEmail}</h4>
            <h4>
              {tReservation("openingHourLabel")}: {openingHours}
            </h4>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerInner}>
            <p>{tFooter("copyName")}</p>
            <p>{tFooter("copySince")}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showReservationModal && (
          <motion.div
            key="reservation-overlay"
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-4"
            onClick={() => setShowReservationModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-full max-w-3xl md:max-w-4xl h-[90vh] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="absolute right-3 top-3 z-[1201] inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white shadow-lg transition hover:bg-neutral-800 focus:outline-none"
              >
                X
              </button>
              <ScrollArea className="h-full rounded-3xl">
                <ReservationForm
                  variant="modal"
                  onSuccess={() => setShowReservationModal(false)}
                />
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
