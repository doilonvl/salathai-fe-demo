"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useCreateReservationRequestMutation } from "@/services/api";
import type { ReservationRequestPayload } from "@/types/reservation";

// All the logic and helper functions from the original file are preserved
const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]*$/u;
const OPENING_HOURS = {
  start: "10:00",
  end: "22:00",
};

function buildReservationSchema(t: ReturnType<typeof useTranslations>) {
  return z
    .object({
      fullName: z
        .string()
        .trim()
        .transform(normalizeName)
        .refine((val) => val.length >= 3, {
          message: t("validation.fullNameMin"),
        })
        .refine((val) => val.length <= 80, {
          message: t("validation.fullNameMax"),
        })
        .refine((val) => NAME_REGEX.test(val), {
          message: t("validation.fullNamePattern"),
        })
        .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
          message: t("validation.fullNameParts"),
        }),
      phoneNumber: z
        .string()
        .trim()
        .refine(isValidPhoneNumber, {
          message: t("validation.phone"),
        }),
      email: z
        .string()
        .trim()
        .email(t("validation.email"))
        .optional()
        .or(z.literal("")),
      guestCount: z
        .number()
        .int()
        .min(1, t("validation.guestMin"))
        .max(30, t("validation.guestMax")),
      reservationDate: z.string().min(1, t("validation.dateRequired")),
      reservationTime: z.string().min(1, t("validation.timeRequired")),
      note: z
        .string()
        .trim()
        .max(400, t("validation.noteMax"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      const reservationDateTime = buildDateTime(
        values.reservationDate,
        values.reservationTime
      );
      if (!reservationDateTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reservationTime"],
          message: t("validation.timeInvalid"),
        });
        return;
      }

      const timeMinutes = timeToMinutes(values.reservationTime);
      const openingStartMinutes = timeToMinutes(OPENING_HOURS.start);
      const openingEndMinutes = timeToMinutes(OPENING_HOURS.end);
      if (
        timeMinutes === null ||
        openingStartMinutes === null ||
        openingEndMinutes === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reservationTime"],
          message: t("validation.timeInvalid"),
        });
        return;
      }

      if (
        timeMinutes < openingStartMinutes ||
        timeMinutes > openingEndMinutes
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reservationTime"],
          message: t("validation.timeOutsideHours"),
        });
      }

      const now = new Date();
      if (reservationDateTime.getTime() < now.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reservationDate"],
          message: t("validation.timePast"),
        });
      }
    });
}

type ReservationFormValues = z.infer<ReturnType<typeof buildReservationSchema>>;

function buildDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const isValid =
    [year, month, day, hour, minute].every(
      (part) => typeof part === "number" && !Number.isNaN(part)
    ) &&
    month >= 1 &&
    month <= 12;
  if (!isValid) return null;
  const candidate = new Date(year, month - 1, day, hour, minute, 0);
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getMonth() + 1 !== month ||
    candidate.getDate() !== day
  ) {
    return null;
  }
  return candidate;
}

function isValidPhoneNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  const normalized = digitsOnly.startsWith("84")
    ? digitsOnly.slice(2)
    : digitsOnly.startsWith("0")
    ? digitsOnly.slice(1)
    : digitsOnly;
  return /^[1-9]\d{8}$/.test(normalized);
}

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+84"))
    return `0${trimmed.replace(/\D/g, "").slice(2)}`;
  if (trimmed.startsWith("84"))
    return `0${trimmed.replace(/\D/g, "").slice(2)}`;
  return trimmed.replace(/\s+/g, "");
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(value: string) {
  const [hourString, minuteString] = value.split(":");
  if (!hourString || !minuteString) return null;
  const hour = Number(hourString);
  const minute = Number(minuteString);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function ReservationForm({
  onSuccess,
}: {
  onSuccess?: (data: ReservationRequestPayload) => void;
}) {
  const t = useTranslations("reservation");
  const schema = useMemo(() => buildReservationSchema(t), [t]);
  const defaultDate = useMemo(() => formatDateInput(new Date()), []);
  const [minSelectableTime, setMinSelectableTime] = useState<
    string | undefined
  >(undefined);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      guestCount: 2,
      reservationDate: defaultDate,
      reservationTime: "19:00",
      note: "",
    },
  });
  const [createReservationRequest, { isLoading }] =
    useCreateReservationRequestMutation();
  const watchDate = watch("reservationDate");

  useEffect(() => {
    // This logic remains unchanged
    const openingStartMinutes = timeToMinutes(OPENING_HOURS.start);
    const openingEndMinutes = timeToMinutes(OPENING_HOURS.end);
    if (openingStartMinutes === null || openingEndMinutes === null) {
      setMinSelectableTime(undefined);
      return;
    }
    if (watchDate !== defaultDate) {
      setMinSelectableTime(OPENING_HOURS.start);
      return;
    }
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const minMinutes = Math.max(openingStartMinutes, nowMinutes);
    const boundedMinMinutes = Math.min(minMinutes, openingEndMinutes);
    setMinSelectableTime(minutesToTime(boundedMinMinutes));
  }, [watchDate, defaultDate]);

  const isBusy = isSubmitting || isLoading;

  const onSubmit = async (values: ReservationFormValues) => {
    const payload: ReservationRequestPayload = {
      fullName: values.fullName,
      phoneNumber: normalizePhoneNumber(values.phoneNumber),
      email: values.email?.trim() || undefined,
      guestCount: values.guestCount,
      reservationDate: values.reservationDate,
      reservationTime: values.reservationTime,
      note: values.note?.trim() || undefined,
      source: "website",
    };

    try {
      await createReservationRequest(payload).unwrap();
      toast.success(t("successTitle"), { description: t("successDesc") });
      setSubmitted(true);
      onSuccess?.(payload);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t("errorDesc");
      toast.error(t("errorTitle"), { description: message });
    }
  };

  const handleModify = () => {
    setSubmitted(false);
    reset();
  };

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-white overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
        <div className="lg:w-2/5 h-[400px] lg:h-auto relative">
          <img
            src="/signature/Mango Sticky Rice.jpeg"
            alt="Mango sticky rice"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-sala-primary/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white border border-white/20 p-8 backdrop-blur-sm">
              <span className="block text-xs tracking-[0.5em] uppercase font-black mb-4">
                Availability
              </span>
              <p className="font-serif text-2xl italic">
                &ldquo;We prepare a limited selection of tables to ensure every
                guest receives our full attention.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-3/5 p-12 lg:p-24">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-24 h-24 border border-sala-accent rounded-full flex items-center justify-center mb-8">
                <div className="w-3 h-3 bg-sala-accent rounded-full"></div>
              </div>
              <h3 className="text-4xl font-serif mb-6 text-sala-primary">
                Your Table Awaits
              </h3>
              <p className="text-stone-500 mb-10 max-w-sm leading-relaxed">
                {t("successDesc")}
              </p>
              <button
                onClick={handleModify}
                className="text-sala-accent tracking-[0.3em] uppercase font-black text-xs border-b-2 border-sala-accent pb-1 hover:text-sala-primary hover:border-sala-primary transition-all"
              >
                Make Another Reservation
              </button>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <span className="text-sala-accent tracking-[0.3em] uppercase text-xs mb-4 block font-bold">
                  {t("sectionTitle")}
                </span>
                <h2 className="text-5xl font-serif text-sala-primary">
                  {t("heading")}
                </h2>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                      {t("fullNameLabel")}
                    </label>
                    <input
                      {...register("fullName")}
                      className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors text-lg font-light"
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                      {t("phoneLabel")}
                    </label>
                    <input
                      {...register("phoneNumber")}
                      type="tel"
                      className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors text-lg font-light"
                      aria-invalid={Boolean(errors.phoneNumber)}
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-600">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                    {t("emailLabel")}
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors text-lg font-light"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                      {t("dateLabel")}
                    </label>
                    <input
                      {...register("reservationDate")}
                      type="date"
                      min={defaultDate}
                      className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors font-light"
                      aria-invalid={Boolean(errors.reservationDate)}
                    />
                    {errors.reservationDate && (
                      <p className="text-xs text-red-600">
                        {errors.reservationDate.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                      {t("timeLabel")}
                    </label>
                    <input
                      {...register("reservationTime")}
                      type="time"
                      min={minSelectableTime}
                      max={OPENING_HOURS.end}
                      className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors font-light"
                      aria-invalid={Boolean(errors.reservationTime)}
                    />
                    {errors.reservationTime && (
                      <p className="text-xs text-red-600">
                        {errors.reservationTime.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 col-span-2 md:col-span-1">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                      {t("guestLabel")}
                    </label>
                    <select
                      {...register("guestCount", { valueAsNumber: true })}
                      className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors font-light"
                      aria-invalid={Boolean(errors.guestCount)}
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30].map((n) => (
                        <option key={n} value={n}>
                          {n === 1
                            ? `${n} ${t("guestSingular")}`
                            : t("guestPlural", { count: n })}
                        </option>
                      ))}
                    </select>
                    {errors.guestCount && (
                      <p className="text-xs text-red-600">
                        {errors.guestCount.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">
                    {t("noteLabel")}
                  </label>
                  <textarea
                    {...register("note")}
                    rows={2}
                    placeholder={t("notePlaceholder")}
                    className="w-full border-b border-stone-200 bg-transparent py-3 focus:outline-none focus:border-sala-accent transition-colors text-lg font-light"
                    aria-invalid={Boolean(errors.note)}
                  />
                  {errors.note && (
                    <p className="text-xs text-red-600">
                      {errors.note.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full py-6 bg-sala-primary text-white uppercase tracking-[0.4em] font-black text-xs hover:bg-sala-accent transition-all duration-500 mt-8 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isBusy ? t("submitting") : t("submit")}
                </button>
                <p className="text-center text-xs text-stone-400 pt-4">
                  {t("privacy")}
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
