"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select, Button } from "@/components/ui";

const EMPLOYMENT_TYPES = [
  { value: "ALL", label: "All Types" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REMOTE", label: "Remote" },
];

interface JobSearchFilterProps {
  locations: string[];
  categories: string[];
}

export default function JobSearchFilter({ locations, categories }: JobSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "ALL");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [type, setType] = useState(searchParams.get("type") || "ALL");

  const hasFilters = query || location !== "ALL" || category !== "ALL" || type !== "ALL";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (location !== "ALL") params.set("location", location);
    if (category !== "ALL") params.set("category", category);
    if (type !== "ALL") params.set("type", type);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleReset = () => {
    setQuery("");
    setLocation("ALL");
    setCategory("ALL");
    setType("ALL");
    router.push("/jobs");
  };

  const locationOptions = [{ value: "ALL", label: "All Ilorin Areas" }, ...locations.map((l) => ({ value: l, label: l }))];
  const categoryOptions = [{ value: "ALL", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white border border-slate-200 rounded-sm p-4 sm:p-5 shadow-sm space-y-4"
      aria-label="Job search and filters"
    >
      {/* Main search row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5">
          <Input
            id="search-query"
            icon={<Search className="w-5 h-5" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search job title, skill, or company…"
          />
        </div>
        <div className="md:col-span-3">
          <Select id="location-select" value={location} onChange={(e) => setLocation(e.target.value)} options={locationOptions} />
        </div>
        <div className="md:col-span-2">
          <Select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full py-3 text-base">Search</Button>
        </div>
      </div>

      {/* Work type quick filters */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
          <span className="text-slate-500 font-bold shrink-0 text-xs uppercase tracking-wider">Type:</span>
          {EMPLOYMENT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`px-3 py-1 rounded-sm border transition-colors text-xs font-semibold whitespace-nowrap ${
                type === value
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
            className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-bold text-xs shrink-0"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </form>
  );
}
