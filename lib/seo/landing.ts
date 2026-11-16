/**
 * Search landing pages: one per Ilorin area and one per job category.
 * `location` / `category` must match the values in lib/constants.ts exactly.
 * The intro copy is shown on the page; edit it freely to add local detail.
 */

export interface AreaPage {
  slug: string;
  location: string;
  name: string;
  intro: string;
}

export interface CategoryPage {
  slug: string;
  category: string;
  name: string;
  intro: string;
}

export const AREA_PAGES: AreaPage[] = [
  {
    slug: "tanke",
    location: "Tanke / Unilorin Axis",
    name: "Tanke",
    intro:
      "Vacancies around Tanke and the University of Ilorin axis, including roles that suit students, corps members and recent graduates.",
  },
  {
    slug: "gra",
    location: "GRA",
    name: "GRA",
    intro: "Vacancies in and around GRA Ilorin, from offices and clinics to shops, hotels and restaurants.",
  },
  {
    slug: "taiwo",
    location: "Taiwo / Post Office",
    name: "Taiwo and Post Office",
    intro: "Vacancies around Taiwo Road and Post Office, one of the busiest commercial parts of Ilorin.",
  },
  {
    slug: "challenge",
    location: "Challenge / Unity",
    name: "Challenge and Unity Road",
    intro: "Vacancies around Challenge and Unity Road, with openings in retail, banking, sales and services.",
  },
  {
    slug: "fate",
    location: "Fate / Airport Road",
    name: "Fate and Airport Road",
    intro: "Vacancies along Fate Road and Airport Road in Ilorin.",
  },
  {
    slug: "asa-dam",
    location: "Asa Dam / Sawmill",
    name: "Asa Dam and Sawmill",
    intro: "Vacancies around Asa Dam Road and Sawmill, including factory, warehouse and technical roles.",
  },
  {
    slug: "sango",
    location: "Sango / Kulende",
    name: "Sango and Kulende",
    intro: "Vacancies around Sango and Kulende in Ilorin.",
  },
  {
    slug: "ganmo",
    location: "Ganmo / Kilanko",
    name: "Ganmo and Kilanko",
    intro: "Vacancies around Ganmo and Kilanko on the outskirts of Ilorin.",
  },
  {
    slug: "oke-oyi",
    location: "Oke-Oyi",
    name: "Oke-Oyi",
    intro: "Vacancies in and around Oke-Oyi.",
  },
  {
    slug: "kwara-poly",
    location: "Kwara Poly / Elekoyangan",
    name: "Kwara Poly and Elekoyangan",
    intro: "Vacancies around Kwara State Polytechnic and Elekoyangan, including part-time roles for students.",
  },
  {
    slug: "offa-garage",
    location: "Offa Garage",
    name: "Offa Garage",
    intro: "Vacancies around Offa Garage in Ilorin.",
  },
];

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    slug: "teaching",
    category: "Education / Teaching",
    name: "Teaching and Education",
    intro: "Teaching, tutoring and school administration vacancies at schools and learning centres in Ilorin.",
  },
  {
    slug: "technology",
    category: "Technology & Software",
    name: "Technology and Software",
    intro: "Software, IT support, design and digital vacancies with Ilorin companies and tech hubs.",
  },
  {
    slug: "retail-sales",
    category: "Retail & Sales",
    name: "Retail and Sales",
    intro: "Sales, cashier, attendant and marketing vacancies at shops, supermarkets and distributors in Ilorin.",
  },
  {
    slug: "healthcare",
    category: "Healthcare & Nursing",
    name: "Healthcare and Nursing",
    intro: "Nursing, pharmacy, laboratory and care vacancies at hospitals, clinics and pharmacies in Ilorin.",
  },
  {
    slug: "artisans",
    category: "Artisans & Technical Trades",
    name: "Artisan and Technical",
    intro: "Vacancies for electricians, mechanics, tailors, drivers and other skilled trades in Ilorin.",
  },
  {
    slug: "customer-service",
    category: "Customer Service",
    name: "Customer Service",
    intro: "Front desk, call centre and customer support vacancies in Ilorin.",
  },
  {
    slug: "banking-accounting",
    category: "Banking & Accounting",
    name: "Banking and Accounting",
    intro: "Accounting, bookkeeping, microfinance and banking vacancies in Ilorin.",
  },
  {
    slug: "hospitality",
    category: "Hospitality & Catering",
    name: "Hospitality and Catering",
    intro: "Hotel, restaurant, kitchen and events vacancies in Ilorin.",
  },
];

export function areaBySlug(slug: string) {
  return AREA_PAGES.find((a) => a.slug === slug);
}

export function areaByLocation(location: string) {
  return AREA_PAGES.find((a) => a.location === location);
}

export function categoryBySlug(slug: string) {
  return CATEGORY_PAGES.find((c) => c.slug === slug);
}

export function categoryByName(category: string) {
  return CATEGORY_PAGES.find((c) => c.category === category);
}
