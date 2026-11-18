# 🐾 AniMeal — Complete Project Documentation

> **AniMeal** is a comprehensive Filipino pet care web application that helps Pinoy pet owners manage nutrition, track wellness, discover nearby veterinary clinics, and get AI-powered guidance — all in one place.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Getting Started](#5-getting-started)
6. [Environment Configuration](#6-environment-configuration)
7. [Features](#7-features)
8. [Pages & Routing](#8-pages--routing)
9. [Authentication System](#9-authentication-system)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [External API Integrations](#12-external-api-integrations)
13. [State Management](#13-state-management)
14. [Services Layer](#14-services-layer)
15. [Key Algorithms](#15-key-algorithms)
16. [Data Files](#16-data-files)
17. [UI Component Library](#17-ui-component-library)
18. [Theming & Dark Mode](#18-theming--dark-mode)
19. [Security](#19-security)
20. [Deployment](#20-deployment)
21. [Contributing](#21-contributing)
22. [License](#22-license)

---

## 1. Project Overview

**AniMeal** (a portmanteau of "Animal" + "Meal") is a web-based platform designed specifically for Filipino pet owners. The application provides:

- **Smart Nutrition Tracking** — Log meals, calculate portions, and monitor calorie intake based on veterinary formulas.
- **AI-Powered Guidance** — Chat with "Mealie," an AI assistant powered by Google Gemini that speaks Taglish (Tagalog + English) and provides personalized pet nutrition and care advice.
- **Vet Finder** — Discover nearby veterinary clinics using real-time GPS and the OpenStreetMap API, with turn-by-turn Google Maps navigation.
- **Wellness Monitoring** — Track hydration, weight progression, and care schedules with household coordination.
- **Food Intelligence** — A curated library of Philippine pet food brands with nutritional data, plus an AI-powered food label scanner.

### Target Audience

Philippine pet owners, particularly those in urban areas, who want a modern, accessible tool to improve their pet's nutrition and overall health.

### Language & Localization

The UI uses **Taglish** — a natural blend of Tagalog and English commonly spoken in the Philippines. Placeholder text, labels, AI responses, and error messages incorporate Filipino expressions and hospitality (e.g., "Kamusta!", "Pasensya na", "petparent@animeal.ph").

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
| --- | --- | --- |
| React | 19.3+ | UI framework |
| TypeScript | 6.0+ | Type-safe development |
| Vite | 8.3+ | Build tool & dev server |
| Tailwind CSS | 4.3+ | Utility-first styling |
| React Router | 7.18+ | Client-side routing |
| Lucide React | 1.63+ | Icon library |
| shadcn/ui | 4.23+ | Pre-built accessible UI components |
| tw-animate-css | 1.4+ | CSS animation utilities |
| Geist Font | Variable | Primary sans-serif typeface |

### Backend

| Technology | Version | Purpose |
| --- | --- | --- |
| Express.js | 5.3+ | REST API server |
| Helmet | 8.3+ | Security headers |
| express-rate-limit | 8.7+ | Rate limiting |
| CORS | 2.8+ | Cross-origin policy enforcement |
| @google/genai | 2.32+ | Gemini AI SDK (server-side) |
| dotenv | 18.0+ | Environment variable management |

### Database & Auth

| Technology | Purpose |
| --- | --- |
| Supabase (PostgreSQL) | Cloud database with Row Level Security |
| Supabase Auth | Email/password, Google OAuth, session management |
| Supabase Storage | File/image uploads |

### External APIs

| Service | Purpose | Auth Required |
| --- | --- | --- |
| Google Gemini 3.8 Flash | AI chat & food label scanning | API key (server-side) |
| OpenStreetMap Nominatim | Geocoding & veterinary clinic search | No (free) |
| ipwho.is | IP-based geolocation fallback | No (free) |
| Google Maps | Turn-by-turn navigation links | No (URL-based) |
| DiceBear Avatars | Auto-generated user avatars | No (free) |

---

## 3. Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│  React 19 + TypeScript + Vite + Tailwind CSS                  │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  AppContext  │  │  AuthContext  │  │  ThemeContext         │  │
│  │ (Global     │  │ (Supabase    │  │ (Dark/Light Mode)    │  │
│  │  State)     │  │  Auth)       │  │                      │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                │                                     │
│  ┌──────┴────────────────┴─────────────────────────────────┐  │
│  │                    Services Layer                        │  │
│  │  supabase-auth │ supabase-db │ api │ vet-proximity      │  │
│  └─────────┬──────────┬─────────────┬──────────────────────┘  │
└────────────┼──────────┼─────────────┼────────────────────────┘
             │          │             │
    ┌────────▼────┐  ┌──▼──────────┐  ▼
    │  Supabase   │  │  Express    │  OpenStreetMap
    │  Cloud      │  │  Server     │  Nominatim API
    │  (Postgres  │  │  (port 3001)│
    │   + Auth)   │  │             │
    └─────────────┘  └──────┬──────┘
                            │
                    ┌───────▼───────┐
                    │  Google       │
                    │  Gemini AI    │
                    │  (3.8 Flash)  │
                    └───────────────┘
```

### Data Flow

1. **Authenticated users** → Supabase (primary) → Express backend (secondary fallback)
2. **Demo users** → Express backend → Local `server/data/db.json` file storage
3. **Offline mode** → `localStorage` with the `animeal-` prefix
4. **AI requests** → Vite dev proxy (`/api`) → Express server → Gemini API (key never exposed to browser)
5. **Vet searches** → Client-side → OpenStreetMap Nominatim (no server proxy needed)

---

## 4. Project Structure

```
Animeal/
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Template for environment setup
├── .gitignore                    # Git exclusion rules
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite + Tailwind + proxy config
├── tsconfig.json                 # TypeScript project references
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.node.json            # Node-specific TS config
├── components.json               # shadcn/ui configuration
│
├── server/
│   ├── index.js                  # Express API server (753 lines)
│   └── data/
│       └── db.json               # Local JSON file database (auto-created)
│
├── supabase/
│   ├── schema.sql                # Production database schema (11 tables)
│   ├── seed.sql                  # Seed data for initial setup
│   └── fix_and_update.sql        # Schema migration/update queries
│
├── src/
│   ├── main.tsx                  # React entry point with provider tree
│   ├── App.tsx                   # Root component (ThemeProvider + Routes)
│   ├── index.css                 # Tailwind setup + custom brand tokens
│   │
│   ├── assets/
│   │   └── fonts/                # Custom typefaces (TT Ramillas)
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client singleton
│   │   └── utils.ts              # shadcn/ui `cn()` utility
│   │
│   ├── types/
│   │   └── index.ts              # All TypeScript type definitions (227 lines)
│   │
│   ├── context/
│   │   ├── AuthContext.tsx        # Authentication state & methods
│   │   ├── AppContext.tsx         # Global app state (pets, feedings, tasks)
│   │   ├── ThemeContext.tsx       # Dark/light mode management
│   │   └── ToastContext.tsx       # Notification toast system
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx          # All route definitions
│   │   └── ProtectedRoute.tsx     # Auth guard component
│   │
│   ├── services/
│   │   ├── api.ts                 # Express backend API client
│   │   ├── supabase-auth.ts       # Supabase authentication operations
│   │   ├── supabase-db.ts         # Supabase database CRUD (816 lines)
│   │   ├── supabase-storage.ts    # Supabase file storage
│   │   ├── gemini.ts              # Gemini AI client (browser fallback)
│   │   └── vet-proximity.ts       # GPS, Haversine, geocoding, live vet search
│   │
│   ├── utils/
│   │   ├── calories.ts            # RER/MER calorie formulas
│   │   ├── formatters.ts          # Date, time, currency, weight formatters
│   │   └── storage.ts             # localStorage helper with prefix
│   │
│   ├── data/
│   │   ├── foods.ts               # Philippine pet food catalog (414 lines)
│   │   ├── vets.ts                # Fallback vet clinic directory
│   │   ├── breeds.ts              # Dog & cat breed lists (Aspin, Puspin, etc.)
│   │   ├── features.ts            # Landing page feature card data
│   │   └── mealie-kb.ts           # Mealie AI knowledge base
│   │
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page (Hero + features + vets)
│   │   ├── LoginPage.tsx          # Auth page (sign in/up, Google, demo)
│   │   ├── MealTrackerPage.tsx    # Meal logging & calorie dashboard
│   │   ├── FoodLibraryPage.tsx    # Pet food catalog browser
│   │   ├── FoodScannerPage.tsx    # AI food label scanner
│   │   ├── PetWellnessPage.tsx    # Hydration, weight, care schedule
│   │   ├── AskMealiePage.tsx      # AI chat assistant
│   │   ├── CareSchedulePage.tsx   # Care task management
│   │   ├── HouseholdPage.tsx      # Shared household roster
│   │   └── NotFoundPage.tsx       # 404 error page
│   │
│   └── components/
│       ├── home/                  # Landing page sections
│       │   ├── Hero.tsx
│       │   ├── TrustStrip.tsx
│       │   ├── FeatureCards.tsx
│       │   ├── HowItWorks.tsx
│       │   ├── NearbyVets.tsx     # GPS-powered vet finder (~750 lines)
│       │   └── MealiePreview.tsx
│       │
│       ├── layout/
│       │   ├── Layout.tsx         # App shell (Navbar + Outlet + Footer)
│       │   ├── Navbar.tsx         # Top navigation bar
│       │   ├── Footer.tsx         # Site footer
│       │   └── ScrollToHash.tsx   # Smooth scroll to #anchors
│       │
│       ├── meal-tracker/
│       │   ├── CalorieDashboard.tsx
│       │   ├── EditPetModal.tsx
│       │   ├── FeedModal.tsx
│       │   ├── FeedingHistory.tsx
│       │   ├── PetOnboardingModal.tsx
│       │   ├── PetSwitcher.tsx
│       │   ├── PlateVisualization.tsx
│       │   └── QuickReminders.tsx
│       │
│       ├── food-library/
│       │   ├── FoodCard.tsx
│       │   ├── FoodCompareModal.tsx
│       │   ├── FoodDetailModal.tsx
│       │   ├── FoodFilterBar.tsx
│       │   ├── AddCustomFoodModal.tsx
│       │   └── QuickLogModal.tsx
│       │
│       ├── food-scanner/
│       │   ├── ScannerUpload.tsx
│       │   ├── ScanningAnimation.tsx
│       │   ├── ExtractedDataEditor.tsx
│       │   ├── VerdictCard.tsx
│       │   └── AlternativeSuggestions.tsx
│       │
│       ├── pet-wellness/
│       │   ├── WaterTracker.tsx
│       │   ├── WeightTracker.tsx
│       │   ├── CareSchedule.tsx
│       │   ├── SharedHousehold.tsx
│       │   ├── AddTaskModal.tsx
│       │   ├── LogWeightModal.tsx
│       │   └── taskConfigs.ts
│       │
│       ├── ask-mealie/
│       │   ├── ChatHeader.tsx
│       │   ├── ChatInput.tsx
│       │   ├── MessageBubble.tsx
│       │   ├── QuickChips.tsx
│       │   ├── TypingIndicator.tsx
│       │   ├── VeterinaryDisclaimerBanner.tsx
│       │   └── mealie-assistant.ts
│       │
│       ├── profile/
│       │   ├── ProfileModal.tsx
│       │   ├── SettingsModal.tsx
│       │   └── HelpCenterModal.tsx
│       │
│       └── ui/                    # shadcn/ui components
│           ├── avatar.tsx
│           ├── badge.tsx
│           ├── button.tsx
│           ├── dialog.tsx
│           ├── dropdown-menu.tsx
│           ├── progress.tsx
│           ├── separator.tsx
│           ├── tabs.tsx
│           ├── tooltip.tsx
│           ├── Card.tsx
│           ├── PhoneFrame.tsx
│           └── SectionHeading.tsx
```

---

## 5. Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS version, v20+)
- npm (bundled with Node.js)
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/aleckxareign/Animeal.git
cd Animeal

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env

# 4. Fill in your real credentials in .env
#    (See Environment Configuration section below)
```

### Running the Application

The app requires **two processes** running simultaneously:

```bash
# Terminal 1: Start the Vite development server (frontend)
npm run dev
# → Opens at http://localhost:5173

# Terminal 2: Start the Express API server (backend)
npm run server
# → Runs at http://localhost:3001
```

The Vite dev server automatically proxies all `/api/*` requests to the Express server on port 3001.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with hot reload (port 5173) |
| `npm run server` | Start Express backend API (port 3001) |
| `npm run build` | Type-check with `tsc -b` and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run test:ai` | Run Mealie AI integration test |

### Database Setup

1. Create a new project on [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor → New Query**
3. Paste the contents of `supabase/schema.sql` and run it
4. Optionally run `supabase/seed.sql` for sample data
5. Copy your project URL and anon key into `.env`

---

## 6. Environment Configuration

The application uses a `.env` file at the project root. Copy `.env.example` to `.env` and configure:

```bash
# ─── Supabase Cloud Configuration ───
# Dashboard → Project Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ─── Gemini AI Configuration ───
# Server-side key (NEVER exposed to browser)
# Get from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ⚠️ SECURITY: Leave blank in production — the Express proxy handles AI calls
VITE_GEMINI_API_KEY=

# ─── Express Server ───
PORT=3001

# ─── Production CORS ───
FRONTEND_URL=https://your-domain.vercel.app

# ─── Environment ───
NODE_ENV=development
```

> **⚠️ IMPORTANT:** The `.env` file is gitignored and must NEVER be committed. Variables prefixed with `VITE_` are embedded in the browser bundle — only use them for public keys. The `GEMINI_API_KEY` (without `VITE_` prefix) stays server-side only.

### Offline / Demo Mode

If Supabase credentials are not configured (or set to placeholder values), the app automatically runs in **offline mode**:
- Authentication uses a demo user profile stored in `localStorage`
- Data is persisted to the Express backend's `server/data/db.json` file
- All features remain functional except Google OAuth

---

## 7. Features

### 7.1 Meal Tracker

**Route:** `/meal-tracker`

A comprehensive pet feeding dashboard that tracks daily nutrition.

- **Pet Profiles** — Create and manage multiple pets (dogs & cats) with breed, weight, age, neutered status, and life stage
- **Calorie Dashboard** — Visual progress ring showing consumed vs. target calories, calculated via veterinary RER/MER formulas
- **Feeding Log** — Log meals with food selection from the built-in library, portion size, unit conversion (grams, scoops, cans, cups, tablespoons), and automatic calorie/macronutrient calculation
- **Plate Visualization** — Visual representation of the day's meals
- **Pet Switcher** — Quick-switch between multiple pet profiles
- **Undo Feeding** — Soft-delete capability for mistakenly logged meals
- **Quick Reminders** — Contextual feeding reminders based on schedule

**Key Components:** `CalorieDashboard`, `FeedModal`, `FeedingHistory`, `PetOnboardingModal`, `PetSwitcher`, `PlateVisualization`, `EditPetModal`, `QuickReminders`

### 7.2 Food Library

**Route:** `/food-library`

A curated catalog of pet foods available in the Philippines.

- **Searchable Catalog** — Browse 20+ pre-loaded Philippine pet food products (Pedigree, Royal Canin, Aozi, Vitality, Special Cat, etc.)
- **Filter & Sort** — Filter by species, category (dry/wet/treat/raw/homemade), life stage, and brand
- **Nutritional Details** — View calories, protein, fat, fiber, moisture, serving size, and price per package
- **Food Comparison** — Side-by-side comparison of two food products
- **Price per Calorie** — Value comparison metric (₱/kcal)
- **Custom Foods** — Add user-defined food entries with manual nutritional data
- **Quick Log** — One-tap meal logging directly from the food card

**Key Components:** `FoodCard`, `FoodDetailModal`, `FoodCompareModal`, `FoodFilterBar`, `AddCustomFoodModal`, `QuickLogModal`

### 7.3 Food Scanner

**Route:** `/food-scanner`

AI-powered pet food label analysis using Google Gemini multimodal capabilities.

- **Photo Upload** — Upload or capture a photo of pet food packaging
- **AI Analysis** — Gemini 3.8 Flash extracts brand, product name, guaranteed analysis (protein, fat, fiber, moisture), calories, package weight, and price
- **Safety Verdict** — AI-assessed suitability rating (safe / caution / unsafe) with Taglish advisory notes
- **Confidence Score** — AI confidence level (high / medium / low)
- **Data Editor** — Manually correct or adjust extracted values before saving
- **Alternative Suggestions** — Recommendations for similar or better products

**Key Components:** `ScannerUpload`, `ScanningAnimation`, `ExtractedDataEditor`, `VerdictCard`, `AlternativeSuggestions`

### 7.4 Pet Wellness

**Route:** `/pet-wellness`

Comprehensive health and wellness tracking dashboard.

- **Water Tracker** — Log daily water intake with a visual progress indicator; goal calculated at ~50 ml/kg body weight
- **Weight Tracker** — Record weight measurements over time with a progression chart; automatically recalculates calorie targets when weight changes
- **Care Schedule** — Manage recurring care tasks (feeding, medication, grooming, exercise, vaccinations, vet appointments, deworming)
- **Task Snooze** — Temporarily postpone tasks
- **Shared Household** — Coordinate care responsibilities among family members

**Key Components:** `WaterTracker`, `WeightTracker`, `CareSchedule`, `SharedHousehold`, `AddTaskModal`, `LogWeightModal`

### 7.5 Ask Mealie (AI Chat)

**Route:** `/ask-mealie`

An AI-powered pet nutrition and care assistant.

- **Conversational AI** — Powered by Google Gemini 3.8 Flash with a custom Taglish system prompt
- **Pet-Aware Responses** — Automatically includes the active pet's profile (name, species, breed, weight, calorie targets) in AI context
- **Toxic Substance Detection** — Instant emergency alerts for dangerous items (chocolate, onions, grapes, xylitol, paracetamol, etc.)
- **Quick Action Chips** — Pre-built questions for common queries
- **Actionable Links** — AI responses include navigation links to relevant app sections
- **Emergency Hotline** — PAWS Emergency line: (02) 8475-1688
- **Fallback Engine** — Local rule-based responses when Gemini API is unavailable
- **Chat History** — Maintained per session with multi-turn context

**Key Components:** `ChatHeader`, `ChatInput`, `MessageBubble`, `QuickChips`, `TypingIndicator`, `VeterinaryDisclaimerBanner`, `mealie-assistant.ts`

### 7.6 Nearest Vet Finder

**Route:** `/#nearby-vets` (section on Home page)

GPS-powered veterinary clinic discovery and navigation.

- **One-Tap GPS Activation** — Requests browser geolocation permission with graceful error handling
- **Live Clinic Discovery** — Fetches real veterinary clinics from OpenStreetMap Nominatim API based on user's coordinates
- **Proximity Sorting** — Clinics ranked by great-circle distance using the Haversine formula
- **Nearest Clinic Highlight** — Visual badge identifying the closest clinic with exact distance
- **Emergency Filter** — One-click filter for 24/7 emergency clinics and hospitals
- **Open Status** — Real-time open/closed status indicators with operating hours
- **City Search** — Manual location search with geocoding for users without GPS
- **City Dropdown** — Quick selection for major Philippine cities
- **Turn-by-Turn Navigation** — Google Maps directions from user's location to selected clinic
- **Interactive Map** — Visual clinic distribution on a stylized map
- **Call Direct** — One-tap phone call to clinic hotline
- **IP Fallback** — Approximate location via ipwho.is when GPS is unavailable

**Clinic Information Displayed:**
- Clinic name, address, city/municipality
- Contact phone number
- Operating hours
- Services provided (Surgery, Vaccination, Dental, Emergency, ICU, X-Ray, etc.)
- 24/7 emergency availability
- Precise GPS coordinates
- Calculated distance from user
- Verification status

**Key Components:** `NearbyVets.tsx` (~750 lines)

**Key Service:** `vet-proximity.ts` (322 lines)

### 7.7 Care Schedule

**Route:** `/care-schedule`

Dedicated page for managing pet care tasks.

- **Task Types** — Feeding, water, medication, grooming, exercise, weight-check, vaccination, vet-appointment, deworming
- **Frequency Options** — Once, daily, weekly, monthly
- **Completion Tracking** — Mark tasks complete with attribution (who completed it)
- **Snooze** — Postpone tasks to a future date

### 7.8 Household Management

**Route:** `/household`

Multi-person pet care coordination.

- **Household Roster** — Add family members with color-coded identifiers
- **Owner Designation** — Prevent removal of the primary owner
- **Task Assignment** — Assign care tasks to specific household members
- **Feeding Attribution** — Track who fed the pet for each meal

### 7.9 Landing Page

**Route:** `/` (redirects to `/login` if unauthenticated)

The home page for authenticated users, composed of six sections:

1. **Hero** — Brand introduction with call-to-action
2. **Trust Strip** — Platform credibility indicators
3. **Feature Cards** — Interactive cards for each major feature
4. **How It Works** — Step-by-step guide to getting started
5. **Nearby Vets** — The GPS-powered vet finder section
6. **Mealie Preview** — Live chat preview in a phone frame mockup

### 7.10 Login Page

**Route:** `/login`

Full-featured authentication page with:

- **Sign In / Sign Up Toggle** — Tab-based switching between login and registration
- **Email & Password** — Standard credentials with validation
- **Google OAuth** — One-click sign-in/up via Google
- **Demo Access** — Instant demo login without creating an account
- **Forgot Password** — Password reset modal (via Supabase)
- **Remember Me** — Persistent session checkbox
- **Dark/Light Mode Toggle** — Theme switcher directly on the login page
- **Brand Panel** — Left-side brand showcase with logo, tagline, and feature highlights

---

## 8. Pages & Routing

### Route Definitions

| Path | Access | Page Component | Description |
| --- | --- | --- | --- |
| `/` | Auth required | `HomePage` | Dashboard with all home sections |
| `/login` | Public only | `LoginPage` | Authentication (redirects if already logged in) |
| `/home` | — | Redirect → `/` | Alias |
| `/welcome` | Public | `HomePage` | Welcome view |
| `/meal-tracker` | Auth required | `MealTrackerPage` | Nutrition tracking |
| `/food-library` | Auth required | `FoodLibraryPage` | Food catalog |
| `/food-scanner` | Auth required | `FoodScannerPage` | AI label scanner |
| `/pet-wellness` | Auth required | `PetWellnessPage` | Health tracking |
| `/care-schedule` | Auth required | `CareSchedulePage` | Task management |
| `/household` | Auth required | `HouseholdPage` | Family coordination |
| `/ask-mealie` | Auth required | `AskMealiePage` | AI chat assistant |
| `*` | Public | `NotFoundPage` | 404 error |

### Route Protection

Protected routes use the `ProtectedRoute` component, which:

1. Shows a loading spinner while auth state initializes
2. Redirects unauthenticated users to `/login` with the original path preserved in `state.from`
3. Renders the nested `<Outlet />` for authenticated users

### Provider Tree

The application wraps components in a nested provider hierarchy:

```
StrictMode
  └─ BrowserRouter
       └─ AuthProvider         ← Supabase auth state
            └─ AppProvider     ← Global app state (pets, feedings, etc.)
                 └─ ToastProvider  ← Notification system
                      └─ ThemeProvider ← Dark/light mode
                           └─ TooltipProvider ← UI tooltips
                                └─ AppRoutes
```

---

## 9. Authentication System

### Architecture

Authentication is handled through a **dual-mode** system:

1. **Supabase Auth** (primary) — Full authentication with email/password, Google OAuth, session management, and JWT tokens
2. **Demo Mode** (fallback) — `localStorage`-based session for development and quick demos

### Auth Flow

```
User Action → AuthContext → supabaseAuth service → Supabase Cloud
                                                  ↓
                                            Session + JWT
                                                  ↓
                            AuthContext state update → re-render protected routes
```

### Supported Methods

| Method | Implementation |
| --- | --- |
| **Email/Password Sign Up** | `supabase.auth.signUp()` with user metadata (full_name, avatar_url) |
| **Email/Password Sign In** | `supabase.auth.signInWithPassword()` |
| **Google OAuth** | `supabase.auth.signInWithOAuth({ provider: 'google' })` with offline access |
| **Demo Login** | Sets `animeal-demo-session` and `animeal-logged-in` in localStorage |
| **Sign Out** | Clears Supabase session + localStorage flags |
| **Session Restoration** | `supabase.auth.getSession()` on app initialization |
| **Auth State Listener** | `supabase.auth.onAuthStateChange()` for token refresh and state sync |

### Profile Management

When a new user signs up via Supabase Auth, a PostgreSQL trigger (`on_auth_user_created`) automatically creates a row in `public.profiles` with:
- `id` (matches `auth.users.id`)
- `email`
- `full_name` (from user metadata or email prefix)
- `avatar_url` (DiceBear-generated avatar)

### Demo User

When Supabase is not configured or the user chooses demo access:

```typescript
const DEMO_USER: AuthUser = {
  id: 'demo-user-id',
  email: 'petparent@animeal.ph',
  fullName: 'Pinoy Pet Parent',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AniMealOwner',
}
```

---

## 10. Database Schema

The Supabase PostgreSQL database contains **11 tables** with Row Level Security (RLS) enabled on all tables.

### Tables Overview

| # | Table | Purpose | RLS Policy |
| --- | --- | --- | --- |
| 1 | `profiles` | User profiles (extends `auth.users`) | Own data only |
| 2 | `pets` | Pet profiles | Own data only |
| 3 | `feeding_logs` | Meal/feeding entries | Own data only |
| 4 | `foods` | Pet food catalog (verified + custom) | Verified = public; custom = own |
| 5 | `care_tasks` | Wellness & care schedule tasks | Own data only |
| 6 | `hydration_logs` | Daily water intake | Own data only |
| 7 | `weight_logs` | Weight progression | Own data only |
| 8 | `household_members` | Shared household roster | Own data only |
| 9 | `chat_conversations` | AI chat history (JSONB messages) | Own data only |
| 10 | `vets` | Veterinary clinics directory | Globally readable |

### Key Table Schemas

#### `pets`

```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT NOT NULL DEFAULT 'Aspin',
  weight_kg NUMERIC(5, 2) NOT NULL,
  age_years NUMERIC(4, 1) NOT NULL,
  neutered BOOLEAN NOT NULL DEFAULT false,
  life_stage TEXT NOT NULL CHECK (life_stage IN ('puppy', 'kitten', 'adult', 'senior')),
  avatar_emoji TEXT DEFAULT '🐾',
  daily_rer_target NUMERIC(7, 2) NOT NULL,
  water_goal_ml NUMERIC(7, 2) NOT NULL DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `feeding_logs`

```sql
CREATE TABLE public.feeding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT,
  food_name TEXT NOT NULL,
  brand TEXT,
  portion_g NUMERIC(6, 2) NOT NULL,
  portion_unit TEXT DEFAULT 'g',
  calories_consumed NUMERIC(6, 2) NOT NULL,
  protein_g NUMERIC(6, 2) DEFAULT 0,
  fat_g NUMERIC(6, 2) DEFAULT 0,
  fiber_g NUMERIC(6, 2) DEFAULT 0,
  fed_by_name TEXT DEFAULT 'Owner',
  fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `vets`

```sql
CREATE TABLE public.vets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  distance TEXT DEFAULT '2.0 km',
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  emergency BOOLEAN DEFAULT false,
  open_now BOOLEAN DEFAULT true,
  hours TEXT DEFAULT '8:00 AM – 8:00 PM',
  services TEXT[] DEFAULT '{"General Checkup", "Vaccination"}',
  rating NUMERIC(3, 1) DEFAULT 4.8,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security Policies

All tables enforce RLS. Key policies:

- **User-scoped data** (`pets`, `feeding_logs`, `care_tasks`, `hydration_logs`, `weight_logs`, `household_members`, `chat_conversations`): Users can only SELECT, INSERT, UPDATE, DELETE their own rows (`auth.uid() = user_id`)
- **Food catalog**: Verified foods (`verified = true`) are globally readable; custom foods are user-scoped
- **Vet directory**: Globally readable by anyone (`FOR SELECT USING (true)`)
- **Profiles**: Users can view, insert, and update only their own profile (`auth.uid() = id`)

### Auto-Trigger

A PostgreSQL trigger `on_auth_user_created` fires after every new user insertion in `auth.users` and automatically creates a corresponding `public.profiles` row.

---

## 11. API Endpoints

The Express server (`server/index.js`) exposes the following REST API on port 3001.

### General

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Server info HTML page |
| `GET` | `/api/health` | Health check (`{ status: 'ok', version: '1.0.0' }`) |

### Pets

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/pets` | List all pets |
| `POST` | `/api/pets` | Create a new pet (auto-calculates calorie targets) |
| `PUT` | `/api/pets/:id` | Update a pet (recalculates targets if weight changes) |
| `DELETE` | `/api/pets/:id` | Delete pet and all associated logs |

### Feeding & Nutrition

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/feedings` | List feedings (optional `petId` and `todayOnly` query params) |
| `POST` | `/api/feedings` | Log a new feeding entry |
| `POST` | `/api/feedings/:id/undo` | Soft-delete a feeding entry |

### Wellness

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/wellness/water/:petId` | Get water logs + today's total |
| `POST` | `/api/wellness/water` | Log water intake |
| `GET` | `/api/wellness/weight/:petId` | Get weight history (sorted by date) |
| `POST` | `/api/wellness/weight` | Log a weight measurement |

### Care Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | List tasks (optional `petId` query param) |
| `POST` | `/api/tasks` | Create a new care task |
| `PUT` | `/api/tasks/:id/complete` | Mark a task as completed |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Household

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/household` | List household members |
| `POST` | `/api/household` | Add a household member |

### AI Chat (Gemini Proxy)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/mealie/chat` | Rule-based chat engine (no API key needed) |
| `POST` | `/api/ai/chat` | Gemini AI chat proxy (server-side key protection) |
| `POST` | `/api/ai/scan` | Gemini multimodal food label scanner |

### Rate Limiting

| Scope | Window | Max Requests |
| --- | --- | --- |
| General (`/api/*`) | 15 minutes | 200 |
| AI endpoints (`/api/ai/*`) | 15 minutes | 30 |

---

## 12. External API Integrations

### 12.1 Google Gemini 3.8 Flash

**Purpose:** AI chat assistant and food label scanner.

**Model:** `gemini-3.8-flash`

**Endpoints proxied through Express server:**

- `/api/ai/chat` — Multi-turn conversational AI with custom Mealie system prompt
- `/api/ai/scan` — Multimodal image analysis for pet food label extraction (returns structured JSON)

**System Prompt Features:**
- Responds in Taglish (Tagalog + English)
- Includes active pet profile context (name, species, breed, weight, age)
- Enforces critical safety guardrails (toxic substances, emergency protocols)
- References PAWS Emergency hotline: (02) 8475-1688
- Never prescribes drug dosages

**Configuration:**
- Temperature: 0.7
- Top-P: 0.9
- Max output tokens: 1024

### 12.2 OpenStreetMap Nominatim

**Purpose:** Geocoding, reverse geocoding, and veterinary clinic discovery.

**Endpoints used:**

| Endpoint | Purpose |
| --- | --- |
| `/search?amenity=veterinary&bounded=1&viewbox=...` | Find vet clinics within a geographic bounding box |
| `/search?q=...&countrycodes=ph` | Forward geocode a city/location name |
| `/reverse?lat=...&lon=...` | Reverse geocode GPS coordinates to a city name |

**Key details:**
- Free, no API key required
- Rate limit: 1 request/second (built-in via user agent identification)
- User-Agent header: `AniMeal-Pet-Care-App/1.0`
- Results filtered to Philippines (`countrycodes=ph`)
- Bounded search uses a calculated viewbox from radius (default 25 km)

### 12.3 ipwho.is

**Purpose:** IP-based geolocation fallback when GPS is unavailable.

**Endpoint:** `https://ipwho.is/`

**Returns:** Approximate latitude, longitude, city, and region.

### 12.4 Google Maps (URL-based)

**Purpose:** Turn-by-turn driving navigation to veterinary clinics.

**URL format:**
```
https://www.google.com/maps/dir/?api=1
  &origin={userLat},{userLon}
  &destination={vetLat},{vetLon}
  &travelmode=driving
```

No API key required — opens in the user's browser or Google Maps app.

---

## 13. State Management

### Context-Based Architecture

The app uses React Context for state management with four providers:

#### AuthContext (`src/context/AuthContext.tsx`)

Manages authentication state and provides methods:

| Property | Type | Description |
| --- | --- | --- |
| `isLoggedIn` | `boolean` | Whether a user is authenticated |
| `user` | `AuthUser | null` | Current user profile |
| `rawUser` | `User | null` | Raw Supabase user object |
| `session` | `Session | null` | Active Supabase session |
| `loading` | `boolean` | Auth initialization state |
| `signIn()` | Function | Email/password sign in |
| `signUp()` | Function | Email/password registration |
| `signInWithGoogle()` | Function | Google OAuth flow |
| `demoLogin()` | Function | Instant demo access |
| `logout()` | Function | Sign out and clear state |
| `updateProfile()` | Function | Update user name/avatar |

#### AppContext (`src/context/AppContext.tsx`)

The central state manager (744 lines) handling all domain data:

**State Shape:**
```typescript
type AppState = {
  pets: Pet[]
  activePetId: string | null
  feedingLog: FeedingEntry[]
  waterLogs: WaterLog[]
  weightLogs: WeightLog[]
  tasks: ScheduleTask[]
  household: HouseholdMember[]
  customFoods: FoodItem[]
}
```

**Data Sync Strategy:**
1. **Load** from `localStorage` on mount (instant)
2. **Sync** with Supabase (if authenticated with a real account)
3. **Fallback** to Express backend (for demo users)
4. **Persist** every state change to `localStorage` (offline resilience)

**Dual-Write Pattern:** Every mutation writes to both the local state and the remote backend (Supabase or Express), using optimistic updates with server-side ID reconciliation.

#### ThemeContext (`src/context/ThemeContext.tsx`)

Manages dark/light mode:
- Initializes from `localStorage` (`animeal-theme`) or system preference (`prefers-color-scheme`)
- Toggles `dark` class on `document.documentElement`
- Persists preference to `localStorage`

#### ToastContext (`src/context/ToastContext.tsx`)

Global notification system:
- Color-coded toasts: success (sage), error (alert), warning (amber), info (dark)
- Auto-dismiss after 3 seconds
- Positioned at bottom-right
- Manual dismiss with ✕ button

---

## 14. Services Layer

### `api.ts` — Express Backend Client

A typed HTTP client for the Express backend API. Uses a generic `request<T>()` function with automatic JSON parsing and error handling. All endpoints are accessed via `/api/*` which Vite proxies to `localhost:3001`.

### `supabase-auth.ts` — Authentication Service

Wraps Supabase Auth operations with graceful fallbacks when Supabase is not configured. Methods include `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getSession`, `getUser`, `onAuthStateChange`, and `getProfile`.

### `supabase-db.ts` — Database Service (816 lines)

Comprehensive type-safe database service that maps between PostgreSQL `snake_case` columns and TypeScript `camelCase` properties. Covers all 10 database tables with full CRUD operations.

### `vet-proximity.ts` — GPS & Proximity Engine

Core geospatial service providing:

| Function | Purpose |
| --- | --- |
| `calculateDistanceKm()` | Haversine formula for great-circle distance |
| `formatDistanceString()` | Human-readable distance ("450 m", "1.2 km") |
| `getGoogleMapsRoutingUrl()` | Google Maps navigation URL builder |
| `reverseGeocodeCoords()` | GPS coordinates → city/district name |
| `geocodeLocationName()` | City/location name → GPS coordinates |
| `fetchLiveNearbyVetsFromApi()` | Live OpenStreetMap veterinary clinic search |
| `fetchClinicsInArea()` | Search clinics by area name |

### `gemini.ts` — AI Client (Browser Fallback)

Direct Gemini client for development when the Express server is offline. Uses `VITE_GEMINI_API_KEY` (should be empty in production).

### `supabase-storage.ts` — File Storage

Handles file uploads to Supabase Storage buckets.

---

## 15. Key Algorithms

### 15.1 Calorie Calculation (RER/MER)

Based on standard veterinary nutritional science formulas:

**Resting Energy Requirement (RER):**

$$\text{RER} = 70 \times W^{0.75}$$

where $W$ is body weight in kilograms.

**Maintenance Energy Requirement (MER):**

$$\text{MER} = \text{RER} \times M$$

where $M$ is the life-stage multiplier:

| Species | Life Stage | Neutered | Multiplier |
| --- | --- | --- | --- |
| Dog | Puppy | — | 2.0 |
| Dog | Adult | Yes | 1.6 |
| Dog | Adult | No | 1.8 |
| Dog | Senior | — | 1.4 |
| Cat | Kitten | — | 2.5 |
| Cat | Adult | Yes | 1.2 |
| Cat | Adult | No | 1.4 |
| Cat | Senior | — | 1.1 |

**Water Goal:** ~50 ml per kg body weight per day.

### 15.2 Haversine Distance Formula

Used to calculate the shortest distance between two GPS coordinates on Earth's surface:

$$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

where:
- $R = 6371$ km (Earth's mean radius)
- $\phi_1, \phi_2$ = latitudes in radians
- $\Delta\phi$ = difference in latitudes
- $\Delta\lambda$ = difference in longitudes

### 15.3 Bounding Box Calculation

For proximity searches, a geographic bounding box is calculated from coordinates and radius:

```
deltaLat = radius_km / 111
deltaLon = radius_km / (111 × cos(latitude))
```

This creates a rectangular search area passed to the Nominatim API's `viewbox` parameter.

### 15.4 Portion-to-Calorie Conversion

Food portion sizes support multiple units, each converted to grams before calorie calculation:

| Unit | Conversion to Grams |
| --- | --- |
| `g` (gram) | Direct |
| `scoop` | × 30g |
| `can` | × food's serving size |
| `cup` | × 120g |
| `tbsp` (tablespoon) | × 15g |
| `piece` | × 10g |

$$\text{Calories} = \frac{\text{caloriesPer100g} \times \text{portionGrams}}{100}$$

---

## 16. Data Files

### `foods.ts` — Philippine Pet Food Catalog

Contains **20+ pre-loaded pet food products** with verified nutritional data, including:

- **Dog foods:** Pedigree (Adult, Puppy), Royal Canin (Medium Adult), Aozi (Organic), Vitality, Bow Wow
- **Cat foods:** Special Cat, Meow Mix, Royal Canin (Indoor), Vitality
- **Treats:** Pedigree DentaStix, Temptations
- **Wet food:** Fancy Feast, Pedigree Wet

Each entry includes: brand, species, category, life stage suitability, calories/100g, protein%, fat%, fiber%, moisture%, serving size, price (PHP), and package size.

### `breeds.ts` — Philippine Breed Lists

- **Dog breeds:** 23 breeds including Aspin (Asong Pinoy), Golden Retriever, Shih Tzu, etc.
- **Cat breeds:** Includes Puspin (Pusang Pinoy), Persian, Siamese, etc.

### `vets.ts` — Fallback Vet Directory

Pre-loaded with 14+ clinics across Metro Manila (Quezon City, Makati, Mandaluyong, Taguig, Pasig, etc.) as fallback data when the live API is unavailable.

### `features.ts` — Landing Page Features

Feature card data for the landing page with icons, descriptions, and navigation links.

### `mealie-kb.ts` — AI Knowledge Base

Curated knowledge base for the Mealie AI assistant covering common pet nutrition questions, toxic substances, and Philippine-specific pet care advice.

---

## 17. UI Component Library

### shadcn/ui Components

The app uses shadcn/ui (v4) for accessible, customizable UI primitives:

| Component | Usage |
| --- | --- |
| `Avatar` | User profile images |
| `Badge` | Status indicators, tags |
| `Button` | Primary/secondary actions with variants |
| `Dialog` | Modal overlays (pet creation, food details, etc.) |
| `DropdownMenu` | Profile menu, options |
| `Progress` | Calorie and hydration progress bars |
| `Separator` | Visual dividers |
| `Tabs` | Login sign-in/sign-up toggle, wellness sections |
| `Tooltip` | Contextual help text |

### Custom Components

| Component | Purpose |
| --- | --- |
| `Card` | Content container with consistent styling |
| `PhoneFrame` | iPhone-style mockup frame (for MealiePreview) |
| `SectionHeading` | Consistent section headers with optional subtitles |

---

## 18. Theming & Dark Mode

### Brand Colors

The application uses a custom brand color palette defined in `src/index.css`:

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `brand-sage` | `#44632f` | — | Primary green |
| `brand-cream` | `#f6f3ec` | — | Background tint |
| `brand-dark` | `#164040` | — | Deep teal accents |
| `brand-alert` | `#b5432f` | — | Emergency/danger |

### Dark Mode Implementation

1. **ThemeContext** manages `'light' | 'dark'` state
2. **Initialization priority:** `localStorage` → system `prefers-color-scheme` → default `'light'`
3. **Toggle** adds/removes `dark` class on `<html>` element
4. **Persistence** via `localStorage` key `animeal-theme`
5. **Tailwind** dark variants (`dark:bg-gray-900`, `dark:text-white`, etc.) used throughout

### Typography

- **Primary font:** Geist (variable, via `@fontsource-variable/geist`)
- **Display font:** TT Ramillas (commercial, falls back to Georgia)
- **System fallback:** Inter, system-ui, sans-serif

---

## 19. Security

### API Key Protection

- **`GEMINI_API_KEY`** (no `VITE_` prefix) — Only accessible on the Express server; never included in browser bundles
- **`VITE_SUPABASE_ANON_KEY`** — Public "anon" key, safe for browser use (RLS enforces access control)
- **`VITE_GEMINI_API_KEY`** — Should be empty in production; only for local development fallback

### Server Security

The Express server implements defense-in-depth:

| Layer | Implementation |
| --- | --- |
| **Helmet** | Security headers (CSP, HSTS, X-Content-Type-Options, etc.) |
| **CORS** | Strict origin whitelist (localhost:5173, production URL) |
| **Rate Limiting** | 200 req/15min general, 30 req/15min for AI |
| **Input Sanitization** | HTML tag stripping, control character removal, length caps |
| **X-Powered-By** | Disabled to prevent fingerprinting |
| **Error Masking** | Production errors return generic messages (no stack traces) |
| **JSON Size Limit** | 10 MB max request body |
| **Image Upload Limit** | ~10 MB file size cap (14 MB base64) |
| **MIME Type Whitelist** | Only `image/jpeg`, `image/png`, `image/webp` accepted for scans |

### Database Security (Supabase RLS)

Row Level Security ensures:
- Users can only access their own data (pets, feedings, logs, tasks, household)
- Verified food entries are globally readable
- Vet directory is publicly accessible
- All policies use `auth.uid()` for identity verification

### Content Security Policy (Production)

```
default-src: 'self'
script-src:  'self'
style-src:   'self', 'unsafe-inline'
img-src:     'self', data:, https:
connect-src: 'self', https://*.supabase.co, https://generativelanguage.googleapis.com
font-src:    'self', https:, data:
object-src:  'none'
```

---

## 20. Deployment

### Production Build

```bash
# Build the frontend (type-check + Vite build)
npm run build
# Output: dist/
```

The build produces optimized static assets in the `dist/` directory.

### Vercel Deployment (Recommended)

1. Push the repository to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (your Vercel domain)
   - `NODE_ENV=production`
4. Configure the Express server as a Vercel serverless function or deploy separately (e.g., Railway, Render)

### Required Environment Variables for Production

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase publishable anon key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |
| `FRONTEND_URL` | Recommended | Production frontend URL for CORS |
| `NODE_ENV` | Recommended | Set to `production` |
| `PORT` | Optional | Express server port (default: 3001) |

---

## 21. Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `npm install`
4. Run both servers: `npm run dev` (Terminal 1) + `npm run server` (Terminal 2)
5. Make changes and verify:
   - `npm run lint` — Pass ESLint checks
   - `npm run build` — Pass TypeScript compilation and Vite build
6. Commit and push your branch
7. Open a pull request

### Code Style

- TypeScript strict mode
- ESLint with `typescript-eslint` and React Hooks plugin
- Tailwind CSS utility classes (no external CSS files beyond `index.css`)
- Component files use PascalCase (e.g., `MealTrackerPage.tsx`)
- Service files use kebab-case (e.g., `vet-proximity.ts`)
- Types defined centrally in `src/types/index.ts`

### Files NOT to Commit

The following are excluded via `.gitignore`:

- `.env` — Real credentials
- `node_modules/` — Dependencies
- `dist/` — Build output
- `server/data/db.json` — Local JSON database
- `AniMeal_Project_Overview.md` — This documentation file
- `AniMeal_Complete_Development_Prompt.md` — Development prompts
- `IMPLEMENTATION_PLAN.md` — Internal planning
- `PROPOSAL.md` — Project proposal

---

## 22. License

Released under the [MIT License](LICENSE).

> **Disclaimer:** AniMeal is an informational tool and does not replace professional veterinary advice. Always consult a licensed veterinarian for your pet's health needs.

---

*Documentation generated for AniMeal v0.0.0 • Built with 🐾 for Filipino pet parents*
