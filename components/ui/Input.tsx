"use client";

import React, { InputHTMLAttributes, ReactNode, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, hint, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-800">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-500 pointer-events-none z-10" aria-hidden="true">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full py-3 bg-slate-50 border border-slate-400 rounded-sm text-base text-slate-900 placeholder-slate-500 transition-colors focus:bg-white focus:border-brand-green ${
              icon ? "pl-11 pr-4" : "px-4"
            } ${error ? "border-rose-600" : ""} ${className}`}
            {...props}
          />
        </div>

        {hint && !error && <p id={hintId} className="text-xs text-slate-600">{hint}</p>}
        {error && <p id={errorId} className="text-xs font-semibold text-rose-700 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
