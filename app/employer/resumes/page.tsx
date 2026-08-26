"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Search, MapPin, FileText, Download, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { UserAccount } from "@/lib/db/users";

export default function ResumeSearchPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("ALL");

  const isProEmployer = user?.role === "EMPLOYER" && user?.planTier === "PRO";

  const locations = [
    "Tanke / Unilorin Axis",
    "GRA",
    "Taiwo / Post Office",
    "Challenge / Unity",
    "Fate / Airport Road",
    "Asa Dam / Sawmill",
    "Sango / Kulende",
    "Kwara Poly / Elekoyangan",
  ];

  const locationOptions = ["ALL", ...locations].map((loc) => ({
    value: loc,
    label: loc === "ALL" ? "All Ilorin Areas" : loc,
  }));

  useEffect(() => {
    async function fetchResumes() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (location !== "ALL") params.set("location", location);

        const res = await fetch(`/api/resumes?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setCandidates(data.resumes);
        }
      } catch (err) {
        console.error("Failed to load candidates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, [query, location]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span
            className="px-2.5 py-1 text-white text-xs font-bold rounded-sm uppercase tracking-wider inline-block mb-2"
            style={{ backgroundColor: "#6FBE44" }}
          >
            Employer Pro Database
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Ilorin Candidate Resume Search
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search pre-screened resumes of local graduates, teachers, developers, and artisans across Kwara State.
          </p>
        </div>

        {!isProEmployer && (
          <Link href="/pricing" className="btn-primary shrink-0 text-sm py-2.5">
            Upgrade to Pro for Full Access
          </Link>
        )}
      </div>

      {/* Pro Gating Banner */}
      {!isProEmployer && (
        <div className="bg-amber-50 border border-amber-300 rounded-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-sm flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Employer Pro Preview</h2>
              <p className="text-xs text-slate-700 mt-0.5">
                Resume contact information and file downloads are exclusively unlocked for <strong>Employer Pro</strong> members.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="btn-primary text-xs shrink-0 py-2">
            Unlock Database (₦15,000/mo)
          </Link>
        </div>
      )}

      {/* Filter Component */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-7">
          <Input
            icon={<Search className="w-5 h-5 text-slate-400" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidate skills (e.g. Next.js, Mathematics, Nursing, Sales)..."
          />
        </div>

        <div className="md:col-span-5">
          <Select
            icon={<MapPin className="w-5 h-5 text-slate-400" />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            options={locationOptions}
          />
        </div>
      </div>

      {/* Candidates List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-200 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-sm p-12 text-center text-sm text-slate-500">
          No candidate resumes matched your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => (
            <div key={cand.id} className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight font-heading">
                      {isProEmployer ? cand.fullName : `${cand.fullName?.split(" ")[0]} (Verified Candidate)`}
                    </h3>
                    <span className="text-xs font-semibold text-brand-green">{cand.locationArea}</span>
                  </div>
                  {cand.planTier === "PRO" && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold rounded-sm">
                      Top Applicant
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-2">{cand.headline || "Job Seeker in Ilorin"}</p>

                {cand.skills && cand.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cand.skills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-sm font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {cand.resumeFileName || "Resume CV"}
                </span>

                {isProEmployer ? (
                  <a
                    href={cand.resumeUrl || "#"}
                    target="_blank"
                    download
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download CV
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pro Only
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
