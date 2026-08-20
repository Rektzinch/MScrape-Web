export type Locale = "id" | "en";

export const DEFAULT_LOCALE: Locale = "id";

export function localeHref(locale: Locale, href: string) {
  if (locale === "id" || !href.startsWith("/")) return href;

  if (href === "/") return "/en";
  if (href.startsWith("/#")) return `/en${href.slice(1)}`;
  return `/en${href}`;
}

export function localeAlternateHref(locale: Locale, currentPath: string) {
  if (locale === "id") return localeHref("en", currentPath);
  const idPath = currentPath.replace(/^\/en(?=\/|#|$)/, "");
  return idPath || "/";
}

export function languageTag(locale: Locale) {
  return locale === "en" ? "en-US" : "id-ID";
}
