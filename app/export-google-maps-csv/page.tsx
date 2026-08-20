import type { Metadata } from "next";
import { SeoLanding } from "../_components/seo-landing";

export const metadata: Metadata = {
  title: "Ekspor Data Google Maps ke CSV | MScrape",
  description:
    "Ekspor hasil pencarian Google Maps ke CSV dengan MScrape. Tinjau, filter, dan unduh data bisnis terpilih untuk riset pasar atau proses kerja tim.",
  alternates: { canonical: "/export-google-maps-csv" },
  openGraph: { url: "/export-google-maps-csv" },
};

export default function ExportGoogleMapsCsvPage() {
  return (
    <SeoLanding
      currentPath="/export-google-maps-csv"
      breadcrumb="Ekspor Google Maps ke CSV"
      kicker="EKSPOR GOOGLE MAPS KE CSV"
      title="Ekspor Data Google Maps ke CSV untuk Dikerjakan Lebih Lanjut"
      lead="Jadikan hasil pencarian bisnis sebagai daftar kerja yang lebih praktis. Setelah scan selesai, tinjau dan filter data yang relevan sebelum mengunduhnya ke CSV untuk riset atau koordinasi tim."
      facts={[
        { label: "Sebelum unduh", value: "Tinjau & filter" },
        { label: "Format", value: "CSV" },
        { label: "Kegunaan", value: "Riset & alur kerja" },
      ]}
      sections={[
        {
          eyebrow: "Dari pencarian ke file kerja",
          title: "Pilih hasil yang memang relevan untuk tujuan Anda",
          paragraphs: [
            "Ekspor akan lebih bernilai ketika daftar hasil telah ditinjau terlebih dahulu. Setelah menjalankan pencarian berdasarkan kata kunci dan wilayah, gunakan konteks data yang tersedia untuk memilih bisnis yang hendak dianalisis lebih lanjut.",
            "Proses ini membantu menjaga file kerja Anda tetap fokus, khususnya saat daftar akan dipakai untuk pemetaan pasar, penyusunan target penawaran, atau pembagian tugas riset di dalam tim.",
          ],
        },
        {
          eyebrow: "Format sederhana untuk proses Anda",
          title: "Unduh hasil pilihan ke CSV",
          paragraphs: [
            "MScrape menyediakan ekspor CSV dari workspace Produksi. CSV dapat dibuka di spreadsheet dan dipakai sebagai bahan lanjutan untuk catatan riset, pengecekan data, atau pengelompokan internal sesuai kebutuhan Anda.",
            "Informasi yang diekspor tetap mengikuti data yang tersedia pada hasil sumber. Kolom kosong perlu diperlakukan sebagai informasi yang belum tersedia, bukan nilai yang perlu dilengkapi dengan asumsi.",
          ],
        },
        {
          eyebrow: "Kerja lanjut yang bertanggung jawab",
          title: "Padukan CSV dengan validasi manual Anda",
          paragraphs: [
            "File CSV adalah alat bantu untuk mengatur pekerjaan, bukan bukti bahwa seluruh informasi selalu mutakhir atau cocok untuk setiap tujuan. Validasi kembali informasi penting sebelum menggunakannya untuk keputusan bisnis atau komunikasi.",
            "Dengan langkah tersebut, daftar hasil dapat membantu menghemat waktu pencarian awal sambil tetap menjaga kualitas riset dan relevansi tindakan berikutnya.",
          ],
        },
      ]}
      related={[
        { href: "/google-maps-scraper", label: "Google Maps Scraper", description: "Pelajari cara menghasilkan daftar pencarian bisnis." },
        { href: "/cari-data-bisnis", label: "Cari Data Bisnis", description: "Mulai dari niche dan wilayah yang relevan." },
        { href: "/lead-generation", label: "Lead Generation", description: "Gunakan daftar sebagai dasar riset prospek yang terarah." },
      ]}
      ctaTitle="Siapkan daftar hasil yang siap ditinjau."
      ctaCopy="Jalankan pencarian di Produksi, pilih hasil yang relevan, lalu gunakan ekspor CSV untuk meneruskan pekerjaan Anda."
    />
  );
}
