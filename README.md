# 🛡️ GuardSport — AI-Powered Sports Content Protection

> **The world's first privacy-first digital fingerprinting platform for sports video creators.** GuardSport detects pirated copies of your content across the web, generates court-ready legal evidence, and sends DMCA takedown notices — all without your videos ever leaving your device.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## 📖 Table of Contents

- [Why GuardSport?](#-why-guardsport)
- [The Problem We're Solving](#-the-problem-were-solving)
- [Architecture Overview](#-architecture-overview)
- [The 3-Layer Intelligence Engine](#-the-3-layer-intelligence-engine)
- [Perceptual Hashing (pHash) — How It Works](#-perceptual-hashing-phash--how-it-works)
- [Privacy-First Design](#-privacy-first-design)
- [Threat Scoring System](#-threat-scoring-system)
- [Legal Workflow](#-legal-workflow)
- [Feature Breakdown by Phase](#-feature-breakdown-by-phase)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Challenges & Solutions](#-challenges--solutions)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap)

---

## 🌟 Why GuardSport?

Sports video piracy costs creators and rights holders **billions annually**. Existing solutions are either:

- **Enterprise-only** (YouTube Content ID, Gracenote) — inaccessible to independent creators
- **Manual** — creators must find pirated links themselves and file DMCA notices by hand
- **Privacy-invasive** — require you to upload your full video to a third-party server
- **Title-match only** — easily fooled by re-encoded, cropped, or renamed copies

GuardSport flips this model. It runs **YouTube Content ID-grade fingerprinting entirely in your browser**, costs nothing to operate, and puts creators fully in control of their legal workflow.

---

## 🔥 The Problem We're Solving

```
Creator publishes: "Premier League Highlights — Gameweek 32"
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   Reuploaded as:   Reuploaded as:   Reuploaded as:
   "PL GW32 HD"    "Watch Free EPL"  "[Re-encode]
                    Highlights"       720p stream"
          │               │               │
    YouTube            Reddit          Telegram
   (different          (link post)     (private
    channel)                            group)
```

Traditional scanners fail on all 3 because the titles don't match.
**GuardSport's pHash engine finds all 3** because it compares the actual visual content — the pixels — not just the title string.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────────┐ │
│  │  Video   │───▶│ Frame Extract│───▶│  pHash Engine (DCT)   │ │
│  │  File    │    │ (Canvas API) │    │  64-bit hex strings   │ │
│  └──────────┘    └──────────────┘    └──────────┬────────────┘ │
│                                                 │               │
│                    Video never leaves here      │ ~500 bytes    │
└─────────────────────────────────────────────────┼───────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS SERVER                           │
│                                                                 │
│  /api/assets/fingerprint ◀── stores hashes ──▶ Supabase DB     │
│  /api/scan ──────────────────────────────────────────────────┐  │
│  /api/violations ────────────────────────────────────────┐   │  │
│  /api/reports ────────────────────────────────────────┐  │   │  │
│  /api/violations/send-takedown ────────────────────┐  │  │   │  │
└────────────────────────────────────────────────────┼──┼──┼───┘  │
                                                     │  │  │       
                    ┌────────────────────────────────┘  │  │       
                    ▼                                   │  │       
             ┌─────────────┐    ┌──────────┐           │  │       
             │ Resend API  │    │Serper API│◀──────────┘  │       
             │ (DMCA Email)│    │(Discovery│              │       
             └─────────────┘    └──────────┘              │       
                                                          ▼       
                                                   ┌────────────┐  
                                                   │ Supabase   │  
                                                   │ PostgreSQL │  
                                                   │ + Auth     │  
                                                   └────────────┘  
```

---

## 🧠 The 3-Layer Intelligence Engine

When you click "Scan Web" on an asset, three layers activate in sequence:

```
Asset Title: "Premier League Highlights Gameweek 32"
                              │
              ┌───────────────▼────────────────┐
              │      LAYER 1: DISCOVERY        │
              │      lib/query-generator.ts    │
              │                                │
              │  Generates 5 search variants:  │
              │  1. "Premier League GW32" (exact)│
              │  2. ... free stream            │
              │  3. ... watch online           │
              │  4. ... download full          │
              │  5. site:twitter.com OR reddit │
              │                                │
              │  → Hits Serper.dev (Google)    │
              │  → Returns ~50 unique URLs     │
              └───────────────┬────────────────┘
                              │ 50 candidate URLs
              ┌───────────────▼────────────────┐
              │    LAYER 2: VERIFICATION       │
              │      lib/og-scraper.ts         │
              │                                │
              │  For each candidate URL:       │
              │  • Fetch first 50KB of HTML    │
              │  • Extract OG meta tags        │
              │  • Detect og:type="video"      │
              │  • Find og:video or twitter:   │
              │    player tags                 │
              │  • 5-second timeout per URL    │
              └───────────────┬────────────────┘
                              │ + OG metadata
              ┌───────────────▼────────────────┐
              │      LAYER 3: SCORING          │
              │      lib/fuzzy-match.ts        │
              │                                │
              │  Confidence Score (0-100):     │
              │  • Token overlap   × 60 pts    │
              │  • Levenshtein sim × 40 pts    │
              │  • Video confirmed +15 pts     │
              │  • No video found  -20 pts     │
              │                                │
              │  Filter: score ≥ 50 = threat   │
              └───────────────┬────────────────┘
                              │
                     Flagged violations
                     saved to Supabase
```

### Layer 1 — Smart Query Generator

Piracy sites rarely use the exact title. Our generator creates 5 targeted variants:

| Query Type | Example | Catches |
|---|---|---|
| Exact | `"Premier League GW32"` | Direct reposts |
| Free stream | `PL GW32 free stream` | Streaming sites |
| Watch online | `PL GW32 watch online` | Embed farms |
| Download | `PL GW32 download full` | Torrent indexes |
| Social | `site:twitter.com OR reddit.com` | Social media shares |

### Layer 2 — OG Metadata Scraper

Zero-dependency lightweight scraper (`lib/og-scraper.ts`):
- Reads **only the first 50KB** of each page (stops at `</head>`) — fast and cheap
- Extracts `og:title`, `og:type`, `og:video`, `twitter:player` via regex
- Detects if the page is actually serving video content
- Respects a **5-second timeout** to never stall the pipeline

### Layer 3 — Fuzzy Confidence Scoring

Two algorithms combined:

**Token Overlap (Jaccard-style)**
```
Original: "premier league highlights gameweek 32"
Found:    "watch premier league gameweek 32 online hd"
Noise removed: "watch", "online", "hd"
After: "premier league gameweek 32"
Overlap: 4/5 tokens = 80% → 48 points
```

**Levenshtein Edit Distance**
```
Measures character-level similarity after normalization.
Normalized distance converted to 0-1 similarity score → max 40 points
```

**Video Verification Bonus**
- `og:type = "video.*"` or `og:video` tag present → **+15 points**
- No video signals found → **-20 points** (reduces false positives)

---

## 🔬 Perceptual Hashing (pHash) — How It Works

Unlike SHA-256 (which changes completely if one pixel changes), a **perceptual hash stays nearly identical** even if a video is re-encoded, cropped, resized, or had a logo overlaid.

### The Algorithm (DCT-based pHash)

```
  Original 1920×1080 Frame
           │
           ▼
  Resize to 32×32 grayscale
  (lose irrelevant detail)
           │
           ▼
  Apply 2D Discrete Cosine Transform (DCT)
  (convert pixels → frequency domain)
           │
           ▼
  Extract top-left 8×8 coefficients
  (these = low-frequency "essence" of image)
           │
           ▼
  Compute median of 63 values
           │
           ▼
  For each coefficient:
    bit = 1 if value > median, else 0
           │
           ▼
  64-bit binary → 16 hex chars
  e.g. "a4f2c89b7e31d056"
```

### Why DCT?

The DCT separates an image's "low frequency" (the broad shapes and content) from "high frequency" (fine details, encoding artifacts, compression noise). By only looking at low frequencies, pHash is completely immune to:
- Re-encoding at different bitrates
- Resizing and cropping
- Colour grading changes
- Logo/watermark overlays
- Frame rate changes

### Hamming Distance Comparison

```
Original hash:  a4f2c89b7e31d056
Pirated copy:   a4f2c89b7e31d057
                               ^ 1 bit different

Hamming distance = 1 (out of 64)
→ MATCH (same content, different encode)

Random video:   3b8a1047fc29e8d2
Hamming distance = 31 (out of 64)
→ NOT A MATCH
```

| Distance | Interpretation |
|---|---|
| 0–9 | Same content (high confidence match) |
| 10–20 | Similar content (medium confidence) |
| > 20 | Different content |

### Privacy Architecture

```
┌─────────────────────────────────┐
│  Browser (your device)          │
│                                 │
│  500MB video file               │
│       │                         │
│       ▼                         │
│  ┌─────────────────────────┐   │
│  │ <video> + <canvas> APIs │   │
│  │ Extract 10 key frames   │   │
│  │ Generate pHash per frame│   │
│  └──────────┬──────────────┘   │
│             │                   │
│   Only these leave your device: │
│   ┌─────────────────────────┐  │
│   │ ~500 bytes of hex hashes│  │
│   └──────────┬──────────────┘  │
└──────────────┼──────────────────┘
               │
               ▼
        Supabase DB
        (stores hashes only)
```

**Your video NEVER leaves your browser.**

---

## 🔒 Privacy-First Design

| What | Where it lives |
|---|---|
| Your video file | **Your device only** |
| Fingerprint hashes | Supabase DB (64-bit hex strings, ~500 bytes) |
| Asset metadata (title, URL) | Supabase DB |
| Violations | Supabase DB |
| DMCA emails | Sent via Resend API (you control content) |
| Evidence reports | Generated on-demand server-side |

---

## 📊 Threat Scoring System

Each asset receives a dynamic 0–100 **Portfolio Threat Level**, updated after every scan:

```
Threat Score = Volume (max 40) + Confidence (max 30) + Spread (max 15) + Recency (max 15)
```

| Component | Calculation |
|---|---|
| **Volume** | `min(violations × 4, 40)` — more violations = higher threat |
| **Confidence** | `(avgConfidence / 100) × 30` — high-confidence matches = more severe |
| **Spread** | `min(uniquePlatforms × 5, 15)` — piracy on more platforms = harder to contain |
| **Recency** | `15 - (daysOld × 0.5)` — recent violations = hotter threat, decays over 30 days |

| Score | Label | Color |
|---|---|---|
| 75–100 | 🔴 Critical | Red |
| 50–74 | 🟠 High | Orange |
| 25–49 | 🟡 Moderate | Yellow |
| 0–24 | 🟢 Safe | Green |

---

## ⚖️ Legal Workflow

```
Scan finds violations
         │
         ▼
┌────────────────────┐
│  Violations Page   │
│  • Filter by status│
│  • Confidence badge│
│  • Check violations│
│    to select       │
└────────┬───────────┘
         │ Select + click "Send Takedown"
         ▼
┌────────────────────────────────────┐
│       DMCA Composer Modal          │
│                                    │
│  To: abuse@platform.com            │
│  Subject: DMCA Notice — [Title]    │
│                                    │
│  [Editable email body with:        │
│   • Auto-inserted asset title      │
│   • Auto-inserted infringing URLs  │
│   • Legal boilerplate              │
│   • User's ownership claim]        │
│                                    │
│  [Send Notice]  [Cancel]           │
└────────────┬───────────────────────┘
             │ Sends via Resend API
             ▼
  violation.status → "takedown_sent"
  Audit event logged to violation_events
             │
             ▼
┌────────────────────────────────────┐
│     Evidence Report (HTML)         │
│  Available from My Assets page     │
│                                    │
│  • Asset details + proof hash      │
│  • All violations with confidence  │
│  • Chain of evidence audit trail   │
│  • Timestamped, printable to PDF   │
└────────────────────────────────────┘
```

---

## 🗓️ Feature Breakdown by Phase

### ✅ Phase 1 — Foundation
- Next.js 16 (App Router) + TypeScript scaffolding
- Supabase project + PostgreSQL schema (`assets`, `violations`)
- Row Level Security (RLS) — users can only access their own data
- Basic environment configuration

### ✅ Phase 2 — Authentication
- Supabase Auth with email/password
- Server-side client (`lib/supabase/server.ts`) and browser client (`lib/supabase/client.ts`)
- Route protection via `proxy.ts` middleware
- Glassmorphic `/login` and `/signup` pages with validation

### ✅ Phase 3 — Dashboard & API Core
- Reusable UI component library: `Button`, `Card`, `Badge`
- Dashboard layout with responsive sidebar navigation
- API routes: `/api/assets`, `/api/violations`, `/api/scan`
- `recharts` integration for data visualization
- Simulated scanner (pre-Phase 5)

### ✅ Phase 4 — Public Polish
- Marketing landing page (`/`) with hero, features, pricing sections
- Settings/Profile management page (`/settings`)
- Pricing page: Free (10 assets) and Pro ($99/mo) tiers

### ✅ Phase 5 — The Real Prototype
- **Serper.dev integration** — real Google Search API for piracy discovery
- **Resend integration** — transactional email for violation alerts
- **Cryptographic Proof of Ownership** — SHA-256 hash of asset metadata stored as immutable on-chain-style proof
- Pricing gating UI (Free: 10 assets, Pro: unlimited)

### ✅ Phase 6 — Intelligence Engine & Legal Action
- **3-Layer Intelligence Pipeline** (`query-generator.ts` → `og-scraper.ts` → `fuzzy-match.ts`)
- **Confidence Scoring** — 0-100 score on every violation
- **Threat Level System** — per-asset Portfolio Threat Score
- **DMCA Email Composer** — user reviews + edits + sends legal notices
- **Evidence Reports** — court-ready HTML reports with audit trail
- **Platform Analytics** — pie chart of piracy distribution by platform
- `violation_events` audit table with RLS

### ✅ Phase 7 — Video Fingerprinting & Watermarking
- **Drag-and-drop video upload** with file validation and auto-title extraction
- **DCT-based pHash engine** (`lib/phash.ts`) — 64-bit perceptual hashes
- **Hamming distance matching** — detects re-encoded/cropped pirated copies
- **Client-side watermark export** (`lib/watermark.ts`) — Canvas + MediaRecorder
- **`asset_fingerprints` table** — stores frame-level hashes with RLS
- **Zero-upload architecture** — video never leaves the browser

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components, API routes, middleware — one repo for everything |
| Database | Supabase (PostgreSQL) | RLS, real-time, built-in Auth, generous free tier |
| Auth | Supabase Auth | Seamless session management with SSR cookies |
| Styling | Tailwind CSS v4 | Utility-first, dark glassmorphic theme |
| Charts | Recharts | Lightweight, composable React charting |
| Email | Resend | Reliable transactional email with great DX |
| Search API | Serper.dev | Google Search API proxy, affordable |
| Fingerprinting | Custom pHash (pure TypeScript) | No dependencies, runs in-browser |
| Watermarking | Canvas + MediaRecorder API | Zero-cost, no server required |
| Language | TypeScript 5 | Full type safety across client + server |

---

## 🗄️ Database Schema

```sql
-- Core Tables
assets (
  id            uuid PRIMARY KEY,
  user_id       uuid REFERENCES auth.users,
  title         text NOT NULL,
  url           text NOT NULL,
  sport         text,
  proof_hash    text,                    -- SHA-256 ownership proof
  fingerprint_status  text,             -- 'none' | 'processing' | 'complete'
  fingerprint_count   integer,          -- number of pHash frames stored
  created_at    timestamptz DEFAULT now()
)

violations (
  id          uuid PRIMARY KEY,
  asset_id    uuid REFERENCES assets,
  found_url   text,
  platform    text,
  status      text CHECK (IN 'new','reviewed','ignored','takedown_sent'),
  confidence  integer,                  -- 0-100 fuzzy match score
  og_title    text,                     -- scraped title from infringing page
  has_video   boolean,                  -- OG video tag detected
  detected_at timestamptz DEFAULT now()
)

-- Audit Trail
violation_events (
  id            uuid PRIMARY KEY,
  violation_id  uuid REFERENCES violations,
  event_type    text,                   -- 'takedown_sent', 'reviewed', etc.
  details       text,
  created_at    timestamptz DEFAULT now()
)

-- Perceptual Fingerprints
asset_fingerprints (
  id          uuid PRIMARY KEY,
  asset_id    uuid REFERENCES assets,
  frame_index integer,                  -- which frame this hash represents
  phash       text,                     -- 16-char hex (64-bit)
  created_at  timestamptz DEFAULT now()
)
```

**All tables have Row Level Security (RLS)** — users can never read, write, or delete another user's data, enforced at the database level.

---

## 🧩 Challenges & Solutions

### Challenge 1 — False Positives in Piracy Detection

**Problem:** Simple title matching produced too many false positives. A search for "World Cup Highlights" would flag every football news article.

**Solution:** The 3-layer engine reduces false positives through progressive filtering:
1. Cast a wide net with 5 query variants (Layer 1)
2. Verify each result actually contains video content via OG scraping (Layer 2)
3. Apply dual scoring (token overlap + Levenshtein) with a 50-point minimum threshold (Layer 3)

The video verification bonus/penalty (`±15-20 points`) is particularly effective — it punishes text articles masquerading as video results.

---

### Challenge 2 — Re-encoded Video Not Detected by Title Matching

**Problem:** Pirates routinely re-encode videos, change resolution, add logos, and rename files. Title-based search misses ~60% of re-uploads.

**Solution:** DCT-based perceptual hashing. By hashing the visual *frequency domain* (not pixel values), GuardSport generates fingerprints that are robust to:
- Re-encoding (different codec/bitrate)
- Resizing (32×32 resize step normalizes dimensions)
- Colour changes (grayscale conversion step)
- Logo/watermark additions (low-frequency content unchanged)
- Cropping (partially — depends on severity)

---

### Challenge 3 — Video Storage Cost & Privacy

**Problem:** Storing user videos server-side costs money and raises serious privacy concerns. Free storage tiers (e.g. Supabase's 1GB) would support only 2 large sports videos.

**Solution:** Client-side processing architecture. The browser's native `<video>` + `<canvas>` APIs extract frames locally. The pHash algorithm runs in pure TypeScript (no native dependencies). Only the resulting ~500 bytes of hex hashes leave the device. Storage cost: effectively zero.

---

### Challenge 4 — Supabase Nested Join Filtering Bug

**Problem:** The Supabase JS client's `assets!inner` join pattern combined with `.eq('assets.user_id', ...)` was silently failing — returning all violations regardless of ownership.

**Solution:** Replaced with a two-step query pattern: fetch the user's asset IDs first, then use `.in('asset_id', assetIds)` for violations. This is explicit, reliable, and fully enforced by RLS as a second layer of protection.

---

### Challenge 5 — pHash BigInt Compatibility

**Problem:** The Hamming distance calculation used BigInt literal syntax (`0n`, `1n`) which TypeScript rejects when targeting pre-ES2020.

**Solution:** Replaced literals with `BigInt(0)` and `BigInt(1)` constructor calls — identical runtime behaviour, compatible with all TS targets.

---

### Challenge 6 — PDF Generation in Next.js Serverless

**Problem:** `pdfmake` requires TTF font files to be available at specific filesystem paths. In Next.js serverless functions, the filesystem is read-only and fonts aren't bundled, causing crashes.

**Solution:** Replaced `pdfmake` with a server-side HTML report generator. The output is a beautifully styled HTML file that the user can open in any browser and print/save as PDF natively — no dependency, no fonts, no crashes.

---

### Challenge 7 — `violations.status` Constraint Mismatch

**Problem:** The database `CHECK` constraint only allowed `'new'`, `'reviewed'`, `'ignored'` — but the legal workflow needed `'takedown_sent'`. Updates silently failed.

**Solution:** Applied a database migration to update the constraint to include `'takedown_sent'`.

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd guardsport

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start the development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

---

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Serper.dev (Google Search API)
SERPER_API_KEY=your-serper-key

# Resend (Email)
RESEND_API_KEY=re_your-resend-key
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/assets` | GET | List user's assets with threat scores |
| `/api/assets` | POST | Register a new asset |
| `/api/assets/proof` | POST | Generate SHA-256 proof of ownership |
| `/api/assets/fingerprint` | POST | Save pHash fingerprints from browser |
| `/api/assets/fingerprint` | GET | Retrieve stored fingerprints |
| `/api/scan` | POST | Run 3-layer intelligence scan on an asset |
| `/api/violations` | GET | List violations for user's assets |
| `/api/violations` | PATCH | Update violation status |
| `/api/violations/send-takedown` | POST | Send DMCA email via Resend |
| `/api/reports` | GET | Generate HTML evidence report |

---

## 🗺️ Roadmap

### Near-term
- [ ] **Bulk Scan** — scan all assets simultaneously with one click
- [ ] **Scan Scheduling** — automated weekly/daily background scans
- [ ] **Watermark Detector** — identify if your watermark appears in search results

### Mid-term
- [ ] **Stripe Integration** — Pro tier payment for unlimited assets
- [ ] **DMCA Status Tracking** — track which platforms have responded to takedowns
- [ ] **Multi-user / Team** — allow multiple users under one account

### Long-term
- [ ] **Browser Extension** — detect if a video you're watching is a pirated copy
- [ ] **API for Rights Holders** — white-label the engine for broadcast companies

---

## 🤝 Contributing

This is a solo-built project. If you find a bug or want to contribute a feature, please open an issue or PR.

---
