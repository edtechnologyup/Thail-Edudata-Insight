"use client";

import { useTranslations } from "next-intl";

type QualityScoreCardProps = {
  score: number;
};

export default function QualityScoreCard({ score }: QualityScoreCardProps) {
  const t = useTranslations("agency.upload");
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div className="rounded-radius-md border border-border-default/30 bg-surface-page p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-sarabun text-label text-text-secondary">
          {t("qualityScore")}
        </span>
        <span className="font-sarabun text-label font-bold text-primary-dark">
          {clampedScore}/100
        </span>
      </div>
      <div className="h-2 w-full rounded-radius-full bg-surface-container">
        <div
          className="h-2 rounded-radius-full bg-primary transition-all"
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <p className="mt-2 font-sarabun text-caption text-text-muted">
        {t("qualityScoreHint")}
      </p>
    </div>
  );
}
