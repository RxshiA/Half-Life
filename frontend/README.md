# Courier Service — Frontend

React 19 single-page application built with Vite 8, Tailwind CSS v4, and shadcn/ui. Provides user authentication, shipment management, and public tracking.

## Prerequisites

- Node.js 22 LTS
- npm 10+
- Backend running at `http://localhost:4000` (see `backend/README.md`)

## Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start the development server
npm run dev
```

The app opens at `http://localhost:5173`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000/api` |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest in watch mode |
| `npx vitest run --coverage` | Run tests with coverage report |

## Application Routes

| Path | Access | Description |
|------|--------|-------------|
| `/login` | Public | User login |
| `/register` | Public | New account registration |
| `/track` | Public | Shipment tracking lookup |
| `/track/:trackingNumber` | Public | Direct tracking link |
| `/dashboard` | Authenticated | My shipments (USER) / All shipments (ADMIN) |
| `/shipments/new` | USER only | Create a new shipment |
| `/shipments/:id` | Authenticated | Shipment detail + event timeline |

## Project Structure

```
frontend/src/
├── main.tsx                    # React entry point
├── App.tsx                     # Root component (providers)
├── router.tsx                  # React Router 7 configuration
├── index.css                   # Tailwind v4 + shadcn/ui theme tokens
├── lib/
│   ├── api.ts                  # Axios instance + interceptors
│   ├── auth-storage.ts         # JWT localStorage helpers
│   └── utils.ts                # cn() helper
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # AppShell, Navbar
│   ├── ProtectedRoute.tsx      # Auth + role guard
│   ├── ShipmentStatusBadge.tsx # Color-coded status badge
│   └── StatusTimeline.tsx      # Vertical tracking history
├── features/
│   ├── auth/                   # AuthContext, Login, Register pages
│   └── shipments/              # Dashboard, Create, Detail, Track pages
├── pages/
│   └── NotFoundPage.tsx
└── test/
    ├── setup.ts                # Vitest + MSW setup
    ├── server.ts               # MSW server
    └── handlers.ts             # Mock API handlers
```

## Running Tests

```bash
# Watch mode
npm test

# Single run with coverage (threshold: 80%)
npx vitest run --coverage
```

Tests use **Vitest 4**, **React Testing Library 16**, and **MSW 2** for API mocking. Coverage is reported via `@vitest/coverage-v8`.

## Key Design Decisions

- **Tailwind v4**: Uses `@tailwindcss/vite` plugin. No `tailwind.config.ts` — theming is done with `@theme` in `index.css`.
- **shadcn/ui**: new-york style with OKLCH colors and `sonner` for toasts. Components are owned in `src/components/ui/`.
- **TanStack Query**: Manages all server state — fetching, caching, and invalidation.
- **React Hook Form + Zod**: Forms are validated at the field level with inline error messages.
- **JWT in localStorage**: Token is persisted and attached via Axios request interceptor. A 401 response clears the token and redirects to `/login`.
