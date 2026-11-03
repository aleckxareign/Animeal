# AniMeal — AI-Powered Pet Nutrition and Care Management

> **Tagline:** Better meals. Happier Tails.  
> **AI assistant:** Mealie  
> **Project type:** Web-based pet health, nutrition, and care management system  
> **Primary audience:** Filipino pet owners, especially cat and dog owners

## 1. Project Overview

AniMeal is a web-based platform designed to help pet owners manage their pets’ daily nutrition and care in one place. It combines pet profiles, calorie estimates, feeding logs, a local pet-food database, food-label scanning, AI-powered guidance, health tracking, reminders, shared household logging, and veterinary clinic discovery.

AniMeal aims to make pet care easier to understand and manage. Rather than only recommending what to feed a pet, it helps owners **plan, record, monitor, and organize everyday care**.

## 2. Problem Statement

Pet owners may find it difficult to:

- Determine an appropriate amount and type of food for their pets.
- Track daily meals, portions, calories, and nutrients.
- Compare pet-food products and understand nutrition labels.
- Manage water intake and weight changes.
- Remember feeding times, medication, grooming, vaccinations, and vet appointments.
- Coordinate care when multiple family members feed the same pet.
- Find nearby veterinary clinics when professional care is needed.

These challenges can lead to inconsistent records, accidental duplicate feeding, missed care tasks, and uncertainty about food choices.

## 3. Proposed Solution

AniMeal provides an integrated pet-care platform with the following capabilities:

1. **Pet Profile and Calorie Calculator** — stores each pet’s species, breed, age, weight, and life stage, then estimates daily energy needs.
2. **Feeding and Nutrition Tracker** — records food and portions, calculates estimated calories, and tracks daily intake.
3. **Meal and Plate Visualization** — presents a visual summary of logged food groups and daily nutrition information.
4. **Pet-Food Database** — organizes local pet-food products, nutritional information, serving details, and prices.
5. **AI Food Scanner** — helps identify pet-food products and extract label details from a photo, with manual confirmation and fallback.
6. **Mealie AI Assistant** — answers common pet-care and food questions in approachable English and Taglish, with appropriate safety guidance.
7. **Water and Weight Tracker** — records water intake and weight history and helps users notice changes over time.
8. **Scheduling and Reminders** — manages recurring or one-time feeding, water, medication, grooming, exercise, vaccination, weight-check, and veterinary tasks.
9. **Shared Household** — allows family members to record feedings and coordinate daily care.
10. **Dashboard and Statistics** — summarizes calorie intake, meals, nutrients, water, trends, and upcoming tasks.
11. **Multiple Pet Profiles** — lets owners manage several pets while keeping their records separate.
12. **GPS Veterinary Finder** — helps users discover nearby veterinary clinics and access available contact, location, and directions information.

## 4. Target Users

- Cat and dog owners who want to manage everyday care.
- Filipino households where multiple family members care for the same pet.
- Budget-conscious owners who compare food prices and nutritional value.
- Owners who need reminders for feeding, medication, vaccinations, and appointments.
- Owners who want help understanding food labels and general pet-care information.

## 5. Core Features and Requirements

### 5.1 Pet Profile and Calorie Calculator — Brain 1

- [ ] Pet onboarding form: species, breed, weight, age, and neutered status.
- [ ] Estimate resting energy requirement (RER) using an appropriate veterinary formula.
- [ ] Display an estimated daily calorie target.
- [ ] Track remaining estimated calories for the day.
- [ ] Allow pet-profile edits, including weight and life stage.
- [ ] Support multiple pets and switching between profiles.
- [ ] Explain that calorie targets are estimates and may require veterinary adjustment.

### 5.2 Feeding Log — Brain 2

- [ ] “+ Napakain ako” quick-action button.
- [ ] Food picker connected to the local food database.
- [ ] Portion input using supported units such as grams, scoops, or cans.
- [ ] Calculate estimated calories from the portion and food data.
- [ ] View today’s and previous days’ feeding history.
- [ ] Undo the most recent feeding entry.
- [ ] Record “Sino nagpakain?” (which household member fed the pet).
- [ ] Warn when logged intake exceeds the estimated daily target.
- [ ] Record timestamps and preserve a clear feeding history.

### 5.3 Plate Visualization

- [ ] Visualize logged food-group information, such as protein, carbohydrates, fiber, water, and treats, where data is available.
- [ ] Update the visualization as food is logged.
- [ ] Show a daily summary or score only when its calculation is clearly defined.
- [ ] Use consistent colors and a readable legend.
- [ ] Show an empty state when no meals have been recorded.
- [ ] Adapt information for the selected species.
- [ ] Display grams or other quantities when reliable data is available.

> **Nutrition note:** A visual plate ratio is not, by itself, proof of a complete or balanced diet. Avoid presenting universal ideal ratios as veterinary standards. Distinguish measured values from estimates and explain missing data.

### 5.4 Pet-Food Database

