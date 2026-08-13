import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "./globals.css";

export const metadata: Metadata = {
  title: "MScrape — Local business lead workspace",
  description:
    "Cari data bisnis nyata dari sumber terbuka atau backend scraper yang kamu host sendiri.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
