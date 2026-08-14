# Vijayprasanth S — MERN Stack Developer Portfolio

A premium, responsive, animated personal portfolio built with the MERN stack. Features a
dark/light theme, a working contact form backed by Express + MongoDB, and real project links
only.

## Structure

```
vijay portfolio/
├── frontend/   React 18 + Vite + Framer Motion + lucide-react
└── backend/    Express + Mongoose (contact form API)
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

## Editing content

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
