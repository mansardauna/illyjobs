import Link from "next/link";
import { AREA_PAGES, CATEGORY_PAGES } from "@/lib/seo/landing";

/** Internal links to every area and category page; helps visitors and search engines. */
export default function BrowseLinks() {
  const linkClass =
    "inline-block px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm font-semibold text-slate-800 hover:border-brand-green hover:text-brand-green";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <nav aria-labelledby="browse-areas">
        <h2 id="browse-areas" className="text-xl font-bold text-slate-900 mb-3">
          Jobs by area in Ilorin
        </h2>
        <ul className="flex flex-wrap gap-2">
          {AREA_PAGES.map((area) => (
            <li key={area.slug}>
              <Link href={`/jobs-in/${area.slug}`} className={linkClass}>
                Jobs in {area.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-labelledby="browse-categories">
        <h2 id="browse-categories" className="text-xl font-bold text-slate-900 mb-3">
          Jobs by category
        </h2>
        <ul className="flex flex-wrap gap-2">
          {CATEGORY_PAGES.map((category) => (
            <li key={category.slug}>
              <Link href={`/job-categories/${category.slug}`} className={linkClass}>
                {category.name} jobs
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
