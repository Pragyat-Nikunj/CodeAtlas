# CodeAtlas AI — Frontend

**The web client for CodeAtlas AI. Explore AI-generated documentation, security findings, and architectural insights for any GitHub repository.**

[Getting Started](#getting-started) · [Project Structure](#project-structure) · [Pages & Features](#pages--features) · [Authentication](#authentication) · [Environment Variables](#environment-variables) · [Contributing](#contributing)

</div>

---

## Overview

The CodeAtlas AI frontend is a **Next.js 15 App Router** application that serves as the primary interface for interacting with the CodeAtlas platform. It allows users to ingest GitHub repositories, browse AI-generated documentation trees, review security audit findings, and manage their projects — all within a dark, developer-focused UI built with **shadcn/ui** and **Tailwind CSS**.

Authentication is handled entirely through **Supabase Auth** (magic link + Google OAuth), with server-side session management via `@supabase/ssr`. Route protection and role-based access control are enforced at the middleware layer.

---

## Tech Stack

| Technology                                                        | Purpose                                        |
| ----------------------------------------------------------------- | ---------------------------------------------- |
| [Next.js 16](https://nextjs.org)                                  | React framework, App Router, Server Components |
| [TypeScript](https://www.typescriptlang.org)                      | Type safety across the entire codebase         |
| [Supabase SSR](https://supabase.com/docs/guides/auth/server-side) | Auth session management, database client       |
| [shadcn/ui](https://ui.shadcn.com)                                | Accessible, composable UI component library    |
| [Tailwind CSS v4](https://tailwindcss.com)                        | Utility-first styling                          |
| [Lucide React](https://lucide.dev)                                | Icon system                                    |
| [`@codeatlas/shared-schema`](../packages/shared-schema)           | Shared Zod schemas and TypeScript types        |

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20.x`
- **pnpm** `>= 9.x` (or npm / yarn)
- A running instance of the [CodeAtlas backend](../backend/README.md)
- A [Supabase](https://supabase.com) project with auth configured

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Pragyat-Nikunj/CodeAtlas.git
cd CodeAtlas/frontend
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Configure environment variables**

```bash
cp .env.example .env.local
```

Fill in the values as described in the [Environment Variables](#environment-variables) section.

**4. Start the development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file at the root of the frontend package. All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

```env
# ── Supabase ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ── Backend API ─────────────────────────────────────────────────────────────────
# The base URL of the CodeAtlas Express backend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> [!WARNING]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend. It must only be used in server-side API routes or the backend service.

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Magic link + Google login
│   │   └── signup/
│   │       └── page.tsx          # New account registration
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Supabase OAuth callback handler
│   ├── explore/
│   │   └── page.tsx              # Public repository browser
│   ├── dashboard/
│   │   ├── page.tsx              # User project dashboard
│   │   ├── projects/
│   │       └── [id]/
│   │           └── page.tsx      # Individual project documentation view
│   │
│   ├── admin/
│   │   └── page.tsx              # SUPERADMIN control panel
│   └── layout.tsx                # Root layout with providers
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   ├── admin/                    # Admin dashboard components
│   │   ├── StatsGrid.tsx
│   │   ├── UsersTable.tsx
│   │   ├── ProjectsTable.tsx
│   │   ├── RecentJobs.tsx
│   │   └── SecurityPanel.tsx
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── project-card.tsx
│   │   └── create-project-dialog.tsx
│   └── Navbar.tsx                # Global navigation bar
│
├── providers/
│   └── AuthContext.tsx           # Auth context and useAuth hook
│
├── utils/
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│
├── lib/
│   └── env.ts                    # Type-safe environment variable access
├── proxy.ts                      # Middleware logic (auth checks, SUPERADMIN bounce)
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Pages & Features

### `/` — Landing Page

Public-facing homepage introducing the platform.

### `/explore` — Explore

Browse all publicly indexed repositories without requiring authentication. Features:

- Live client-side search by repo name, owner, or description
- Repository cards with visibility badges, owner info, and creation date
- Skeleton loading states and empty/error fallbacks
- Direct links to individual project documentation

### `/login` — Sign In

- **Magic link** authentication via Supabase OTP
- **Google OAuth** single sign-on
- Handles `shouldCreateUser: false` to prevent unauthorized signups via the login page

### `/signup` — Sign Up

- Magic link + Google OAuth registration
- Passes `full_name` metadata to Supabase on account creation

### `/dashboard` — User Dashboard

Protected route. Requires an authenticated session.

- Lists all ingested projects (public + user-created)
- **Create Project dialog** — accepts a GitHub URL, validates format, triggers backend ingestion, and redirects to the job tracker
- Loading skeleton, error retry, and empty state handling

### `/dashboard/projects/[id]` — Project View

Displays the full AI-generated documentation tree for a repository, including:

- Structural pillars and summaries
- File-level documentation nodes
- Security findings panel

### `/admin` — Admin Dashboard

**SUPERADMIN only.** Redirected to automatically from `/dashboard` if the authenticated user holds the `SUPERADMIN` role. Features:

- **Stats grid** — total users, projects, open security findings, active jobs
- **Users table** — all registered users with role badges and delete functionality (with confirmation dialog)
- **Projects table** — all ingested repositories with creator attribution
- **Security panel** — open findings breakdown by severity (CRITICAL / HIGH / MEDIUM / LOW) with visual progress bars
- **Recent jobs feed** — last 20 ingestion jobs with live progress bars for in-flight jobs

---

## Authentication

Authentication is managed by **Supabase Auth** with server-side session handling via `@supabase/ssr`.

### Flow

```
User submits email / clicks Google
        ↓
Supabase sends magic link / OAuth redirect
        ↓
/auth/callback/route.ts exchanges code for session
        ↓
Session cookies are set on the response
        ↓
User is redirected → /dashboard
        ↓
middleware.ts intercepts /dashboard
        ↓
If role === SUPERADMIN → redirect to /admin
Otherwise → allow through
```

### Route Protection (middleware)

All route protection is enforced in `middleware.ts` via `proxy.ts`:

| Route                           | Rule                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/dashboard/*`                  | Requires authenticated session. Redirects to `/login` if unauthenticated.                                |
| `/dashboard` (exact)            | If `role === SUPERADMIN`, bounces to `/admin`.                                                           |
| `/admin/*`                      | Requires authenticated session **and** `role === SUPERADMIN`. Non-admins are redirected to `/dashboard`. |
| `/explore`, `/login`, `/signup` | Fully public.                                                                                            |

### Role System

Roles are stored in the `public.profiles` table in Supabase and enforced via **Row Level Security (RLS)** policies.

| Role           | Access                                          |
| -------------- | ----------------------------------------------- |
| `VIEWER`       | Can view public projects and their own profile  |
| `PROJECTADMIN` | Extended project management capabilities        |
| `SUPERADMIN`   | Full access to the admin dashboard and all data |

> [!NOTE]
> RLS policies use a `get_user_role(user_id UUID)` security definer function to avoid infinite recursion when policies on `profiles` reference the same table.

---

## Component Architecture

### shadcn/ui

All base UI components (`Button`, `Card`, `Input`, `Dialog`, `Table`, `Badge`, `Tabs`, etc.) are sourced from shadcn/ui. They live in `components/ui/` and are **never modified directly** — extend them by wrapping in feature-specific components.

### Shared Schema

Types and Zod schemas are imported from the `@codeatlas/shared-schema` workspace package. This ensures the frontend and backend stay in sync on data shapes:

```ts
import {
  Project,
  IngestionJob,
  SecurityFinding,
} from '@codeatlas/shared-schema';
```

### Auth Context

The `useAuth()` hook is available throughout the app via `AuthContext`:

```ts
const { user, signOut } = useAuth();
```

---

## Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
```

---

## Supabase Setup

The frontend expects the following tables to exist in your Supabase project. Refer to the Database Schema in the backend docs for the full SQL.

Required tables:

- `public.profiles`
- `public.projects`
- `public.ingestion_jobs`
- `public.documentation_nodes`
- `public.security_findings`

Required RLS policies — ensure the following are in place:

```sql
-- Allow all users to read public projects
CREATE POLICY "Public projects are viewable by everyone"
ON public.projects FOR SELECT USING (is_public = true);

-- Avoid infinite recursion on admin policies
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch — `git checkout -b feat/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to your branch — `git push origin feat/your-feature`
5. Open a Pull Request against `main`

Please ensure your code passes `npm run lint` before submitting.
