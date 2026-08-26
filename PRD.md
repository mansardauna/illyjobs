# Product Requirement Document (PRD)

## Project Title: Illy Jobs SaaS (Enterprise-Grade Hyper-Local Job & Recruitment Platform)

**Document Version:** 2.0.0  
**Date:** August 26, 2026  
**Status:** Approved for Implementation  
**App Name:** Illy Jobs  
**Brand Identity:** Crisp Pure White & Lush Emerald Green (`#059669` / `#047857`)  
**Typography System:** Google Fonts — **DM Sans** (Headings) & **Poppins** (Body & Controls)  
**Target Scale:** 1,000,000+ Active Users (Scalable Architecture)  
**Business Model:** Freemium SaaS (Free Seeker/Employer Tier + Pro Seeker & Pro Employer Plans)

---

## 1. Executive Overview & Scale Architecture

### 1.1 Enterprise Product Vision
**Illy Jobs** is an enterprise-scale hyper-local recruitment SaaS platform built for Ilorin City and Kwara State, engineered to seamlessly scale to 1M+ active candidates and employers.

It features:
1. **Multi-Role Authentication**: Dedicated Job Seeker & Employer login/register flows (`/auth/login`, `/auth/register`) with role-based routing and session state.
2. **SaaS Subscription System**: Dual monetization model (Pro Employers & Pro Job Seekers) with feature gating, badges, and automated plan management.
3. **Advanced Resume/CV Storage & Parser Engine**: Frictionless drag-and-drop resume upload (PDF/DOCX), automatic candidate profile parsing, and searchable resume index for Pro employers.
4. **Enhanced Typography & Visual Hierarchy**: High readability using **DM Sans** for headings and **Poppins** for body copy with enlarged font scales (`text-base` standard body, `text-lg` subtitles, `text-3xl`–`text-5xl` headlines).
5. **High-Performance Architecture**: Scalable repository pattern, cached search queries, paginated API endpoints, and clean Supabase migration pathways.

---

## 2. SaaS Plans & Feature Matrix

### 2.1 Pricing Tier Matrix (`/pricing`)

| Feature | Job Seeker (Free) | Seeker Pro (₦2,500/mo) | Employer (Free) | Employer Pro (₦15,000/mo) |
| :--- | :---: | :---: | :---: | :---: |
| **Job Search & 1-Click Apply** | ✅ Unlimited | ✅ Unlimited | N/A | N/A |
| **WhatsApp Express Apply** | ✅ Yes | ✅ Yes | N/A | N/A |
| **Resume CV Upload** | ✅ 1 Resume | ✅ Multi-CVs | N/A | N/A |
| **"Featured Top Applicant" Badge** | ❌ No | ✅ Included | N/A | N/A |
| **Instant WhatsApp Job Alerts** | ❌ Weekly | ✅ Instant | N/A | N/A |
| **Active Job Postings** | N/A | N/A | 2 Listings | ✅ Unlimited |
| **"Urgent & Featured" Job Pins** | N/A | N/A | ❌ No | ✅ Top of Search |
| **Resume Database Access** | N/A | N/A | ❌ No | ✅ Search & Contact |
| **Candidate ATS Kanban Pipeline** | N/A | N/A | Basic | ✅ Full ATS + Export |

---

## 3. Architecture & Data Schema (1M User Scalability)

### 3.1 Scalable Database Schema (`data/db.json` -> Supabase / PostgreSQL)

```prisma
enum Role {
  JOB_SEEKER
  EMPLOYER
  ADMIN
}

enum PlanTier {
  FREE
  PRO
}

model User {
  id           String      @id @default(uuid())
  email        String      @unique
  phone        String?     @unique
  passwordHash String
  role         Role        @default(JOB_SEEKER)
  planTier     PlanTier    @default(FREE)
  createdAt    DateTime    @default(now())

  seekerProfile   JobSeekerProfile?
  employerProfile EmployerProfile?
}

model JobSeekerProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  fullName     String
  headline     String?  // e.g. "Unilorin Computer Science Graduate"
  locationArea String   // e.g. "Tanke"
  resumeUrl    String?  // PDF/DOCX file link
  resumeFileName String?
  skills       String[]
  isProSeeker  Boolean  @default(false)
}

model EmployerProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  companyName    String
  companyLogo    String?
  address        String
  locationArea   String
  isVerified     Boolean  @default(false)
  isProEmployer  Boolean  @default(false)
}
```

---

## 4. UI/UX Design System Specification

* **Headings**: **DM Sans** (`font-heading`, bold, tracking-tight).
* **Body & Inputs**: **Poppins** (`font-sans`, medium/regular, larger base sizes for high legibility).
* **Buttons**: Crisp `rounded-sm` (4px radius) + `shadow-sm` elevation.
* **Colors**: Emerald Green (`#059669` / `#047857`) & Pure White (`#FFFFFF`).
* **Accessibility**: WCAG 2.1 AA compliant, visible focus rings, ARIA dialogs.

---

*This document defines the SaaS architecture and design specs for Illy Jobs v2.0.*
