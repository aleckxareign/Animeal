# Animeal 🐾

> **Better meals. Happier tails.**  
> An AI-powered, data-driven pet nutrition and wellness platform designed specifically for Filipino pet parents.

---

## Overview

**Animeal** eliminates guesswork in daily pet care by providing scientific Resting Energy Requirement (RER) calorie calculations, localized Philippine pet food price-per-calorie comparisons, multimodal AI food label scanning, collaborative multi-caregiver feeding coordination ("Napakain ko na!"), and an interactive 24/7 veterinary clinic finder across the Philippines.

Accompanied by **Mealie**, a bilingual (English & Taglish) AI pet care assistant powered by Google Gemini, Animeal provides reliable, veterinary-grounded advice for dogs and cats at every life stage.

---

## Key Features

| Module | Core Capabilities |
|---|---|
| 🐾 **Pet Profile & RER Calorie Targets** | Scientific calorie estimation using veterinary standard $RER = 70 \times (\text{weight in kg})^{0.75}$ with multipliers for life stages (puppy/kitten, adult, senior), neuter status, and activity levels. |
| 🍲 **Meal Tracker & Duplicate Prevention** | Log meals with automatic portion calculation, nutrient breakdown (protein, fat, fiber), daily calorie budget progress bars, and one-tap undo to prevent duplicate feedings across family members. |
| 🥫 **Philippine Pet Food Library** | Curated catalog of locally available brands (Pedigree, Whiskas, Aozi, Royal Canin, Special Cat, Vitality, etc.) with price-per-calorie ($\text{₱}/\text{kcal}$) metrics and AAFCO compliance checks. |
| 📷 **AI Food Label Scanner** | Multimodal OCR powered by Google Gemini. Snap or upload a photo of any pet food packaging to automatically extract Guaranteed Analysis, net weight, ingredients, and AAFCO adequacy verdicts. |
| 💧 **Hydration & Weight Monitoring** | Climate-calibrated daily water intake targets (accounting for moisture-heavy wet food vs. dry kibble) and historical weight progression tracking. |
| 📅 **Care Schedule & Reminders** | Recurring schedules and browser notifications for vaccinations, deworming, medication, grooming, and vet appointments. |
| 👨‍👩‍👧‍👦 **Shared Household Coordination** | Multi-user household care. Assign feedings, see who fed the pet last in real-time, and maintain consistent daily routines among family members and pet sitters. |
| 💬 **Ask Mealie AI** | Conversational pet care assistant with cultural awareness of Filipino households (bilingual Taglish/English support, table food safety warnings e.g., sibuyas, bawang, tsokolate). |
| 🏥 **Nearest Vet Finder** | Interactive stylized map with real-time GPS proximity, typeahead location search, and OpenStreetMap directory of 24/7 emergency clinics and animal hospitals across the Philippines. |

---

## Tech Stack

