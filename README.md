# GuardSport — Digital Asset Protection

GuardSport is a web platform for sports video content creators to protect their digital assets. It allows users to register their video URLs, scan the web for potential piracy, and manage violations via a clean dashboard.

## Tech Stack
- **Frontend & API**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts

## Current Progress

This repository currently contains the **Complete MVP (Phases 1-4)** of the project build:

### ✅ Phase 1: Project Setup & Database
- Scaffolding Next.js with TypeScript and Tailwind CSS.
- Initializing the Supabase project.
- Provisioning the PostgreSQL database schema (`assets` and `violations` tables).
- Configuring Row Level Security (RLS) policies so users can only access their own data.

### ✅ Phase 2: Authentication Core
- Establishing Supabase Client Utilities for the browser (`lib/supabase/client.ts`) and server (`lib/supabase/server.ts`).
- Route protection implementation using Next.js `proxy.ts`.
- Building a custom, glassmorphic UI for `/login` and `/signup`.
- End-to-end user registration and login flows functioning locally.

### ✅ Phase 3: Dashboard & API Core
- Created reusable UI components (Button, Card, Badge) aligned with the glassmorphic design.
- Built the Dashboard layout with a responsive sidebar navigation.
- Implemented backend API routes (`/api/assets`, `/api/violations`, `/api/scan`).
- Developed a simulated web scanner (`lib/scanner.ts`) to detect piracy instances.
- Built out the frontend pages: Dashboard, My Assets, Add Asset, and Violations.
- Integrated `recharts` for data visualization.

### ✅ Phase 4: Public & User Polish
- Built a stunning, responsive, public-facing marketing Landing Page (`/`).
- Implemented a User Profile & Settings management view (`/settings`).
- Integrated final UI/UX polish across the application for production readiness.

### ✅ Phase 5: The Real Prototype
- **Real Web Scanning:** Replaced the simulated scanner with the live Serper.dev API to find real pirated URLs via Google Search.
- **Automated Email Alerts:** Integrated Resend to automatically email users when a scan finds copyright violations.
- **Pricing & Subscription:** Added a Pricing page showcasing a 10-asset Free tier and a $99/mo Pro tier.
- **Blockchain Simulation:** Added a "Proof of Ownership" feature that generates an immutable cryptographic SHA-256 hash of an asset to prove ownership.

### ✅ Phase 6: The Intelligence Engine & Legal Action
- **3-Layer Intelligence Pipeline:** Scanning now utilizes a Smart Query Generator, an Open Graph (OG) web scraper to verify video content, and a Fuzzy Matching algorithm to assign a "Confidence Score" to every potential violation.
- **Asset Threat Levels:** Implemented a dynamic 0-100 Threat Score for every asset based on the volume, recency, spread, and confidence of violations.
- **DMCA Email Composer:** A full UI workflow for users to review violations, auto-generate customized legal DMCA takedown notices, and send them directly via Resend.
- **Evidence Audit & Export:** Implemented a strict database audit trail for every violation event, and added a feature to instantly generate and download professional HTML/PDF Evidence Reports for legal use.
- **Platform Analytics:** Added a dynamic pie chart to the dashboard detailing which social/web platforms are hosting the most pirated versions of the user's content.

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Set up your `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. Run the development server with `npm run dev`
5. Navigate to `http://localhost:3000`

---
*Built as a solo project MVP.*
