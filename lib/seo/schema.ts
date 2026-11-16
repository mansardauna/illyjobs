import type { Job } from "@/lib/db/jobs";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
  REMOTE: "FULL_TIME",
};

/** Google for Jobs structured data for one vacancy. */
export function jobPostingSchema(job: Job) {
  const paragraphs = job.description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  const requirements = job.requirements?.length
    ? `<p>Requirements:</p><ul>${job.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>`
    : "";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: paragraphs + requirements,
    identifier: { "@type": "PropertyValue", name: SITE_NAME, value: job.id },
    datePosted: job.postedAt,
    employmentType: EMPLOYMENT_TYPES[job.employmentType] || "OTHER",
    directApply: true,
    url: absoluteUrl(`/jobs/${job.slug}`),
    industry: job.category,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.companyLogo ? { logo: job.companyLogo } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.address || job.locationArea,
        addressLocality: "Ilorin",
        addressRegion: "Kwara",
        addressCountry: "NG",
      },
    },
  };

  if (job.closesAt) schema.validThrough = job.closesAt;

  if (job.employmentType === "REMOTE") {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = { "@type": "Country", name: "Nigeria" };
  }

  if (job.salaryMin || job.salaryMax) {
    const min = job.salaryMin || job.salaryMax;
    const max = job.salaryMax || job.salaryMin;
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "NGN",
      value:
        min === max
          ? { "@type": "QuantitativeValue", value: min, unitText: "MONTH" }
          : { "@type": "QuantitativeValue", minValue: min, maxValue: max, unitText: "MONTH" },
    };
  }

  return schema;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function jobListSchema(name: string, jobs: Job[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 50).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/jobs/${job.slug}`),
      name: `${job.title} at ${job.company}`,
    })),
  };
}

export const siteSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon"),
    description: "Local job board for Ilorin and Kwara State, Nigeria.",
    areaServed: { "@type": "City", name: "Ilorin" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-NG",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/jobs?query={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
];
