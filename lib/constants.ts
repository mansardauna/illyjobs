export const LOCATIONS = [
  "Tanke / Unilorin Axis",
  "GRA",
  "Taiwo / Post Office",
  "Challenge / Unity",
  "Fate / Airport Road",
  "Asa Dam / Sawmill",
  "Sango / Kulende",
  "Ganmo / Kilanko",
  "Oke-Oyi",
  "Kwara Poly / Elekoyangan",
  "Offa Garage",
];

export const CATEGORIES = [
  "Education / Teaching",
  "Technology & Software",
  "Retail & Sales",
  "Healthcare & Nursing",
  "Artisans & Technical Trades",
  "Customer Service",
  "Banking & Accounting",
  "Hospitality & Catering",
];

export const FREE_EMPLOYER_JOB_LIMIT = 2;

export const APPLICATION_STATUSES = [
  "SUBMITTED",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  REVIEWED: "Reviewed",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  HIRED: "Hired",
  REJECTED: "Not selected",
};

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};
