"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useDatasetPublicModels } from "@/hooks/useMLModels";

type Props = {
  datasetId: string;
};

export default function DatasetMLModels({ datasetId }: Props) {
  const locale = useLocale();
  const { data: models, isLoading } = useDatasetPublicModels(datasetId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-40 rounded bg-surface-container" />
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-surface-container" />
            <div className="h-16 rounded-xl bg-surface-container" />
          </div>
        </div>
      </div>
    );
  }

  if (!models || models.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3f2fd] text-[#01579b]">
          <ModelIcon />
        </div>
        <div>
          <h3 className="font-kanit text-body-md font-bold text-primary-dark">
            โมเดล ML
          </h3>
          <p className="font-sarabun text-caption text-text-muted">
            โมเดลทำนายที่สร้างจาก Dataset นี้ ({models.length} โมเดล)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {models.map((m) => {
          const isRegression = m.model_type === "regression";
          const score = isRegression
            ? (m.metrics as Record<string, number>)?.r2_score
            : (m.metrics as Record<string, number>)?.accuracy;
          const scorePct = score != null ? (score * 100).toFixed(1) : null;
          const scoreColor =
            score == null
              ? "text-text-muted"
              : score >= 0.7
                ? "text-[#2e7d32]"
                : score >= 0.4
                  ? "text-[#f9a825]"
                  : "text-[#e53935]";

          return (
            <Link
              key={m.id}
              href={`/${locale}/datasets/${datasetId}/models/${m.id}`}
              className="group flex items-center justify-between rounded-xl border border-border-default/60 px-5 py-4 transition-all hover:border-[#01579b]/40 hover:bg-[#f7f9fc] hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-sarabun text-body-md font-bold text-text-primary group-hover:text-[#01579b]">
                  {m.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sarabun text-caption font-medium ${
                      isRegression
                        ? "bg-[#e3f2fd] text-[#01579b]"
                        : "bg-[#f3e5f5] text-[#6a1b9a]"
                    }`}
                  >
                    {isRegression ? "พยากรณ์" : "จำแนก"}
                  </span>
                  <span className="font-sarabun text-caption text-text-muted">
                    {(m.metrics as Record<string, string>)?.algorithm ?? "-"}
                  </span>
                  <span className="font-sarabun text-caption text-text-muted">
                    ใช้ทำนาย {m.predict_count} ครั้ง
                  </span>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-4">
                {scorePct != null && (
                  <div className="text-right">
                    <p className="font-sarabun text-[11px] text-text-muted">
                      {isRegression ? "R²" : "Accuracy"}
                    </p>
                    <p className={`font-kanit text-lg font-bold ${scoreColor}`}>
                      {scorePct}%
                    </p>
                  </div>
                )}
                <ChevronRightIcon />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ModelIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.994.994 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-5 w-5 text-text-muted transition-colors group-hover:text-[#01579b]"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
