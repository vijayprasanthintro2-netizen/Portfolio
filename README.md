# Vijayprasanth S — MERN Portfolio

A responsive personal portfolio built with React, Vite, Node.js, Express and MongoDB. The public site presents projects, skills, experience and contact details. A protected admin panel manages the same content at runtime, including resume files, media, messages and theme tokens.

## About the project

This repository contains two separate npm projects:

- `frontend/` — the React single-page application.
- `backend/` — the Express API, MongoDB models and file storage.

The public site reads content from `/api/content`. If the API is unavailable, it falls back to the data in `frontend/src/data`, so the portfolio still renders. Admin pages use JWT-protected endpoints to edit content, upload files and read contact messages.

White is the default theme for both the public site and the admin panel. Dark mode is optional.

## Technologies

Frontend:

- React 18
- Vite 5
- Framer Motion
- lucide-react
- Plain CSS with custom design tokens

Backend:

- Node.js 18+
- Express 4
- Mongoose 8
- MongoDB and GridFS
- JSON Web Tokens, bcryptjs and express-rate-limit
- Multer for in-memory uploads
- Nodemailer for optional contact emails

## Features

Public site:

- Hero, About, Skills, Projects, MERN flow, Experience, Journey, Education, Build approach, GitHub and Contact sections
- VP monogram logo, premium boot loader and custom desktop cursor
- Responsive layout, mobile navigation and native scrolling
- Light and dark themes, with light selected by default
- Contact form backed by the Express API
- Resume download from the public URL when a resume is configured

Admin panel:

- Username and password login with a JWT session
- Dashboard with content, message and resume summaries
- Section editors for the CMS content stored in MongoDB
- Resume upload, replace, preview, download and delete
- Media library with stable public URLs for saved images
- Contact inbox with search, filter, read status and delete
- Password change and admin theme settings

## Project structure

```text
vijay portfolio/
├── README.md
├── frontend/
│   ├── public/                  Static files such as favicon, cover and resume
│   ├── src/
│   │   ├── admin/               Admin login, shell, dashboard and editors
│   │   ├── components/          Public sections and shared UI
│   │   ├── content/             CMS context, API client and URL helpers
│   │   ├── data/                Fallback content used when the API is down
│   │   ├── hooks/               Theme, reveal, typewriter and scroll hooks
│   │   ├── lib/                 Shared scroll listener
│   │   ├── styles/              Tokens, components, layout and responsive CSS
│   │   ├── App.jsx              Public/admin routing and preloader gate
│   │   ├── config.js            Profile links and API base URL
│   │   └── main.jsx             React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── config/                  Environment, database, defaults and GridFS
    ├── controllers/             Request handlers
    ├── middleware/              Auth, uploads and error handling
    ├── models/                  Admin, Content and ContactMessage schemas
    ├── routes/                  API route definitions
    ├── .env.example
    ├── package.json
    └── server.js                Express app and server startup
```

## Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env` only if you need to override the defaults:

```env
VITE_API_URL=/api
```

`VITE_API_URL` is read when Vite builds the app. The default `/api` works with the development and preview proxy. If the API is on another origin, include the full path, for example `https://api.example.com/api`.

Start the development server:

```bash
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to `http://localhost:5000` by default.

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`. A minimal local configuration looks like this:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/vijay-portfolio
CLIENT_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-string
```

Email delivery is optional. Set `CONTACT_TO_EMAIL` and the `SMTP_*` values only when you want contact submissions emailed as well as stored.

Start the API:

```bash
npm run dev
```

For a production-style local run:

```bash
npm start
```

The API listens on `http://localhost:5000` unless `PORT` is changed.

## Environment variables

Backend variables are defined in `backend/.env.example`:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. Defaults to `5000`. |
| `NODE_ENV` | Enables Morgan request logs when set to `development`. |
| `MONGO_URI` | MongoDB connection string. Without it, messages are not persisted and uploads are unavailable. |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS. |
| `CONTACT_TO_EMAIL` | Address that receives contact messages when SMTP is configured. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional SMTP delivery settings. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin account created on first start when a database is available. |
| `JWT_SECRET` | Secret used to sign admin session tokens. |

