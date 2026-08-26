"use client";

import React, { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-800">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full py-3 bg-slate-50 border border-slate-300 rounded-sm text-base text-slate-900 placeholder-slate-400 transition-colors focus:bg-white focus:outline-none focus:border-brand-green ${
              icon ? "pl-11 pr-4" : "px-4"
            } ${error ? "border-rose-500" : ""} ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-xs font-semibold text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
