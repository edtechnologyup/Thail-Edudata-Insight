"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useDatasetRating } from "@/hooks/useDatasetRating";
import { useAuthStore } from "@/stores/useAuthStore";

type DatasetRatingProps = {
  datasetId: string;
  datasetOwnerId: string;
  isPublished: boolean;
  initialAvg?: number;
  initialCount?: number;
  initialUserRating?: number | null;
  viewCount?: number;
};

function normalizeId(id: string | undefined | null): string {
  return (id ?? "").trim().toLowerCase();
}

export default function DatasetRating({
  datasetId,
  datasetOwnerId,
  isPublished,
  initialAvg = 0,
  initialCount = 0,
  initialUserRating = null,
  viewCount = 0,
}: DatasetRatingProps) {
  const t = useTranslations("dataset");
  const locale = useLocale();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isOwnDataset =
    user?.role === "agency" &&
    normalizeId(user.id) === normalizeId(datasetOwnerId);
  const canVote = isPublished && !isAdmin && !isOwnDataset;

  const { ratingAvg, ratingCount, userRating, isRating, submitRating } =
    useDatasetRating(datasetId, initialAvg, initialCount, initialUserRating);

  const [hoverRating, setHoverRating] = useState(0);
  const numberLocale = locale === "th" ? "th-TH" : "en-US";

  return (
    <div className="flex w-full flex-col items-end gap-3 text-right md:ml-auto md:w-auto">
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center justify-end gap-3 text-text-secondary">
          <svg
            className="h-7 w-7 shrink-0 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="font-sarabun text-body-lg font-semibold text-text-primary">
            {t("viewCount")}: {viewCount.toLocaleString(numberLocale)}{" "}
            {t("downloadsUnit")}
          </span>
        </div>

        {ratingCount === 0 ? (
          <span className="font-sarabun text-body-lg font-medium text-text-muted">
            {t("noRating")}
          </span>
        ) : (
          <span className="font-sarabun text-body-lg font-bold text-text-primary">
            <span className="text-amber-400">★</span> {ratingAvg.toFixed(1)}{" "}
            <span className="text-body-md font-semibold text-text-secondary">
              ({t("ratingVoters", { count: ratingCount })})
            </span>
          </span>
        )}
      </div>

      {canVote && (
        <div className="flex items-center justify-end gap-1">
          {isRating ? (
            <span className="font-sarabun text-body-md font-medium text-text-muted">
              {t("ratingSaving")}
            </span>
          ) : (
            [1, 2, 3, 4, 5].map((i) => {
              const filled = i <= (hoverRating || userRating || 0);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isRating}
                  className={`min-h-[44px] min-w-[44px] font-sarabun text-4xl leading-none transition-colors disabled:opacity-50 ${
                    filled ? "text-amber-400" : "text-text-muted"
                  }`}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => submitRating(i)}
                  aria-label={`${i}`}
                >
                  {filled ? "★" : "☆"}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