- **Frontend:** [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev), [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`
- **Routing & State:** [React Router 7](https://reactrouter.com), React Context (`AppContext`, `AuthContext`)
- **Backend API:** [Express 5](https://expressjs.com) with [Helmet](https://helmetjs.github.io/) security headers, strict CORS, and rate limiting (`express-rate-limit`)
- **Database & Authentication:** [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Supabase Auth, and Storage Buckets for `pet-avatars` and `food-scans`)
- **Artificial Intelligence:** [Google Gemini API](https://aistudio.google.com) (`@google/genai`) for conversational intelligence and vision OCR
- **Geocoding & Maps:** [OpenStreetMap Nominatim API](https://nominatim.org) and custom Haversine distance calculations
- **Icons & Typography:** [Lucide Icons](https://lucide.dev), [Geist Font](https://vercel.com/font)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher recommended)
- `npm` or `yarn` / `pnpm`
- *(Optional for full cloud features)* A free [Supabase](https://supabase.com) account and [Google AI Studio](https://aistudio.google.com) API key.

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/aleckxareign/Animeal.git
cd Animeal

# Install dependencies
npm install
```

---

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# 1. Supabase Cloud Configuration (PostgreSQL + Auth + Storage)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 2. Gemini AI Configuration (Server-side key)
GEMINI_API_KEY=your_gemini_api_key_here

# 3. Backend Server Port (Default: 3001)
PORT=3001
```

> 💡 **Zero-Config / Offline Demo Mode:**  
> If you don't configure Supabase or Gemini keys immediately, Animeal will automatically run in **safe offline mode** with local state persistence and built-in Taglish rule-based pet care guidance.

---

### 3. Database Setup (Supabase)

If using Supabase, set up your database in 2 easy steps:

1. Open your **Supabase Dashboard** -> **SQL Editor** -> **+ New Query**.
2. Run [`supabase/schema.sql`](supabase/schema.sql) (creates tables, foreign key cascades, RLS security policies, and storage buckets).
3. *(Optional)* Run [`supabase/seed.sql`](supabase/seed.sql) to populate verified Philippine pet food products and Metro Manila veterinary clinics.

---

### 4. Running the Application

Animeal consists of an Express API backend and a Vite frontend client.

#### Option A: Running in Two Terminals (Recommended for Development)

**Terminal 1 — Backend Server:**
```bash
npm run server
```
*Starts the API on `http://localhost:3001`.*

**Terminal 2 — Frontend Client:**
```bash
npm run dev
```
*Starts the Vite dev server on `http://localhost:5173` (with hot reloading and `/api` proxying to port 3001).*

#### Option B: Single-Command Shortcut
```bash
npm run server & npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Starts Vite local development server with HMR (`http://localhost:5173`) |
| `npm run server` | Starts Express backend server on port 3001 |
| `npm run build` | Runs TypeScript check (`tsc -b`) and produces optimized production build in `dist/` |
| `npm run preview` | Locally serves the production `dist/` build |
| `npm run lint` | Runs ESLint across TypeScript and React code |
| `npm run test:ai` | Runs standalone Mealie AI test script |

---

## Project Structure

```
Animeal/
├── api/                    # Vercel serverless entrypoint
├── public/                 # Static public assets (logos, images, favicon)
├── server/
│   └── index.js            # Express API server (Gemini proxy, security, rate limiters)
├── src/
│   ├── assets/             # Bundled fonts and media
│   ├── components/
│   │   ├── ask-mealie/     # Mealie AI chat UI & fallback knowledge base
│   │   ├── food-library/   # Food comparison table and detail modals
│   │   ├── food-scanner/   # Packaging camera/upload scanner & nutrition cards
│   │   ├── home/           # Landing page sections (Hero, ToolShowcase, NearbyVets)
│   │   ├── layout/         # Shell layout, Navbar, Footer, FloatingMealieBubble
│   │   ├── meal-tracker/   # Calorie rings, meal logger modal, feeding timeline
│   │   ├── onboarding/     # New user interactive tour coachmarks
│   │   ├── pet-wellness/   # Water tracker, weight progression, household sync
│   │   ├── profile/        # Profile settings and help center modals
│   │   └── ui/             # Reusable UI primitives (buttons, badges, modals)
│   ├── context/            # Global AppContext and AuthContext
│   ├── data/               # Default fallback catalog (vets, foods, KB)
│   ├── lib/                # Supabase client singleton
│   ├── pages/              # Application views / routes
│   ├── routes/             # AppRoutes and ProtectedRoute guards
│   ├── services/           # API services (supabase-db, gemini, vet-proximity)
│   └── types/              # Centralized TypeScript definitions
├── supabase/
│   ├── README.md           # Database documentation
│   ├── schema.sql          # Full PostgreSQL schema, RLS policies, and storage
│   └── seed.sql            # Seed dataset for Philippine pet foods and clinics
├── .env.example            # Environment variable template
└── vite.config.ts          # Vite configuration with `/api` proxy
```

---

## Security & Architecture Highlights

- **Row Level Security (RLS):** Strict PostgreSQL policies ensure users can only read and write their own pet data, care schedules, and meal logs.
- **API Key Protection:** Gemini API calls are proxied through the Express backend to ensure private API keys are never exposed in client-side bundles.
- **Graceful Degradation:** Built-in offline fallback models and local caching allow the application to remain functional even under intermittent network connectivity.
- **Space & Memory Optimization:** Clean database normalization with `NUMERIC` constraints, check enums, and cascading deletes prevent database bloat.

---

## Medical Disclaimer

Animeal and Mealie AI provide evidence-grounded nutritional metrics and daily wellness suggestions for informational and educational purposes. They do not replace professional veterinary diagnostics, clinical examinations, or prescription dietary plans. For medical emergencies or suspected toxic ingestion, visit a licensed veterinary clinic immediately.

---

## License

Released under the [MIT License](LICENSE).
