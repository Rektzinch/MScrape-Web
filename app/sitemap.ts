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

  return pages.flatMap((page) => {
    const englishPath = page.path === "/" ? "/en" : `/en${page.path}`;
    const languages = {
      "id-ID": new URL(page.path, siteUrl).toString(),
      "en-US": new URL(englishPath, siteUrl).toString(),
    };
    return [
      {
        url: languages["id-ID"],
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      },
      {
        url: languages["en-US"],
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: Math.max(0.2, page.priority - 0.05),
        alternates: { languages },
      },
    ];
  });
}
