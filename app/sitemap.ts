import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/google-maps-scraper", changeFrequency: "monthly", priority: 0.9 },
    { path: "/cari-data-bisnis", changeFrequency: "monthly", priority: 0.9 },
    { path: "/lead-generation", changeFrequency: "monthly", priority: 0.85 },
    { path: "/export-google-maps-csv", changeFrequency: "monthly", priority: 0.85 },
    { path: "/cari-bisnis-tanpa-website", changeFrequency: "monthly", priority: 0.85 },
    { path: "/tentang-mscrape", changeFrequency: "monthly", priority: 0.6 },
    { path: "/developer", changeFrequency: "monthly", priority: 0.5 },
    { path: "/syarat-ketentuan", changeFrequency: "yearly", priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: new URL(page.path, siteUrl).toString(),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
