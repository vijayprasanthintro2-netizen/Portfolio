# Vijayprasanth S — MERN Stack Developer Portfolio

A premium, responsive, animated personal portfolio built with the MERN stack. Features a
dark/light theme, a working contact form backed by Express + MongoDB, and real project links
only.

## Structure

```
vijay portfolio/
├── frontend/   React 18 + Vite + Framer Motion + lucide-react
│   └── src/
│       ├── content/   ContentProvider (fetches /api/content), iconMap, api client
│       ├── admin/     Admin panel UI (login, per-section editors, live design preview)
│       ├── sections/  Homepage sections (read content via context, static fallback)
│       └── data/      Static fallback content
└── backend/    Express + Mongoose (contact form API + content CMS)
    ├── config/        env, defaultContent seed
    ├── models/        Admin, Content, (contact)
    ├── controllers/   auth, content
    ├── middleware/    JWT auth
    └── routes/        auth, content
```

## Prerequisites

- Node.js (v18+) and npm
- MongoDB running locally on `localhost:27017` (for contact storage)

## Getting started

### 1. Backend

```bash
cd "E:\vijay portfolio\backend"
npm install
npm run dev        # http://localhost:5000
```

### 2. Frontend

```bash
cd "E:\vijay portfolio\frontend"
npm install
npm run dev        # http://localhost:5173
```

The frontend proxies `/api` to `http://localhost:5000` in development, so the contact
form works out of the box.

### Production build

```bash
cd "E:\vijay portfolio\frontend"
npm run build
npm run preview
```

## Environment variables (`backend/.env`)

| Variable          | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `PORT`            | Backend port (default `5000`)                            |
| `MONGO_URI`       | MongoDB connection string                                |
| `CLIENT_ORIGIN`   | Allowed frontend origin (default `http://localhost:5173`)|
| `CONTACT_TO_EMAIL`| Where contact-form emails are sent (optional)            |
| `SMTP_HOST`       | SMTP host (optional — required to email form replies)    |
| `SMTP_PORT`       | SMTP port (default `587`)                                |
| `SMTP_USER`       | SMTP username (optional)                                 |
| `SMTP_PASS`       | SMTP password (optional)                                 |

No credentials are hardcoded. If SMTP is not configured, the contact form still saves
messages to MongoDB. If neither is available it returns a friendly 503.

## Frontend environment variables

| Variable      | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| `VITE_API_URL`| API base URL (defaults to `/api` via the Vite proxy in dev)       |

## Admin panel (content CMS)

The site is fully editable at runtime from a password-protected admin panel at
`http://localhost:5173/#/admin` (hash route — no rebuild needed after saving).

Login credentials come from `backend/.env`:

| Variable          | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `ADMIN_USERNAME`  | Admin login username (default `admin`)                   |
| `ADMIN_PASSWORD`  | Admin login password (seeded on first backend start)     |
| `JWT_SECRET`      | Secret used to sign admin JWTs                           |

The admin panel lets you edit every section (Profile, About, Socials, Nav, Skills,
Projects, Journey, MERN, Build, Tech, Design) plus the global design tokens
(colors, fonts, radius) with a live preview, reset any section to defaults, and
change the admin password. Icons are resolved in code (`frontend/src/content/iconMap.js`)
and are not editable.

Saving writes to MongoDB; the public site fetches `GET /api/content` at runtime and
falls back to the static files in `frontend/src/data` if the API is unreachable.

The **Messages** page lists contact-form submissions (JWT-protected, delete included),
and a subtle **Admin** link is available in the public site's footer.

### CMS API endpoints

| Method | Endpoint                  | Auth | Description                                |
| ------ | ------------------------- | ---- | ------------------------------------------ |
| GET    | `/api/content`            | None | All content sections for the public site   |
| GET    | `/api/content/:section`   | JWT  | One section (seed data if none saved)      |
| PUT    | `/api/content/:section`   | JWT  | Save/replace a section                     |
| DELETE | `/api/content/:section`   | JWT  | Reset a section to defaults                |
| POST   | `/api/admin/login`        | None | Login, returns JWT                         |
| PUT    | `/api/admin/password`     | JWT  | Change the admin password                  |
| POST   | `/api/contact`            | None | Public contact form (rate-limited)         |
| GET    | `/api/contact`            | JWT  | List contact messages (newest first)       |
| DELETE | `/api/contact/:id`        | JWT  | Delete a contact message                   |

## Editing content (static fallback)

- Personal details & links → `frontend/src/config.js`
- Projects → `frontend/src/data/projects.js`
- Skills → `frontend/src/data/skills.js`
- Learning journey → `frontend/src/data/journey.js`
- Resume → place a PDF in `frontend/public/` and set `profile.resume` in `config.js`

## Notes

- Only real information is shown: VijayCart (live + GitHub) and the Weather App (GitHub).
  No fake projects, URLs or percentages.
- The project preview images are labelled UI-concept illustrations, not screenshots.
- Nothing is pushed to GitHub — you manage Git/GitHub manually.
