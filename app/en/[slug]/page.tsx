import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLanding, type SeoLandingProps } from "../../_components/seo-landing";
import { AboutPage } from "../../tentang-mscrape/page";
import { TermsPage } from "../../syarat-ketentuan/page";
import { DeveloperProfilePage } from "../../developer/page";

type EnglishSeoPage = Omit<SeoLandingProps, "locale" | "currentPath"> & {
  metaTitle: string;
  metaDescription: string;
};

const seoPages: Record<string, EnglishSeoPage> = {
  "google-maps-scraper": {
    metaTitle: "Google Maps Scraper for Indonesian Business Data",
    metaDescription: "Search Google Maps business data by keyword and location, review the available information, and export selected results with MScrape.",
    breadcrumb: "Google Maps Scraper",
    kicker: "GOOGLE MAPS SCRAPER INDONESIA",
    title: "A Google Maps Scraper for Local Business Research",
    lead: "Start with a specific keyword and region. MScrape organizes Google Maps business results into a list you can review, filter, and carry into your next workflow.",
    facts: [
      { label: "Input", value: "Niche & region" },
      { label: "Coverage", value: "City & subdistrict" },
      { label: "Results", value: "Filter & CSV export" },
    ],
    sections: [
      { eyebrow: "A direct workflow", title: "Search businesses by keyword and location", paragraphs: ["MScrape starts with a term that describes the business niche and the area you want to study. This combination narrows a search to a useful local context.", "Results appear in one Production workspace, so you can review businesses against the same search intent before deciding what deserves further research."] },
      { eyebrow: "Review available information", title: "Organize business data without sample records", paragraphs: ["Depending on source availability, records may include business name, address, phone, website, rating, review count, Google Maps link, coordinates, and email.", "Unavailable fields stay clearly marked instead of being guessed, helping sales teams, agencies, freelancers, and researchers judge the dataset honestly."] },
      { eyebrow: "From results to workflow", title: "Filter and export the relevant list", paragraphs: ["After a scan completes, filter the results to focus on businesses that need a closer look. Export the selected list for a spreadsheet or internal workflow.", "MScrape provides a research starting point. Decisions about outreach and follow-up remain with the user."] },
    ],
    related: [
      { href: "/cari-data-bisnis", label: "Find Business Data", description: "Set up local business searches by niche and location." },
      { href: "/export-google-maps-csv", label: "Export to CSV", description: "Understand how selected scan results are downloaded." },
      { href: "/lead-generation", label: "Lead Generation", description: "Turn initial data into responsible prospect research." },
    ],
    ctaTitle: "Start a more specific business search.",
    ctaCopy: "Open MScrape Production, choose a keyword and region, and review the available results before moving forward.",
  },
  "cari-data-bisnis": {
    metaTitle: "Find Indonesian Business Data by Location",
    metaDescription: "Find Indonesian business data by niche and location with MScrape, then use the available Google Maps results for market and prospect research.",
    breadcrumb: "Find Business Data",
    kicker: "FIND INDONESIAN BUSINESS DATA",
    title: "Find Business Data by Niche and Region",
    lead: "Map businesses relevant to your market through keyword and location searches. MScrape turns Google Maps results into a starting list for research, analysis, and follow-up planning.",
    facts: [
      { label: "Start with", value: "Keywords" },
      { label: "Filter by", value: "Location" },
      { label: "Continue with", value: "Filters & CSV" },
    ],
    sections: [
      { eyebrow: "Research starts with context", title: "Define the market you want to understand", paragraphs: ["Business-data searches are more useful when both the keyword and region are specific. Enter a business type and choose the city or area you want to map.", "This keeps the work grounded in a local market instead of collecting a large list without a clear purpose."] },
      { eyebrow: "For local markets", title: "Use results as a starting point for Indonesian business research", paragraphs: ["Publicly available Google Maps information can reveal an initial view of business presence, location, and profile completeness.", "MScrape does not replace manual validation. Recheck important details and use contact channels responsibly before making decisions or communicating."] },
      { eyebrow: "More than a list of names", title: "Create a worklist your team can review", paragraphs: ["Inspect the available fields, focus the list with filters, and export the selected records for collaboration or deeper research.", "The workflow suits territory mapping, prospect identification, or niche evaluation before a service campaign begins."] },
    ],
    related: [
      { href: "/google-maps-scraper", label: "Google Maps Scraper", description: "See the business-search workflow from Google Maps." },
      { href: "/cari-bisnis-tanpa-website", label: "Businesses Without Websites", description: "Research one signal of a digital-service opportunity." },
      { href: "/lead-generation", label: "Lead Generation", description: "Connect an initial list with responsible prospect research." },
    ],
    ctaTitle: "Start with the right niche and region.",
    ctaCopy: "Use Production to run a search, then turn the available results into material for local market research.",
  },
  "lead-generation": {
    metaTitle: "Lead Generation for Indonesian Local Businesses",
    metaDescription: "Start Indonesian lead generation with relevant local business data, research business context, and export a focused worklist with MScrape.",
    breadcrumb: "Lead Generation Indonesia",
    kicker: "LEAD GENERATION INDONESIA",
    title: "Indonesian Lead Generation That Starts with Local Research",
    lead: "Find businesses relevant to your service, understand their local context, and build a worklist for better research and conversations.",
    facts: [
      { label: "Initial target", value: "Local businesses" },
      { label: "Context", value: "Niche & region" },
      { label: "Process", value: "Find · review · export" },
    ],
    sections: [
      { eyebrow: "A clearer prospect base", title: "Start with businesses relevant to your service", paragraphs: ["Good lead generation begins with understanding who you want to serve. Use keywords close to your niche and constrain the region to build a more relevant list.", "Agencies, sales teams, and freelancers can use the results to judge market fit before creating a personalized approach."] },
      { eyebrow: "Data is not permission to contact", title: "Use results for research, not mass messaging", paragraphs: ["Treat scan information as research context. Review the business profile, likely relevance, and preferred communication channel before acting.", "MScrape does not automate messages or promise sales. Its job is to organize the start of your research so follow-up can be thoughtful and responsible."] },
      { eyebrow: "Prepare the workflow", title: "Move the selected list into your team process", paragraphs: ["Filter results to keep only businesses you genuinely want to research. CSV export moves the list into a spreadsheet, research notes, or team coordination.", "A focused list lets your team spend time on evaluation quality and offer relevance rather than repeated initial searching."] },
    ],
    related: [
      { href: "/cari-data-bisnis", label: "Find Business Data", description: "Build an initial list by niche and location." },
      { href: "/cari-bisnis-tanpa-website", label: "Website Opportunities", description: "Use website status as one research signal." },
      { href: "/export-google-maps-csv", label: "CSV Export", description: "Continue the selected list in your team's tools." },
    ],
    ctaTitle: "Start prospect research in a market you understand.",
    ctaCopy: "Open Production, define the niche and location, and review the results before planning relevant follow-up.",
  },
  "export-google-maps-csv": {
    metaTitle: "Export Google Maps Business Data to CSV",
    metaDescription: "Review, filter, and export selected Google Maps business results to CSV for market research or team workflows with MScrape.",
    breadcrumb: "Export Google Maps to CSV",
    kicker: "EXPORT GOOGLE MAPS TO CSV",
    title: "Export Google Maps Data to CSV for Further Work",
    lead: "Turn business-search results into a practical worklist. Review and filter relevant records before downloading them to CSV for research or team coordination.",
    facts: [
      { label: "Before download", value: "Review & filter" },
      { label: "Format", value: "CSV" },
      { label: "Use", value: "Research & workflow" },
    ],
    sections: [
      { eyebrow: "From search to work file", title: "Select results that match your purpose", paragraphs: ["Exports are more valuable after the result list has been reviewed. Use the available context to select businesses that deserve further analysis.", "This keeps a work file focused for market mapping, target planning, or assigning research inside a team."] },
      { eyebrow: "A simple format for your process", title: "Download selected results to CSV", paragraphs: ["MScrape exports CSV from the Production workspace. Open it in a spreadsheet for research notes, data checks, or internal grouping.", "Exported information follows source availability. Treat empty fields as unavailable, not as values that should be filled with assumptions."] },
      { eyebrow: "Responsible follow-up work", title: "Combine CSV with manual validation", paragraphs: ["A CSV is a work-management aid, not proof that every detail is current or suitable for every purpose.", "Validate important information before using it for business decisions or communication, while keeping the initial search efficient."] },
    ],
    related: [
      { href: "/google-maps-scraper", label: "Google Maps Scraper", description: "Learn how the business-search list is generated." },
      { href: "/cari-data-bisnis", label: "Find Business Data", description: "Start with a relevant niche and region." },
      { href: "/lead-generation", label: "Lead Generation", description: "Use the list as a basis for focused prospect research." },
    ],
    ctaTitle: "Prepare a result list that is ready to review.",
    ctaCopy: "Run a search in Production, select relevant results, and use CSV export to continue your work.",
  },
  "cari-bisnis-tanpa-website": {
    metaTitle: "Find Indonesian Businesses Without Websites",
    metaDescription: "Find businesses that do not show a website in Google Maps results and use available context to prioritize digital-service research with MScrape.",
    breadcrumb: "Find Businesses Without Websites",
    kicker: "FIND BUSINESSES WITHOUT WEBSITES",
    title: "Find Businesses Without Websites for Digital Opportunity Research",
    lead: "Find local businesses by niche and region, then use the available website information to prioritize records that need deeper research.",
    facts: [
      { label: "Focus", value: "Digital-service opportunities" },
      { label: "Context", value: "Website status in results" },
      { label: "Next step", value: "Review & validate" },
    ],
    sections: [
      { eyebrow: "One signal to study", title: "Use website status as prioritization context", paragraphs: ["For agencies and freelancers, a business that does not show a website in Google Maps can be one signal for digital-service research.", "Missing website data does not prove the business has no online presence. Use it as an initial marker, then verify manually before judging or contacting anyone."] },
      { eyebrow: "A specific search", title: "Start with your niche and service area", paragraphs: ["Enter a business type aligned with your service and choose the region you can realistically support.", "When results arrive, filter for records that need a closer look without turning an initial list into assumptions about each business."] },
      { eyebrow: "Research before outreach", title: "Review the business need before offering a service", paragraphs: ["A website is only one part of digital presence. Profiles, social media, customer reviews, and operational context can improve your assessment.", "MScrape organizes the initial search; follow-up quality still depends on research, service relevance, and respect for communication preferences."] },
    ],
    related: [
      { href: "/cari-data-bisnis", label: "Find Business Data", description: "Map businesses by niche and location." },
      { href: "/lead-generation", label: "Lead Generation", description: "Build a more focused prospect-research process." },
      { href: "/export-google-maps-csv", label: "CSV Export", description: "Continue a selected list in your spreadsheet." },
    ],
    ctaTitle: "Start with an opportunity to research, not an assumption.",
    ctaCopy: "Open Production to find local businesses and use website status as one signal when prioritizing research.",
  },
};

