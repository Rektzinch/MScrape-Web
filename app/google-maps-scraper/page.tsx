import type { Metadata } from "next";
import { SeoLanding } from "../_components/seo-landing";

export const metadata: Metadata = {
  title: "Google Maps Scraper Indonesia untuk Data Bisnis | MScrape",
  description:
    "Gunakan Google Maps scraper MScrape untuk mencari data bisnis berdasarkan kata kunci dan lokasi. Tinjau informasi yang tersedia lalu ekspor hasil terpilih ke CSV.",
  alternates: { canonical: "/google-maps-scraper" },
  openGraph: { url: "/google-maps-scraper" },
};

export default function GoogleMapsScraperPage() {
  return (
    <SeoLanding
      breadcrumb="Google Maps Scraper"
      kicker="GOOGLE MAPS SCRAPER INDONESIA"
      title="Google Maps Scraper untuk Riset Data Bisnis Lokal"
      lead="Mulai dari kata kunci dan wilayah yang spesifik. MScrape membantu menata hasil bisnis dari Google Maps menjadi daftar yang dapat Anda periksa, filter, dan bawa ke proses kerja berikutnya."
      facts={[
        { label: "Input", value: "Niche & wilayah" },
        { label: "Cakupan", value: "Kota & kecamatan" },
        { label: "Hasil", value: "Filter & ekspor CSV" },
      ]}
      sections={[
        {
          eyebrow: "Cara kerja yang langsung",
          title: "Cari bisnis berdasarkan kata kunci dan lokasi",
          paragraphs: [
            "Google Maps scraper MScrape dimulai dengan istilah yang menggambarkan niche bisnis serta area yang ingin Anda pelajari. Kombinasi ini membantu menyempitkan pencarian, misalnya layanan tertentu di kota atau kecamatan tertentu.",
            "Hasil scan ditampilkan dalam workspace Produksi agar Anda dapat melihat daftar bisnis pada konteks pencarian yang sama. Pilih kata kunci yang benar-benar mewakili pasar Anda untuk memperoleh titik awal riset yang lebih berguna.",
          ],
        },
        {
          eyebrow: "Tinjau informasi yang tersedia",
          title: "Susun data bisnis tanpa memulai dari daftar contoh",
          paragraphs: [
            "Bergantung pada ketersediaan hasil sumber, data dapat mencakup nama bisnis, alamat, telepon, website, rating, tautan Google Maps, dan email. Kolom yang tidak tersedia tetap ditampilkan secara transparan agar tidak disalahartikan sebagai data yang sudah diverifikasi.",
            "Daftar tersebut dapat membantu tim sales, agensi, freelancer, atau peneliti pasar melakukan penilaian awal sebelum melakukan riset tambahan dan tindak lanjut yang sesuai.",
          ],
        },
        {
          eyebrow: "Dari hasil ke alur kerja",
          title: "Filter dan ekspor daftar bisnis yang relevan",
          paragraphs: [
            "Setelah scan selesai, gunakan filter hasil untuk memusatkan perhatian pada bisnis yang ingin Anda tinjau lebih lanjut. Daftar pilihan dapat diunduh sebagai CSV agar mudah dilanjutkan dalam spreadsheet atau proses kerja internal.",
            "MScrape membantu menyediakan titik awal pencarian. Keputusan untuk menghubungi bisnis dan cara tindak lanjutnya tetap berada pada penilaian serta tanggung jawab pengguna.",
          ],
        },
      ]}
      related={[
        { href: "/cari-data-bisnis", label: "Cari Data Bisnis", description: "Atur pencarian bisnis lokal menurut niche dan lokasi." },
        { href: "/export-google-maps-csv", label: "Ekspor ke CSV", description: "Pahami alur mengunduh hasil scan terpilih." },
        { href: "/lead-generation", label: "Lead Generation", description: "Jadikan data awal sebagai bahan riset prospek." },
      ]}
      ctaTitle="Mulai pencarian bisnis yang lebih spesifik."
      ctaCopy="Buka Produksi MScrape, pilih kata kunci dan wilayah, lalu tinjau hasil yang tersedia sebelum melanjutkan pekerjaan Anda."
    />
  );
}
