# Venudue

Venudue is a hospitality and venue-management SaaS for event venues, restaurants, and private dining spaces. The product helps venue teams manage the full operational lifecycle: public enquiry intake and proposal sharing, enquiry pipeline and conversion to events, event scheduling and function sheets, staff rota building and shift confirmations, team roster management, in-app notifications, operational reports, venue setup, and a dedicated staff portal for shift visibility.

## Tech stack

- **Monorepo:** pnpm workspace (`apps/web`)
- **App:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend:** [Supabase](https://supabase.com/) — Postgres, Auth, Row Level Security (RLS)
- **Deployment:** Vercel (production domain: [venudue.app](https://venudue.app))

## Local setup

### Prerequisites

- Node.js 20+ (22 recommended)
- [pnpm](https://pnpm.io/) 9+
- A Supabase project with migrations applied (see `supabase/migrations/`)

### 1. Clone and install

```bash
git clone <repo-url> vendue
cd vendue
pnpm install
```

If you only work inside the web app directory:

```bash
cd apps/web
pnpm install
```

### 2. Environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

Optional but recommended:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Local app URL (default `http://localhost:3000`) |
| `NEXT_PUBLIC_SITE_URL` | Production site URL |
| `RESEND_API_KEY` / `POSTMARK_SERVER_TOKEN` / `EMAIL_FROM` | Email delivery (copy mode works without these) |

Apply migrations to your Supabase project (Supabase CLI or Dashboard SQL editor), then optionally seed demo data:

```bash
# Paste supabase/seed/demo_data.sql in the Supabase SQL editor after completing venue onboarding
```

### 3. Run the dev server

From the repo root:

```bash
pnpm dev
```

Or from `apps/web`:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete venue onboarding, then explore the dashboard.

## Repository layout

```
apps/web/                 # Venudue product application (@vendue/web)
  app/                    # Next.js App Router routes
    dashboard/            # Authenticated venue dashboard (enquiries, events, rota, team, …)
    enquire/              # Public enquiry forms
    proposal/             # Public client proposal view
    staff/                # Staff portal
    (auth)/               # Sign-in / sign-up
  components/             # React UI (dashboard, enquiries, events, rota, team, …)
  lib/                    # Server actions, data loaders, Supabase clients, domain logic
  src/types/              # Generated / shared database types
supabase/
  migrations/             # Postgres schema and RLS policies
  seed/                   # Demo seed SQL (run manually after onboarding)
nextjs-dashboard/         # Unrelated Next.js tutorial scaffolding — not part of Venudue
```

## Scripts

Run from the repo root (workspace filter) or from `apps/web`:

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `pnpm dev` | Start Next.js dev server (Turbopack) |
| Build | `pnpm build` | Production build |
| Start | `pnpm start` | Serve production build |
| Lint | `pnpm lint` | ESLint via Next.js |
| Typecheck | `pnpm typecheck` | `tsc --noEmit` |
| E2E tests | `pnpm test:e2e` | Playwright end-to-end tests |

Root equivalents: `pnpm --filter @vendue/web <script>`

### E2E tests

E2E tests require a Supabase project with migrations applied and demo seed data (or equivalent fixtures). Set these env vars in `apps/web/.env.local` or CI secrets:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (test setup only — never expose client-side) |
| `E2E_VENUE_SLUG` | Public slug of a venue with enquiry form enabled |
| `E2E_PROPOSAL_TOKEN` | Proposal token for an enquiry with shared proposal content |

```bash
cd apps/web
pnpm exec playwright install chromium
pnpm test:e2e
```

CI runs E2E when Supabase secrets are configured in the repository.
