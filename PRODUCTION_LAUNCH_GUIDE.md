# Production Launch Guide: Illy Jobs

A comprehensive step-by-step guide to deploying **Illy Jobs** to production with enterprise-grade SEO indexability, 100% WCAG 2.1 AA accessibility compliance, custom domain integration (`illyjobs.ng`), Supabase database migration, and instant Google indexing.

---

## 📋 Table of Contents

1. [Phase 1: Supabase Database & Storage Migration](#phase-1-supabase-database--storage-migration)
2. [Phase 2: Production Hosting & Custom Domain Setup](#phase-2-production-hosting--custom-domain-setup)
3. [Phase 3: World-Class SEO & Google Instant Indexing](#phase-3-world-class-seo--google-instant-indexing)
4. [Phase 4: WCAG 2.1 AA Accessibility Verification](#phase-4-wcag-21-aa-accessibility-verification)
5. [Phase 5: Post-Launch Growth & Analytics Engine](#phase-5-post-launch-growth--analytics-engine)

---

## Phase 1: Supabase Database & Storage Migration

Currently, Illy Jobs uses a local `data/db.json` store with a decoupled Data Access Layer ([`lib/db/jobs.ts`](file:///c:/Users/USER/Documents/antigravity/magical-noether/lib/db/jobs.ts) and [`lib/db/users.ts`](file:///c:/Users/USER/Documents/antigravity/magical-noether/lib/db/users.ts)).

### Step 1.1: Create Supabase Project
1. Sign up at [supabase.com](https://supabase.com) and create a new project named `illy-jobs-prod`.
2. Select Region: **EU (Frankfurt)** or **EU (London)** for low latency to Nigeria.

### Step 1.2: Execute Production SQL Migration
In the Supabase SQL Editor, run the following schema migration:

```sql
-- Create Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'JOB_SEEKER',
  plan_tier TEXT DEFAULT 'FREE',
  full_name TEXT,
  company_name TEXT,
  company_logo TEXT,
  headline TEXT,
  location_area TEXT DEFAULT 'Tanke / Unilorin Axis',
  resume_url TEXT,
  resume_file_name TEXT,
  skills TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Jobs Table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  location_area TEXT NOT NULL,
  address TEXT,
  category TEXT NOT NULL,
  employment_type TEXT DEFAULT 'FULL_TIME',
  salary_min INT,
  salary_max INT,
  salary_currency TEXT DEFAULT 'NGN',
  description TEXT NOT NULL,
  requirements TEXT[],
  preferred_channel TEXT DEFAULT 'WHATSAPP',
  whatsapp_phone TEXT,
  contact_email TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_pro_employer BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Hyper-Fast Search in Ilorin
CREATE INDEX idx_jobs_location_category ON public.jobs (location_area, category);
CREATE INDEX idx_jobs_slug ON public.jobs (slug);
CREATE INDEX idx_jobs_posted_at ON public.jobs (posted_at DESC);

-- Create Applications Table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  location_area TEXT,
  resume_url TEXT,
  cover_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Supabase Storage Bucket for Resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);
```

### Step 1.3: Update Data Access Layer
Install `@supabase/supabase-js`:
```bash
npm install @supabase/supabase-js
```
Replace the internal methods in `lib/db/jobs.ts` and `lib/db/users.ts` with Supabase query calls. **No UI component changes required.**

---

## Phase 2: Production Hosting & Custom Domain Setup

### Step 2.1: Connect Git Repository to Vercel
1. Push your project to GitHub/GitLab.
2. Sign in to [Vercel](https://vercel.com) and import the `magical-noether` repository.
3. Framework Preset: **Next.js**.

### Step 2.2: Set Environment Variables on Vercel
In Vercel Project Settings > Environment Variables, add:
* `NEXT_PUBLIC_SITE_URL` = `https://illyjobs.ng`
* `NEXT_PUBLIC_SUPABASE_URL` = `https://your-supabase-id.supabase.co`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
* `SUPABASE_SERVICE_ROLE_KEY` = `your-supabase-service-role-key`

### Step 2.3: Configure Custom Domain (`illyjobs.ng`)
1. Purchase domain `illyjobs.ng` or `illyjobs.com` (from Whogohost, DomainKing, or Namecheap).
2. Add custom domain in Vercel Settings > Domains.
3. Update DNS record at your domain registrar:
   - **A Record**: `@` -> `76.76.21.21`
   - **CNAME Record**: `www` -> `cname.vercel-dns.com`

---

## Phase 3: World-Class SEO & Google Instant Indexing

To guarantee anyone searching for jobs in Nigeria or Ilorin finds Illy Jobs on Google:

### Step 3.1: Verify Google Search Console & Submit Sitemap
1. Open [Google Search Console](https://search.google.com/search-console).
2. Add Property `https://illyjobs.ng`.
3. Go to **Sitemaps** and submit: `https://illyjobs.ng/sitemap.xml`.

### Step 3.2: Configure Google Indexing API (Instant 15-Minute Indexing)
When an employer posts a job, alert Google instantly to crawl the new URL:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Web Search Indexing API**.
3. Create a Service Account, download the JSON private key, and grant it `Owner` permissions in Google Search Console.
4. Add API Webhook in `app/api/jobs/route.ts` so whenever a job is created, it sends a `URL_UPDATED` notification to Google.

### Step 3.3: Implement IndexNow Protocol for Bing & Yandex
Add an IndexNow route `/api/indexnow` to ping Bing Search API whenever a job slug is published.

---

## Phase 4: WCAG 2.1 AA Accessibility Verification

Achieve a 100/100 Lighthouse Accessibility Rating:

1. **Automated Audit**: Run `npx axe-cli https://illyjobs.ng` to detect any contrast or ARIA violations.
2. **Keyboard Focus Check**: Press `Tab` continuously from top to bottom. Ensure all interactive links and buttons display visible emerald focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-600`).
3. **Screen Reader Verification**: Enable VoiceOver (macOS/iOS) or NVDA (Windows) to verify:
   - Modals announce `role="dialog"` and `aria-labelledby`.
   - Dynamic search result updates use `aria-live="polite"`.
   - Forms have explicit `<label htmlFor="...">` associations.

---

## Phase 5: Post-Launch Growth & Local Kwara Strategy

1. **Onboard Ilorin Anchor Employers**: Directly register top schools, supermarkets, hospitals, and tech studios in Tanke, GRA, Taiwo, and Challenge.
2. **WhatsApp Job Alert Bot**: Launch a dedicated WhatsApp Channel / Bot ("Illy Jobs Daily Alerts") for Kwara State job seekers.
3. **SEO Keyword Monitoring**: Track rankings for target keywords: *"Jobs in Ilorin"*, *"Teaching jobs in Tanke"*, *"Vacancies in Kwara State"*, and *"Supermarket jobs GRA Ilorin"*.

---

*This guide ensures Illy Jobs launches cleanly, scales to 1M+ users, and dominates Google search rankings for Ilorin and Kwara State.*
