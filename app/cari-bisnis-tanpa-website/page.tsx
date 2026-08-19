import type { Metadata } from "next";
import { SeoLanding } from "../_components/seo-landing";

export const metadata: Metadata = {
  title: "Cari Bisnis Tanpa Website di Indonesia | MScrape",
  description:
    "Cari bisnis yang belum menampilkan website pada hasil Google Maps dengan MScrape. Gunakan informasi yang tersedia untuk memprioritaskan riset peluang layanan digital.",
  alternates: { canonical: "/cari-bisnis-tanpa-website" },
  openGraph: { url: "/cari-bisnis-tanpa-website" },
};

export default function CariBisnisTanpaWebsitePage() {
  return (
    <SeoLanding
      breadcrumb="Cari Bisnis Tanpa Website"
      kicker="CARI BISNIS TANPA WEBSITE"
      title="Cari Bisnis Tanpa Website untuk Riset Peluang Digital"
      lead="Temukan bisnis lokal berdasarkan niche dan wilayah, lalu gunakan informasi website yang tersedia pada hasil untuk memprioritaskan daftar yang perlu Anda teliti lebih lanjut."
      facts={[
        { label: "Fokus", value: "Peluang layanan digital" },
        { label: "Konteks", value: "Status website pada hasil" },
        { label: "Langkah lanjut", value: "Tinjau & validasi" },
      ]}
      sections={[
        {
          eyebrow: "Satu sinyal untuk dipelajari",
          title: "Gunakan status website sebagai konteks prioritas",
          paragraphs: [
            "Untuk agensi dan freelancer, bisnis yang belum menampilkan website pada hasil Google Maps dapat menjadi salah satu sinyal untuk riset peluang layanan digital. MScrape membantu Anda melihat konteks tersebut di samping informasi bisnis lain yang tersedia.",
            "Ketidaktersediaan website pada hasil bukan berarti bisnis tersebut tidak memiliki kehadiran digital. Gunakan sebagai penanda awal, kemudian lakukan pengecekan manual sebelum membuat penilaian atau menghubungi pemilik bisnis.",
          ],
        },
        {
          eyebrow: "Pencarian yang spesifik",
          title: "Mulai dari niche dan area layanan Anda",
          paragraphs: [
            "Masukkan jenis usaha yang selaras dengan layanan Anda dan pilih wilayah yang benar-benar ingin Anda jangkau. Fokus geografis membantu Anda menilai peluang pada pasar yang lebih dekat dengan kemampuan operasional atau strategi penawaran Anda.",
            "Setelah hasil scan tersedia, gunakan filter untuk memusatkan perhatian pada bisnis yang memerlukan peninjauan lebih lanjut. Dengan begitu, daftar awal tidak segera berubah menjadi asumsi tentang kebutuhan setiap bisnis.",
          ],
        },
        {
          eyebrow: "Siapkan riset sebelum pendekatan",
          title: "Tinjau kebutuhan bisnis sebelum menawarkan layanan",
          paragraphs: [
            "Website hanyalah satu bagian dari kehadiran digital. Profil bisnis, media sosial, ulasan pelanggan, dan kebutuhan operasional dapat memberikan konteks tambahan sebelum Anda menyusun proposal atau percakapan yang relevan.",
            "MScrape membantu mengatur tahap pencarian awal. Kualitas tindak lanjut tetap bergantung pada riset, relevansi layanan, dan penghormatan Anda terhadap preferensi komunikasi setiap bisnis.",
          ],
        },
      ]}
      related={[
        { href: "/cari-data-bisnis", label: "Cari Data Bisnis", description: "Petakan bisnis menurut niche dan lokasi." },
        { href: "/lead-generation", label: "Lead Generation", description: "Susun proses riset prospek yang lebih terarah." },
        { href: "/export-google-maps-csv", label: "Ekspor CSV", description: "Lanjutkan daftar terpilih dalam spreadsheet Anda." },
      ]}
      ctaTitle="Mulai dari peluang yang perlu diteliti, bukan asumsi."
      ctaCopy="Buka Produksi untuk mencari bisnis lokal dan gunakan status website sebagai salah satu konteks saat menyusun prioritas riset."
    />
  );
}
