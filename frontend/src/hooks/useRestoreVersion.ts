"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMockRestoreVersion } from "@/data/mockData";

type RestoreVersionInput = {
  datasetId: string;
  version: string;
};

async function restoreVersion({
  datasetId,
  version,
}: RestoreVersionInput): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.post(
  //   `/agency/datasets/${datasetId}/versions/${version}/restore`
  // );
  return fetchMockRestoreVersion(datasetId, version);
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreVersion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({
        queryKey: ["agency", "datasets", variables.datasetId, "versions"],
      });
    },
  });
}
