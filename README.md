# ✨ Priyangi's Magical World

A full-stack personal site for Priyangi — articles, drawings, music, games, study, school, calendar and a private contacts directory. Admin (Priyangi) creates and edits all public content; signed-in users can comment, like and favourite.

## Stack
- **Backend:** Node 18+ / Express, MongoDB (Mongoose), JWT auth
- **Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion, React Router

## Project layout
```
priyangi/
├── server/         # Express + MongoDB API
│   ├── .env        # MongoDB URI, JWT secret, admin credentials
│   └── src/
└── client/         # Vite + React frontend
    └── src/
        ├── pages/  # Sections (articles, drawings, music, …)
        └── games/  # 7 mini-games
```

## First-time setup

The connection string you provided is in `server/.env`. **Rotate that MongoDB password** in Atlas — it was sent in plaintext, so treat it as compromised and create a new password, then update `MONGODB_URI` in `server/.env`.

While you're in there, also change:
- `JWT_SECRET` → a long random string
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` → Priyangi's real credentials

Dependencies are already installed by the scaffolder, but if you ever need to re-install:
```powershell
cd server; npm install
cd ../client; npm install
```

## Run it

Open **two terminals**:

**Terminal 1 — backend:**
```powershell
cd server
npm run dev
```
Should print `🌸 MongoDB connected` and `✨ Priyangi server on http://localhost:5000`. On first boot it creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

**Terminal 2 — frontend:**
```powershell
cd client
npm run dev
```
Open http://localhost:5173. You'll see the intro splash, then the magical home.

To make Priyangi an admin, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`. Other users can register normally and they'll be regular users.

## Sections

| Section | Public can | Logged in user can | Admin (Priyangi) can |
|---|---|---|---|
| Home | view | — | — |
| Articles | browse, read | comment, like | create, edit, delete |
| Drawings | browse, zoom | like | upload, edit, delete |
| Games | play | play | play |
| Music | browse, watch | favourite | add, edit, delete |
| Study | read notes | — | post study notes (article category=study) |
| School | view timetable, posts | — | post school posts |
| Calendar | — | private events | private events |
| Contacts | — | own directory | own directory |

(Calendar and Contacts are per-user private. Only the logged-in user — including Priyangi — sees their own.)

## Games
1. **Tic-Tac-Toe** — 2-player turn-based
2. **Memory Match** — flip 16 cards, find 8 pairs
3. **Word Scramble** — unscramble cute words, build streak
4. **Hangman** — guess words from K-pop / sweets vocab (keyboard works)
5. **2048** — slide tiles with arrow keys
6. **Snake** — classic, arrow keys
7. **Doodle Pad** — free-draw canvas with colour palette + daily prompt + PNG export

## Adding music
On the Music page, click "+ Add track" (admin only). Paste any YouTube URL — the server extracts the 11-character video ID automatically. Cover image is optional (falls back to YouTube thumbnail).

## API summary
All routes under `/api`. Auth header: `Authorization: Bearer <JWT>`.

- `POST /auth/register|login`, `GET /auth/me`
- `GET /articles` (filters: `category`, `q`), `GET /articles/:slug`, `POST /articles` (admin), `PUT/DELETE /articles/:id` (admin), `POST /articles/:id/like`, `POST /articles/:id/comments`, `DELETE /articles/comments/:id`
- `GET /drawings`, `POST/PUT/DELETE` (admin), `POST /drawings/:id/like`
- `GET /music`, `POST/PUT/DELETE` (admin), `POST /music/:id/favorite`
- `GET/POST/PUT/DELETE /events` (per-user)
- `GET/POST/PUT/DELETE /contacts` (per-user)

## Troubleshooting

**`MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`**
Atlas only accepts connections from whitelisted IPs. Open MongoDB Atlas → **Network Access** → **Add IP Address** → either *Add Current IP Address* (preferred) or *Allow Access From Anywhere* (`0.0.0.0/0`, only for development). After adding, wait ~30 seconds and restart the server.

If you've rotated the password, update `MONGODB_URI` in `server/.env` with the new one (URL-encode special characters: `@` → `%40`, `:` → `%3A`, etc.).

**Port already in use** — change `PORT` in `server/.env` (and update the proxy in `client/vite.config.js`).

**"Admin only" errors when posting** — log in with the email/password from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Regular registered accounts are users, not admins. To promote an existing account to admin, set `ADMIN_EMAIL` to that account's email and restart the server — the bootstrap step will upgrade their role.

## Production notes (later)
- Build the client: `cd client && npm run build` → `dist/` is a static bundle.
- Deploy server (Render/Railway/Fly) with the same env vars; serve the client from anywhere static (Vercel/Netlify) and set `CLIENT_ORIGIN` to its URL.
- Switch `JWT_SECRET` to a strong random value.
- Consider an image upload service (Cloudinary/S3) — for now drawing/music covers are URL-only.

✨ Built with love for Priyangi.
