"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import apiClient from "@/services/api";

type TopAgency = {
  agency_name: string | null;
  agency_name_en: string | null;
  dataset_count: number;
};

const BAR_COLORS = ["#1a237e", "#3949ab", "#5c6bc0", "#7986cb", "#9fa8da"];

function useTopAgencies() {
  return useQuery({
    queryKey: ["stats", "top-agencies"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { agencies: TopAgency[] } }>(
        "/stats/top-agencies"
      );
      return res.data.data.agencies ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export default function TopAgenciesCard() {
  const locale = useLocale();
  const isTh = locale === "th";
  const { data: agencies = [], isLoading, isError } = useTopAgencies();

  const maxCount = Math.max(...agencies.map((a) => a.dataset_count), 1);

  return (
    <div className="h-full w-full rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h2 className="font-kanit text-heading-3-mobile font-bold text-primary md:text-heading-3">
          {isTh ? "Top 5 หน่วยงานที่เผยแพร่มากสุด" : "Top 5 publishing agencies"}
        </h2>
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 rounded-radius-full bg-surface-container" />
          ))}
        </div>
      )}

      {isError && (
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Failed to load data"}
        </p>
      )}

      {!isLoading && !isError && agencies.length === 0 && (
        <p className="font-sarabun text-body-md text-text-muted">
          {isTh ? "ยังไม่มีข้อมูล" : "No data yet"}
        </p>
      )}

      {!isLoading && !isError && agencies.length > 0 && (
        <div className="flex flex-col gap-4">
          {agencies.map((agency, index) => {
            const name = isTh
              ? agency.agency_name ?? agency.agency_name_en ?? "-"
              : agency.agency_name_en ?? agency.agency_name ?? "-";
            const widthPercent = Math.max(
              6,
              Math.round((agency.dataset_count / maxCount) * 100)
            );
            return (
              <div key={`${name}-${index}`} className="flex items-center gap-3">
                <span
                  className="w-36 shrink-0 truncate font-sarabun text-label text-text-secondary md:w-44"
                  title={name}
                >
                  {name}
                </span>
                <div className="h-4 flex-1 overflow-hidden rounded-radius-full bg-surface-container">
                  <div
                    className="h-full rounded-radius-full transition-all"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-kanit text-label font-bold text-primary">
                  {agency.dataset_count.toLocaleString(locale)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
