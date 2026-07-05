"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import type { AuditLogAction } from "@/types/admin";

const ACTION_STYLES: Record<AuditLogAction, { bg: string; text: string; icon: string }> = {
  UPLOAD: { bg: "bg-[#0081A7]/10", text: "text-[#0081A7]", icon: "M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" },
  LOGIN: { bg: "bg-[#053F5C]/10", text: "text-[#053F5C]", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" },
  DELETE: { bg: "bg-red-50", text: "text-red-500", icon: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" },
  APPROVE: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" },
  REJECT: { bg: "bg-orange-50", text: "text-orange-500", icon: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2Zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59Z" },
  DOWNLOAD: { bg: "bg-[#00AFB9]/10", text: "text-[#00AFB9]", icon: "M5 20h14v-2H5v2ZM19 9h-4V3H9v6H5l7 7 7-7Z" },
};

function timeAgo(timestamp: string, locale: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === "th" ? "เมื่อกี้" : "just now";
  if (mins < 60) return locale === "th" ? `${mins} นาที` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return locale === "th" ? `${hrs} ชม.` : `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return locale === "th" ? `${days} วัน` : `${days}d`;
}

export default function AdminRecentActivity() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const base = `/${locale}`;

  const { data, isLoading } = useAuditLogs({ page: 1 });
  const items = data?.data?.slice(0, 5) ?? [];

  return (
    <section
      className="flex flex-col rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,129,167,0.08)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-kanit text-heading-3 font-bold text-[#053F5C]">
          {t("recentActivity", { defaultValue: "กิจกรรมล่าสุด" })}
        </h2>
        <Link
          href={`${base}/admin/audit-logs`}
          className="flex items-center gap-1 font-sarabun text-caption font-bold text-[#0081A7] transition-colors hover:text-[#053F5C]"
        >
          {t("viewAll", { defaultValue: "ดูทั้งหมด" })}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71 7.88 8.12 12.75 13l-4.87 4.88 1.41 1.41L15.58 13 9.29 6.71Z" />
          </svg>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="font-sarabun text-caption text-text-muted">
            {t("loading", { defaultValue: "กำลังโหลด..." })}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="font-sarabun text-caption text-text-muted">
            {t("noActivity", { defaultValue: "ยังไม่มีกิจกรรม" })}
          </p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col divide-y divide-gray-100">
          {items.map((log) => {
            const style = ACTION_STYLES[log.action] ?? ACTION_STYLES.LOGIN;
            return (
              <li key={log.id} className="flex items-start gap-3 py-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                  <svg className={`h-4 w-4 ${style.text}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={style.icon} />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sarabun text-sm font-medium text-[#053F5C]">
                    {log.detail}
                  </p>
                  <p className="truncate font-sarabun text-[11px] text-text-muted">
                    {log.email}
                  </p>
                </div>
                <span className="shrink-0 font-sarabun text-[11px] text-text-muted">
                  {timeAgo(log.timestamp, locale)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
