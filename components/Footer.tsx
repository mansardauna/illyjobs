import Link from "next/link";
import { AREA_PAGES, CATEGORY_PAGES } from "@/lib/seo/landing";

interface FooterLinksProps {
  heading: string;
  links: { label: string; href: string }[];
}

function FooterLinkGroup({ heading, links }: FooterLinksProps) {
  return (
    <nav aria-label={`Footer: ${heading}`}>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">{heading}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className="text-slate-300 hover:text-white hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/">
              <span className="text-xl font-extrabold font-heading text-white tracking-tight">
                Illy<span className="text-brand-on-dark">Jobs</span>
              </span>
              <span className="sr-only"> home</span>
            </Link>
            <p className="text-sm leading-relaxed">
              The local job board for Ilorin and Kwara State. Free for job seekers.
            </p>
            <p className="text-sm leading-relaxed">
              Never pay to apply for a job. Report any employer who asks for money.
            </p>
          </div>

          <FooterLinkGroup
            heading="Jobs by area"
            links={AREA_PAGES.slice(0, 8).map((a) => ({ label: `Jobs in ${a.name}`, href: `/jobs-in/${a.slug}` }))}
          />

          <FooterLinkGroup
            heading="Jobs by category"
            links={CATEGORY_PAGES.map((c) => ({ label: `${c.name} jobs`, href: `/job-categories/${c.slug}` }))}
          />

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">For employers</h3>
            <p className="text-sm">Post vacancies free and reach job seekers across Ilorin.</p>
            <Link href="/post-job" className="btn-primary py-2 px-4 text-sm">
              Post a free vacancy
            </Link>
            <p className="text-sm">
              <Link href="/pricing" className="text-slate-300 hover:text-white underline">Pricing</Link>
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-sm text-slate-300">
          <p>© {new Date().getFullYear()} Illy Jobs. Built for Ilorin and Kwara State.</p>
        </div>
      </div>
    </footer>
  );
}
