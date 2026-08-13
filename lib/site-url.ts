function resolveSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!value) return undefined;

  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return undefined;
  }
}

export const siteUrl = resolveSiteUrl();
