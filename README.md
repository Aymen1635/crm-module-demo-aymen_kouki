# CRM Take-Home

A minimal, production-oriented CRM module built with **NestJS**, **Next.js App Router**, **Prisma**, and **PostgreSQL**.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 10 + TypeScript strict |
| Frontend | Next.js 14 (App Router) + TypeScript strict |
| ORM | Prisma 5 |
| Database | PostgreSQL 15+ |
| Validation | class-validator + class-transformer |

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL 15+ running locally **or** Docker

---

## Quick Start

### 1 — Clone & install

```bash
git clone <repo-url>
cd crm
npm install          # installs root + all workspaces
```

### 2 — Environment

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL to your Postgres instance
```

### 3 — Database

```bash
# Option A: Docker (recommended)
docker compose up -d

# Option B: existing Postgres
# Make sure DATABASE_URL in .env is correct
```

### 4 — Run migrations & seed

```bash
npm run db:migrate   # runs prisma migrate dev
npm run db:seed      # seeds sample clients + opportunities
```

### 5 — Start dev servers

```bash
npm run dev          # starts backend (3001) and frontend (3000) concurrently
```

Open [http://localhost:3000](http://localhost:3000).

---

## Individual workspace commands

```bash
# Backend only
npm run dev:backend       # NestJS on :3001
npm run db:migrate        # prisma migrate dev
npm run db:seed           # seed script
npm run db:studio         # prisma studio

# Frontend only
npm run dev:frontend      # Next.js on :3000
```

---

## Project structure

```
crm/
├── Backend/              # NestJS API
│   ├── prisma/           # schema.prisma + migrations + seed
│   └── src/
│       ├── clients/
│       ├── opportunities/
│       ├── pipeline/
│       ├── prisma/       # PrismaService
│       └── common/       # filters, pipes, types
└── Frontend/             # Next.js App Router
    └── src/
        ├── app/
        ├── components/
        ├── lib/
        └── hooks/
```

---

## Key design decisions

See [decisions.md](./decisions.md) for the full rationale. Summary:

- **Single-table clients** — one `clients` table with a `type` discriminant (`COMPANY | INDIVIDUAL`)
- **Soft delete** — `deletedAt` timestamp; nothing is ever hard-deleted in normal flow
- **Amount in cents** — `amountCents: Int` avoids float precision issues (note: capped at ~214k EUR; upgrade to `BigInt` for larger deals)
- **Risk flags computed in service layer** — `late` (past expected date, not closed) and `stagnant` (no stage change in 14 days, configurable via `STAGNANT_THRESHOLD_DAYS`)
- **Pipeline aggregation** — `GET /pipeline/summary` returns totals per stage + at-risk value

---

## Known limitations (prototype scope)

- No authentication / authorization
- `amountCents` is a 32-bit `Int` — sufficient for the prototype, use `BigInt` for production
- Staleness threshold (14 days) is env-configurable but not user-editable via UI
- No physical delete endpoint
