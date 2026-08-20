import type { Metadata } from "next";
import { SeoLanding } from "../_components/seo-landing";

export const metadata: Metadata = {
  title: "Lead Generation Indonesia untuk Bisnis Lokal | MScrape",
  description:
    "Mulai lead generation Indonesia dari data bisnis lokal yang relevan. MScrape membantu mencari hasil Google Maps, meninjau konteks usaha, dan mengekspor daftar untuk riset lanjutan.",
  alternates: { canonical: "/lead-generation" },
  openGraph: { url: "/lead-generation" },
};

export default function LeadGenerationPage() {
  return (
    <SeoLanding
      currentPath="/lead-generation"
      breadcrumb="Lead Generation Indonesia"
      kicker="LEAD GENERATION INDONESIA"
      title="Lead Generation Indonesia yang Dimulai dari Riset Lokal"
      lead="Cari bisnis yang relevan dengan layanan Anda, pahami konteks lokalnya, lalu susun daftar kerja untuk riset dan percakapan yang lebih tepat. MScrape membantu Anda memulai dari data bisnis yang tersedia."
      facts={[
        { label: "Sasaran awal", value: "Bisnis lokal" },
        { label: "Konteks", value: "Niche & wilayah" },
        { label: "Proses", value: "Cari · tinjau · ekspor" },
      ]}
      sections={[
        {
          eyebrow: "Dasar prospek yang lebih jelas",
          title: "Mulai dari bisnis yang relevan dengan layanan Anda",
          paragraphs: [
            "Lead generation yang baik dimulai dengan pemahaman mengenai siapa yang ingin Anda layani. Gunakan kata kunci yang dekat dengan niche Anda, lalu batasi area pencarian untuk membangun daftar bisnis lokal yang lebih relevan.",
            "Bagi agensi, tim sales, dan freelancer, hasil tersebut dapat menjadi bahan awal untuk menilai kesesuaian pasar sebelum membuat pendekatan yang dipersonalisasi.",
          ],
        },
        {
          eyebrow: "Data bukan izin untuk menghubungi",
          title: "Gunakan hasil untuk riset, bukan komunikasi massal",
          paragraphs: [
            "Informasi yang ditampilkan dalam hasil scan sebaiknya digunakan sebagai konteks riset. Periksa kembali profil bisnis, kebutuhan yang mungkin relevan, serta preferensi kanal komunikasi sebelum mengambil tindakan lebih lanjut.",
            "MScrape tidak mengotomatisasi pengiriman pesan atau menjamin hasil penjualan. Nilai utamanya adalah membantu Anda menata titik awal riset supaya proses tindak lanjut dapat dibuat lebih matang dan bertanggung jawab.",
          ],
        },
        {
          eyebrow: "Siapkan alur kerja",
          title: "Bawa daftar terpilih ke proses tim Anda",
          paragraphs: [
            "Setelah meninjau hasil, filter daftar untuk menyisakan bisnis yang benar-benar ingin Anda teliti. Ekspor CSV memudahkan Anda meneruskan daftar itu ke spreadsheet, catatan riset, atau proses koordinasi internal.",
            "Dengan daftar yang lebih terarah, waktu tim dapat difokuskan pada kualitas penilaian dan relevansi penawaran, bukan pada pencarian awal yang berulang.",
          ],
        },
      ]}
      related={[
        { href: "/cari-data-bisnis", label: "Cari Data Bisnis", description: "Bangun daftar awal berdasarkan niche dan lokasi." },
        { href: "/cari-bisnis-tanpa-website", label: "Peluang Website", description: "Gunakan status website sebagai salah satu konteks riset." },
        { href: "/export-google-maps-csv", label: "Ekspor CSV", description: "Lanjutkan daftar pilihan dalam alat kerja tim Anda." },
      ]}
      ctaTitle="Mulai riset prospek dari wilayah yang Anda pahami."
      ctaCopy="Buka Produksi, tentukan niche dan lokasi, kemudian tinjau hasil sebelum menyusun langkah tindak lanjut yang relevan."
    />
  );
}
