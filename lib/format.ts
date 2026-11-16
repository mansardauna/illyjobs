/** Client-safe formatting helpers. Fixed locale and time zone so server and browser output match. */

const DATE = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const DATE_TIME = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatSalary(min?: number, max?: number): string {
  if (min && max && max !== min) return `${naira(min)} – ${naira(max)} per month`;
  if (min || max) return `${naira((min || max) as number)} per month`;
  return "Salary negotiable";
}

export function formatSalaryShort(min?: number, max?: number): string {
  const k = (n: number) => `₦${Math.round(n / 1000)}k`;
  if (min && max && max !== min) return `${k(min)} – ${k(max)}/mo`;
  if (min || max) return `${k((min || max) as number)}/mo`;
  return "Negotiable";
}
