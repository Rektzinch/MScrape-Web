import type { Metadata } from "next";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";
import { DocumentLanguage } from "../_components/document-language";
import type { Locale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Ringkasan prinsip penggunaan MScrape secara bertanggung jawab untuk riset, analisis, dan tindak lanjut data bisnis.",
  alternates: { canonical: "/syarat-ketentuan" },
  openGraph: { url: "/syarat-ketentuan" },
};

const termsId = [
  ["Penggunaan bertanggung jawab", "Gunakan data yang tersedia melalui MScrape untuk riset, analisis, dan tindak lanjut yang sah serta relevan dengan kebutuhan Anda."],
  ["Sumber dan kelengkapan data", "Data hasil scan bergantung pada informasi yang tersedia dari sumber pencarian. Kolom kosong, perubahan data, atau hasil yang tidak lengkap perlu ditinjau kembali sebelum digunakan."],
  ["Komunikasi dan privasi", "Pastikan setiap komunikasi lanjutan menghormati privasi, izin, preferensi penerima, dan aturan yang berlaku pada wilayah maupun kanal komunikasi terkait."],
  ["Akses layanan", "Kapasitas hasil, jeda request, dan fitur yang tersedia mengikuti tier akses aktif. Status akses dapat diperiksa dari workspace Produksi."],
];

const termsEn = [
  ["Responsible use", "Use data available through MScrape for lawful research, analysis, and follow-up relevant to your needs."],
  ["Sources and data completeness", "Scan results depend on information available from the search source. Review empty fields, changing data, or incomplete results before use."],
  ["Communication and privacy", "Make sure any follow-up communication respects privacy, permission, recipient preferences, and the rules that apply to the relevant region and channel."],
  ["Service access", "Result capacity, request cooldowns, and available features follow the active access plan. You can check access status from the Production workspace."],
];

export function TermsPage({ locale = "id" }: { locale?: Locale }) {
  const en = locale === "en";
  const terms = en ? termsEn : termsId;
  return (
    <>
      <DocumentLanguage locale={locale} />
      <AppHeader current="info" locale={locale} currentPath={en ? "/en/syarat-ketentuan" : "/syarat-ketentuan"} />
      <main className="info-page">
        <section className="info-masthead info-masthead--terms" aria-labelledby="terms-title">
          <div className="info-masthead__inner wb-shell">
            <p>02 / {en ? "USE" : "PENGGUNAAN"}</p>
            <h1 id="terms-title">{en ? "MScrape Terms & Conditions." : <>Syarat &amp; Ketentuan penggunaan MScrape.</>}</h1>
          </div>
        </section>
        <section className="terms-document wb-shell" aria-label="Ringkasan syarat dan ketentuan">
          <p className="terms-document__intro">{en ? "This summary helps keep MScrape use focused. Always make your own assessment of the data context and any communication you plan to conduct." : "Ringkasan ini membantu menjaga penggunaan MScrape tetap terarah. Selalu lakukan penilaian Anda sendiri terhadap konteks data dan komunikasi yang akan dilakukan."}</p>
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
        <AppFooter locale={locale} />
      </main>
    </>
  );
}

export default function SyaratKetentuanPage() {
  return <TermsPage />;
}
