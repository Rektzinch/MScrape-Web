import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];

  const lastModified = new Date();
  return [
    {
      url: new URL("/dashboard", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/produksi", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
