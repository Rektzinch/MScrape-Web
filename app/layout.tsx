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
        "Aplikasi untuk menemukan bisnis lokal tanpa website dari Google Maps dan menyiapkan daftar prospek ke CSV.",
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
    default: "MScrape | Cari Prospek Bisnis Lokal Tanpa Website",
    template: "%s | MScrape",
  },
  description:
    "MScrape membantu agen web, freelancer, tim sales, dan konsultan digital menemukan bisnis lokal tanpa website dari Google Maps, lalu menyiapkan daftar prospek ke CSV.",
  applicationName: "MScrape",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/media/mscrape-logo.png", type: "image/png", sizes: "2172x724" }],
    shortcut: ["/media/mscrape-logo.png"],
    apple: [{ url: "/media/mscrape-logo.png", type: "image/png", sizes: "2172x724" }],
  },
  keywords: [
    "cari bisnis tanpa website",
    "prospek bisnis lokal",
    "Google Maps scraper Indonesia",
    "calon klien jasa website",
    "lead generation Indonesia",
    "ekspor lead CSV",
    "prospek layanan digital",
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
    url: "/dashboard",
    siteName: "MScrape",
    title: "MScrape | Cari Prospek Bisnis Lokal Tanpa Website",
    description:
      "Temukan bisnis lokal tanpa website, pilih akses MScrape yang sesuai, lalu siapkan daftar prospek untuk layanan digital Anda.",
    images: socialImage
      ? [
          {
            url: socialImage,
            width: 1600,
            height: 1000,
            alt: "Workspace Produksi MScrape untuk pencarian prospek bisnis lokal",
          },
        ]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "MScrape | Cari Prospek Bisnis Lokal Tanpa Website",
    description:
      "Temukan bisnis lokal tanpa website, pilih akses MScrape yang sesuai, lalu siapkan daftar prospek untuk layanan digital Anda.",
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
