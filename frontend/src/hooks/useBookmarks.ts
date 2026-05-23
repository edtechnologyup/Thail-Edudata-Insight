"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAgencyBookmarkMock,
  getAgencyBookmarksMock,
  type AgencyBookmarkMock,
} from "@/data/mockData";

export function useBookmarks() {
  return useQuery<AgencyBookmarkMock[]>({
    queryKey: ["agency", "bookmarks"],
    queryFn: async () => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // const res = await apiClient.get<{ data: AgencyBookmarkMock[] }>(
      //   "/agency/bookmarks"
      // );
      // return res.data.data;

      await Promise.resolve();
      return getAgencyBookmarksMock();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // await apiClient.delete(`/agency/bookmarks/${id}`);

      await Promise.resolve();
      deleteAgencyBookmarkMock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "bookmarks"] });
    },
  });
}
