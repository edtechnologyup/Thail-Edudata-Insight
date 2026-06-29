"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type HeroImageData = {
  imageUrl: string | null;
};

type SiteSettingsPublic = {
  ribbon_enabled: boolean;
  ribbon_image_url: string;
  grayscale_enabled: boolean;
  image_urls: Record<string, string>;
};

function resolveUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function useHeroImage() {
  return useSettingImage("home_hero_image");
}

export function useSettingImage(key: string) {
  return useQuery<HeroImageData>({
    queryKey: ["settings", "image", key],
    queryFn: async () => {
      const res = await apiClient.get<{ data: SiteSettingsPublic }>(
        "/public/settings/site"
      );
      const url = res.data.data.image_urls?.[key] ?? null;
      return { imageUrl: resolveUrl(url) };
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
