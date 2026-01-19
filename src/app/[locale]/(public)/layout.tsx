"use client";

import { useMessages, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/request";
import { Toaster } from "@/components/ui/sonner";
import { FooterExplosion } from "@/components/shared/footer";
import NewNavbar from "@/components/shared/NewNavbar";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReservationForm } from "@/components/shared/reservation-form";
import { useParams } from "next/navigation";

type LocaleLayoutProps = {
  children: React.ReactNode;
};

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  const params = useParams();
  const locale = params.locale as Locale;
  const resolvedLocale = locale as Locale;
  const messages = useMessages();
  const tReservation = useTranslations("reservation");
  const [showReservationModal, setShowReservationModal] = useState(false);

  const onOpenReservation = () => setShowReservationModal(true);
  const onCloseReservation = () => setShowReservationModal(false);

  return (
    <>
      <NewNavbar
        onOpenReservation={onOpenReservation}
        onCloseReservation={onCloseReservation}
      />
      {children}
      <FooterExplosion />
      <Toaster />

      <AnimatePresence mode="wait">
        {showReservationModal && (
          <motion.div
            key="reservation-overlay"
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-4"
            onClick={onCloseReservation}
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
              <div className="relative h-full rounded-3xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={onCloseReservation}
                  className="absolute right-4 top-4 z-[1201] inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white shadow-lg transition hover:bg-neutral-800 focus:outline-none"
                >
                  X
                </button>
                <ScrollArea className="h-full reservation-scroll">
                  <ReservationForm onSuccess={onCloseReservation} />
                </ScrollArea>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
