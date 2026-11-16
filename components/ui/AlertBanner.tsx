"use client";

import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface AlertBannerProps {
  variant?: "error" | "warning" | "success";
  children: ReactNode;
  icon?: ReactNode;
}

const variantMap = {
  error: "bg-rose-50 border-rose-200 text-rose-800",
  warning: "bg-amber-50 border-amber-300 text-amber-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

export function AlertBanner({ variant = "error", children, icon }: AlertBannerProps) {
  return (
    <div
      role={variant === "success" ? "status" : "alert"}
      className={`p-3 border rounded-sm text-sm flex items-start gap-2 ${variantMap[variant]}`}
    >
      <span className="shrink-0 mt-0.5" aria-hidden="true">
        {icon ?? <AlertCircle className="w-4 h-4" />}
      </span>
      <div>{children}</div>
    </div>
  );
}
