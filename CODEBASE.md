# Recoveree Web — Coach Dashboard

This document is the single source of truth for the **Coach's Web Dashboard** sub-app
of the Recoveree platform. It is written so a new contributor can pick up work
without reading the rest of the codebase first.

> Sister app: an iOS app (separate repo) that athletes use to log sleep + recovery
> data. This web app **does not** write to `recovery_logs`; it only reads them.

---

## 1. Tech Stack

| Concern        | Choice                                |
|----------------|---------------------------------------|
| Framework      | React 18 (function components + hooks)|
| Build tool     | Vite 5                                |
| Backend        | Supabase (Postgres + Auth)            |
| Data client    | `@supabase/supabase-js` v2 (browser)  |
| Styling        | Plain CSS in `src/styles.css` + minor inline styles. **Intentionally bare-bones** — a custom design system will be added in a later phase. Do **not** add Tailwind, MUI, etc. |
| State / routing| Local component state + a single `AuthContext`. No Redux, no React Router (we conditionally render `AuthPage` vs `DashboardPage` based on session). |

---

## 2. Quick Start

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env
# then edit .env with your Supabase project URL and anon key

# 3. Run the dev server
npm run dev
# Vite serves on http://localhost:5173

# 4. Production build (sanity check)
npm run build
```

### Required env vars

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`src/lib/supabaseClient.js` throws at load time if either is missing — this is
intentional so we fail loudly during the hackathon instead of silently.

---

## 3. Database Schema (Supabase, RLS disabled for hackathon)

> **The web app must not change these schemas.** The iOS app and any DB seeders
> assume them as-is.

### `profiles`
| Column | Type      | Notes                                  |
|--------|-----------|----------------------------------------|
| id     | uuid (PK) | Matches `auth.users.id`                |
| email  | text      |                                        |
| role   | text      | `'athlete'` or `'coach'`               |

### `team_roster`
| Column      | Type   | Notes                                       |
|-------------|--------|---------------------------------------------|
| id          | bigint (PK) |                                        |
| coach_id    | uuid   | FK → `profiles.id` where role=`'coach'`     |
| athlete_id  | uuid   | FK → `profiles.id` where role=`'athlete'`   |

### `recovery_logs`
| Column          | Type      | Notes                                  |
|-----------------|-----------|----------------------------------------|
| id              | bigint (PK) |                                      |
| athlete_id      | uuid      | FK → `profiles.id`                     |
| sleep_hours     | numeric   |                                        |
| recovery_score  | integer   |                                        |
| ai_advice       | text      | Generated server-side / by iOS app     |
| created_at      | timestamp |                                        |

> RLS is **disabled** for the hackathon, so the anon key can read/write everything.
> If RLS is later enabled, this app will need policies allowing coaches to:
> - select their own `team_roster` rows
> - select `profiles` rows whose id is in their roster
> - select `recovery_logs` rows whose `athlete_id` is in their roster
> - insert into `team_roster` with `coach_id = auth.uid()`
> - upsert their own `profiles` row on signup

---

## 4. File Tree

```
.
├── CODEBASE.md              # this file
├── README.md                # short "getting started" pointer
├── .env.example
├── .gitignore
├── index.html               # Vite entry HTML
├── package.json
├── vite.config.js
└── src
    ├── main.jsx             # React root + <AuthProvider> mount
    ├── App.jsx              # Routes between AuthPage and DashboardPage based on session
    ├── styles.css           # Minimal global styles
    ├── lib
    │   └── supabaseClient.js  # Singleton Supabase client (reads env vars)
    ├── context
    │   └── AuthContext.jsx    # Session state + signIn / signUp / signOut helpers
    ├── hooks
    │   └── useTeamData.js     # Fetches roster + profiles + recovery_logs for a coach
    ├── pages
    │   ├── AuthPage.jsx       # Login / Signup form
    │   └── DashboardPage.jsx  # Coach's main view
    └── components
        ├── DashboardHeader.jsx  # Title + email + Log out
        ├── AddAthleteForm.jsx   # Form to add an athlete to the roster
        └── AthleteTable.jsx     # Table of athletes + their latest recovery log
