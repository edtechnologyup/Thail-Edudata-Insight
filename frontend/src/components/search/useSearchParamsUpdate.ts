"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type SearchParamUpdates = Record<string, string | null | undefined>;

export function useSearchParamsUpdate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: SearchParamUpdates, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (options?.resetPage !== false) {
        const hasNonPageChange = Object.keys(updates).some((k) => k !== "page");
        if (hasNonPageChange && !("page" in updates)) {
          params.delete("page");
        }
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  return updateParams;
}

export function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

export function toggleListParam(current: string[], id: string): string[] {
  if (current.includes(id)) {
    return current.filter((v) => v !== id);
  }
  return [...current, id];
}
