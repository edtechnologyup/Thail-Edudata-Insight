"use client";

import { useCallback, useEffect, useState } from "react";
import { shouldShowNewBadge } from "@/utils/datasetNew";

export function useDatasetNewBadge(
  datasetId: string,
  publishedAt: string | null | undefined
) {
  const compute = useCallback(
    () => shouldShowNewBadge(datasetId, publishedAt),
    [datasetId, publishedAt]
  );

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(compute());

    const refresh = () => setShow(compute());
    window.addEventListener("dataset-viewed", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("dataset-viewed", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [compute]);

  return show;
}
