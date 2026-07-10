import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://167.99.67.27";
  const now = new Date();

  return [
    { url: `${siteUrl}/th`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/en`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/th/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/en/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/th/stats`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/en/stats`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/th/scholarship`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/en/scholarship`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/th/api-docs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/en/api-docs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
