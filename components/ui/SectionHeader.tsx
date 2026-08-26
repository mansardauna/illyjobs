"use client";

import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  border?: boolean;
}

export function SectionHeader({ title, subtitle, action, border = false }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${border ? "border-b border-slate-200 pb-4" : ""}`}>
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
