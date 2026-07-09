"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Scholarship } from "@/hooks/useScholarships";

type ScholarshipCardProps = {
  scholarship: Scholarship;
};

function isClosed(closeDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const close = new Date(closeDate);
  close.setHours(0, 0, 0, 0);
  return close < today;
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

const SCHOLARSHIP_PLACEHOLDERS: Record<string, { gradient: string; icon: React.ReactNode }> = {
  government: {
    gradient: "from-[#1565c0] to-[#0d47a1]",
    icon: <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
  },
  university: {
    gradient: "from-[#5e35b1] to-[#4527a0]",
    icon: <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  },
  private: {
    gradient: "from-[#00897b] to-[#00695c]",
    icon: <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  },
  foundation: {
    gradient: "from-[#ef6c00] to-[#e65100]",
    icon: <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  },
  exchange: {
    gradient: "from-[#0277bd] to-[#01579b]",
    icon: <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  },
  other: {
    gradient: "from-[#546e7a] to-[#37474f]",
    icon: <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tCard = useTranslations("scholarship.card");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const closed = isClosed(scholarship.close_date);

  const amountFormatted = scholarship.amount
    ? scholarship.amount.toLocaleString(locale === "th" ? "th-TH" : "en-US")
    : null;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border-default/60 bg-white shadow-level-1 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-level-2 ${
        closed ? "opacity-80" : ""
      }`}
    >
      {/* Image + Status badge */}
      <div className={`relative h-40 w-full shrink-0 overflow-hidden ${closed ? "grayscale" : ""}`}>
        {scholarship.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE}${scholarship.image_url}`}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${(SCHOLARSHIP_PLACEHOLDERS[scholarship.scholarship_type] ?? SCHOLARSHIP_PLACEHOLDERS.other).gradient}`} aria-hidden>
            <div className="text-white/40">
              {(SCHOLARSHIP_PLACEHOLDERS[scholarship.scholarship_type] ?? SCHOLARSHIP_PLACEHOLDERS.other).icon}
            </div>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 font-sarabun text-caption font-bold text-white shadow-level-1 ${
            closed ? "bg-text-muted" : ""
          }`}
          style={closed ? undefined : { backgroundColor: "#10b981" }}
        >
          {!closed && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {closed
            ? t("filter.applicationStatus_closed")
            : t("filter.applicationStatus_open")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
      {/* Tags */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-primary/30 bg-primary-light/60 px-3 py-1 font-sarabun text-caption font-semibold text-primary-dark">
          {tTypes(scholarship.scholarship_type)}
        </span>
        <span className="rounded-full border border-border-default px-3 py-1 font-sarabun text-caption font-medium text-text-secondary">
          {tLevels(scholarship.target_level)}
        </span>
      </div>

      {/* Title */}
      <h2 className="mb-2 line-clamp-2 font-kanit text-body-lg font-bold text-text-primary transition-colors group-hover:text-primary-dark">
        {scholarship.title}
      </h2>

      {/* Agency */}
      <p className="mb-4 font-sarabun text-caption text-text-muted">
        {tCard("agency")}: {scholarship.agency_name ?? t("common.noAgency")}
      </p>

      {/* Amount + Close Date */}
      <div className="mt-auto">
        {amountFormatted && (
          <div className="mb-3 rounded-xl border border-primary/15 bg-primary-light/50 px-3 py-2">
            <p className="font-sarabun text-label font-bold text-primary-dark">
              {locale === "th" ? "มูลค่าทุนสูงสุด" : "Max amount"}: {amountFormatted}{" "}
              <span className="font-normal text-text-secondary">{t("common.currency")}</span>
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {closed ? (
            <span className="font-sarabun text-caption font-bold" style={{ color: "#c41411" }}>
              {t("common.closedBadge")}
            </span>
          ) : (
            <span className="font-sarabun text-caption text-text-secondary">
              {tCard("closeDate")}: {formatDate(scholarship.close_date, locale)}
            </span>
          )}
        </div>

        <Link
          href={`/${locale}/scholarship/${scholarship.id}`}
          className={`flex min-h-[44px] w-full items-center justify-center rounded-radius-full font-sarabun text-label font-bold transition-all ${
            closed
              ? "bg-surface-container text-text-muted hover:bg-border-default/60"
              : "bg-gradient-to-b from-primary-hover to-primary-dark text-white shadow-level-1 hover:brightness-110"
          }`}
        >
          {tCard("viewDetail")}
        </Link>
      </div>
      </div>
    </article>
  );
}
