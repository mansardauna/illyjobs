/** Public site address, used for canonical URLs, the sitemap and structured data. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://illyjobs.ng").replace(/\/$/, "");
export const SITE_NAME = "Illy Jobs";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
