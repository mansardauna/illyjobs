import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, Banknote, ShieldCheck, CheckCircle2, CalendarDays } from "lucide-react";
import ApplyModalWrapper from "./ApplyModalWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { getJobBySlug, getJobs, isJobActive } from "@/lib/db/jobs";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/format";
import { areaByLocation, categoryByName } from "@/lib/seo/landing";
import { breadcrumbSchema, jobPostingSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  if (!job) return { title: "Job not found", robots: { index: false, follow: true } };

  const title = `${job.title} at ${job.company}, ${job.locationArea}, Ilorin`;
  const salary = job.salaryMin || job.salaryMax ? ` ${formatSalary(job.salaryMin, job.salaryMax)}.` : "";
  const description = `${job.company} is hiring a ${job.title} in ${job.locationArea}, Ilorin.${salary} ${job.description}`
    .replace(/\s+/g, " ")
    .slice(0, 158);

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    // Closed or expired vacancies should drop out of search results.
    robots: isJobActive(job) ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/jobs/${job.slug}`,
      type: "article",
      publishedTime: job.postedAt,
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJobBySlug(params.slug);
  if (!job) notFound();

  const active = isJobActive(job);
  const area = areaByLocation(job.locationArea);
  const category = categoryByName(job.category);

  const similarJobs = (await getJobs({ locationArea: job.locationArea }))
    .filter((j) => j.id !== job.id)
    .slice(0, 3);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Jobs in Ilorin", path: "/jobs" },
    ...(area ? [{ name: area.name, path: `/jobs-in/${area.slug}` }] : []),
    { name: job.title, path: `/jobs/${job.slug}` },
  ];

  const whatsappMessage = encodeURIComponent(
    `Hello, I saw your job vacancy for "${job.title}" on Illy Jobs and would like to apply.`
  );
  const whatsappUrl = job.whatsappPhone
    ? `https://wa.me/${job.whatsappPhone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`
    : null;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${job.title} at ${job.company}, ${job.locationArea}, Ilorin. Apply here: ${absoluteUrl(`/jobs/${job.slug}`)}`
  )}`;

  return (
    <>
      <JsonLd data={active ? [jobPostingSchema(job), breadcrumbSchema(breadcrumbs)] : breadcrumbSchema(breadcrumbs)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  {last ? (
                    <span aria-current="page" className="font-semibold text-slate-900">{crumb.name}</span>
                  ) : (
                    <>
                      <Link href={crumb.path} className="underline hover:text-slate-900">{crumb.name}</Link>
                      <span aria-hidden="true">/</span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <article className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
          <header className="flex items-start gap-4 border-b border-slate-200 pb-6">
            {job.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.companyLogo}
                alt=""
                width={64}
                height={64}
                className="w-16 h-16 rounded-sm object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-sm bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-2xl shrink-0"
                aria-hidden="true"
              >
                {job.company.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{job.title}</h1>
              <p className="text-base font-semibold text-slate-800 mt-1">{job.company}</p>

              <ul className="flex items-center gap-2 flex-wrap mt-3">
                <li className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-900 rounded-sm border border-emerald-300">
                  {job.locationArea}
                </li>
                <li className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded-sm border border-slate-200">
                  {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
                </li>
                {job.isVerified && (
                  <li className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-900 rounded-sm">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Verified employer
                  </li>
                )}
              </ul>
            </div>
          </header>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-sm text-sm">
            <div>
                <dt className="text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                  Location
                </dt>
                <dd className="font-bold text-slate-900">{job.address || job.locationArea}</dd>
            </div>
            <div>
                <dt className="text-slate-700 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                  Salary
                </dt>
                <dd className="font-bold text-slate-900">{formatSalary(job.salaryMin, job.salaryMax)}</dd>
            </div>
            <div>
                <dt className="text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                  Category
                </dt>
                <dd className="font-bold text-slate-900">
                  {category ? (
                    <Link href={`/job-categories/${category.slug}`} className="underline">{job.category}</Link>
                  ) : (
                    job.category
                  )}
                </dd>
            </div>
            <div>
                <dt className="text-slate-700 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                  Posted
                </dt>
                <dd className="font-bold text-slate-900">
                  <time dateTime={job.postedAt}>{formatDate(job.postedAt)}</time>
                  {active && job.closesAt && (
                    <span className="font-normal text-slate-700">
                      {" "}• closes <time dateTime={job.closesAt}>{formatDate(job.closesAt)}</time>
                    </span>
                  )}
                </dd>
            </div>
          </dl>

          {active ? (
            <ApplyModalWrapper job={job} whatsappUrl={whatsappUrl} shareUrl={shareUrl} />
          ) : (
            <p role="status" className="p-4 bg-amber-50 border border-amber-300 rounded-sm text-amber-900 font-semibold">
              This vacancy is closed and no longer accepting applications.{" "}
              <Link href={area ? `/jobs-in/${area.slug}` : "/jobs"} className="underline">
                See open jobs{area ? ` in ${area.name}` : ""}
              </Link>
              .
            </p>
          )}

          <section className="space-y-3 pt-4 border-t border-slate-200" aria-labelledby="job-description">
            <h2 id="job-description" className="text-xl font-bold text-slate-900">Job description</h2>
            <div className="text-base text-slate-800 leading-relaxed whitespace-pre-line">{job.description}</div>
          </section>

          {job.requirements && job.requirements.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-slate-200" aria-labelledby="job-requirements">
              <h2 id="job-requirements" className="text-xl font-bold text-slate-900">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-base text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-1" aria-hidden="true" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <aside className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-sm space-y-1" aria-label="Safety advice">
            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Stay safe
            </p>
            <p className="text-slate-800">
              Never pay a fee for a job application, interview, medical test or training. If an employer asks
              you for money, do not pay and report the listing to Illy Jobs.
            </p>
          </aside>
        </article>

        {similarJobs.length > 0 && (
          <section className="space-y-4 pt-4" aria-labelledby="similar-jobs">
            <h2 id="similar-jobs" className="text-xl font-bold text-slate-900">More jobs in {job.locationArea}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarJobs.map((simJob) => (
                <li key={simJob.id} className="bg-white border border-slate-200 rounded-sm p-4 space-y-1 shadow-sm">
                  <h3 className="font-bold text-slate-900">
                    <Link href={`/jobs/${simJob.slug}`} className="hover:underline">{simJob.title}</Link>
                  </h3>
                  <p className="text-sm text-slate-700">{simJob.company}</p>
                  <p className="text-sm font-semibold text-slate-900">{formatSalary(simJob.salaryMin, simJob.salaryMax)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
