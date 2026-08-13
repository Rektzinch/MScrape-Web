import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import "./workbench.css";

export const metadata: Metadata = {
  title: {
    default: "MScrape — Data bisnis lokal siap kerja",
    template: "%s — MScrape",
  },
  description:
    "Pindai Google Maps secara live, saring data bisnis lokal, dan ekspor hasil yang rapi ke CSV.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
