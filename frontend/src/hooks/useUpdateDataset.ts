"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export type UpdateDatasetPayload = {
  id: string;
  formData: FormData;
  status: "draft" | "published";
};

async function updateDataset(
  payload: UpdateDatasetPayload
): Promise<{ id: string; status: "draft" | "published" }> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.put(`/agency/datasets/${payload.id}`, payload.formData);
  await Promise.resolve();
  return { id: payload.id, status: payload.status };
}

export function useUpdateDataset() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDataset,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
      router.push(`/${locale}/datasets/${variables.id}`);
    },
  });
}