- [ ] Include local products and brands, such as Whiskas, Aozi, Pedigree, and Beef Pro, after verifying product details.
- [ ] Store calories, protein, fat, fiber, serving information, and data sources when available.
- [ ] Store price and package size.
- [ ] Calculate price per 100 kcal when the required data is available.
- [ ] Filter by species and relevant life stage.
- [ ] Provide search and sorting.
- [ ] Allow users to add custom food entries.
- [ ] Identify missing or unverified nutritional values instead of assuming them.

### 5.5 Food Scanner and Verdict

- [ ] “Scan the bag” entry point.
- [ ] Camera capture and photo upload.
- [ ] Extract likely product name, brand, nutrition-label values, package weight, and price where visible.
- [ ] Allow users to review and correct extracted values.
- [ ] Provide a manual product-selection fallback.
- [ ] Display an explainable suitability summary, such as Good / Okay / Review, based on transparent criteria.
- [ ] Check relevant nutritional thresholds only when supported by reliable data.
- [ ] Highlight fat, fiber, or other values when relevant and interpretable.
- [ ] Compare price per 100 kcal when data is sufficient.
- [ ] Support budget-based comparisons.
- [ ] Suggest potentially more affordable alternatives when reliable comparisons exist.
- [ ] Clearly state uncertainty and avoid guaranteeing that a product is safe or appropriate for every pet.

### 5.6 Mealie AI Assistant

- [ ] Chat interface with English and Taglish responses.
- [ ] Quick-question chips.
- [ ] Knowledge base for common toxic foods, including chocolate, onion, garlic, and grapes/raisins.
- [ ] General information about commonly asked food questions, with appropriate caveats.
- [ ] General guidance for concerns such as reduced appetite, weight changes, or unusual tiredness.
- [ ] Context-aware responses using the selected pet’s species, weight, age, and user-provided preferences.
- [ ] Symptom guidance for issues such as vomiting, diarrhea, and lethargy.
- [ ] Clear escalation guidance: monitor when appropriate, contact a veterinarian promptly, or seek emergency care.
- [ ] Knowledge-base-only fallback if the AI service is unavailable.
- [ ] A visible disclaimer that Mealie does not replace a veterinarian.

### 5.7 Water and Weight Tracking

- [ ] Water-intake logging.
- [ ] A configurable water goal where a reliable basis exists.
- [ ] Weight logs with dates.
- [ ] Weight trend chart.
- [ ] Alerts for notable changes using defined thresholds.
- [ ] Guidance to seek veterinary advice when appropriate.
- [ ] Distinguish measured drinking water from estimates of water obtained through food.

### 5.8 Shared Household

- [ ] Quick “Napakain na” action to prevent duplicate feeding.
- [ ] Household member list.
- [ ] Shared feeding and care-task history.
- [ ] Record who completed each task and when.
- [ ] Appropriate account permissions and privacy controls.

### 5.9 Dashboard and Statistics

- [ ] Estimated daily calorie target versus logged intake.
- [ ] Meals logged today.
- [ ] Protein, fat, and fiber summaries where data is available.
- [ ] Water logged today.
- [ ] Plate visualization or nutrition summary.
- [ ] Optional streak counter based on a clearly defined goal.
- [ ] Upcoming care tasks and reminders.
- [ ] Alerts that need attention.

### 5.10 Scheduling and Reminders

- [ ] One-time and recurring tasks.
- [ ] Feeding reminders.
- [ ] Water refill reminders.
- [ ] Weekly weight-check reminders.
- [ ] Veterinary appointment reminders.
- [ ] Medication reminders when applicable.
- [ ] Grooming, exercise, vaccination, and deworming reminders.
- [ ] Mark tasks complete, snooze them, and review task history.
- [ ] Notifications where supported by the browser or device.

### 5.11 GPS Veterinary Finder — Proposed Addition

- [ ] Request browser location permission only after a user action.
- [ ] Search nearby veterinary clinics using a mapping or places service.
- [ ] Show map pins and a corresponding clinic list.
- [ ] Display available address, distance, phone number, hours, and directions.
- [ ] Provide filters for open clinics, emergency services, and 24-hour clinics where data is available.
- [ ] Allow city or barangay search when location permission is denied.
- [ ] Provide a “Find a Vet Near Me” action from relevant Mealie guidance.
- [ ] Clearly identify the source and freshness of clinic information.
- [ ] Do not imply that a clinic is open or offers emergency services unless supported by current information.

### 5.12 Recommended Future Features

- [ ] Digital health passport for vaccination, deworming, medication, allergies, and veterinary records.
- [ ] Monthly pet-food cost summaries and budget planning.
- [ ] Food-stock depletion estimate and restock reminders.
- [ ] Pet-sitter mode with temporary access to care instructions.
- [ ] Weekly wellness summaries.
- [ ] Offline-friendly logging with synchronization when internet access returns.
- [ ] Optional clinic and pet-store partnerships, subject to availability.
- [ ] Exportable care summaries for veterinary appointments.

