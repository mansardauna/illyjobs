/** Reads ?next= from the current URL, accepting only same-site paths. */
export function getNextPath(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) return next;
  return fallback;
}
