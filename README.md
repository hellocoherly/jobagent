# Compass AI — Career Operating System (Phase 1)

Phase 1 implementation of the Compass AI PRD (see [`PRD.md`](./PRD.md)): resume
upload with AI profile generation, job aggregation from public ATS feeds, an
AI matching engine, an interactive Career Map, an Opportunity Feed, and saved
employers.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **PostgreSQL + Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **Anthropic Claude** (`@anthropic-ai/sdk`) for resume parsing and AI job-fit scoring
- **Google Maps** (`@react-google-maps/api`) for the Career Map
- Minimal custom auth (bcrypt + signed JWT session cookie via `jose`) — no third-party auth provider

## Getting started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up Postgres** and copy `.env.example`-style values into `.env`:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/jobagent?schema=public"
   ANTHROPIC_API_KEY="sk-ant-..."       # https://console.anthropic.com/settings/keys
   GOOGLE_MAPS_API_KEY="..."            # server-side (reserved for future geocoding use)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..." # https://console.cloud.google.com/google/maps-apis/credentials
   AUTH_SECRET="$(openssl rand -base64 32)"
   ```

3. **Run migrations and seed starter employers**

   ```bash
   npx prisma migrate dev
   pnpm db:seed
   ```

4. **Pull live job postings** from the seeded employers' public ATS boards
   (Greenhouse / Lever / Ashby):

   ```bash
   pnpm sync:jobs
   ```

5. **Start the app**

   ```bash
   pnpm dev
   ```

   Sign up at `/signup`, upload a resume at `/onboarding`, then visit `/map`.
   From `/map` or `/feed`, hit "Refresh feed" / call `POST /api/matches/refresh`
   to have the Career Agent score open roles against your profile.

## Project structure

```
prisma/schema.prisma       Core data model (User, Profile, Employer, Office, Job, Match, ...)
prisma/seed.ts              Starter employers/offices on public ATS boards
scripts/sync-jobs.ts        CLI to pull jobs for all configured employers
src/lib/ai.ts                Claude-backed resume parsing + job-fit scoring
src/lib/ats/                Greenhouse / Lever / Ashby adapters
src/lib/jobs-sync.ts        Ingest + upsert Job rows from ATS adapters
src/lib/matching.ts         AI matching engine (Match records)
src/lib/feed.ts              Opportunity Feed generation
src/lib/map-data.ts          Query layer for the Career Map
src/lib/auth.ts, session.ts Password hashing + JWT session cookie
src/proxy.ts                 Route protection (Next 16's `middleware` → `proxy`)
src/app/                     Pages: /, /login, /signup, /onboarding, /map, /feed, /saved
src/app/api/                 Route handlers backing the above
```

## Known limitations / next steps

- **ATS board tokens in `prisma/seed.ts` are best-effort starter data.** Public
  Greenhouse/Lever/Ashby board slugs can change if a company switches ATS
  providers. `pnpm sync:jobs` skips (and logs) any board that fails to resolve
  rather than failing the whole run — verify/replace entries for your
  deployment.
- **This sandbox's outbound network is restricted** to a small host allowlist,
  so live ATS sync and the Anthropic API could not be exercised end-to-end
  here. Auth, the data model, the Career Map, Saved Employers, and the
  Opportunity Feed's empty/populated states were verified against a real
  local Postgres instance. `pnpm sync:jobs` and the resume-upload/matching
  endpoints are implemented and type-checked but need a real `ANTHROPIC_API_KEY`
  and open network access to fully verify.
- **Auth is intentionally minimal** for Phase 1 (email/password, single role).
  No password reset, email verification, or OAuth yet.
- Office coordinates in the seed data are approximate city-center
  coordinates, not geocoded street addresses.
- Everything under "Phase 2+" in the PRD (Career Dashboard, salary
  intelligence, interview coach, employer dashboards, recruiter messaging,
  networking graph, negotiation agent) is out of scope for this pass.
