import type { Metadata } from "next";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Ringkasan prinsip penggunaan MScrape secara bertanggung jawab untuk riset, analisis, dan tindak lanjut data bisnis.",
  alternates: { canonical: "/syarat-ketentuan" },
  openGraph: { url: "/syarat-ketentuan" },
};

const terms = [
  ["Penggunaan bertanggung jawab", "Gunakan data yang tersedia melalui MScrape untuk riset, analisis, dan tindak lanjut yang sah serta relevan dengan kebutuhan Anda."],
  ["Sumber dan kelengkapan data", "Data hasil scan bergantung pada informasi yang tersedia dari sumber pencarian. Kolom kosong, perubahan data, atau hasil yang tidak lengkap perlu ditinjau kembali sebelum digunakan."],
  ["Komunikasi dan privasi", "Pastikan setiap komunikasi lanjutan menghormati privasi, izin, preferensi penerima, dan aturan yang berlaku pada wilayah maupun kanal komunikasi terkait."],
  ["Akses layanan", "Kapasitas hasil, jeda request, dan fitur yang tersedia mengikuti tier akses aktif. Status akses dapat diperiksa dari workspace Produksi."],
];

export default function SyaratKetentuanPage() {
  return (
    <>
      <AppHeader current="info" />
      <main className="info-page">
        <section className="info-masthead info-masthead--terms" aria-labelledby="terms-title">
          <div className="info-masthead__inner wb-shell">
            <p>02 / PENGGUNAAN</p>
            <h1 id="terms-title">Syarat &amp; Ketentuan penggunaan MScrape.</h1>
          </div>
        </section>
        <section className="terms-document wb-shell" aria-label="Ringkasan syarat dan ketentuan">
          <p className="terms-document__intro">Ringkasan ini membantu menjaga penggunaan MScrape tetap terarah. Selalu lakukan penilaian Anda sendiri terhadap konteks data dan komunikasi yang akan dilakukan.</p>
          <ol>
            {terms.map(([title, detail], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <AppFooter />
      </main>
    </>
  );
}
