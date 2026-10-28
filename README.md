# Animeal

A pet nutrition and wellness web app. Animeal helps pet owners log meals, understand pet food, and keep track of their pet's health in one place, with a friendly assistant named **Mealie** to answer questions along the way.

> **Status: early development.** The landing page and app shell are built. The feature pages below are placeholders that are still being implemented. See [Roadmap](#roadmap).

## Features

| Feature | What it's for | Status |
| --- | --- | --- |
| **Meal Tracker** | Log meals, record food portions, and review feeding history | Planned |
| **Food Library** | Explore pet foods, compare products, and check ingredients and nutrition | Planned |
| **Food Scanner** | Scan or upload food labels to understand ingredients and nutritional details | Planned |
| **Pet Wellness** | Track weight, hydration, health records, and care reminders | Planned |
| **Ask Mealie** | Chat assistant for pet feeding and care questions | Planned |
| **Landing page** | Hero, feature overview, how it works, Mealie preview, nearby vets | Built |
| **Routing and layout** | Navbar, footer, protected routes, 404 page | Built |

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for dev server and builds
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`
- [React Router 7](https://reactrouter.com) for routing
- [Lucide](https://lucide.dev) icons
- ESLint with `typescript-eslint` and the React Hooks plugin

## Getting started

**Prerequisites:** a recent version of [Node.js](https://nodejs.org) (LTS) and npm.

```bash
# clone the repository
git clone https://github.com/aleckxareign/Animeal.git
cd Animeal

# install dependencies
npm install

# start the dev server
npm run dev
```

Then open the local URL that Vite prints (usually `http://localhost:5173`).

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check with `tsc -b` and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## Project structure

```
src/
├── components/
│   ├── home/        # Landing page sections (Hero, FeatureCards, HowItWorks, ...)
│   ├── layout/      # Layout, Navbar, Footer, ScrollToHash
│   └── ui/          # Reusable UI pieces (Button, Card, PhoneFrame, SectionHeading)
├── context/         # AuthContext (login state)
├── data/            # Static data (features, vets)
├── pages/           # One component per route
├── routes/          # AppRoutes and ProtectedRoute
├── types/           # Shared TypeScript types
├── index.css        # Tailwind setup and global styles
└── main.tsx         # App entry point
```

### Routes

| Path | Access | Page |
| --- | --- | --- |
| `/` | Public | Home |
| `/login` | Public | Login |
| `/meal-tracker` | Login required | Meal Tracker |
| `/food-library` | Login required | Food Library |
| `/food-scanner` | Login required | Food Scanner |
| `/pet-wellness` | Login required | Pet Wellness |
| `/ask-mealie` | Login required | Ask Mealie |
| `*` | Public | Not found |

## Important notes

- **Authentication is a placeholder.** Login currently just sets a flag in `localStorage`. There is no real account system or backend yet, so don't enter real credentials or rely on it for security.
- **Demo data.** Nearby vets and other sample content are placeholders, not real listings.
- **Fonts.** The display font (TT Ramillas) is a commercial typeface and is not included in this repository. Without it, the app falls back to Georgia and still works. If you have a license, place the font file in `src/assets/fonts/` and match the file name referenced in `src/index.css`.
- **Not veterinary advice.** Animeal is an informational tool and does not replace a veterinarian.

## Roadmap

- [ ] Meal Tracker: pets, feeding log, portion tracking
- [ ] Food Library: browsable pet food data with nutrition details
- [ ] Food Scanner: label upload and ingredient breakdown
- [ ] Pet Wellness: weight, hydration, health records, reminders
- [ ] Ask Mealie: chat assistant
- [ ] Real authentication and a backend

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss what you'd like to change. Run `npm run lint` and `npm run build` before submitting.

## License

Released under the [MIT License](LICENSE). The bundled font is not covered by this license (see [Important notes](#important-notes)).
