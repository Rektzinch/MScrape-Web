import type { Metadata } from "next";
import { SeoLanding } from "../_components/seo-landing";

export const metadata: Metadata = {
  title: "Cari Data Bisnis Indonesia Berdasarkan Lokasi | MScrape",
  description:
    "Cari data bisnis Indonesia berdasarkan niche dan lokasi dengan MScrape. Gunakan hasil Google Maps sebagai titik awal riset pasar, prospek, dan penawaran layanan.",
  alternates: { canonical: "/cari-data-bisnis" },
  openGraph: { url: "/cari-data-bisnis" },
};

export default function CariDataBisnisPage() {
  return (
    <SeoLanding
      breadcrumb="Cari Data Bisnis"
      kicker="CARI DATA BISNIS INDONESIA"
      title="Cari Data Bisnis Berdasarkan Niche dan Wilayah"
      lead="Petakan bisnis yang relevan dengan pasar Anda melalui pencarian kata kunci dan lokasi. MScrape membantu mengubah hasil Google Maps menjadi daftar awal untuk riset, analisis, dan perencanaan tindak lanjut."
      facts={[
        { label: "Mulai dari", value: "Kata kunci" },
        { label: "Saring menurut", value: "Lokasi" },
        { label: "Lanjutkan dengan", value: "Filter & CSV" },
      ]}
      sections={[
        {
          eyebrow: "Riset yang dimulai dari konteks",
          title: "Tentukan pasar yang ingin Anda pahami",
          paragraphs: [
            "Pencarian data bisnis akan lebih berguna ketika kata kunci dan wilayah dirumuskan secara spesifik. Masukkan jenis usaha yang relevan dengan layanan atau riset Anda, kemudian pilih kota atau area yang ingin dipetakan.",
            "Pendekatan ini membantu Anda melihat daftar bisnis pada konteks lokal, bukan sekadar mengumpulkan data dalam jumlah besar tanpa arah kerja yang jelas.",
          ],
        },
        {
          eyebrow: "Untuk pasar lokal",
          title: "Gunakan hasil sebagai titik awal riset bisnis Indonesia",
          paragraphs: [
            "Data yang tersedia pada hasil Google Maps dapat memberikan gambaran awal tentang keberadaan bisnis, lokasi, serta informasi yang ditampilkan secara publik. Gunakan informasi itu untuk membaca pola pasar dan memilih bisnis yang perlu dianalisis lebih lanjut.",
            "MScrape tidak menggantikan validasi manual. Sebelum menggunakan data untuk keputusan atau komunikasi, periksa kembali kesesuaian informasi serta gunakan saluran kontak secara bertanggung jawab.",
          ],
        },
        {
          eyebrow: "Lebih dari daftar nama",
          title: "Buat daftar kerja yang siap ditinjau tim",
          paragraphs: [
            "Setelah hasil tersedia, Anda dapat memeriksa informasi yang ada dan memusatkan perhatian pada daftar yang relevan. Hasil pilihan dapat diunduh sebagai CSV agar mudah dibuka bersama rekan kerja atau dipadukan dengan riset lain.",
            "Alur ini cocok ketika Anda membutuhkan fondasi data untuk pemetaan wilayah, identifikasi calon pelanggan, atau evaluasi niche sebelum memulai kampanye layanan.",
          ],
        },
      ]}
      related={[
        { href: "/google-maps-scraper", label: "Google Maps Scraper", description: "Lihat alur pencarian data bisnis dari Google Maps." },
        { href: "/cari-bisnis-tanpa-website", label: "Bisnis Tanpa Website", description: "Fokuskan riset pada salah satu konteks peluang digital." },
        { href: "/lead-generation", label: "Lead Generation", description: "Hubungkan daftar awal dengan riset prospek yang bertanggung jawab." },
      ]}
      ctaTitle="Mulai dari niche dan wilayah yang tepat."
      ctaCopy="Gunakan Produksi untuk menjalankan pencarian, lalu jadikan hasil yang tersedia sebagai bahan riset pasar lokal Anda."
    />
  );
}