Frontend variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL used by the browser. Defaults to `/api` and must include `/api` when set to another origin. Build-time only. |
| `VITE_API_TARGET` | Dev/preview proxy target for `/api`. Defaults to `http://localhost:5000`. |
| `PORT` | Port used by `npm run preview`. Defaults to `4173`. |

Never commit real credentials, JWT secrets or database passwords.

## Database configuration

The API uses Mongoose with three collections:

- `Content` — one document per CMS section.
- `ContactMessage` — contact form submissions, newest first.
- `Admin` — the admin account created from environment variables.

Uploaded resume PDFs and media images are stored in MongoDB GridFS under the `portfolio_assets` bucket, not on the server disk. If `MONGO_URI` is empty, the server still starts and the public site uses its fallback content, but contact storage, CMS saves and uploads will not work.

Default section content lives in `backend/config/defaultContent.js`. The frontend also keeps fallback data in `frontend/src/data`.

## Development commands

From the repository root, work in the two folders separately:

```bash
cd frontend && npm run dev
cd backend && npm run dev
```

Available scripts:

| Folder | Command | Action |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start Vite on port 5173. |
| `frontend` | `npm run build` | Build the static site into `frontend/dist`. |
| `frontend` | `npm run preview` | Preview the production build on port 4173 by default. |
| `backend` | `npm run dev` | Start the API with nodemon. |
| `backend` | `npm start` | Start the API with Node. |

## API documentation

All routes are mounted under `/api`.

Public:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API health check. |
| `GET` | `/api/content` | Merged public CMS content. |
| `GET` | `/api/content/asset/*` | Resolve a saved CMS asset URL. |
| `GET` | `/api/assets/k/:key` | Stream a GridFS file by its stable key. |
| `GET` | `/api/assets/:id` | Stream a GridFS file by ObjectId. |
| `POST` | `/api/contact` | Submit a contact message. Rate limited. |

Admin — requires `Authorization: Bearer <token>`:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Sign in and receive a token. Rate limited. |
| `PUT` | `/api/admin/password` | Change the admin password. |
| `GET` | `/api/admin/overview` | Dashboard counters and recent activity. |
| `GET` | `/api/content/:section` | Read one CMS section. |
| `PUT` | `/api/content/:section` | Save one CMS section. |
| `DELETE` | `/api/content/:section` | Reset one CMS section to its default. |
| `GET` | `/api/contact` | List contact messages, newest first and capped at 100. |
| `PATCH` | `/api/contact/:id/read` | Toggle a message's read status. |
| `DELETE` | `/api/contact/:id` | Delete a message. |
| `GET` | `/api/admin/assets` | List uploaded media. |
| `POST` | `/api/admin/assets` | Upload a media file. |
| `PUT` | `/api/admin/assets/key/:key` | Replace a media file without changing its URL. |
| `DELETE` | `/api/admin/assets/key/:key` | Delete a media file. |
| `GET` | `/api/admin/resume` | Read resume metadata and URLs. |
| `POST` | `/api/admin/resume` | Upload or replace the resume PDF. |
| `DELETE` | `/api/admin/resume` | Delete the resume PDF. |

Use `?download=1` with a streamed asset URL when a download response is needed.

## Deployment

This repository does not include deployment configuration such as `vercel.json`, `netlify.toml`, a Dockerfile or a process manager file. Hosting is handled outside the repository.

The general flow is:

1. Build the frontend with `cd frontend && npm run build`.
2. Serve the generated `frontend/dist` folder as static files.
3. Run the backend with `npm start` and set all required environment variables.
4. Make sure the browser can reach the API. Either proxy `/api` to the backend on the same origin, or build the frontend with `VITE_API_URL=https://your-api-origin/api`.
5. Set `CLIENT_ORIGIN` on the backend to the deployed frontend origin so CORS allows the requests.
6. Use a hosted MongoDB instance and keep its credentials only in the hosting dashboard.

The admin panel is available at the `#/admin` hash route.

## Future improvements

- Add automated tests for the API and the main admin flows.
- Test scrolling and touch interactions on a wider range of real devices.
- Add image format conversion and responsive variants for large media uploads.
- Review rate limits and caching rules as traffic grows.

## Author

Vijayprasanth S — MERN Stack Developer

- GitHub: https://github.com/vijayprasanthintro
- LinkedIn: https://www.linkedin.com/in/vijayprasanth-s-b0343431b
- Email: vijayprasanth242@gmail.com
