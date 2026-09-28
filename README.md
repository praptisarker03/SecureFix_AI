# SecureFix AI

Detect vulnerabilities with static analysis, fix them with AI, and verify every fix by scanning the patched code again.

**The loop:** Upload → Detect (Semgrep) → Fix (Gemini) → Verify (re-scan + syntax check)

> Status: the frontend, authentication and database security are done. The scan pipeline
> (upload, Semgrep, Gemini, verification) is not built yet; the app pages show empty states
> until those backend endpoints exist.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, plain CSS (no UI framework) |
| Backend | Python, FastAPI, Uvicorn, Pydantic Settings, PyJWT, httpx |
| Auth & database | Supabase (Auth + PostgreSQL with Row Level Security) |
| Static analysis *(planned)* | Semgrep |
| AI engine *(planned)* | Google Gemini API |
| Tests / lint | pytest (backend), ESLint (frontend) |

---

## Architecture

```text
Browser (React SPA)
  │  1. login / signup / Google OAuth ───────────────► Supabase Auth
  │  ◄─────────────────────────────── access token (JWT)
  │
  │  2. API call with "Authorization: Bearer <JWT>"
  ▼
FastAPI backend
  │  3. verify JWT signature, expiry, issuer, audience (JWKS)
  │  4. confirm email is verified (asks Supabase), check role
  ▼
Protected endpoints  ──(planned)──► Semgrep ─► Gemini ─► re-scan

Supabase Postgres: every table has Row Level Security, so a user can only
read or change their own rows even with the public anon key.
```

Security is checked in three places:
1. **UI** – `ProtectedRoute` blocks pages until the user is logged in, has a verified email and (for `/admin`) the right role. This is only for user experience.
2. **Backend** – `deps.py` verifies the token and role on every request. This is the real API protection.
3. **Database** – RLS policies in `supabase/migrations`. This protects the data itself.

---

## Project structure

```text
SecureFix_Ai/
├── frontend/                     React app (Vite)
│   ├── index.html                HTML shell, fonts, favicon
│   ├── public/favicon.svg        Logo mark
│   └── src/
│       ├── main.jsx              Entry point: mounts <App />, loads tokens.css
│       ├── App.jsx               All routes (public / auth / app) + scroll handling
│       │
│       ├── styles/
│       │   ├── tokens.css        Design tokens: colors, fonts, radius, base element styles
│       │   └── app.css           All component and page styles
│       │
│       ├── lib/                  Non-UI helpers
│       │   ├── supabase.js       Supabase client (reads VITE_SUPABASE_* from .env)
│       │   ├── api.js            apiFetch(): calls FastAPI with the user's token
│       │   ├── passwordPolicy.js Password rules + strength score
│       │   └── constants.js      Severities, supported languages, date helpers
│       │
│       ├── context/
│       │   ├── AuthContext.jsx   Login, signup, Google, reset, verify, logout, role
│       │   └── DataContext.jsx   Projects/scans/findings store — the ONE place to
│       │                         connect the scan backend later (see TODO(backend))
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── PublicLayout.jsx   Top nav + footer for the marketing site
│       │   │   ├── AuthLayout.jsx     Split screen: form + animated loop
│       │   │   └── AppLayout.jsx      Sidebar + top bar for signed-in pages
│       │   ├── auth/
│       │   │   ├── ProtectedRoute.jsx Login / verified-email / role guard
│       │   │   ├── PasswordStrength.jsx Strength bar + checklist
│       │   │   └── ConfigBanner.jsx   Warning when Supabase .env is missing
│       │   ├── ui/
│       │   │   ├── Icons.jsx      Icon set + SecureFix logo
│       │   │   ├── Elements.jsx   Badges, Card, PageHeader, StatTile, EmptyState, …
│       │   │   ├── Charts.jsx     SVG charts: severity trend, bars, donut
│       │   │   ├── DiffView.jsx   Side-by-side before/after code diff
│       │   │   ├── Faq.jsx        Expandable FAQ list
│       │   │   └── Reveal.jsx     Fade-in-on-scroll wrapper
│       │   └── illustrations/
│       │       ├── HeroEditor.jsx Landing hero: animated scan → fix → verify editor
│       │       └── LoopDiagram.jsx Login page: animated Detect → Fix → Verify ring
│       │
│       └── pages/
│           ├── public/            Landing, How it works (docs), Pricing
│           ├── auth/              Login/Signup/Forgot, Reset password, Verify email, Unauthorized
│           ├── app/               Dashboard, Projects, New scan, Scan progress, Findings,
│           │                      Finding detail, Verification, Report, History, Evaluation,
│           │                      Settings, Admin
│           └── NotFoundPage.jsx   404
│
├── backend/                      FastAPI app
│   ├── app/
│   │   ├── main.py               Creates the app, CORS, mounts /api/v1
│   │   ├── core/
│   │   │   ├── config.py         Settings from backend/.env
│   │   │   └── security.py       Supabase JWT verification + email-confirmed check
│   │   └── api/
│   │       ├── deps.py           get_current_user, get_verified_user, require_role
│   │       └── v1/
│   │           ├── router.py     Registers the v1 routers
│   │           ├── health.py     GET /api/v1/health
│   │           └── auth.py       GET /api/v1/auth/me, GET /api/v1/admin/overview
│   ├── tests/test_auth.py        Token, verification and role tests
│   ├── requirements.txt
│   └── requirements-dev.txt      + pytest
│
└── supabase/migrations/          SQL to run in Supabase (profiles table + RLS)
```

---

## Pages

| Area | Route | Page |
|---|---|---|
| Public | `/` | Landing |
| | `/how-it-works` | Workflow, languages, verification logic, FAQ |
| | `/pricing` | Plans, comparison table, FAQ |
| | `/evaluation-results` | Public benchmark results |
| Auth | `/login`, `/signup`, `/forgot-password` | Email + Google sign in |
| | `/reset-password`, `/verify-email`, `/unauthorized` | Account flows |
| App | `/dashboard` | KPIs, trend, recent scans (onboarding when empty) |
| | `/projects` | Project cards / table |
| | `/scans/new` | Upload .zip, language, privacy notice |
| | `/scans/:id/progress` | Extract → Semgrep → AI → Verify tracker |
| | `/findings`, `/findings/:id` | List with filters; detail with AI fix diff |
| | `/findings/:id/verification`, `/verifications` | Three-check verification result |
| | `/report`, `/history`, `/evaluation` | Report + PDF, scan compare, thesis evaluation |
| | `/settings`, `/admin` | Profile, usage, integrations, false-positive rules; admin |

---

## Getting started

Requirements: Python 3.10+, Node.js 18+.

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1          # Windows  (Linux/macOS: source .venv/bin/activate)
pip install -r requirements-dev.txt
copy .env.example .env              # then fill in SUPABASE_URL and SUPABASE_ANON_KEY
uvicorn app.main:app --reload --port 8000
pytest                               # run tests
```
API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
copy .env.example .env              # then fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```
Open http://localhost:5173

### Database
Run the files in `supabase/migrations/` in order in the Supabase SQL editor.
