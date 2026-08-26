"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { CheckCircle2, AlertCircle, ArrowRight, Lock, Sparkles } from "lucide-react";
import { Job } from "@/lib/db/jobs";

export default function PostJobPage() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.companyName || "");
  const [locationArea, setLocationArea] = useState("Tanke / Unilorin Axis");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Education / Teaching");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [preferredChannel, setPreferredChannel] = useState("WHATSAPP");
  const [whatsappPhone, setWhatsappPhone] = useState(user?.phone || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [isFeatured, setIsFeatured] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successJobSlug, setSuccessJobSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [userJobsCount, setUserJobsCount] = useState(0);

  const isProEmployer = user?.role === "EMPLOYER" && user?.planTier === "PRO";
  const isFreeEmployer = user?.role === "EMPLOYER" && user?.planTier === "FREE";

  useEffect(() => {
    async function checkEmployerJobs() {
      if (user?.companyName) {
        try {
          const res = await fetch("/api/jobs");
          const data = await res.json();
          if (data.success && Array.isArray(data.jobs)) {
            const count = data.jobs.filter(
              (j: Job) => j.company.toLowerCase() === user.companyName?.toLowerCase()
            ).length;
            setUserJobsCount(count);
          }
        } catch (e) {
          console.error("Failed to check employer jobs:", e);
        }
      }
    }
    checkEmployerJobs();
  }, [user]);

  const isLimitReached = isFreeEmployer && userJobsCount >= 2;

  const locations = [
    "Tanke / Unilorin Axis",
    "GRA",
    "Taiwo / Post Office",
    "Challenge / Unity",
    "Fate / Airport Road",
    "Asa Dam / Sawmill",
    "Sango / Kulende",
    "Ganmo / Kilanko",
    "Oke-Oyi",
    "Kwara Poly / Elekoyangan",
    "Offa Garage",
  ];

  const categories = [
    "Education / Teaching",
    "Technology & Software",
    "Retail & Sales",
    "Healthcare & Nursing",
    "Artisans & Technical Trades",
    "Customer Service",
    "Banking & Accounting",
    "Hospitality & Catering",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setErrorMsg("Free Tier limit reached (2 jobs). Please upgrade to Employer Pro for unlimited job postings.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          locationArea,
          address,
          category,
          employmentType,
          salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
          salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
          description,
          requirements: requirements.split("\n").filter((r) => r.trim() !== ""),
          preferredChannel,
          whatsappPhone: whatsappPhone ? `234${whatsappPhone.replace(/^0/, "")}` : undefined,
          contactEmail,
          isFeatured: isProEmployer && isFeatured,
        }),
      });

      const data = await res.json();
      if (data.success && data.job) {
        setSuccessJobSlug(data.job.slug);
      } else {
        setErrorMsg(data.error || "Failed to publish job posting.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-1 text-white text-xs font-bold rounded-sm uppercase tracking-wider bg-brand-green inline-block mb-2">
          Employer Portal
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Post a Job Vacancy in Ilorin
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Reach qualified candidates across Tanke, GRA, Taiwo, Challenge, and Fate.
        </p>
      </div>

      {/* Free Tier Limit Warning Banner */}
      {isLimitReached && (
        <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <Lock className="w-5 h-5 text-amber-600" />
            <span>Free Tier Job Posting Limit Reached (2/2 Active Jobs)</span>
          </div>
          <p className="text-sm text-amber-800">
            Free Employer accounts can maintain up to 2 active listings. Upgrade to <strong>Employer Pro (₦15,000/mo)</strong> for unlimited job postings, top-of-search pins, and direct resume database access.
          </p>
          <Link href="/pricing" className="btn-primary py-2.5 px-4 text-sm inline-block">
            Upgrade to Employer Pro Now →
          </Link>
        </div>
      )}

      {successJobSlug ? (
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">Job Successfully Published!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your vacancy for <strong className="text-slate-900">{title}</strong> is live on Illy Jobs.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/jobs/${successJobSlug}`}
              className="btn-primary text-sm py-2.5"
            >
              View Published Vacancy →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-sm text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Role Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
              1. Job Role Details
            </h2>

            <div>
              <label htmlFor="job-title" className="block text-sm font-bold text-slate-800 mb-1">
                Job Title *
              </label>
              <input
                id="job-title"
                type="text"
                required
                disabled={isLimitReached}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Secondary Mathematics Teacher, Store Manager"
                className="input-standard"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-bold text-slate-800 mb-1">
                  Company Name *
                </label>
                <input
                  id="company-name"
                  type="text"
                  required
                  disabled={isLimitReached}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Standard Academy Tanke"
                  className="input-standard"
                />
              </div>

              <div>
                <label htmlFor="job-category" className="block text-sm font-bold text-slate-800 mb-1">
                  Category *
                </label>
                <select
                  id="job-category"
                  disabled={isLimitReached}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-standard cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Salary */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
              2. Location & Salary in Ilorin
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location-area" className="block text-sm font-bold text-slate-800 mb-1">
                  Ilorin Area *
                </label>
                <select
                  id="location-area"
                  disabled={isLimitReached}
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="input-standard cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="employment-type" className="block text-sm font-bold text-slate-800 mb-1">
                  Type *
                </label>
                <select
                  id="employment-type"
                  disabled={isLimitReached}
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="input-standard cursor-pointer"
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary-min" className="block text-sm font-bold text-slate-800 mb-1">
                  Min Salary (₦/mo)
                </label>
                <input
                  id="salary-min"
                  type="number"
                  disabled={isLimitReached}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="100000"
                  className="input-standard"
                />
              </div>

              <div>
                <label htmlFor="salary-max" className="block text-sm font-bold text-slate-800 mb-1">
                  Max Salary (₦/mo)
                </label>
                <input
                  id="salary-max"
                  type="number"
                  disabled={isLimitReached}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="150000"
                  className="input-standard"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Description & Requirements */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
              3. Description & Requirements
            </h2>

            <div>
              <label htmlFor="job-description" className="block text-sm font-bold text-slate-800 mb-1">
                Full Description *
              </label>
              <textarea
                id="job-description"
                required
                disabled={isLimitReached}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State daily duties, responsibilities, working hours..."
                className="input-standard"
              />
            </div>
          </div>

          {/* Pro Feature: Feature / Pin on Top */}
          {isProEmployer && (
            <div className="p-4 bg-brand-light border border-brand-green rounded-sm flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Feature & Pin this Job Listing
                </span>
                <p className="text-xs text-slate-600">Pro Employers get top-of-search placement.</p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting || isLimitReached}
              className="btn-primary w-full text-base py-3"
            >
              {submitting ? "Publishing..." : "Publish Job Opening"}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
