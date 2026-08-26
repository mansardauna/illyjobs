"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  icon?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", icon, className = "", ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center font-semibold rounded-sm shadow-sm transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-brand-green hover:bg-brand-600 text-white border border-transparent",
      secondary: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300",
      outline: "bg-transparent hover:bg-emerald-50 text-emerald-800 border border-emerald-300",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {icon && <span className="mr-2 flex items-center shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
