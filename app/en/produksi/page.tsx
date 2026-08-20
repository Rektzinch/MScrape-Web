import type { Metadata } from "next";
import { ProductionPage } from "../../produksi/page";

export const metadata: Metadata = {
  title: "Production",
  description: "Run a Google Maps scan, review and filter business results, then export the selected dataset.",
  alternates: {
    canonical: "/en/produksi",
    languages: { "id-ID": "/produksi", "en-US": "/en/produksi" },
  },
  openGraph: { url: "/en/produksi", locale: "en_US" },
  robots: { index: false, follow: false },
};

export default function EnglishProductionPage() {
  return <ProductionPage locale="en" />;
}