const infoMeta: Record<string, { title: string; description: string; idPath: string }> = {
  "tentang-mscrape": { title: "About MScrape", description: "Learn how MScrape supports focused local business research, analysis, and follow-up.", idPath: "/tentang-mscrape" },
  "syarat-ketentuan": { title: "Terms & Conditions", description: "A summary of responsible MScrape use for business-data research, analysis, and follow-up.", idPath: "/syarat-ketentuan" },
  developer: { title: "Developer", description: "Meet the developer of MScrape, Muh Amin Arsyad, and find his official contact channels.", idPath: "/developer" },
};

export function generateStaticParams() {
  return [...Object.keys(seoPages), ...Object.keys(infoMeta)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seo = seoPages[slug];
  const info = infoMeta[slug];
  if (!seo && !info) return {};

  const title = seo?.metaTitle || info.title;
  const description = seo?.metaDescription || info.description;
  const idPath = info?.idPath || `/${slug}`;
  const englishPath = `/en/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: englishPath, languages: { "id-ID": idPath, "en-US": englishPath } },
    openGraph: { url: englishPath, locale: "en_US", title, description },
  };
}

export default async function EnglishStaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "tentang-mscrape") return <AboutPage locale="en" />;
  if (slug === "syarat-ketentuan") return <TermsPage locale="en" />;
  if (slug === "developer") return <DeveloperProfilePage locale="en" />;

  const page = seoPages[slug];
  if (!page) notFound();
  const { metaTitle: _metaTitle, metaDescription: _metaDescription, ...content } = page;
  return <SeoLanding {...content} locale="en" currentPath={`/en/${slug}`} />;
}
