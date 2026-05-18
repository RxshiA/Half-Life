# Courier Service — Backend

Express 5 REST API with TypeScript, Prisma ORM, and PostgreSQL. Follows a strict **routes → controller → service** layer architecture.

## Prerequisites

- Node.js 22 LTS
- npm 10+
- Docker Desktop / Docker Engine (for PostgreSQL)

## Setup

```bash
# 1. Copy environment file and fill in values
cp .env.example .env

# 2. Start PostgreSQL via Docker Compose
docker compose up -d

# 3. Install dependencies
npm install

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Seed the database (admin + demo user + shipments)
npm run seed

# 6. Start the development server
npm run dev
```

The API will be available at `http://localhost:4000`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://courier:courier@localhost:5432/courier_db` |
| `JWT_SECRET` | Secret for signing JWTs | *(required)* |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Pino log level | `info` |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with `tsx` watch mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm test` | Run all tests |
| `npm run seed` | Seed the database |

## Project Structure

```
backend/
├── docker-compose.yml          # PostgreSQL 16
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
└── src/
    ├── index.ts                # HTTP server entry point
    ├── app.ts                  # Express app factory (used by tests)
    ├── routes.ts               # Top-level router
    ├── config/env.ts           # Zod-validated environment config
    ├── errors/AppError.ts      # Custom error class
    ├── lib/
    │   ├── prisma.ts           # PrismaClient singleton
    │   ├── jwt.ts              # Token helpers
    │   ├── password.ts         # bcrypt helpers
    │   ├── tracking.ts         # Tracking number generator
    │   └── logger.ts           # Pino logger
    ├── middleware/
    │   ├── auth.ts             # requireAuth + requireRole
    │   ├── validate.ts         # Zod request validation
    │   ├── errorHandler.ts     # Central error handler
    │   ├── notFound.ts         # 404 handler
    │   └── asyncHandler.ts     # Async wrapper
    └── modules/
        ├── auth/               # Register, Login, Me
        ├── users/              # View/update profile
        └── shipments/          # Create, list, get, status update, tracking
```

## Layer Architecture

- **`*.routes.ts`** — Declares routes, attaches middleware and controllers. No business logic, no Prisma.
- **`*.controller.ts`** — HTTP boundary: reads from `req`, calls service, sends response. No Prisma.
- **`*.service.ts`** — Business logic: talks to Prisma and `lib/*`, returns plain objects. No `req`/`res`.
- **`*.schemas.ts`** — Zod schemas as the single source of truth for validation and TypeScript types.

## Running Tests

Integration tests use the database from `.env.test` (default `courier_test`). After starting Docker for the first time, apply migrations to that database:

```bash
npm run test:db
```

Then:

```bash
# Run all tests
npm test

# Run with coverage (threshold: 80%)
npm test -- --coverage

# Run a specific test file
npm test -- --testPathPatterns="auth.service"
```

Tests are located alongside source files in `__tests__/` directories and in the top-level `tests/` folder for shared helpers.

## Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@courier.local` | `Admin@1234` |
| User | `demo@courier.local` | `User@1234` |

Same values are printed at the end of `npm run seed`.
