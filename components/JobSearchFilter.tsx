"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select, Button } from "@/components/ui";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";

const EMPLOYMENT_TYPES = [
  { value: "ALL", label: "All types" },
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REMOTE", label: "Remote" },
];

interface JobSearchFilterProps {
  /** Preselected filters, e.g. on an area or category landing page. */
  defaultLocation?: string;
  defaultCategory?: string;
}

export default function JobSearchFilter({ defaultLocation, defaultCategory }: JobSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [location, setLocation] = useState(searchParams.get("location") || defaultLocation || "ALL");
  const [category, setCategory] = useState(searchParams.get("category") || defaultCategory || "ALL");
  const [type, setType] = useState(searchParams.get("type") || "ALL");

  const hasFilters = query || location !== "ALL" || category !== "ALL" || type !== "ALL";

  const search = (nextType: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (location !== "ALL") params.set("location", location);
    if (category !== "ALL") params.set("category", category);
    if (nextType !== "ALL") params.set("type", nextType);
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  };

  const handleReset = () => {
    setQuery("");
    setLocation("ALL");
    setCategory("ALL");
    setType("ALL");
    router.push("/jobs");
  };

  const locationOptions = [{ value: "ALL", label: "All Ilorin areas" }, ...LOCATIONS.map((l) => ({ value: l, label: l }))];
  const categoryOptions = [{ value: "ALL", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))];

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        search(type);
      }}
      className="bg-white border border-slate-200 rounded-sm p-4 sm:p-5 shadow-sm space-y-4"
      aria-label="Search jobs in Ilorin"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5">
          <Input
            type="search"
            aria-label="Job title, skill or company"
            icon={<Search className="w-5 h-5" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill or company"
          />
        </div>
        <div className="md:col-span-3">
          <Select aria-label="Area" value={location} onChange={(e) => setLocation(e.target.value)} options={locationOptions} />
        </div>
        <div className="md:col-span-2">
          <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full py-3 text-base">Search</Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
        <div role="group" aria-label="Job type" className="flex items-center gap-2 overflow-x-auto p-1 flex-1">
          {EMPLOYMENT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={type === value}
              onClick={() => {
                setType(value);
                search(value);
              }}
              className={`px-3 py-1.5 rounded-sm border transition-colors text-sm font-semibold whitespace-nowrap ${
                type === value
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-slate-700 hover:text-rose-700 font-bold text-sm shrink-0 p-1"
          >
            <X className="w-4 h-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
