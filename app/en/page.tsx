import type { Metadata } from "next";
import { HomePage } from "../page";

export const metadata: Metadata = {
  title: { absolute: "MScrape — Google Maps Scraper for Indonesian Business Data" },
  description: "Find and organize Indonesian business data from Google Maps, review available contacts, ratings, review counts, and websites, then export selected results.",
  alternates: {
    canonical: "/en",
    languages: { "id-ID": "/", "en-US": "/en" },
  },
  openGraph: { url: "/en", locale: "en_US" },
};

export default function EnglishHomePage() {
  return <HomePage locale="en" />;
}
