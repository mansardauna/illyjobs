-- Illy Jobs production schema.
-- Run once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: every statement is idempotent.
--
-- The app talks to these tables and the storage bucket only from the server,
-- using the service role key. Row Level Security is enabled with no policies,
-- so the public anon key cannot read or write anything (password hashes,
-- applicant details, messages and CVs stay private).

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text,
  password_hash text not null,
  role text not null default 'JOB_SEEKER' check (role in ('JOB_SEEKER', 'EMPLOYER', 'ADMIN')),
  plan_tier text not null default 'FREE' check (plan_tier in ('FREE', 'PRO')),
  full_name text,
  company_name text,
  company_logo text,
  headline text,
  location_area text,
  address text,
  resume_url text,          -- storage path inside the private "resumes" bucket
  resume_file_name text,
  skills text[],
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.users(id) on delete set null,
  title text not null,
  slug text unique not null,
  company text not null,
  company_logo text,
  location_area text not null,
  address text,
  category text not null,
  employment_type text not null default 'FULL_TIME',
  salary_min int,
  salary_max int,
  salary_currency text not null default 'NGN',
  description text not null,
  requirements text[] not null default '{}',
  preferred_channel text not null default 'WHATSAPP',
  whatsapp_phone text,
  contact_email text,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  is_pro_employer boolean not null default false,
  status text not null default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  posted_at timestamptz not null default now(),
  closes_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists idx_jobs_location_category on public.jobs (location_area, category);
create index if not exists idx_jobs_posted_at on public.jobs (posted_at desc);
create index if not exists idx_jobs_employer on public.jobs (employer_id);
create index if not exists idx_jobs_status_closes on public.jobs (status, closes_at);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references public.users(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null,
  location_area text,
  resume_path text,         -- snapshot of the CV used for this application
  resume_file_name text,
  cover_note text,
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index if not exists idx_applications_job on public.applications (job_id);
create index if not exists idx_applications_applicant on public.applications (applicant_id);

-- One conversation per application, between the applicant and the employer.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  kind text not null default 'TEXT' check (kind in ('TEXT', 'STATUS')),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_messages_application on public.messages (application_id, created_at);

alter table public.users enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;

-- Private bucket for CVs. Files are only served through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('resumes', 'resumes', false, 5242880)
on conflict (id) do update set public = false, file_size_limit = 5242880;