```

### Conventions

- **One component per file.** The file's default export is the React component.
- **Hooks** live in `src/hooks/` and use the `useXxx` naming convention.
- **All Supabase calls go through `src/lib/supabaseClient.js`.** Components and
  hooks import `supabase` from there; nothing else creates a client.
- **No backend / API routes.** Data is always fetched client-side.

---

## 5. Auth Flow (Phase 2)

Implemented in `src/context/AuthContext.jsx` and consumed by `src/App.jsx`.

1. On mount, `AuthProvider` calls `supabase.auth.getSession()` and subscribes to
   `onAuthStateChange`. Its `session` value is the source of truth across the app.
2. `App.jsx` renders `<AuthPage />` if there is no session, otherwise `<DashboardPage />`.
3. `AuthPage` has a single form with a toggle between **Log In** and **Sign Up**.
4. **Sign up:**
   1. `supabase.auth.signUp({ email, password })`
   2. Because email verification is disabled in the project's Supabase Auth
      settings, `data.session` is returned immediately.
   3. We then `upsert` a row into `profiles` with `id = data.user.id`,
      `email`, and `role = 'coach'`. This is what makes a web signup a coach.
5. **Log in:** `supabase.auth.signInWithPassword({ email, password })`. The
   profile row is assumed to already exist (created on signup).
6. **Log out:** `supabase.auth.signOut()` — handled from `DashboardHeader`.
7. Sessions persist across reloads via `persistSession: true` in the client config.

> If we re-enable email verification later, the profile upsert needs to move
> from "right after signUp" to "right after the verified session first appears"
> (e.g. inside the `onAuthStateChange` listener, gated on `event === 'SIGNED_IN'`
> and the absence of an existing profile row).

---

## 6. Roster Management (Phase 3)

Component: `src/components/AddAthleteForm.jsx`.

The coach types either:
- a UUID (validated by regex), or
- an email address (looked up in `profiles` to resolve the UUID).

Then we:
1. Reject if the resolved profile's `role` is not `'athlete'`.
2. Reject if a `(coach_id, athlete_id)` pair already exists in `team_roster`.
3. Insert a new row in `team_roster` with the current coach's `auth.uid()` and the
   resolved `athlete_id`.
4. Call the `onAdded` callback so the parent can refresh the dashboard data.

---

## 7. Data Fetching & Visualization (Phase 4)

Hook: `src/hooks/useTeamData.js`. Consumed by `src/pages/DashboardPage.jsx`.

Pipeline (all client-side):

1. `team_roster.select('id, athlete_id').eq('coach_id', coachId)` →
   list of athlete UUIDs on this coach's roster.
2. In parallel:
   - `profiles.select('id, email, role').in('id', athleteIds)`
   - `recovery_logs.select('id, athlete_id, sleep_hours, recovery_score, ai_advice, created_at').in('athlete_id', athleteIds).order('created_at', { ascending: false })`
3. Reduce `recovery_logs` into a `Map<athleteId, latestLog>` by taking the
   first entry per athlete (the array is pre-sorted desc).
4. Merge profile + latest log per athlete and expose `{ athletes, loading, error, refresh }`.

`DashboardPage` renders:
- `AddAthleteForm` (passes `refresh` as `onAdded`)
- `AthleteTable` showing one row per athlete with their **latest** `recovery_score`,
  `sleep_hours`, `ai_advice`, and the timestamp of that log.
- A **Refresh** button that re-runs the whole pipeline. This is how a coach pulls
  the newest logs from the iOS app on demand.

> Live updates were intentionally *not* wired through Supabase Realtime to keep
> the hackathon scope tight. The "Refresh" button is the documented mechanism.
> If we want push updates later, subscribe to `recovery_logs` channel filtered
> by `athlete_id=in.(...)` inside `useTeamData` and re-run `refresh` on insert.

---

## 8. Common Tasks (Cheat Sheet)

**Add a new field to the athletes table** (e.g. show `hrv` from `recovery_logs`):
1. Add the column to the `select` list in `useTeamData.js`.
2. Add a `<th>` and `<td>` in `AthleteTable.jsx`.

**Allow removing an athlete from the roster:**
1. Add a "Remove" button on each row in `AthleteTable` (will need to thread a
   callback through `DashboardPage`).
2. On click: `supabase.from('team_roster').delete().eq('coach_id', coachId).eq('athlete_id', athleteId)`.
3. Call `refresh()` from `useTeamData`.

**Switch to React Router:**
- Wrap `<App />` in a `<BrowserRouter>` in `main.jsx`.
- Replace the conditional in `App.jsx` with `<Routes>` and a `ProtectedRoute`
  wrapper that reads from `useAuth()`.

**Add a design system later:**
- Replace `src/styles.css` and inline styles. The components are deliberately
  thin so swapping styling layers is cheap.

---

## 9. Known Limitations / Tech Debt

- No tests. (Hackathon scope.)
- No realtime subscriptions; Refresh is manual.
- `AddAthleteForm` only supports email-or-UUID; no autocomplete / picker.
- Errors are surfaced as plain strings; no toast system.
- RLS is off — anyone with the anon key can read all data.
- `profiles.role` is set on signup but never validated server-side; the iOS app
  is responsible for marking athlete profiles with `role = 'athlete'`.

---

## 10. Phase Status

- [x] **Phase 1** — Vite + React scaffold, Supabase client wired to env vars.
- [x] **Phase 2** — Email/password auth, auto-coach role on signup, persisted session.
- [x] **Phase 3** — Dashboard view, Add Athlete form (email or UUID).
- [x] **Phase 4** — Roster + profiles + recovery_logs fetch, athlete table, Refresh button.
