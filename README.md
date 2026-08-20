# Rugonfalva Grill & Bar — Backend

Express + TypeScript + Prisma + Postgres backend, két frontendet szolgál ki:
- **QR menu app** — vendégek scanner-en át böngészik a menüt
- **Admin panel** — menü szerkesztés + belső rendelés-felvevő rendszer

## Stack

- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- JWT auth + bcrypt
- Zod validáció
- CORS (több FE origin támogatás)
- Docker Compose (csak DB, lokálisan)

## Mappa szerkezet

```
src/
  index.ts                 # entry point, express setup
  config/
    env.ts                 # env változók
    db.ts                  # Prisma client
  routers/                 # route definíciók
  middlewares/             # auth, validate, error
  controllers/             # HTTP handler-ek
  dtos/                    # Zod sémák + típusok
  services/                # üzleti logika
  utils/                   # segédek (jwt, httpError)
prisma/
  schema.prisma
```

## Setup

```bash
pnpm install
cp .env.example .env       # ha még nincs .env
pnpm db:up                 # Postgres indítás dockerben
pnpm prisma:migrate        # első migráció (add nevet, pl. "init")
pnpm dev
```

Health check: `GET http://localhost:4000/api/health`

## Auth endpointok

- `POST /api/auth/register` — `{ email, password, name? }`
- `POST /api/auth/login` — `{ email, password }` → `{ user, token }`
- `GET  /api/auth/me` — `Authorization: Bearer <token>`

## Deploy (későbbi)

Szerveren `docker-compose.yml` kibővítendő a BE service-szel — most lokálisan csak DB fut kontanerben, hogy a `pnpm dev` hot-reload kényelmes maradjon.
