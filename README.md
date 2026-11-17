# AHF Rwanda – Anonymous Student Q&A Platform

Students scan a QR code, fill in four fields (nickname, gender, avatar, question) and submit. AHF staff see questions instantly in a protected dashboard, mark them Pending/Answered, record who answered (AHF, RBC, USAID, or Untracked), and export everything to Excel.

Stack: Next.js 14 (App Router) · Tailwind CSS · Supabase (Postgres + Auth) · Vercel.

## Folder structure

```
supabase/schema.sql              Database table, constraints, trigger, RLS
src/app/page.tsx                 Student page (public)
src/app/api/questions/route.ts   Student submission endpoint (server-side validation + insert)
src/app/admin/login/page.tsx     Admin sign-in
src/app/admin/page.tsx           Admin dashboard (stats, tabs, search/filters, status management)
src/app/api/admin/...            Admin-only endpoints: list, update, Excel export
src/middleware.ts                Blocks /admin for anyone not signed in as an allowed admin
src/lib/                         Validation, avatars (SVG), Supabase clients, admin allow-list
scripts/make-qr.mjs              QR code PNG generator
```

## How security works

- The `questions` table has Row Level Security enabled with **no policies**, so the public anon key can neither read nor write it.
- Students submit to `/api/questions`; the **server** validates, then inserts with the service-role key (never sent to the browser). The database also enforces gender/avatar/status/respondent constraints.
- Every `/api/admin/*` route re-checks the signed-in Supabase user against the `ADMIN_EMAILS` allow-list, and `/admin` pages are blocked by middleware. Having a Supabase account alone is not enough.
- The app does not collect or store IP addresses, device IDs or location, and has no third-party tracking. (Vercel's own hosting logs may record request metadata; that is outside the app.)

## Setup

### 1. Supabase
1. Create a project at supabase.com.
2. **SQL Editor** → paste and run `supabase/schema.sql`.
3. **Authentication → Providers → Email**: keep Email enabled, and **turn OFF "Allow new users to sign up"** (Authentication → Sign In / Providers settings) so only accounts you create can exist.
4. **Authentication → Users → Add user → Create new user**: enter the staff email and a strong password, tick "Auto Confirm User". Repeat for each staff member.
5. **Project Settings → API**: copy the Project URL, the anon/publishable key and the service_role/secret key.

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key (server only) |
| `ADMIN_EMAILS` | Comma-separated staff emails created in step 1.4 |

### 3. Run locally
```
npm install
npm run dev
```
Student page: http://localhost:3000 · Admin: http://localhost:3000/admin

### 4. Deploy to Vercel
1. Push this folder to a GitHub repository.
2. On vercel.com: **Add New → Project → import the repo** (framework auto-detects as Next.js).
3. Add the four environment variables above (Settings → Environment Variables) for Production.
4. Deploy. Your student URL is the project domain, e.g. `https://your-project.vercel.app`.

### 5. Generate the QR code
After deployment, with the **student** URL (not `/admin`):
```
npm run qr -- https://your-project.vercel.app
```
This writes `qr/ahf-student-qr.png` (1200 px, high error correction; suitable for slides and print). Scan it with a phone and confirm the student form opens before printing.

## Test checklist (run on the deployed site)
Open on a phone; try submitting with each field empty; check Female shows only female avatars and Male only male; switch gender and confirm the avatar clears; submit a valid question and see the confirmation; confirm it appears in `/admin` under Pending; mark it answered with each respondent; confirm it moves to Answered; test search and filters; download the Excel file and check both sheets (Summary, Questions); open `/admin` in a private window and confirm you are sent to login; visit `/api/admin/questions` signed out and confirm 401.

## Notes on decisions
- The brief says both "UNSAID" and "USAID". I assumed **USAID** was intended and used it throughout (database, dashboard, export). To change it, edit `RESPONDENTS` in `src/lib/types.ts` and the `answered_by` check in `supabase/schema.sql`.
- The "Answered by" options are AHF, RBC and USAID; choosing "Not recorded" saves **Untracked**.
- The question limit is a 5,000-character abuse guard, far above a real question.
- The AHF logo is not included; `src/components/Brand.tsx` shows a simple "AHF" mark. Replace it with the official logo file when you have it.
- Admin data refreshes every 15 seconds and via the Refresh button.
