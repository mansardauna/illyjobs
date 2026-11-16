"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Menu, X, PlusCircle, LogOut, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui";

interface NavLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  mobile?: boolean;
}

function NavLink({ href, onClick, children, mobile = false }: NavLinkProps) {
  const pathname = usePathname();
  const current = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const base = "font-semibold transition-colors hover:text-slate-900";
  const tone = current ? "text-slate-900 underline underline-offset-8 decoration-2" : "text-slate-700";
  const cls = mobile ? `block text-base ${base} ${tone} py-2` : `text-base ${base} ${tone}`;
  return (
    <Link href={href} onClick={onClick} className={cls} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}

function UnreadPill({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 px-1.5 py-0.5 bg-rose-700 text-white text-xs font-bold rounded-full">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> unread</span>
    </span>
  );
}

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Close the mobile menu after navigating.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push("/");
  };

  const isEmployer = user?.role === "EMPLOYER" || user?.role === "ADMIN";

  const links = (mobile: boolean) => (
    <>
      <NavLink href="/jobs" onClick={closeMenu} mobile={mobile}>Find Jobs</NavLink>
      {user && <NavLink href="/dashboard" onClick={closeMenu} mobile={mobile}>Dashboard</NavLink>}
      {user && (
        <NavLink href="/messages" onClick={closeMenu} mobile={mobile}>
          <span className="inline-flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
            Messages
            <UnreadPill count={unreadCount} />
          </span>
        </NavLink>
      )}
      {(!user || isEmployer) && <NavLink href="/employer/resumes" onClick={closeMenu} mobile={mobile}>Find Candidates</NavLink>}
      {(!user || isEmployer) && <NavLink href="/pricing" onClick={closeMenu} mobile={mobile}>Pricing</NavLink>}
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-green focus:text-white focus:rounded-sm"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="rounded-sm">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Illy<span className="text-brand-green">Jobs</span>
            </span>
            <span className="sr-only"> home</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-7" aria-label="Main">
            {links(false)}
          </nav>

          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200"
                >
                  <span className="text-xs font-bold text-slate-900 max-w-[140px] truncate">
                    {user.fullName || user.email}
                  </span>
                  {user.planTier === "PRO" && <Badge variant="emerald">PRO</Badge>}
                </Link>

                {isEmployer && (
                  <Link href="/post-job" className="btn-primary py-2 px-4 text-sm">
                    <PlusCircle className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Post Job
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-700 hover:text-rose-700 rounded-sm"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
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

          <button
            type="button"
            className="lg:hidden p-2 text-slate-800 rounded-sm"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            {!menuOpen && unreadCount > 0 && <span className="sr-only">{unreadCount} unread messages</span>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1">
          {links(true)}

          <div className="pt-3 mt-2 border-t border-slate-200">
            {user ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">
                  Signed in as <strong className="text-slate-900">{user.fullName || user.email}</strong>
                </p>
                {isEmployer && (
                  <Link href="/post-job" onClick={closeMenu} className="btn-primary w-full text-center py-2.5 text-sm">
                    Post a Job
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="btn-secondary w-full py-2.5 text-sm">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/login" onClick={closeMenu} className="btn-secondary text-center py-2.5 text-sm">
                  Sign In
                </Link>
                <Link href="/auth/register" onClick={closeMenu} className="btn-primary text-center py-2.5 text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
