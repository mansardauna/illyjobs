import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobBySlug, getJobs } from "@/lib/db/jobs";
import { MapPin, Briefcase, Banknote, ShieldCheck, MessageCircle, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import ApplyModalWrapper from "./ApplyModalWrapper";

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate Dynamic SEO Metadata for Google Crawlers
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    return { title: "Job Vacancy Not Found | Illy Jobs" };
  }

  return {
    title: `${job.title} at ${job.company} (${job.locationArea}, Ilorin)`,
    description: `Vacancy for ${job.title} in ${job.locationArea}, Ilorin, Kwara State. Apply directly via Illy Jobs or WhatsApp.`,
    openGraph: {
      title: `${job.title} - ${job.company} (${job.locationArea}, Ilorin)`,
      description: job.description.slice(0, 160),
      url: `https://illyjobs.ng/jobs/${job.slug}`,
      siteName: "Illy Jobs",
      type: "article",
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    notFound();
  }

  const allJobs = await getJobs({ locationArea: job.locationArea });
  const similarJobs = allJobs.filter((j) => j.id !== job.id).slice(0, 3);

  // Format salary
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `₦${job.salaryMin.toLocaleString()} - ₦${job.salaryMax.toLocaleString()} per month`;
    }
    if (job.salaryMin) {
      return `From ₦${job.salaryMin.toLocaleString()} per month`;
    }
    return "Salary Negotiable";
  };

  // Google JobPosting JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Illy Jobs",
      "value": job.id,
    },
    "datePosted": job.postedAt,
    "validThrough": "2026-10-30",
    "employmentType": job.employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "logo": job.companyLogo || "https://illyjobs.ng/logo.png",
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": job.address || job.locationArea,
        "addressLocality": "Ilorin",
        "addressRegion": "Kwara State",
        "addressCountry": "NG",
      },
    },
    "baseSalary": job.salaryMin
      ? {
          "@type": "MonetaryAmount",
          "currency": "NGN",
          "value": {
            "@type": "QuantitativeValue",
            "value": job.salaryMin,
            "unitText": "MONTH",
          },
        }
      : undefined,
  };

  const whatsappMessage = encodeURIComponent(
    `Hello, I saw your job vacancy for "${job.title}" on Illy Jobs and would like to submit my application.`
  );
  const whatsappUrl = job.whatsappPhone
    ? `https://wa.me/${job.whatsappPhone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`
    : null;

  return (
    <>
      {/* Inject Google JobPosting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs in Ilorin</span>
        </Link>

        {/* Main Job Card Header */}
        <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-start gap-4">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="w-16 h-16 rounded-sm object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-sm bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-2xl shrink-0">
                  {job.company.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-sm border border-emerald-200">
                    {job.locationArea}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-sm">
                    {job.employmentType.replace("_", " ")}
                  </span>
                  {job.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Employer
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {job.title}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-1">{job.company}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">Location</span>
                <strong className="text-slate-800">{job.address || job.locationArea}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">Monthly Salary</span>
                <strong className="text-slate-800">{formatSalary()}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">Job Category</span>
                <strong className="text-slate-800">{job.category}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Apply Actions Container */}
          <ApplyModalWrapper job={job} whatsappUrl={whatsappUrl} />

          {/* Job Description */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements List */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Requirements & Qualifications</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification & Trust Disclaimer */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safety Guarantee on Illy Jobs
            </p>
            <p className="text-slate-600">
              Never pay any fee for job applications, medical tests, or training in Ilorin. Illy Jobs strictly verifies employers to prevent recruitment fraud.
            </p>
          </div>
        </div>

        {/* Similar Jobs in this Area */}
        {similarJobs.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-900">
              More Vacancies in {job.locationArea}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarJobs.map((simJob) => (
                <div key={simJob.id} className="bg-white border border-slate-200 rounded-sm p-4 text-xs space-y-2 shadow-sm">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {simJob.locationArea}
                  </span>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{simJob.title}</h3>
                  <p className="text-slate-500">{simJob.company}</p>
                  <Link
                    href={`/jobs/${simJob.slug}`}
                    className="inline-block pt-1 font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    View Role →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
