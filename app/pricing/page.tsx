"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Check, ShieldCheck, Zap, Star, ArrowRight, Sparkles, Building, User } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { user, upgradePlan } = useAuth();
  const [tab, setTab] = useState<"EMPLOYER" | "SEEKER">("EMPLOYER");
  const [upgrading, setUpgrading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpgrade = async (plan: "PRO") => {
    if (!user) {
      alert("Please login or register an account first to upgrade.");
      return;
    }
    setUpgrading(true);
    setSuccessMsg("");
    const ok = await upgradePlan(plan);
    if (ok) {
      setSuccessMsg("Congratulations! Your account has been upgraded to Pro.");
    }
    setUpgrading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-sm border border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>SaaS Growth Plans for Ilorin</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Simple, Transparent Plans Built for Kwara
        </h1>
        <p className="text-base text-slate-600">
          Supercharge your hiring process or get noticed first by top employers across Tanke, GRA, Taiwo, and Challenge.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-sm text-center font-bold text-emerald-900 text-sm">
          {successMsg}
        </div>
      )}

      {/* Role Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-200 p-1.5 rounded-sm inline-flex space-x-2 text-sm font-bold">
          <button
            type="button"
            onClick={() => setTab("EMPLOYER")}
            className={`px-5 py-2.5 rounded-sm flex items-center gap-2 transition-all ${
              tab === "EMPLOYER"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>For Employers</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("SEEKER")}
            className={`px-5 py-2.5 rounded-sm flex items-center gap-2 transition-all ${
              tab === "SEEKER"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>For Job Seekers</span>
          </button>
        </div>
      </div>

      {/* Employer Pricing Cards */}
      {tab === "EMPLOYER" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* Employer Free */}
          <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Employer Basic</h2>
              <div className="text-3xl font-extrabold text-slate-900">
                ₦0 <span className="text-sm font-medium text-slate-500">/ forever</span>
              </div>
              <p className="text-sm text-slate-600">Great for small businesses posting occasional vacancies in Ilorin.</p>

              <ul className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 2 active job listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Receive applications via Dashboard & Email</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Basic applicant inbox</span>
                </li>
              </ul>
            </div>

            <Link href="/post-job" className="btn-secondary w-full text-center">
              Post Free Job
            </Link>
          </div>

          {/* Employer Pro */}
          <div className="bg-white border-2 border-emerald-600 rounded-sm p-8 shadow-md flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-sm shadow-xs uppercase tracking-wider">
              Recommended
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pro Enterprise</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Employer Pro</h2>
              <div className="text-4xl font-extrabold text-slate-900">
                ₦15,000 <span className="text-sm font-medium text-slate-500">/ month</span>
              </div>
              <p className="text-sm text-slate-600">Full recruitment suite for active hiring teams in Kwara State.</p>

              <ul className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
                <li className="flex items-center gap-2 font-semibold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited job vacancy listings</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>"Urgent & Featured" top-of-search pins</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-emerald-800">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Candidate Resume Database Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp Broadcast alerts to Kwara talent pool</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ATS Candidate Kanban Pipeline & CSV Export</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade("PRO")}
              disabled={upgrading || (user?.planTier === "PRO" && user?.role === "EMPLOYER")}
              className="btn-primary w-full"
            >
              {user?.planTier === "PRO" && user?.role === "EMPLOYER"
                ? "Active Pro Plan"
                : upgrading
                ? "Upgrading..."
                : "Upgrade to Employer Pro"}
            </button>
          </div>

        </div>
      )}

      {/* Job Seeker Pricing Cards */}
      {tab === "SEEKER" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* Seeker Free */}
          <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Seeker</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Candidate Free</h2>
              <div className="text-3xl font-extrabold text-slate-900">
                ₦0 <span className="text-sm font-medium text-slate-500">/ forever</span>
              </div>
              <p className="text-sm text-slate-600">Standard access for candidates browsing jobs in Ilorin.</p>

              <ul className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited job browsing & searching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1-Click CV submission & WhatsApp apply</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Saved Resume CV</span>
                </li>
              </ul>
            </div>

            <Link href="/jobs" className="btn-secondary w-full text-center">
              Browse Jobs Free
            </Link>
          </div>

          {/* Seeker Pro */}
          <div className="bg-white border-2 border-emerald-600 rounded-sm p-8 shadow-md flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-sm shadow-xs uppercase tracking-wider">
              Top Pick
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pro Candidate</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Seeker Pro</h2>
              <div className="text-4xl font-extrabold text-slate-900">
                ₦2,500 <span className="text-sm font-medium text-slate-500">/ month</span>
              </div>
              <p className="text-sm text-slate-600">Stand out at the top of employer searches in Ilorin.</p>

              <ul className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
                <li className="flex items-center gap-2 font-semibold text-emerald-800">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span>"Top Applicant" badge on employer dashboards</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant WhatsApp alerts for new Tanke & GRA jobs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Featured profile in Pro Employer Resume Search</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Resume Match Score report</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade("PRO")}
              disabled={upgrading || (user?.planTier === "PRO" && user?.role === "JOB_SEEKER")}
              className="btn-primary w-full"
            >
              {user?.planTier === "PRO" && user?.role === "JOB_SEEKER"
                ? "Active Pro Seeker"
                : upgrading
                ? "Upgrading..."
                : "Upgrade to Seeker Pro"}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
