# Online Assessment Platform

A production-ready online assessment platform built with Next.js 16, React 19, Neon PostgreSQL, Prisma ORM, JWT authentication, and a purple-themed UI with ShadCN/UI components.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6)

---

## Live Demo

🔗 **[https://akij-resouces-online-task.vercel.app](https://akij-resouces-online-task.vercel.app)**

### Demo Credentials

**Employer (Admin):**
- Email: `admin@akijresource.com`
- Password: `Admin@123456`

**Candidate:**
- Register a new account at `/candidate/register`
- Or use any previously registered candidate account

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/arifarman22/Akij_Resouces_online_task.git
cd Akij_Resouces_online_task

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and fill in your values
cp .env.example .env

# 4. Set up the database (generate client + push schema + seed employer)
npm run db:setup

# 5. Run the development server
npm run dev

# 6. Open in browser
http://localhost:3000
```

### Environment Variables

Copy `.env.example` to `.env` and update:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Strong random string (min 32 chars) for access tokens |
| `JWT_REFRESH_SECRET` | Strong random string (min 32 chars) for refresh tokens |
| `JWT_ACCESS_EXPIRY` | Access token lifetime (default: `15m`) |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime (default: `7d`) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms (default: `60000`) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window (default: `30`) |
| `EMPLOYER_EMAIL` | Built-in employer email for seeding |
| `EMPLOYER_PASSWORD` | Built-in employer password for seeding |
| `EMPLOYER_NAME` | Built-in employer display name |
| `NEXT_PUBLIC_APP_URL` | App URL (default: `http://localhost:3000`) |

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (webpack mode) |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:setup` | Generate + push schema + seed (one-time setup) |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the built-in employer account |
| `npm run db:studio` | Open Prisma Studio GUI |

> **Note:** Dev and build use `--webpack` mode because Turbopack has module resolution issues with Prisma 7's adapter pattern.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 7 (with `PrismaNeon` adapter) |
| Authentication | JWT (access + refresh tokens with auto-rotation) |
| State Management | Zustand (with persist middleware) |
| Forms | React Hook Form + Zod validation |
| Styling | Tailwind CSS 4 + ShadCN/UI |
| HTTP Client | Axios (with interceptors for token refresh) |
| Language | TypeScript (strict mode) |
| Deployment | Vercel |

---

## Features

### Homepage
- Animated splash screen with logo scale-bounce, tagline fade-up, and purple loading bar
- Landing page with gradient background, portal cards (Employer / Candidate) with hover effects
- "Get Started →" links to respective login pages

### Employer Panel
- **Login** — JWT authentication with email & password, inline error messages
- **Dashboard** — Exam cards with status badges (Upcoming/Past), colored tag pills, icon-boxed stats grid, schedule section. "View Candidates" opens a dialog with submitted results table. Delete exam support
- **Create Online Test** — Multi-step form with animated stepper:
  - Step 1: Title, Capacity & Structure, Type & Duration, Schedule, Negative Marking (bordered card)
  - Step 2: Professional inline question form with type-specific layouts:
    - **Radio (Single Choice)** — Options with correct answer selector via radio buttons
    - **Checkbox (Multiple Choice)** — Options with multiple correct answer checkboxes
    - **Text (Essay/Short Answer)** — Expected answer / keywords field
  - Correct answer stored per question in the database
  - Always-visible edit/delete buttons on question cards
- **Logout** — Profile dropdown menu with logout option

### Candidate Panel
- **Login** (`/candidate/login`) — Clean login-only page with inline error display
- **Register** (`/candidate/register`) — Dedicated registration page with:
  - Full Name, Email, Password, Confirm Password fields
  - Real-time validation hints (password length, passwords match)
  - Proper error handling with AlertCircle icon
- **Dashboard** — Assessment grid with pagination controls and per-page selector (4, 8, 12, 20). Shows duration, question count, negative marking, and completion status
- **Exam Screen** — One-at-a-time question flow with:
  - Skip / Save & Continue navigation
  - Progress dots and question navigator grid
  - Countdown timer with auto-submit on timeout
  - Fullscreen enforcement and tab switch detection
  - Animated completion dialog (SVG checkmark with circle draw-in, check stroke animation, pulse rings)
  - Separate timeout dialog (amber clock icon, "Time's Up!" with auto-submission message)
- **Logout** — Profile dropdown with logout option

### Authentication & Security
- JWT access/refresh token system with automatic rotation
- Rate limiting on all API routes (configurable window + max requests)
- Role-based access control (EMPLOYER / CANDIDATE)
- Password hashing with bcryptjs
- Bearer token extraction with middleware validation
- Auto-refresh on 401 with request queue (skips auth routes to prevent redirect loops)
- Separate login and register pages with isolated state (no cross-contamination)

### API Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Login (returns access + refresh tokens) |
| `POST` | `/api/auth/register` | No | Register new candidate |
| `POST` | `/api/auth/refresh` | No | Refresh access token |
| `GET` | `/api/auth/me` | Yes | Get current user profile |
| `GET` | `/api/exams` | Yes | List exams (employer: own, candidate: all) |
| `POST` | `/api/exams` | Employer | Create exam with questions + correct answers |
| `GET` | `/api/exams/:id` | Yes | Get exam by ID with questions |
| `DELETE` | `/api/exams/:id` | Employer | Delete exam |
| `GET` | `/api/results` | Yes | Get results (employer: by examId, candidate: own) |
| `POST` | `/api/results` | Candidate | Submit exam answers |

---

## Database Schema

5 models using Neon PostgreSQL with Prisma 7:

```
User ──────────── 1:N ──── Exam
  │                          │
  │                          1:N
  │                          │
  │                       Question (with correctAnswer)
  │
  └── 1:N ──── CandidateResult ──── N:1 ── Exam
  │
  └── 1:N ──── RefreshToken
```

- **User** — EMPLOYER or CANDIDATE role, email (unique), hashed password
- **Exam** — Title, capacity, slots, question sets, schedule, duration, negative marking
- **Question** — Title, type (radio/checkbox/text), options array, correctAnswer (optional), order
- **CandidateResult** — Answers (JSON), tab switches, fullscreen exits, unique per candidate+exam
- **RefreshToken** — Token string, expiry, linked to user

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (5 models)
│   └── seed.ts                # Seeds built-in employer account
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # login, register, refresh, me
│   │   │   ├── exams/         # CRUD + [id] routes
│   │   │   └── results/       # Get + submit results
│   │   ├── candidate/
│   │   │   ├── dashboard/     # Assessment grid with pagination
│   │   │   ├── exam/[id]/     # Exam screen (one-at-a-time flow)
│   │   │   ├── login/         # Candidate login (login only)
│   │   │   ├── register/      # Candidate registration (dedicated page)
│   │   │   └── layout.tsx     # Candidate layout with auth guard
│   │   ├── employer/
│   │   │   ├── dashboard/     # Exam cards + create-test form
│   │   │   ├── login/         # Employer login
│   │   │   └── layout.tsx     # Employer layout with auth guard
│   │   ├── globals.css        # Animations & theme variables
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Splash screen + landing page
│   ├── components/
│   │   ├── layout/            # Header (with dropdown logout), Footer
│   │   └── ui/                # ShadCN/UI components (14 components)
│   ├── hooks/
│   │   ├── useAuth.ts         # Login/register with API client + clearError
│   │   ├── useTimer.ts        # Countdown timer for exams
│   │   └── useProctoring.ts   # Fullscreen + tab switch detection
│   ├── lib/
│   │   ├── api/client.ts      # Axios client with token interceptors
│   │   ├── auth/jwt.ts        # Sign/verify access & refresh tokens
│   │   ├── auth/rateLimit.ts  # In-memory rate limiter
│   │   ├── auth/withAuth.ts   # Auth middleware for API routes
│   │   ├── db/prisma.ts       # Prisma singleton (PrismaNeon config adapter)
│   │   └── types.ts           # Shared TypeScript interfaces
│   └── store/
│       ├── useEmployerStore.ts # Employer state (user, exams, tokens)
│       └── useCandidateStore.ts # Candidate state (user, results, tokens)
├── .env.example               # Environment variable template
├── next.config.ts             # serverExternalPackages for Prisma
├── package.json               # Scripts including db:setup
└── README.md
```

---

## Architecture Highlights

- **Prisma 7 Adapter Pattern** — Uses `PrismaNeon` with config object `{ connectionString }` (v7 creates its own Pool internally)
- **Token Auto-Refresh** — Axios response interceptor catches 401s on non-auth routes, queues pending requests, refreshes token, then replays the queue
- **Auth Route Protection** — 401 interceptor skips `/auth/*` routes so login errors display inline instead of triggering redirects
- **Rate Limiting** — In-memory store with configurable window/max, auto-cleanup every 5 minutes
- **Layout Auth Guards** — `usePathname()` in layouts hides profile/logout on login and register pages
- **Isolated Auth State** — Login and register pages use local `useState` instead of shared hooks to prevent state leaks
- **Memoized Components** — `React.memo` on ExamCard, `useCallback` for event handlers
- **CSS Animations** — Custom keyframes for splash screen, completion dialog, timeout dialog (all in globals.css)
- **Base UI Compatibility** — `DropdownMenuLabel` wrapped in `DropdownMenuGroup` for MenuGroupRootContext; Select uses `value` (controlled) instead of `defaultValue`

---

## Additional Questions

### MCP Integration

**Have you worked with any MCP (Model Context Protocol)?**

Yes. I have used Amazon Q Developer which operates through a Model Context Protocol-like architecture — it reads filesystem context, executes commands, and manipulates project resources through structured tool calls within the IDE environment.

**How MCP could be used in this project:**

- **Supabase MCP:** Connect directly to a Supabase instance to auto-generate database schemas from the TypeScript types (`Exam`, `Question`, `CandidateResult`), enabling real-time data sync without manual SQL migration scripts.
- **Figma MCP:** Read design tokens (colors, spacing, typography) directly from the Figma file and auto-generate Tailwind CSS theme variables, ensuring pixel-perfect design consistency.
- **Chrome DevTools MCP:** Capture runtime performance metrics and accessibility audit results during development, feeding them back into the development workflow for automated optimization.

### AI Tools for Development

**Which AI tools or processes have you used or recommend to speed up frontend development?**

- **Amazon Q Developer** — Used for this project. Excellent for full-stack agentic coding: reading project context, generating components, fixing errors, and running builds directly in the IDE.
- **GitHub Copilot** — Great for inline autocomplete, especially for repetitive patterns like form fields and API handlers.
- **v0 by Vercel** — Useful for quickly prototyping ShadCN/UI component layouts before integrating into the codebase.

### Offline Mode

**How would you handle offline mode if a candidate loses internet during an exam?**

1. **Local State Persistence:** Zustand's `persist` middleware already saves all answers to `localStorage` automatically. If the browser closes or refreshes, answers are preserved.
2. **Offline Detection:** Register `window.addEventListener('online'/'offline')` to show a "You are offline — your progress is saved locally" banner.
3. **Timer Continuity:** The timer runs client-side and is independent of network connectivity, so it continues accurately.
4. **Queued Submission:** On submit, if offline, push the result into an IndexedDB queue. Register a Service Worker with Background Sync API to automatically flush the queue when connectivity returns.
5. **Conflict Resolution:** Include a timestamp with each queued submission. The server validates that the submission timestamp falls within the exam window before accepting it.

---

## Video Recording