## 6. Scheduling System

Owners can create one-time or recurring tasks for:

**Feeding → Water → Medication → Grooming → Exercise → Weight Check → Vaccination → Vet Appointment**

The system should notify users before scheduled tasks when notifications are enabled. Users can mark tasks as complete, snooze them, and review their history. Shared households should be able to see completed tasks to reduce duplicate feeding or missed care.

## 7. Suggested User Journey

1. **Create a profile:** Add a pet’s species, age, weight, and other relevant details.
2. **Review the estimate:** See an estimated daily calorie target with an explanation of its limitations.
3. **Choose or scan food:** Search the database or scan a label and verify extracted details.
4. **Log a meal:** Select food, enter the portion, and record who fed the pet.
5. **Review the dashboard:** Check logged intake, remaining estimated calories, water, and upcoming tasks.
6. **Manage care:** Set reminders and record weight, medication, vaccination, and other activities.
7. **Ask Mealie:** Get general food and care guidance, with appropriate veterinary escalation.
8. **Find a vet:** Discover nearby clinics when professional help is needed.

## 8. Technology Stack

The following is a proposed stack; the final choices should depend on the implementation and deployment requirements.

| Layer | Proposed technology |
|---|---|
| Frontend | React, HTML, CSS, JavaScript |
| Backend | Node.js and Express |
| Database | MySQL or Firebase |
| AI assistant | Gemini API or another suitable AI service |
| Image analysis | Vision-capable model for label extraction |
| Maps and location | Browser Geolocation API plus a maps/places provider |
| Scheduling and notifications | In-app scheduler, Firebase Cloud Messaging, or supported browser notifications |
| Deployment | Vercel for frontend; Firebase or Render for backend/services |

### Implementation considerations

- Keep calorie calculations deterministic in application code rather than relying on a language model for arithmetic.
- Validate and normalize food data before calculating calories or prices.
- Protect API keys on the server.
- Ask permission before accessing location and provide a manual search alternative.
- Handle unavailable AI, maps, and network services gracefully.
- Plan authentication, access control, backups, and household data privacy.
- Check the licensing, cost, usage limits, and data quality of external APIs and food databases.

## 9. Simple System Concept

**Pet Information → Estimated Nutrition Target → Food Search or Scan → Feeding Log → Nutrition Dashboard → Health Records → Scheduling and Reminders → Veterinary Discovery**

Mealie provides contextual guidance across this workflow, while the owner remains responsible for decisions and veterinary care.

## 10. Safety, Scope, and Limitations

AniMeal is intended to support pet-care organization and general education. It is not a substitute for a veterinarian, a diagnostic device, or a guarantee that a particular food is suitable.

- Calorie needs are estimates and may vary by individual pet and health status.
- Food-label scanning can misread text or miss important information; users should verify extracted values.
- Food ratings must be based on transparent criteria and reliable data.
- Symptom guidance must not claim a definitive diagnosis.
- Suspected poisoning, severe symptoms, or other urgent concerns should be directed to a veterinarian or emergency veterinary service.
- GPS results depend on location permission, provider coverage, and the accuracy of clinic listings.
- Any shared household feature should use appropriate privacy and access controls.

## 11. Scalability

AniMeal can expand through:

- Support for more pets and larger household accounts.
- Broader, verified pet-food databases.
- Partnerships with veterinary clinics and pet stores.
- Appointment or tele-veterinary integrations where available.
- Wearable-device integrations, if suitable data access becomes available.
- More languages and locally relevant care information.
- Offline-friendly operation and synchronization.
- Improved AI assistance grounded in reliable, curated pet-care information.

Growth should prioritize data quality, user trust, and dependable core workflows before adding more complex AI features.

## 12. Recommended Development Priorities

### Phase 1 — Core MVP
- Pet onboarding and profile management.
- Calorie estimation.
- Food database.
- Feeding log and undo.
- Daily dashboard.
- Basic care reminders.

### Phase 2 — Differentiating Features
- Food scanning with user verification.
- Explainable food comparison.
- Plate visualization.
- Mealie assistant with safety guardrails.
- GPS Veterinary Finder.

### Phase 3 — Health and Household Management
- Water and weight tracking.
- Health passport.
- Shared household.
- Expanded recurring schedules.
- Weekly wellness reports.

### Phase 4 — Expansion
- Offline-friendly synchronization.
- Food-stock and budget tools.
- Pet-sitter mode.
- Clinic and store integrations.
- Broader data coverage and supported integrations.

## 13. Project Summary

AniMeal is a pet nutrition and care management platform designed to help Filipino pet owners make more informed, organized everyday decisions. It combines food and calorie tracking, local product information, AI-assisted guidance, health records, reminders, household coordination, and veterinary discovery.

**Core value proposition:** AniMeal helps pet owners understand what their pets eat, keep track of daily care, and know what steps to take next.

**Tagline:** *Better meals. Happier Tails.*
