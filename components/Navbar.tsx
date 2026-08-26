"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Menu, X, PlusCircle, LogOut } from "lucide-react";
import { Badge } from "@/components/ui";

interface NavLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  mobile?: boolean;
}

function NavLink({ href, onClick, children, mobile = false }: NavLinkProps) {
  const base = "font-semibold text-slate-700 hover:text-slate-900 transition-colors";
  const cls = mobile ? `block text-base ${base} py-1` : `text-base ${base}`;
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-green focus:text-white focus:rounded-sm"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Brand wordmark — no logo box, no SVG */}
          <Link
            href="/"
            className="rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            aria-label="Illy Jobs – Homepage"
          >
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Illy<span className="text-brand-green">Jobs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center space-x-8" aria-label="Main Navigation">
            <NavLink href="/jobs">Find Jobs</NavLink>
            <NavLink href="/employer/resumes">Resumes</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
          </nav>

          {/* Desktop user actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200">
                  <span className="text-xs font-bold text-slate-900 max-w-[140px] truncate">
                    {user.fullName || user.email}
                  </span>
                  {user.planTier === "PRO" && <Badge variant="emerald">PRO</Badge>}
                </div>

                <Link href="/post-job" className="btn-primary py-2 px-4 text-sm">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Post Job
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-sm focus:outline-none"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-base font-semibold text-slate-700 hover:text-slate-900 px-3 py-2">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-700 rounded-sm focus:outline-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3">
          <NavLink href="/jobs" onClick={closeMenu} mobile>Find Jobs</NavLink>
          <NavLink href="/employer/resumes" onClick={closeMenu} mobile>Resumes</NavLink>
          <NavLink href="/pricing" onClick={closeMenu} mobile>Pricing</NavLink>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <button
                type="button"
                onClick={() => { logout(); closeMenu(); }}
                className="text-sm font-bold text-rose-600 py-1"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/login" onClick={closeMenu} className="btn-secondary text-center py-2 text-sm">
                  Sign In
                </Link>
                <Link href="/auth/register" onClick={closeMenu} className="btn-primary text-center py-2 text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
