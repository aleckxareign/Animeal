# AniMeal — Project Proposal
### A Web-Based Pet Nutrition and Care Management Platform for Filipino Pet Owners

> **Project Name:** AniMeal  
> **Project Type:** Web Application (SPA + REST API)  
> **Target Users:** Filipino cat and dog owners  
> **AI Assistant:** Mealie  
> **Version:** 1.0  

---

## Table of Contents

1. [Introduction](#i-introduction)
   - [Overview of the Proposed Topic](#overview-of-the-proposed-topic)
   - [Background and Rationale](#background-and-rationale)
   - [Problem Statement](#problem-statement)
   - [Objectives](#objectives)
2. [System / Topic Description](#ii-system--topic-description)
   - [Description](#description)
   - [Purpose](#purpose)
   - [Main Concept](#main-concept)
   - [Intended Functionality](#intended-functionality)
3. [Technical Architecture](#iii-technical-architecture)
   - [Tech Stack](#tech-stack)
   - [System Architecture Overview](#system-architecture-overview)
   - [Data Flow](#data-flow)
   - [Security Architecture](#security-architecture)
4. [Scope and Limitations](#iv-scope-and-limitations)
5. [Significance of the Study](#v-significance-of-the-study)
6. [Scheduling System](#vi-scheduling-system)
7. [Scalability Roadmap](#vii-scalability-roadmap)

---

## I. Introduction

### Overview of the Proposed Topic

**AniMeal** is a web-based pet nutrition and care management platform designed specifically for Filipino pet parents who own cats and dogs. It consolidates feeding management, food analysis, health tracking, care scheduling, and veterinary clinic access into a single, easy-to-use platform — with Mealie, an AI-powered assistant, available at every step to answer questions and provide personalized guidance.

Pet ownership in the Philippines has seen significant growth in recent years. According to market research, the Philippine pet care market continues to expand as more households adopt companion animals. Despite this growth, however, reliable, accessible, and locally relevant tools for pet nutrition management remain scarce. The majority of pet owners still rely on advice from friends, social media posts, or the brief feeding guidelines printed on the back of a bag of kibble. AniMeal is designed to change this — replacing guesswork with clear, data-driven, and personally relevant care guidance.

---

### Background and Rationale

Proper nutrition is one of the most critical factors in a pet's long-term health and quality of life. For cats and dogs, dietary requirements vary significantly based on species, breed, age, weight, activity level, and reproductive status. A food portion that is correct for one dog may be dangerously insufficient — or excessively generous — for another. Despite this complexity, most commercially available pet food packaging offers only generic feeding guidelines that do not account for individual animal differences.

In the Philippine context, the challenge is compounded by:

- A fragmented market of local and imported pet food brands, each with varying nutritional profiles and price points.
- Limited veterinary literacy among first-time and casual pet owners, many of whom are unsure how to interpret guaranteed analysis labels.
- The prevalence of multi-member households where coordinating a pet's care among several family members is difficult without shared records.
- The absence of a centralized, Filipino-made platform that integrates nutrition tracking, health monitoring, AI assistance, and vet discovery in a single experience.

AniMeal addresses this gap by providing an integrated, intelligent, and culturally grounded platform that speaks to Filipino pet owners in their own language and context.

---

### Problem Statement

Many Filipino pet owners find it difficult to properly manage their pets' nutrition and daily care because the information and tools they need are either scattered, overly technical, or not tailored to their local situation. The specific problems this project addresses are:

1. **No clear feeding amount.** Owners often do not know how much their pet should eat each day. Feeding by estimation or habit can lead to chronic overfeeding, underfeeding, or nutritional imbalances that contribute to obesity, lethargy, and organ problems over time.

2. **Hard-to-read food labels.** Ingredient lists and guaranteed analysis panels use technical terminology (crude protein, crude fiber, ME/kg) that is unfamiliar to most consumers. It is difficult for ordinary pet owners to determine whether a product is nutritionally suitable for their specific pet.

3. **Hard-to-compare food options.** Prices and nutrition details of pet foods sold in Philippine stores and e-commerce platforms are spread across different sources, making it impractical for owners to compare value for money or nutritional quality without significant effort.

4. **Scattered health records.** Weight history, water intake logs, vaccination schedules, and care reminders are typically kept on paper, in chat messages, or only in memory — making them easy to lose, inconsistent, and inaccessible during veterinary visits.

5. **Difficulty coordinating care in multi-member households.** When several family members are responsible for a pet's care, meals can be missed or given twice because no one knows what has already been done. This lack of coordination is a common cause of overfeeding.

6. **Delays in finding a vet during emergencies.** When a pet falls ill or is injured, owners lose critical time searching for a nearby clinic that is open, accessible, and equipped to handle emergencies.

7. **Generic advice that is not personalized.** Online resources and community forums provide general answers that are rarely based on the pet's specific species, age, weight, breed, or health condition, limiting their practical value.

---

### Objectives

#### General Objective

To design and develop **AniMeal**, a user-friendly web platform that empowers Filipino pet parents to make better-informed decisions about their cats' and dogs' nutrition, health, and daily care through data-driven tools, AI assistance, and collaborative household features.

#### Specific Objectives

1. To allow users to create a pet profile and receive a personalized daily calorie target calculated from the pet's **Resting Energy Requirement (RER)** and **Maintenance Energy Requirement (MER)** using validated veterinary formulas.

2. To provide a **Meal Tracker** where users can log daily meals, portion sizes, and treat intake, and review a complete feeding history with automatic calorie computation.

3. To provide a **Pet Food Library** that lets users explore, search, and compare commercially available cat and dog foods sold in the Philippines, including nutritional profiles and retail prices in Philippine Pesos (PHP).

4. To provide an **AI Food Scanner** that processes uploaded or captured photos of pet food packaging and automatically extracts ingredient information, nutritional values, and a suitability assessment in plain language.

5. To provide a **Pet Wellness** section for tracking weight trends, daily hydration, health records, and care reminders, with visual progress charts and automated alerts for unusual changes.

6. To allow multiple family members in the same household to share a pet's profile and record feedings collaboratively, ensuring meals are never missed or given twice.

7. To provide a **Vet Finder** that lists nearby veterinary clinics with their address, contact number, directions, services, and emergency availability.

8. To provide **Mealie**, an AI assistant that answers common pet nutrition and care questions in natural Taglish, with safety guardrails for toxic food detection and emergency referrals.

9. To design a **responsive interface** that is intuitive, accessible, and usable across phones, tablets, and desktop computers.

---

## II. System / Topic Description

### Description

**AniMeal** is a full-stack web application built to help Filipino pet owners manage their cats' and dogs' nutrition, health, and daily care. The platform integrates eight core functional modules: pet profile management with calorie estimation, meal and nutrition tracking, an AI-powered food label scanner, a curated pet food library, a wellness and health monitor, a scheduling and reminder system, shared household coordination, and an AI pet nutrition assistant.

The platform is backed by a secure cloud database (Supabase PostgreSQL), real-time authentication, and an AI pipeline powered by the Google Gemini API — including multimodal vision capabilities for food packaging analysis. All features degrade gracefully to local storage when the network is unavailable, ensuring the app remains usable in low-connectivity conditions common in some areas of the Philippines.

---

### Purpose

AniMeal was developed to address the common and practical challenges faced by Filipino pet owners — particularly limited access to reliable, personalized, and locally relevant pet-care information. It is primarily designed for Filipino cat and dog owners, with a focus on first-time owners and those seeking to improve their existing care practices.

The system is a **decision-support tool** — it makes professional-grade nutritional information and health tracking accessible to everyday users. It is not intended to replace licensed veterinary care. Rather, it empowers owners with the data and guidance they need to maintain their pets' day-to-day health and to recognize when professional intervention is needed. Mealie, the AI assistant, is explicitly configured to recommend veterinary consultation for clinical symptoms and to refer users to emergency hotlines when urgent situations are detected.

---

### Main Concept

AniMeal operates as an intuitive, step-by-step system that connects pet data, food information, AI analysis, and family coordination into a single continuous care flow:

```
Pet Profile Setup
      ↓
Calorie & Nutrition Target (RER/MER calculation)
      ↓
Food Selection / AI Label Scanning
      ↓
Meal Logging & Calorie Tracking
      ↓
Real-Time Nutrition Dashboard
      ↓
Hydration & Weight Monitoring
      ↓
Care Scheduling & Reminders
      ↓
Household Coordination
      ↓
AI Assistant (Mealie) — available at every step
      ↓
Vet Finder — when professional help is needed
```

The core philosophy is that AniMeal does not simply tell a pet owner what to feed their pet. It guides them through the **entire care cycle** — planning, recording, monitoring, coordinating, and improving — with AI assistance woven throughout.

#### Step-by-Step Flow

**1. Profile Setup and Caloric Baseline**  
The process begins by registering a pet profile with biological metrics: species (cat or dog), breed, age, current weight, reproductive status (intact or neutered/spayed), and activity level. Using validated veterinary formulas, the platform calculates:

$$\text{RER (kcal/day)} = 70 \times (\text{body weight in kg})^{0.75}$$

$$\text{MER (kcal/day)} = \text{RER} \times \text{Life Stage Factor}$$

This establishes an accurate, individualized daily caloric threshold for each registered pet.

**2. Food Logging and AI Label Scanning**  
Users track daily meals by selecting items from the built-in Philippine pet food library or by uploading a packaging photo to the multimodal AI food scanner. The scanner uses Google Gemini Vision to automatically parse guaranteed analysis panels and extract crude protein, crude fat, crude fiber, moisture percentages, and estimated caloric density — presented in plain, understandable language.

**3. Real-Time Nutrition Tracking**  
Logged food entries are automatically compared against the pet's daily caloric target. The dashboard visualizes the remaining calorie allowance, tracks macronutrient ratios, monitors hydration levels, and plots weight change over time. Alerts notify caretakers of trends that may require attention.

**4. AI Assistance and Care Scheduling**  
Owners can consult Mealie at any time to ask dietary and care questions in natural Taglish. Mealie is contextually aware of the active pet's profile and enforces strict toxicity guardrails — immediately flagging dangerous foods and providing emergency veterinary references when needed. The scheduling module allows one-time and recurring task creation across all care categories.

**5. Collaborative Household Care**  
All care activities are synchronized in real time across household members, giving every caretaker instant visibility into what has already been completed — eliminating missed doses and accidental double-feeding.

---

### Intended Functionality

The platform provides **eight core functional modules**:

---

#### 🐾 1. Pet Profile & Calorie Target Calculator

- Create and manage multiple pet profiles for cats and dogs within a single account.
- Store essential health parameters: species, breed, name, life stage, reproductive status, current weight, and activity level.
- Automatically compute personalized daily calorie targets using standardized veterinary **RER** and **MER** formulas.
- Display a clear summary card for the active pet that is accessible from every section of the app.
- Support switching between multiple registered pets with a single tap.

---

#### 📷 2. AI Food Scanner (Multimodal)

- Allow users to upload or capture photos of pet food packaging, labels, and guaranteed analysis panels.
- Automatically extract crude protein percentage, crude fat percentage, crude fiber percentage, moisture percentage, and estimated caloric density using **Google Gemini Vision**.
- Output a suitability assessment: **Safe**, **Caution**, or **Unsafe** — with a plain-language explanation.
- Optionally upload the scanned image to cloud storage for future reference.
- Fall back to a guided manual-entry form if the image is unclear or the AI cannot extract data reliably.

---

#### 🤖 3. AI Pet Nutrition Assistant — Mealie

- Deliver conversational pet-care and dietary guidance in natural **Taglish** (mixed Tagalog and English).
- Dynamically use the active pet's profile (species, breed, age, weight) to give context-aware answers without requiring the user to repeat this information.
- Enforce strict **toxicity guardrails**: detect mentions of toxic foods for dogs (chocolate, grapes, raisins, onions, garlic, xylitol, macadamia nuts, alcohol, caffeine, cooked bones) and cats (all of the above plus lilies and raw fish), and provide immediate first-aid guidance and emergency referrals.
- Refer users to veterinarians for clinical symptoms and to the **Philippine Animal Welfare Society (PAWS) hotline — (02) 8475-1688** — for pet emergencies.
- Persist conversation history to the database so users can scroll back through previous interactions.
- Operate through a **three-tier fallback**: server-side Gemini proxy → client-side Gemini API → local rule-based engine.

---

#### 🍖 4. Feeding & Nutrition Tracker

- Record daily meals, portion sizes (grams or cups), and treats with automatic calorie computation.
- Display a live daily dashboard showing consumed calories, remaining allowance, and a macronutrient breakdown (protein, fat, fiber).
- Maintain a complete feeding history log with timestamps, portion sizes, and the name of the person who fed the pet.
- Support logging meals from either the food library or manually entered custom entries.

---

#### 🥫 5. Pet Food Library

- Index commercially available cat and dog food products sold locally in the Philippines, including dry, wet, and semi-moist formats.
- Display full nutritional profiles (protein, fat, fiber, moisture, caloric density), recommended serving sizes, and retail prices in **Philippine Pesos (PHP)**.
- Enable search and filter by brand, type, life stage, and price range.
- Allow side-by-side comparison of two or more products for informed purchasing decisions.
- Include a user-contributed section where owners can submit and share locally found products.

---

#### 💧 6. Wellness & Health Monitor

- Log periodic weight measurements over time and visualize trends in an interactive chart.
- Track daily water intake against a recommended hydration goal (calculated from body weight).
- Alert users when weight drops or spikes exceed normal thresholds, or when hydration is significantly below target on consecutive days.
- Maintain a health record timeline that serves as a reference during veterinary consultations.

---

#### 📅 7. Scheduling & Reminder System

- Support creation of one-time or recurring care tasks across all major care categories:
  - 🍗 Feeding · 💧 Water Refresh · 💊 Medication · ✂️ Grooming · 🏃 Exercise · ⚖️ Weight Check · 💉 Vaccination · 🏥 Vet Appointment
- Assign tasks to specific times and dates, with daily, weekly, monthly, or custom recurrence options.
- Allow task-completion toggling with timestamps, maintaining an organized care history.
- Display upcoming tasks in a consolidated daily schedule view.

---

#### 👨‍👩‍👧 8. Shared Household Management

- Invite family members or co-caretakers to share access to a pet's profile within a household group.
- Synchronize feeding logs and task completions in real time across all household members.
- Display a household activity feed showing who fed the pet, how much, and when — giving every caretaker immediate visibility into the pet's current status.
- Prevent duplicate feedings and missed medications through shared real-time records.

---

#### 🏥 Bonus: Nearest Vet Finder (GPS & Google Maps Proximity Engine)

- **Live Location Detection & Nearest Ranking:** Uses the browser Geolocation API and the mathematical **Haversine formula** to calculate the real-time distance (in km and meters) between the user's current GPS location and all nearby clinics.
- **Proximity-First Sorting:** Automatically sorts veterinary clinics with the closest facility ranked #1 at the top of the list, complete with a prominent "⭐ Nearest Clinic" badge.
- **Directory Information:** Displays clinic name, street address, municipality/city, direct telephone hotline, operating hours, emergency services, and current open/closed status.
- **One-Tap Google Maps Navigation:** Generates direct turn-by-turn routing URLs (`https://www.google.com/maps/dir/?api=1&origin=...&destination=...`) from the pet owner's exact GPS coordinates to the clinic entrance.
- **Filters & Verification:** Allows instant filtering by 24/7 emergency readiness and current operating hours, with search by clinic name or city. Supported by a Supabase PostgreSQL backend populated with Metro Manila veterinary hospitals and clinics.

---

## III. Technical Architecture

### Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 19 + TypeScript | Component-based, type-safe UI with strong ecosystem support and excellent performance |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with zero-runtime overhead; ideal for rapid, consistent UI development |
| **Build Tool** | Vite | Blazing-fast HMR and optimized production builds; native ESM support |
| **Backend** | Node.js + Express (TypeScript) | Lightweight REST API server for AI proxying, rate limiting, and fallback data |
| **Authentication** | Supabase Auth | Built-in JWT auth with email/password, OAuth, and session management |
| **Database** | Supabase PostgreSQL | Managed relational DB with Row Level Security (RLS) for per-user data isolation |
| **Storage** | Supabase Storage | Secure cloud storage for pet avatars and scanned food label images |
| **AI — Chat** | Google Gemini 3.8 Flash | Fast, capable multimodal model for Taglish conversational assistance |
| **AI — Vision** | Gemini Vision (Gemini 3.8 Flash) | Multimodal image analysis for food packaging label extraction |
| **Maps** | Google Maps API | Vet clinic discovery with directions |
| **Deployment** | Vercel | Zero-config deployment with automatic HTTPS, edge CDN, and environment variable management |
| **Version Control** | Git + GitHub | Branch-based workflow with feature branches and pull requests |

---

### System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    USER BROWSER                      │
│         React 19 + TypeScript + Tailwind CSS         │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Auth     │  │ App      │  │ Pages & Components │ │
│  │ Context  │  │ Context  │  │ (10+ modules)      │ │
│  └────┬─────┘  └────┬─────┘  └────────────────────┘ │
└───────┼─────────────┼────────────────────────────────┘
        │             │
        ▼             ▼
┌──────────────────────────────┐   ┌─────────────────────┐
│       SUPABASE CLOUD         │   │   EXPRESS SERVER     │
│                              │   │   (localhost:3001 /  │
│  ┌─────────┐  ┌───────────┐  │   │   Vercel Serverless) │
│  │  Auth   │  │ PostgreSQL│  │   │                     │
│  │ (JWT)   │  │ + RLS     │  │   │  /api/ai/chat  →    │
│  └─────────┘  └───────────┘  │   │  /api/ai/scan  →    │
│  ┌──────────────────────┐     │   │  rate limiting      │
│  │  Supabase Storage    │     │   │  helmet headers     │
│  │  (images, avatars)   │     │   └──────────┬──────────┘
│  └──────────────────────┘     │              │
└──────────────────────────────┘              ▼
                                   ┌──────────────────────┐
                                   │  Google Gemini API   │
                                   │  (gemini-3.8-flash)  │
                                   │  ┌──────────────────┐│
                                   │  │  Chat (Mealie)   ││
                                   │  │  Vision (Scanner)││
                                   │  └──────────────────┘│
                                   └──────────────────────┘
```

---

### Data Flow

The application uses a **three-tier data persistence strategy** to ensure reliability in variable network conditions:

```
Tier 1 (Primary):   Supabase Cloud DB  ←→  Real-time sync, RLS-protected
        ↓ fallback if Supabase unavailable
Tier 2 (Secondary): Express REST API   ←→  JSON flat-file DB (server/data/db.json)
        ↓ fallback if server unavailable
Tier 3 (Offline):   Browser localStorage  ←→  Fully offline capable
```

This design ensures the app remains functional even without internet access, with data syncing automatically when the connection is restored.

---

### Security Architecture

| Control | Implementation |
|---------|---------------|
| **API Key Protection** | Gemini API key is server-side only (`GEMINI_API_KEY`); never exposed to the browser |
| **Row Level Security** | All Supabase tables enforce `auth.uid() = user_id` — users can only access their own data |
| **Rate Limiting** | 200 req/15min on all API routes; **30 req/15min** on AI endpoints |
| **Security Headers** | `helmet` with CSP, HSTS (1-year in production), `X-Frame-Options`, `X-Content-Type-Options` |
| **CORS** | Strict allowlist — only the app's frontend origin is whitelisted |
| **Input Sanitization** | All user-submitted strings are sanitized on the server (HTML tags stripped, length capped) |
| **File Upload Controls** | MIME whitelist (`image/jpeg`, `image/png`, `image/webp`), 10MB maximum size enforced |
| **XSS Protection** | React auto-escapes all JSX output; no `dangerouslySetInnerHTML` with dynamic content |
| **SQL Injection** | Supabase JS client uses parameterized queries internally; Express fallback uses a JSON flat file (no SQL) |
| **Auth** | JWT-based Supabase Auth; no server-side session cookies → inherently CSRF-resistant |

---

## IV. Scope and Limitations

### In Scope

- **Species:** Domestic cats and dogs only.
- **Geography:** Primarily designed for Filipino pet owners; food library seeded with Philippine market products; peso pricing; Taglish AI responses.
- **Veterinary Directory:** Metro Manila vet clinics (expandable to other regions).
- **Platforms:** Web browsers on desktop, tablet, and mobile (responsive design).
- **AI Features:** Conversational nutrition guidance (Mealie), food label scanning, toxic food detection.
- **Collaboration:** Household member sharing within a single account group.

### Out of Scope (Version 1.0)

- **Wearable device integration** (e.g., fitness trackers for pets).
- **Online veterinary consultations** (telemedicine) — the platform directs users to physical clinics.
- **Species other than cats and dogs** (e.g., birds, reptiles, fish, small mammals).
- **Prescription diet planning** — AniMeal provides nutritional guidance, not veterinary prescriptions.
- **E-commerce integration** — the food library displays prices for comparison only; purchases are made externally.
- **Real-time push notifications** — reminders are displayed in-app; browser push notifications are a future enhancement.

### Limitations

- Nutritional recommendations are based on **standardized formulas** and are approximations. Individual pets may have unique health conditions that require a licensed veterinarian's direct assessment.
- The AI Food Scanner's accuracy is **dependent on image quality** — blurry, poorly lit, or partially obscured packaging may yield incomplete extraction results.
- Mealie's responses are informed by the pet's profile but are **not a substitute for professional veterinary diagnosis or treatment**.
- The vet directory is **manually seeded** and may not reflect real-time changes in clinic hours, services, or availability.

---

## V. Significance of the Study

### For Pet Owners

AniMeal gives Filipino cat and dog owners — especially first-time and young pet parents — a practical, free, and always-available tool for managing their pets' nutrition and care. By replacing guesswork with data, the platform helps owners build consistent, evidence-based care habits that can meaningfully improve their pets' long-term health and quality of life.

### For the Veterinary Community

AniMeal complements, rather than replaces, professional veterinary care. By raising the nutritional literacy of pet owners and encouraging regular health tracking, the platform enables more productive veterinary consultations. Owners arrive with structured health records, weight history, and feeding logs — data that supports better clinical decisions.

### For the Philippine Pet Care Industry

By indexing locally available pet foods with Philippine-peso pricing and nutritional data, AniMeal provides a market resource that promotes informed consumer choices. This encourages higher standards of product transparency among pet food brands operating in the Philippine market.

### For the Academic Community

This project demonstrates the practical integration of modern full-stack web technologies (React, Supabase, TypeScript) with large-language-model AI capabilities (Google Gemini) to solve a real-world community health problem. It contributes a working reference implementation for AI-assisted health management systems in a Southeast Asian cultural context, including Taglish conversational AI design and localized nutritional data modeling.

---

## VI. Scheduling System

The scheduling module allows pet owners to create, manage, and track one-time or recurring care tasks across the full spectrum of daily pet care responsibilities:

| Task Type | Frequency Options | Example |
|-----------|------------------|---------|
| 🍗 Feeding | Daily, twice daily, custom | "Morning meal — 180g dry kibble at 7:00 AM" |
| 💧 Water Refresh | Daily, every N hours | "Replace water bowl at 8:00 AM and 6:00 PM" |
| 💊 Medication | Daily, weekly, monthly | "Heartworm tablet — 1st of every month" |
| ✂️ Grooming | Weekly, monthly, custom | "Bath and brush every Saturday" |
| 🏃 Exercise | Daily, weekdays | "30-minute walk at 5:30 PM" |
| ⚖️ Weight Check | Weekly, monthly | "Weigh Bruno every Sunday morning" |
| 💉 Vaccination | Annually, custom | "Rabies booster — June 15" |
| 🏥 Vet Appointment | One-time, custom | "Annual check-up — Dr. Santos, Nov 20" |

Each task can be:
- Marked complete with a timestamp (who completed it, and when).
- Assigned to a specific household member.
- Viewed in a daily or weekly agenda view.
- Filtered by pet, task type, or completion status.

---

## VII. Scalability Roadmap

AniMeal is designed with future expansion in mind. The following enhancements are planned for subsequent versions:

| Phase | Feature |
|-------|---------|
| **v1.1** | Browser push notifications for care reminders |
| **v1.2** | Expanded food library covering Visayas and Mindanao market products |
| **v1.3** | Vet Finder expanded to Cebu, Davao, and other major Philippine cities |
| **v2.0** | Online veterinary consultation booking (telemedicine) |
| **v2.1** | Pet fitness tracker integration (wearable device API) |
| **v2.2** | Mobile apps (iOS and Android) via React Native |
| **v3.0** | Multi-clinic and veterinary practice dashboard for clinics to manage patient records |
| **v3.1** | Pet food brand partner portal for verified product data submission |

The underlying architecture — Supabase's managed PostgreSQL, Supabase Auth, and the Google Gemini API — is production-grade and horizontally scalable, ensuring AniMeal can grow from a student project to a commercially viable platform without requiring a fundamental rebuild.

---

## Database Schema Overview

The following tables form the core of AniMeal's data model:

| Table | Purpose |
|-------|---------|
| `profiles` | User account metadata (full name, avatar URL) |
| `pets` | Pet profiles linked to user accounts |
| `feeding_logs` | Daily meal records (food, portion, calories, timestamp) |
| `foods` | Pet food library (nutritional data, pricing, local availability) |
| `hydration_logs` | Daily water intake records per pet |
| `weight_logs` | Periodic weight measurements per pet |
| `care_tasks` | Scheduled care activities (feeding, meds, grooming, vet) |
| `household_members` | Household collaboration memberships |
| `chat_conversations` | Persisted Mealie AI chat history per user |
| `vets` | Veterinary clinic directory (location, contact, services) |

All tables implement **Row Level Security (RLS)** policies ensuring each user can only access their own data.

---

## Simple System Concept (Summary)

```
Pet Information
      ↓
AI Analysis (Gemini)
      ↓
Calorie / Nutrition Target (RER × Life Stage Factor)
      ↓
Food Selection / AI Label Scanning
      ↓
Feeding Log
      ↓
Nutrition Tracking (Real-Time Dashboard)
      ↓
Health Monitoring (Weight + Hydration)
      ↓
Schedule & Reminders
      ↓
Household Coordination
      ↓
Vet Finder (when professional care is needed)
```

> **Core Philosophy:** AniMeal does not simply tell a pet owner what to feed their pet. It guides them through the entire care cycle — planning, recording, monitoring, coordinating, and improving — with AI assistance woven throughout every step.

---

*AniMeal — Pampakain, pag-aalaga, at kalusugan ng inyong alagang hayop, sa isang lugar.*  
*("Feeding, care, and health for your beloved pet, in one place.")*
