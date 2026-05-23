"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export type UploadDatasetPayload = {
  formData: FormData;
  status: "draft" | "published";
};

export type UploadDatasetResponse = {
  id: string;
  status: "draft" | "published";
  qualityScore?: number;
  maskedColumns?: string[];
};

async function uploadDataset(
  payload: UploadDatasetPayload
): Promise<UploadDatasetResponse> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.post<JSendResponse<UploadDatasetResponse>>(
  //   "/agency/datasets",
  //   payload.formData,
  //   { headers: { "Content-Type": "multipart/form-data" } }
  // );
  // return response.data.data!;
  await Promise.resolve();
  void payload;
  return { id: "new-dataset", status: payload.status };
}

export function useUploadDataset() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
      router.push(`/${locale}/datasets`);
    },
  });
}
