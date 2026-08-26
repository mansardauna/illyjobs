"use client";

import React, { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  options?: { value: string; label: string }[] | string[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, icon, error, options, children, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-bold text-slate-800">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            className={`w-full py-3 bg-slate-50 border border-slate-300 rounded-sm text-base text-slate-900 cursor-pointer appearance-none focus:bg-white focus:outline-none focus:border-brand-green ${
              icon ? "pl-11 pr-8" : "px-4"
            } ${error ? "border-rose-500" : ""} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => {
                  const val = typeof opt === "string" ? opt : opt.value;
                  const lbl = typeof opt === "string" ? opt : opt.label;
                  return (
                    <option key={val} value={val}>
                      {lbl}
                    </option>
                  );
                })
              : children}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
