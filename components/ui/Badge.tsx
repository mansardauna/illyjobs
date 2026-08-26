"use client";

import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "emerald" | "amber" | "slate";
  className?: string;
}

export function Badge({ children, variant = "emerald", className = "" }: BadgeProps) {
  const variantStyles = {
    emerald: "bg-brand-light text-brand-900 border-brand-green",
    amber: "bg-amber-50 text-amber-900 border-amber-300",
    slate: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold border rounded-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
