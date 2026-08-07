# Medico Overseas — MBBS Abroad Consultancy Platform

A full-stack MERN application (JavaScript only, no TypeScript) for an MBBS-abroad consultancy: a marketing website
with lead capture, a Student Portal with document management and an application progress tracker, and an Admin
Dashboard with a Lead CRM, content management, and analytics.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup — Backend](#setup--backend)
5. [Setup — Frontend](#setup--frontend)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Seeded Accounts](#seeded-accounts)
8. [Full Working Flow](#full-working-flow)
   - [A. Public Visitor Flow](#a-public-visitor-flow)
   - [B. Student Flow](#b-student-flow)
   - [C. Counsellor / Admin Flow](#c-counsellor--admin-flow)
   - [D. Content Management Flow](#d-content-management-flow)
9. [API Reference](#api-reference)
10. [Roles & Permissions Matrix](#roles--permissions-matrix)
11. [Application Progress Stages](#application-progress-stages)
12. [Known Gaps / TODO Before Production](#known-gaps--todo-before-production)
13. [Troubleshooting](#troubleshooting)

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT (access + refresh tokens), bcrypt, Cloudinary, NodeMailer,
Helmet, express-rate-limit, express-mongo-sanitize, ExcelJS, PDFKit.

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Redux Toolkit, TanStack Query, React Hook Form, Framer
Motion, Lenis (smooth scroll), Swiper, Recharts, React Hot Toast.

---

## Project Structure

```
medico-overseas/
├── backend/
│   ├── config/          MongoDB + Cloudinary connection config
│   ├── controllers/     Route handlers (business logic)
│   ├── middleware/      auth, error handling, validation, file upload
│   ├── models/          Mongoose schemas
│   ├── routes/          Express route definitions
│   ├── services/        email, Cloudinary, reCAPTCHA helper services
│   ├── utils/           ApiError, ApiResponse, asyncHandler, seed script
│   ├── .env.example
│   ├── package.json
│   └── server.js        App entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/store.js         Redux store
│   │   ├── components/
│   │   │   ├── layout/          Navbar, Footer, PublicLayout, AdminLayout, StudentPortalLayout, ProtectedRoute
│   │   │   ├── home/             Homepage sections (Hero, DestinationsGrid, etc.)
│   │   │   ├── forms/             EnquiryForm (reused site-wide)
│   │   │   └── common/           Logo, PageHero, Preloader, WhatsAppButton
│   │   ├── features/authSlice.js Redux auth slice
│   │   ├── hooks/                 React Query data-fetching hooks
│   │   ├── lib/                    axios client (with auto token refresh), React Query client
│   │   ├── pages/                  Route-level page components
│   │   │   ├── admin/               Admin dashboard pages
│   │   │   └── student/             Student portal pages
│   │   ├── App.jsx                 All route definitions
│   │   └── main.jsx                 App bootstrap (providers)
│   ├── package.json
│   └── vite.config.js
│
└── README.md   ← you are here
```

---

## Prerequisites

- **Node.js** ≥ 18.x and npm ≥ 9.x
- **MongoDB** — either a local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Cloudinary account** (free tier is fine) — for image/document uploads
- **SMTP credentials** — e.g. a Gmail account with an App Password, or any SMTP provider (SendGrid, Mailgun, etc.)
- (Optional but recommended) **Google reCAPTCHA v3 keys** — for spam protection on public forms

---

## Setup — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in the values (see [Environment Variables Reference](#environment-variables-reference) below).
At minimum, `MONGO_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are required for the app to start.

Generate strong random secrets for the JWT keys, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice to get two different values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

Seed the database with an initial Super Admin account and two sample destinations:

```bash
npm run seed
```

Start the server in development mode (auto-restarts on file changes via nodemon):

```bash
npm run dev
```

You should see:

```
MongoDB connected: <your-cluster-host>
Medico Overseas API running on port 5000 [development]
```

Verify it's alive:

```bash
curl http://localhost:5000/api/health
# {"status":"ok","uptime":...}
```

---

## Setup — Frontend

In a **separate terminal**:

```bash
cd frontend
npm install
npm run dev
```

Vite will start on `http://localhost:5173` and proxy any `/api/*` request to `http://localhost:5000` (configured in
`vite.config.js`), so the frontend and backend talk to each other automatically in development — no extra CORS
setup needed on your end beyond what's already in `server.js`.

Open **http://localhost:5173** in your browser.

---

## Environment Variables Reference

All of these live in `backend/.env` (copy from `backend/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Backend port (default `5000`) |
| `CLIENT_URL` | Yes | Frontend origin, e.g. `http://localhost:5173` — used for CORS and email links |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing long-lived refresh tokens (must differ from above) |
| `JWT_ACCESS_EXPIRES` | No | Default `15m` |
| `JWT_REFRESH_EXPIRES` | No | Default `7d` |
| `CLOUDINARY_CLOUD_NAME` | Yes* | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes* | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes* | From your Cloudinary dashboard |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Yes* | For sending lead-notification and password-reset emails |
| `EMAIL_FROM` | No | Display name/address for outgoing emails |
| `LEAD_NOTIFY_EMAIL` | No | Where new lead/contact submissions are emailed |
| `RECAPTCHA_SECRET_KEY` | No | If omitted, reCAPTCHA verification is skipped (dev-friendly) |
| `GOOGLE_MAPS_API_KEY` | No | Reserved for future use — the current Contact page map uses a public embed URL instead |

\* Required for that specific feature (uploads / emails) to work — the app will still boot without them, but
document uploads or emails will fail until they're set.

---

## Seeded Accounts

Running `npm run seed` creates:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@medicooverseas.com` | `ChangeMe123!` |

**Change this password immediately** after your first login in a real deployment — there's no forced-reset flow
yet, so this is a manual step.

Student accounts are **not** seeded — create one yourself via `/register` on the frontend (see below).

There is currently no UI for a Super Admin to create *other* staff accounts (counsellor, content_manager, etc.) —
the fastest way to create one during development is directly in MongoDB, or by adding a temporary admin-only
"create user" endpoint. See [Known Gaps](#known-gaps--todo-before-production).

---

## Full Working Flow

This section walks through the entire system end-to-end, in the order a real user would experience it.

### A. Public Visitor Flow

1. Visitor lands on `/` (Homepage) → sees hero, trust stats, destinations grid, admission process, exam teasers,
   testimonials, blog highlights.
2. Visitor clicks **Destinations → MBBS in Russia** (or any seeded country) → lands on
   `/destinations/mbbs-in-russia`, a fully data-driven page pulling from `GET /api/countries/:slug`.
3. Visitor fills out the **enquiry form** (present in the hero, on every destination page sidebar, on exam pages,
   and on the Contact page) → `POST /api/leads` is called.
   - Backend verifies reCAPTCHA (or skips if not configured).
   - A `Lead` document is created with `status: 'new'` and `source` set to wherever the form was submitted from.
   - An email is fired to `LEAD_NOTIFY_EMAIL` (failure here does **not** block the lead from being saved).
   - Visitor sees a toast confirmation.
4. Visitor can also browse `/blog`, `/testimonials`, `/gallery`, `/faqs`, or click the floating **WhatsApp button**
   (bottom-right) to open a pre-filled WhatsApp chat.
5. This lead now exists in the system, ready to be picked up by a counsellor (see Flow C).

### B. Student Flow

1. Student clicks **Log In** → **Create an account** (or goes directly to `/register`).
2. Fills in name, email, phone, password → `POST /api/auth/register`.
   - Backend hashes the password, creates a `User` with `role: 'student'`, issues an access token (returned in the
     response body) and a refresh token (set as an httpOnly cookie).
   - Frontend stores the access token in memory (`src/lib/api.js`) and the user object in Redux.
3. Student is redirected to `/portal` — the **Student Dashboard**.
   - On first visit, `GET /api/applications/me` lazily creates an `Application` document for them if one doesn't
     exist yet, starting at stage `application_submitted`.
   - The dashboard shows: current stage, assigned counsellor (initially "Not yet assigned"), estimated completion
     date, the latest counsellor remark (if any), and a 12-step visual progress tracker.
4. Student goes to `/portal/documents`.
   - For each required document type (Passport, Aadhaar, PAN, 10th/12th Memo, NEET Scorecard, Passport Photo,
     Medical Certificate, Offer Letter, Visa Documents, Other), they can **drag-and-drop or click to upload**.
   - `POST /api/applications/me/documents` streams the file to Cloudinary and attaches it to their application.
     Uploading to a slot that already has a file **replaces** it (the old file is deleted from Cloudinary).
   - Each document shows a status badge: *Not uploaded* → *Pending Review* → *Verified* (or *Rejected* with a
     reason, set by a counsellor).
   - Students can **preview** (opens the Cloudinary URL) or **delete** any uploaded document.
5. Student can view `/portal/profile` for their basic account info.
6. As a counsellor updates their application (Flow C), the student sees the stage advance and new remarks appear.
   An in-app notification is recorded on the backend for every stage change (currently stored on the `Application`
   document itself; a dedicated notification bell UI is a good next addition — see Known Gaps).

### C. Counsellor / Admin Flow

1. Staff member logs in at `/login` with their staff credentials → redirected to `/admin` (Admin Dashboard).
2. **Overview** (`/admin`) — `GET /api/admin/analytics` renders:
   - Stat cards: total students, total leads, new leads (30 days), conversion rate, applications, destinations,
     universities, published blogs.
   - A bar chart of monthly lead growth (last 6 months) and a pie chart of leads by CRM status.
3. **Leads (CRM)** (`/admin/leads`):
   - Table of all leads (counsellors only see leads assigned to them; admins/marketing see all).
   - Filter by status, search by name/phone/email.
   - Change a lead's status inline via dropdown → `PATCH /api/leads/:id` (this also appends to the lead's
     `statusHistory` automatically via a Mongoose pre-save hook).
   - Export the full list as **Excel** or **PDF** via the buttons (calls
     `GET /api/admin/export/leads/excel` / `.../pdf` directly, which streams a file download).
   - *(The backend also supports adding notes and assigning a counsellor to a lead — `POST /api/leads/:id/notes`
     and the `assignedCounsellor` field on `PATCH /api/leads/:id` — but the notes UI isn't wired into this table
     yet; see Known Gaps.)*
4. **Applications** (`/admin/applications`):
   - Table of all student applications (counsellors see only their assigned students).
   - Filter by current stage.
   - Use the **Advance To** dropdown on any row to move a student to a new stage →
     `PATCH /api/applications/:id/stage`. You'll be prompted for an optional counsellor remark, which gets
     attached to that stage-history entry and immediately surfaces on the student's dashboard.
   - *(Document verification — marking an uploaded document Verified/Rejected — has a backend endpoint,
     `PATCH /api/applications/:id/documents/:documentId/verify`, but no dedicated admin UI yet; see Known Gaps.)*
5. **Destinations** (`/admin/countries`) — list existing countries, add a new one via the inline form (name, short
   description, overview). This is what lets the client add a 7th+ country without any code changes — as soon as
   it's created here, it automatically appears in the navbar dropdown, homepage grid, and gets its own
   `/destinations/mbbs-in-<slug>` page.
6. **Universities** (`/admin/universities`) — list existing universities, add a new one tied to a country with a
   tuition fee.
7. **Blog CMS** (`/admin/blogs`) — list posts, create a new one (title, excerpt, body, category) which saves as a
   `draft`. Change its status via the dropdown (`draft` → `scheduled` → `published`) to make it live on `/blog`.

### D. Content Management Flow

The **Country** model is the backbone of the reusable destination template — every field entered here (eligibility,
admission process steps, required documents, visa process text, living cost, climate notes, FAQs) renders directly
on the corresponding public destination page with no template changes required. To fully populate a destination
page beyond what the current admin form covers (which only sets name/description/overview), use the API directly,
e.g.:

```bash
curl -X PUT http://localhost:5000/api/countries/<country_id> \
  -H "Authorization: Bearer <staff_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "eligibility": { "minAge": 17, "neetRequired": true, "minAcademicPercent": 50, "notes": "..." },
    "admissionProcess": [{ "step": "Consultation", "description": "..." }],
    "requiredDocuments": ["Passport", "10th Marksheet"],
    "visaProcess": "...",
    "livingCost": { "monthlyEstimate": 200, "currency": "USD" },
    "faqs": [{ "question": "...", "answer": "..." }]
  }'
```

A richer admin form for these nested fields is a natural next step (see Known Gaps).

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Register a student |
| POST | `/auth/login` | Public | Login (any role) |
| POST | `/auth/refresh` | Public (cookie) | Get a new access token |
| POST | `/auth/logout` | Private | Invalidate refresh token |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/reset-password/:token` | Public | Reset password |
| GET | `/auth/me` | Private | Current user |
| GET / POST | `/leads` | Public (POST) / Staff (GET) | Lead capture / CRM list |
| GET / PATCH / DELETE | `/leads/:id` | Staff | Single lead ops |
| POST | `/leads/:id/notes` | Staff | Add a note to a lead |
| GET | `/countries` | Public | List destinations |
| GET | `/countries/:slug` | Public | Destination detail + its universities |
| POST / PUT / DELETE | `/countries[/:id]` | Staff | Manage destinations |
| GET | `/universities` | Public | List universities (`?country=<slug>`) |
| POST / PUT / DELETE | `/universities[/:id]` | Staff | Manage universities |
| GET | `/blogs` | Public | List posts (`?category=&search=&page=&limit=`) |
| GET | `/blogs/:slug` | Public | Single post + related |
| POST / PUT / DELETE | `/blogs[/:id]` | Staff | Manage posts |
| GET | `/testimonials`, `/faqs`, `/gallery` | Public | List content |
| POST / PUT / DELETE | same, `/:id` | Staff | Manage content |
| GET | `/applications/me` | Student | My application |
| POST / DELETE | `/applications/me/documents[/:documentId]` | Student | Upload / delete a document |
| GET | `/applications` | Staff | List applications (`?stage=`) |
| PATCH | `/applications/:id/stage` | Staff | Advance stage |
| PATCH | `/applications/:id/assign` | Admin | Assign counsellor |
| PATCH | `/applications/:id/documents/:documentId/verify` | Staff | Verify/reject a document |
| POST | `/contact` | Public | Contact form |
| GET / PATCH | `/contact[/:id]` | Staff | Manage contact submissions |
| GET | `/admin/analytics` | Staff | Dashboard stats |
| GET | `/admin/export/leads/excel` \| `/pdf` | Staff | Download lead reports |

All protected routes expect `Authorization: Bearer <accessToken>` (the frontend's axios client attaches this
automatically once logged in, and transparently retries with a refreshed token on a 401).

---

## Roles & Permissions Matrix

| Action | super_admin | admin | counsellor | content_manager | marketing_manager | student |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View all leads | ✅ | ✅ | own only | ❌ | ✅ | ❌ |
| Update lead status / assign | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete lead | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage countries/universities/blogs/faqs/gallery | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage testimonials | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| View/advance applications | ✅ | ✅ | own only | ❌ | ❌ | ❌ |
| Assign counsellor to application | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View admin analytics / exports | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage own application/documents | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Enforced server-side via the `authorize(...)` middleware on every route — the frontend's `ProtectedRoute` component
mirrors this for UX (redirecting unauthorized users) but the backend is the actual source of truth.

---

## Application Progress Stages

In order, as tracked on `Application.currentStage`:

1. `application_submitted`
2. `documents_verified`
3. `university_shortlisted`
4. `application_sent`
5. `offer_letter`
6. `admission_confirmed`
7. `visa_processing`
8. `visa_approved`
9. `flight_booked`
10. `departure`
11. `university_reached`
12. `completed`

Every stage change is appended to `stageHistory` (with timestamp, optional counsellor remark, optional estimated
completion date, and who made the change) and generates a student-facing notification — this is what powers both
the student dashboard's progress bar and the counsellor remark callout.

---

## Known Gaps / TODO Before Production

- **Never installed or run** — this was built in a sandboxed environment without npm registry access. Every file
  was syntax-checked and import paths were verified to resolve, but `npm install` / `npm run dev` has not actually
  been executed. Budget time for a first-run debugging pass.
- **Blog rich-text editor** — the admin "Body" field is a plain `<textarea>` expecting raw HTML. Wire in TipTap,
  Quill, or similar before giving this to non-technical content editors.
- **Student profile editing** — `/portal/profile` is read-only; add a `PATCH /api/users/me` endpoint and form.
- **Lead notes UI** — backend supports notes (`POST /api/leads/:id/notes`) and status history; not yet surfaced in
  the admin Leads table (currently a status-history array with no dedicated timeline view).
- **Document verification UI** — backend endpoint exists (`PATCH /api/applications/:id/documents/:documentId/verify`)
  but there's no admin screen to review/approve/reject individual student documents yet.
- **Staff account creation** — no UI exists for a super_admin to create counsellor/content_manager/marketing_manager
  accounts; currently requires direct DB insertion or a temporary endpoint.
- **Nested destination-page fields** (admission process steps, required documents checklist, FAQs, visa process
  text) aren't yet exposed in the `/admin/countries` form — only name/description/overview are. Use the API
  directly (see [Content Management Flow](#d-content-management-flow)) until that form is built out.
- **Real content** — university data, testimonials, team bios/photos, and gallery images are all placeholders per
  the original requirements doc; replace before launch.
- **Credentials** — Cloudinary, SMTP, and reCAPTCHA keys must be supplied for uploads, email notifications, and
  spam protection to actually function; the app degrades gracefully without them in development (uploads/emails
  will just fail with clear errors; reCAPTCHA is skipped entirely if unconfigured).
- **No automated tests** — add Jest + Supertest for the backend and Vitest + React Testing Library for the frontend
  before shipping to production.
- **Notification bell UI** — `Application.notifications` array is populated on every stage change but there's no
  dedicated notification center in the student portal yet.

---

## Troubleshooting

**"MongoDB connection error" on backend start**
Check `MONGO_URI` in `.env` — if using Atlas, ensure your current IP is allow-listed under Network Access, and the
username/password in the connection string are URL-encoded if they contain special characters.

**Frontend shows a blank page / network errors in console**
Confirm the backend is running on port 5000 first — the frontend's dev server proxies `/api` calls to it and will
fail silently in the Network tab (not the page itself) if the backend isn't up.

**Login works but every subsequent request 401s**
The access token is kept in memory only (not localStorage, by design, to reduce XSS risk) — a full page refresh
clears it. The app should transparently fetch a new one via the refresh-token cookie on load (`fetchMe` in
`App.jsx`); if that's failing, check that `CLIENT_URL` in the backend `.env` exactly matches the frontend's origin
(protocol + host + port), since the refresh cookie is `sameSite: 'strict'` and CORS is locked to that origin.

**File uploads fail with a Cloudinary error**
Double-check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are all set and correct —
all three are required together.

**Emails aren't sending**
Verify `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`. If using Gmail, you need an **App Password** (not your
regular account password) with 2FA enabled on the account. Lead capture and contact-form submissions will still
succeed even if the email fails — check the backend console log for the actual SMTP error.
