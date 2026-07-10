import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://167.99.67.27";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/th/dashboard", "/en/dashboard", "/th/manage/", "/en/manage/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
