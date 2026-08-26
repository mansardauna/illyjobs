"use client";

import Link from "next/link";

interface FooterLinksProps {
  heading: string;
  links: { label: string; href: string }[];
}

function FooterLinkGroup({ heading, links }: FooterLinksProps) {
  return (
    <div>
      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">{heading}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className="text-slate-400 hover:text-emerald-400 transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const LOCATION_LINKS = [
  { label: "Tanke / Unilorin Axis", href: "/jobs?location=Tanke" },
  { label: "GRA Ilorin", href: "/jobs?location=GRA" },
  { label: "Taiwo & Post Office", href: "/jobs?location=Taiwo" },
  { label: "Challenge & Unity Road", href: "/jobs?location=Challenge" },
  { label: "Fate / Airport Road", href: "/jobs?location=Fate" },
];

const CATEGORY_LINKS = [
  { label: "Teaching & Education", href: "/jobs?category=Education" },
  { label: "Software & Tech", href: "/jobs?category=Technology" },
  { label: "Retail & Sales", href: "/jobs?category=Retail" },
  { label: "Healthcare & Nursing", href: "/jobs?category=Healthcare" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" aria-label="Illy Jobs Homepage">
              <span className="text-xl font-extrabold font-heading text-white tracking-tight">
                Illy<span className="text-brand-green">Jobs</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Hyper-local job marketplace for Ilorin City &amp; Kwara State. Connecting employers and job seekers across Tanke, GRA, Taiwo, Challenge, and Fate.
            </p>
          </div>

          {/* Locations */}
          <FooterLinkGroup heading="Ilorin Locations" links={LOCATION_LINKS} />

          {/* Categories */}
          <FooterLinkGroup heading="Categories" links={CATEGORY_LINKS} />

          {/* Employers CTA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">For Employers</h3>
            <p className="text-sm">Post vacancies free and reach qualified applicants across Kwara State.</p>
            <Link
              href="/post-job"
              className="inline-block px-4 py-2 bg-brand-green hover:bg-brand-600 text-white font-semibold text-xs rounded-sm shadow-sm transition-colors"
            >
              Post a Free Vacancy
            </Link>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <p>© {new Date().getFullYear()} Illy Jobs. Built for Ilorin City &amp; Kwara State.</p>
          <div className="flex gap-4">
            <span>WCAG 2.1 AA</span>
            <span>•</span>
            <span>Programmatic SEO</span>
            <span>•</span>
            <span>PWA Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
