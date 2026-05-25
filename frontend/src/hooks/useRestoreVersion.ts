"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type RestoreVersionInput = {
  datasetId: string;
  version: string;
};

type RestoreVersionResponse = {
  success: boolean;
  data: unknown;
};

async function restoreVersion({
  datasetId,
  version,
}: RestoreVersionInput): Promise<unknown> {
  const versionNumber = Number.parseInt(version, 10);
  if (Number.isNaN(versionNumber)) {
    throw new Error("หมายเลขเวอร์ชันไม่ถูกต้อง");
  }

  const res = await apiClient.post<RestoreVersionResponse>(
    `/datasets/${datasetId}/versions/${versionNumber}/restore`
  );
  return res.data.data;
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreVersion,
    retry: 1,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agency", "datasets", variables.datasetId, "versions"],
      });
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
    },
  });
}
