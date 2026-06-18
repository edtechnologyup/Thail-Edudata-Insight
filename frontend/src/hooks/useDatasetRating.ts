"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/services/api";

type RatingResponse = {
  rating_avg: number;
  rating_count: number;
  user_rating: number | null;
};

export function useDatasetRating(
  datasetId: string,
  initialAvg: number = 0,
  initialCount: number = 0,
  initialUserRating: number | null = null,
) {
  const [ratingAvg, setRatingAvg] = useState(initialAvg);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);

  const mutation = useMutation({
    mutationFn: async (score: number) => {
      const res = await apiClient.post<{ data: RatingResponse }>(
        `/datasets/${datasetId}/rate`,
        { score },
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      setRatingAvg(data.rating_avg);
      setRatingCount(data.rating_count);
      setUserRating(data.user_rating);
    },
  });

  return {
    ratingAvg,
    ratingCount,
    userRating,
    isRating: mutation.isPending,
    submitRating: mutation.mutate,
    error: mutation.error,
  };
}
