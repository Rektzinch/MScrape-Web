import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/bricolage-grotesque";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";
import "./workbench.css";

const socialImage = siteUrl
  ? new URL("/media/production-console.webp", siteUrl).toString()
  : undefined;
const brandLogo = siteUrl
  ? new URL("/media/mscrape-logo.png", siteUrl).toString()
  : "/media/mscrape-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "MScrape",
      url: siteUrl?.origin,
      logo: brandLogo,
      image: brandLogo,
    },
    {
      "@type": "WebSite",
      name: "MScrape",
      url: siteUrl?.origin,
      inLanguage: "id-ID",
    },
    {
      "@type": "SoftwareApplication",
      name: "MScrape",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl?.origin,
      inLanguage: "id-ID",
      description:
        "Aplikasi untuk mencari dan mengumpulkan data bisnis dari Google Maps berdasarkan kata kunci serta wilayah, lalu mengekspor hasil pilihan ke CSV.",
      image: brandLogo,
      publisher: {
        "@type": "Organization",
        name: "MScrape",
        logo: brandLogo,
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "MScrape — Google Maps Scraper & Pencari Data Bisnis Indonesia",
    template: "%s | MScrape",
  },
  description:
    "Cari dan kumpulkan data bisnis dari Google Maps dengan MScrape. Temukan nama bisnis, alamat, telepon, website, email bila tersedia, lalu ekspor hasil ke CSV.",
  applicationName: "MScrape",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/media/mscrape-logo.png", type: "image/png", sizes: "2172x724" }],
    shortcut: ["/media/mscrape-logo.png"],
    apple: [{ url: "/media/mscrape-logo.png", type: "image/png", sizes: "2172x724" }],
  },
  keywords: [
    "google maps scraper indonesia",
    "scraper google maps",
    "ambil data google maps",
    "cari data bisnis",
    "database bisnis indonesia",
    "lead generation indonesia",
    "export google maps ke csv",
    "cari bisnis tanpa website",
    "data bisnis lokal",
    "prospek bisnis lokal",
    "pencari data bisnis",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "MScrape",
    title: "MScrape — Google Maps Scraper & Pencari Data Bisnis Indonesia",
    description:
      "Cari dan kumpulkan data bisnis dari Google Maps dengan MScrape. Temukan nama bisnis, alamat, telepon, website, email bila tersedia, lalu ekspor hasil ke CSV.",
    images: socialImage
      ? [
          {
            url: socialImage,
            width: 1600,
            height: 1000,
            alt: "Workspace MScrape untuk pencarian dan ekspor data bisnis dari Google Maps",
          },
        ]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "MScrape — Google Maps Scraper & Pencari Data Bisnis Indonesia",
    description:
      "Cari dan kumpulkan data bisnis dari Google Maps dengan MScrape. Temukan nama bisnis, alamat, telepon, website, email bila tersedia, lalu ekspor hasil ke CSV.",
    images: socialImage ? [socialImage] : undefined,
  },
  category: "business",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
