"use client";

import { useMutation } from "@tanstack/react-query";
import {
  fetchMockBulkUpload,
  type BulkUploadResult,
} from "@/data/mockData";

async function bulkUpload(file: File): Promise<BulkUploadResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const formData = new FormData();
  // formData.append("file", file);
  // const response = await apiClient.post<JSendResponse<BulkUploadResult>>(
  //   "/agency/datasets/bulk-upload",
  //   formData,
  //   { headers: { "Content-Type": "multipart/form-data" } }
  // );
  // return response.data.data!;
  return fetchMockBulkUpload(file);
}

export function useBulkUpload() {
  return useMutation({
    mutationFn: bulkUpload,
  });
}
