"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import apiClient from "@/services/api";

type TopRatedDataset = {
  id: string;
  title: string;
  average_score: number;
  rating_count: number;
};

function useTopRated() {
  return useQuery({
    queryKey: ["stats", "top-rated"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { datasets: TopRatedDataset[] } }>(
        "/stats/top-rated"
      );
      return res.data.data.datasets ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

function Stars({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <span className="flex items-center gap-0.5" aria-label={`${score} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-3.5 w-3.5"
          fill={i < filled ? "#f9a825" : "#e0e0e0"}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </span>
  );
}

export default function TopRatedList() {
  const locale = useLocale();
  const isTh = locale === "th";
  const { data: datasets = [], isLoading, isError } = useTopRated();

  return (
    <div className="h-full w-full rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <svg className="h-5 w-5" style={{ color: "#f9a825" }} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h2 className="font-kanit text-heading-3-mobile font-bold text-primary md:text-heading-3">
          {isTh ? "คะแนนรีวิวสูงสุด" : "Top rated datasets"}
        </h2>
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-4 w-3/4 rounded-radius-sm bg-surface-container" />
              <div className="h-3 w-1/2 rounded-radius-sm bg-surface-container" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Failed to load data"}
        </p>
      )}

      {!isLoading && !isError && datasets.length === 0 && (
        <p className="font-sarabun text-body-md text-text-muted">
          {isTh ? "ยังไม่มีรีวิว" : "No reviews yet"}
        </p>
      )}

      {!isLoading && !isError && datasets.length > 0 && (
        <div className="flex flex-col">
          {datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/${locale}/datasets/${dataset.id}`}
              className="group border-b border-border-default/40 py-3 transition-colors last:border-b-0 hover:bg-gray-50/50"
            >
              <p className="truncate font-kanit text-label font-bold text-text-primary transition-colors group-hover:text-primary-dark">
                {dataset.title}
              </p>
              <div className="mt-1 flex items-center gap-2 font-sarabun text-caption text-text-muted">
                <Stars score={dataset.average_score} />
                <span className="font-bold" style={{ color: "#ba7517" }}>
                  {dataset.average_score.toFixed(1)}
                </span>
                <span>
                  ({dataset.rating_count.toLocaleString(locale)}{" "}
                  {isTh ? "รีวิว" : "reviews"})
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
