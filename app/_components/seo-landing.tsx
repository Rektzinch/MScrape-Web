import Link from "next/link";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";

type Fact = {
  label: string;
  value: string;
};

type Section = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
};

type RelatedLink = {
  href: string;
  label: string;
  description: string;
};

export type SeoLandingProps = {
  breadcrumb: string;
  kicker: string;
  title: string;
  lead: string;
  facts: Fact[];
  sections: Section[];
  related: RelatedLink[];
  ctaTitle: string;
  ctaCopy: string;
};

export function SeoLanding({
  breadcrumb,
  kicker,
  title,
  lead,
  facts,
  sections,
  related,
  ctaTitle,
  ctaCopy,
}: SeoLandingProps) {
  return (
    <>
      <AppHeader current="info" />
      <main className="seo-page">
        <nav className="seo-breadcrumb wb-shell" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Beranda</Link></li>
            <li aria-current="page">{breadcrumb}</li>
          </ol>
        </nav>
        <section className="seo-hero wb-shell" aria-labelledby="seo-page-title">
          <p className="seo-hero__kicker">{kicker}</p>
          <h1 id="seo-page-title">{title}</h1>
          <p className="seo-hero__lead">{lead}</p>
          <div className="seo-hero__actions">
            <Link className="seo-button seo-button--primary" href="/dashboard">Buka MScrape</Link>
            <Link className="seo-button seo-button--quiet" href="/google-maps-scraper">Lihat cara kerjanya</Link>
          </div>
          <dl className="seo-fact-row" aria-label="Kapabilitas MScrape">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="seo-body wb-shell" aria-label="Penjelasan layanan">
          {sections.map((section) => (
            <article className="seo-article" key={section.title}>
              <p className="seo-article__eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </article>
          ))}
        </section>

        <section className="seo-related" aria-labelledby="related-title">
          <div className="wb-shell">
            <div className="seo-section-heading">
              <p>Jelajahi menurut kebutuhan</p>
              <h2 id="related-title">Panduan MScrape untuk pekerjaan Anda</h2>
            </div>
            <div className="seo-related__grid">
              {related.map((item) => (
                <Link className="seo-related__card" href={item.href} key={item.href}>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                  <span aria-hidden="true">Baca halaman →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-cta wb-shell" aria-labelledby="seo-cta-title">
          <div>
            <p>Mulai dari pencarian yang terarah</p>
            <h2 id="seo-cta-title">{ctaTitle}</h2>
          </div>
          <div>
            <p>{ctaCopy}</p>
            <Link className="seo-button seo-button--dark" href="/dashboard">Masuk ke Dashboard</Link>
          </div>
        </section>
      </main>
      <AppFooter />
    </>
  );
}
