# 🎙️ interviewer.ai (v2.0)

An ultra-premium, fully interactive, voice-driven AI technical interviewer that analyzes candidates' public GitHub repositories, builds custom evaluation rubrics, conducts live voice interviews in the browser, and delivers high-fidelity scorecard dashboards—**100% cost-free** and **Docker-free**.

Developed with a gorgeous cyber-tech dark theme inspired by premium design concepts, featuring stacked card viewport scroll transitions, and built on a secure serverless architecture.

---

## 🚀 Key Features

* **📦 Repository Architecture Audits:** On-the-fly parsing of public GitHub repositories to analyze dependencies, coding styles, design patterns, and package structures.
* **🃏 Stacked Card Viewport Transitions:** A sleek, Figma-style navigation experience on desktop where page sections slide up and stack over each other with soft drop-shadow dividers.
* **🗣️ Browser-Native Voice Sessions:** Live, interactive technical interviews utilizing the browser's native Web Speech API (speech recognition and synthesis) for zero latency and zero API cost.
* **🧠 Multi-Model Consensus Scoring:** Uses Gemini’s free-tier API to execute separate analytical evaluations on candidate responses, outputting a precise consensus scorecard.
* **📊 Glassmorphic Scorecard Dashboards:** A premium feedback dashboard showing overall scores, qualitative reports, and a complete message-by-message conversation transcript.
* **🛡️ Compliant Ingestion Sandbox:** Never caches raw repository code permanently on disks; files are compiled on-the-fly and immediately garbage-collected to ensure 100% IP security.

---

## 🛠️ Technology Stack

* **Frontend:** React, Vite, TailwindCSS (configured with native `.dark` support), Lucide Icons, and Sonner.
* **Backend:** Node.js, Express, Prisma ORM, and Axios.
* **Database:** Supabase (PostgreSQL Free Tier).
* **AI Model:** Google Gemini (Free API Tier).
* **Runtime:** Bun or Node.js.

---

## 📂 Project Structure (Monorepo)

```text
├── apps
│   ├── backend            # Express server (Gemini APIs, repository scraper, Prisma Client)
│   │   ├── prisma/        # Database schemas and migration history
│   │   └── index.ts       # Server entry point & endpoints
│   └── frontend           # React application (Vite template, Lucide, Tailwind)
│       ├── src/           # Component library (Form, Interview, Result, VoiceOrb)
│       └── styles/        # Global CSS styles (fonts, animations, scroll reveal)
├── packages               # Shared monorepo configuration layers
│   ├── eslint-config/     # Linting standards
│   └── typescript-config/ # Global TS configs
├── package.json           # Root workspace configuration
└── turbo.json             # Turborepo build orchestrations
```

---

## 💻 Local Development Setup

### Pre-requisites
- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) installed.
- A free **Supabase** project (for PostgreSQL).
- A free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sumitaiml/Interviewer.Ai.git
cd Interviewer.Ai
bun install
```

### 2. Configure Environment Variables
Create a `.env` file inside `apps/backend/` and add:
```env
DATABASE_URL="your-supabase-postgresql-connection-string"
GEMINI_API_KEY="your-free-gemini-api-key"
```

### 3. Sync Database Schema
Sync your Supabase database with the Prisma schema:
```bash
cd apps/backend
npx prisma db push
cd ../..
```

### 4. Start Development Servers
Run the following command in the root folder to spin up the Turborepo dev servers:
```bash
bun run dev
```
* The frontend will be available at: `http://localhost:3000/`
* The backend will run on: `http://localhost:3001/`

---

## ☁️ 100% Free Cloud Deployment Guide

### Phase 1: Database (Supabase)
* Register a free account on [Supabase](https://supabase.com/).
* Create a project and retrieve your connection string from **Project Settings > Database**.

### Phase 2: Backend Server (Render)
1. Sign up for a free account at [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository.
4. Set the following configurations:
   * **Root Directory:** `apps/backend`
   * **Build Command:** `npm install && npx prisma generate`
   * **Start Command:** `node index.js` (or `bun run index.ts` if using Bun)
   * **Instance Type:** `Free`
5. In the **Environment Variables** panel, add:
   * `DATABASE_URL` = *[Your Supabase connection string]*
   * `GEMINI_API_KEY` = *[Your Gemini API key]*
6. Deploy the service and copy the provided Render URL.

### Phase 3: Frontend Client (Vercel)
1. Sign up for a free account at [Vercel](https://vercel.com/).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the project:
   * **Root Directory:** Edit and select **`apps/frontend`**
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. In the **Environment Variables** panel, add:
   * **Key:** `VITE_BACKEND_URL`
   * **Value:** *[Your Render Backend URL]* (e.g., `https://interviewer-backend.onrender.com`)
6. Deploy. Vercel will provide your live public URL.