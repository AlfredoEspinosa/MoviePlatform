# CONTEXT.md — MoviePlatform (IBM Node.js Challenge)

This file is a living reference for LLMs and developers. It captures the architecture, organization, tech stack, conventions, and known quirks of the project so that work can be resumed without restarting from scratch (e.g., after a model change or token exhaustion). **Update this file whenever the project changes.**

---

## 1. Project overview

MoviePlatform is a sample Node.js REST API application for managing a movie catalog. It demonstrates:

- A REST API built with **Express** (GET / POST / PUT / PATCH / DELETE).
- Two HTML pages served by the same app that consume the API via **Axios** (loaded from CDN), acting as a lightweight/improvized frontend.
- **PostgreSQL** as the datastore, deployed as a separate container and orchestrated with **docker-compose / podman-compose**.
- DB schema creation (migrations) and initial data load (seeds) run as Node scripts on container startup.
- Unit testing with **Jest + Supertest**, plus a **GitHub Actions** CI workflow.

Primary purpose today: demonstrate the API and CRUD operations. The Axios/HTML frontend is being replaced by a **small React SPA** built with Vite in the `frontend/` folder (migration in progress — see §8 and §14).

Repo: `https://github.com/AlfredoEspinosa/MoviePlatform.git` (branch `main`).

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Host machine                            │
│                                                                  │
│   ┌───────────────────────────┐    ┌───────────────────────────┐ ┌─────────────────────────┐ │
│   │  api container            │    │  db container             │ │  frontend container      │ │
│   │  (node:22-alpine)         │    │  (postgres:16)            │ │  (node:22-alpine)       │ │
│   │  ──────────────────────── │    │  ──────────────────────── │ │  ───────────────────────│ │
│   │  docker-entrypoint.sh     │    │  DB: movie_platform       │ │  Vite dev server :5173  │ │
│   │   ├─ wait for pg (pg_isready)│  │  user/pass: postgres     │ │  /api → api:3000 (proxy)│ │
│   │   ├─ npm run migrate      │    │  port: 5432               │ │  src bind-mounted (HMR) │ │
│   │   ├─ npm run seed         │    │  volume: movie-db-data    │ │  volume: frontend-node-  │ │
│   │   └─ npm start (index.js) │    │                           │ │           modules        │ │
│   │  Express app on :3000     │    └───────────────────────────┘ └─────────────────────────┘ │
│   │   ├─ /api/movies/*  API   │                                  │                          │
│   │   └─ /public  static HTML │                                  │                          │
│   └───────────────────────────┘                                  │                          │
│        │  TCP 5432 (internal network) ───────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
        │                                                            │
        │ HTTP :3000 (browser/curl)                                  │ HTTP :5173 (browser)
        ▼                                                            ▼
   Browser → http://localhost:3000/  (API + legacy HTML UI)   Browser → http://localhost:5173/  (React SPA)
```

- API container waits for DB health, then runs migrations and seeds **idempotently**, then starts the Express server.
- The DB container persists data in a named Docker volume (`movie-db-data`), so data survives container restarts.
- DB connection is a **singleton `pg.Pool`** (no ORM). All SQL is hand-written.

---

## 3. Tech stack

| Piece | Technology | Version / Notes |
|---|---|---|
| Runtime | Node.js | 22 (Docker image `node:22-alpine`) |
| Web framework | Express | ^5.1.0 (v5! middleware/error-handling semantics differ from v4) |
| Database | PostgreSQL | 16 (Docker image `postgres:16`) |
| DB driver | `pg` (node-postgres) | ^8.22.0 — raw SQL via `Pool` |
| HTTP test client | Supertest | ^7.1.4 |
| Testing framework | Jest | ^30.2.0 |
| Dev auto-reload | Nodemon | ^3.1.10 (used by `npm run dev`) |
| Frontend HTTP | Axios | loaded from CDN in HTML pages (not an npm dependency here) |
| Frontend framework | React | 19 (new SPA in `frontend/`, migration in progress) |
| Frontend build tool | Vite | 8 (scaffolded with `npm create vite@latest frontend -- --template react`) |
| Frontend routing | react-router-dom | 7 (`<BrowserRouter>`, `<Routes>`, `<Link>`) |
| Container runtime | Docker or Podman | compose orchestration (`podman-compose up --build`) |
| Frontend container | node:22-alpine | Vite dev server (:5173) with `/api` proxy → `api:3000` |
| CI | GitHub Actions | Node 22.x + Postgres 16 service container |

The top-level root also contains a `node_modules/` folder (legacy; the real one lives under `movie-platform-rest-api/`).

---

## 4. Repository layout

```
IBM-NodeJS-Challenge/
├── README.md                      # Setup & usage docs (podman instructions, API table)
├── docker-compose.yml             # db + api service orchestration
├── CONTEXT.md                     # THIS FILE
├── localhost_menu.png             # Screenshot of the HTML UI menu
├── .github/workflows/node.js.yml  # CI: migrate → seed → test against Postgres
├── .gitignore
└── movie-platform-rest-api/       # Node.js application (the whole app lives here)
    ├── index.js                   # Express entry point, static hosting, route mount
    ├── package.json               # scripts + dependencies
    ├── package-lock.json
    ├── Dockerfile                 # node:22-alpine + postgresql-client (pg_isready)
    ├── docker-entrypoint.sh       # wait-for-db → migrate → seed → start
    ├── config/
    │   └── database.cjs           # pg.Pool singleton (env-based config)
    ├── routes/
    │   └── movies.js              # Express Router for /api/movies
    ├── controllers/
    │   └── movieController.js     # All DB query + response logic (7 handlers)
    ├── middleware/
    │   ├── validationMiddleware.js # validateMovieRecord (POST/PUT body checks)
    │   └── errorMiddleware.js     # notFound (404) + errorHandler (500)
    ├── database/
    │   ├── migrations/
    │   │   └── createTables.js    # DROP + CREATE movies table
    │   ├── seeds/
    │   │   └── seedMovies.js      # 10 sample movies (idempotent, --force to wipe)
    │   └── movie_platform.sqlite3 # ⚠️ STALE / NOT IN USE (legacy SQLite)
    ├── public/                    # Static frontend (served at root)
    │   ├── load-all-movies.html   # list + filter + create UI (Axios)
    │   ├── single-movie.html      # dropdown detail + PUT/PATCH/DELETE UI (Axios)
    │   └── movies-list-post-requests.json  # 106 pre-made POST payloads
    ├── movies.test.js             # Jest + Supertest test (validation middleware)
    └── .gitignore
    └── frontend/                      # React SPA (Vite) — replaces the HTML+Axios pages
        ├── package.json               # react, react-dom, axios, react-router-dom + Vite tooling
        ├── vite.config.js             # /api proxy → http://localhost:3000
        ├── index.html                 # Vite entry HTML
        ├── public/images/             # 0-5.png posters (kept, currently unused)
        └── src/
            ├── main.jsx               # ReactDOM entry, wraps <App/> in <BrowserRouter>
            ├── App.jsx                # <Routes> only: "/" (list) and "/movie/:id" (detail) — no nav bar
            ├── index.css              # design vars (--bg, --accent, …), toolbar, filters, filmstrip, movie-card
            ├── api/
            │   └── movies.js          # axios client: 7 functions (getMovies, getDropdownMovies, getMovie, createMovie, updateMovie, updateViews, deleteMovie)
            ├── utils/
            │   └── chunkArray.js      # splits array into rows of N (groups movie posters 2-per-row)
            ├── assets/                # posters 0-7.jpeg (bundled at build time via import.meta.glob)
            └── pages/
                ├── MovieListPage.jsx  # debounced live filters + "Create New Movie" toolbar/form
                ├── Movie.jsx          # editable form card; edit mode (Edit/Delete) OR create mode (Create/Cancel) via `isCreating`
                ├── MoviePage.jsx      # route /movie/:id → fetch movie, render <Movie key={movie.id}/>
                ├── MoviesStrip.jsx    # filmstrip: poster grid (2/row), import.meta.glob posters, navigate() on click
                └── MovieDetailPage.jsx# ⚠️ leftover of an earlier step — no longer routed
```

> ⚠️ `frontend/` and `.gitattributes` are currently **untracked** in git (working tree shows them as new files).

> ⚠️ `database/movie_platform.sqlite3` is a leftover from the old SQLite implementation and is **ignored / not in use**. Do not build on it. The `.gitignore` files ignore both root and app `node_modules/` and the sqlite file.

---

## 5. Runtime flow (container startup)

`docker-entrypoint.sh` (`movie-platform-rest-api/docker-entrypoint.sh`):

1. `set -e` — fail fast on any error.
2. Poll `pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER` up to **10 attempts**, 2s apart. Exits 1 if DB never becomes reachable.
3. `npm run migrate` → runs `database/migrations/createTables.js`.
4. `npm run seed` → runs `database/seeds/seedMovies.js`.
5. `npm start` → `node index.js` (Express server).

`docker-compose.yml` (`services: db, api, frontend`):

- `db`: `postgres:16`, env `POSTGRES_USER/PASSWORD/DB = postgres/postgres/movie_platform`, port `5432:5432`, named volume `movie-db-data`, healthcheck `pg_isready`.
- `api`: built from `./movie-platform-rest-api`, port `3000:3000`, env `DB_HOST=db`, `DB_PORT=5432`, `DB_USER/PASSWORD=postgres`, `DB_NAME=movie_platform`, `depends_on.db.condition: service_healthy`.
- `frontend`: built from `./frontend` (Dockerfile runs the **Vite dev server**), port `5173:5173`, env `VITE_API_PROXY=http://api:3000` + `VITE_USE_POLLING=true`, bind-mounts `./frontend:/app` (live HMR) with a named `frontend-node-modules` volume so the container keeps its own `node_modules` (the host one is shadowed). `depends_on: api`.

---

## 6. Database schema

Table `movies` (recreated on every container start by the migration script — DROP + CREATE):

```sql
CREATE TABLE IF NOT EXISTS movies(
    id            SERIAL PRIMARY KEY,
    title         TEXT NOT NULL,
    release_year  INTEGER,
    genere        TEXT NOT NULL CHECK(genere IN ('Drama','Action','Comedy','Fantasy','Romance','Horror','Western','Science fiction','Adventure','Documentary','Animation')),
    synopsis      TEXT NOT NULL,
    country       TEXT NOT NULL,
    views         INTEGER DEFAULT 0,
    directed_by   TEXT NOT NULL,
    main_actors   TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_record INTEGER DEFAULT 1
)
```

Important data-model facts:

- `genere` is a **deliberately misspelled** column/field name (project convention — keep it consistent everywhere).
- `main_actors` is stored as a **comma-joined TEXT string** (e.g., `"John Carter, Maya Lin"`), but the API expects/returns an **array** of strings. The controller joins on write (`main_actors.join(", ")`) and does NOT split on read (frontend re-splits it). ⚠️ When reading, `main_actors` comes back as a string, not an array.
- `active_record` (INTEGER, 1/0) is a **soft-delete** flag. `active_record=1` filters appear in GET endpoints.
- `views` default 0.

---

## 7. API reference

Base URL: `http://localhost:3000`

Root `GET /` returns a JSON menu listing the endpoints.

| Method | Endpoint | Controller handler | Description |
|---|---|---|---|
| GET | `/api/movies` | `getAllMovies` | List active movies. Filters (query params, all optional): `title` (LIKE), `release_year` (=), `genere` (=), `country` (=), `directed_by` (LIKE), `main_actors` (LIKE). Returns `{success, count, data}` or 404 if none match. |
| GET | `/api/movies/dropdown-movies` | `getDropDownMovies` | Active movies as `{id, title}` only (used to populate the HTML dropdown). |
| GET | `/api/movies/:id` | `getMovie` | Single active movie by id; 404 (`notFound`) if missing/inactive. |
| POST | `/api/movies` | `createMovie` | Create a movie. Body must pass `validateMovieRecord`. Insert without returning the created row. |
| PUT | `/api/movies/:id` | `updateMovie` | Full update (validated). Builds dynamic SET clause only for provided fields; always touches `updated_at`. Requires `main_actors` as array. 404 if movie does not exist. |
| PATCH | `/api/movies/:id` | `updateMovieViews` | Partial update — **only updates `views`** to whatever `views` is sent in body (no validation). |
| DELETE | `/api/movies/:id` | `deleteMovie` | **Soft delete**: sets `active_record=0`. Row remains in DB. |

Response envelope convention: `{ success: boolean, data | count | updated | error }`.

Static pages:
- `GET /load-all-movies` → `public/load-all-movies.html`
- `GET /single-movie` → `public/single-movie.html`

### Valid movie body (POST/PUT)

```
{
  title: string (required),
  release_year: number (required, not in the future),
  genere: string (required, must be in the 11-genre CHECK list, case-insensitive),
  synopsis: string (required),
  country: string (required),
  views: number (required),
  directed_by: string (required),
  main_actors: string[] (required, non-empty)
}
```

Validation lives in `middleware/validationMiddleware.js` and returns 400 with `success:false` + `"Bad Request - Invaild data: ..."` (note the typo "Invaild" in the message — existing tests assert on it, change with care).

---

## 8. Frontend (React SPA — migration in progress)

Two generations of frontend coexist right now:

**Legacy (still served, to be removed):** `movie-platform-rest-api/public/` — plain HTML + Axios from CDN.
- `load-all-movies.html`: search/filter form + "Create New Movie" button; create picks a random index 1–100 from `movies-list-post-requests.json` (106 entries) and POSTs it.
- `single-movie.html`: dropdown from `/api/movies/dropdown-movies`; supports Update (PUT), Increase Views (PATCH, +random 0–999), and Delete (soft).
- Both hardcode `http://localhost:3000` as the API base.

**React SPA (current work):** `frontend/` — Vite + React 19 + react-router-dom 7 + axios.
- Dev server `http://localhost:5173`, with Vite proxy `/api → http://localhost:3000` (no CORS issues; the SPA never talks directly to port 3000 in dev).
- `vite.config.js` — proxy target configurable via `VITE_API_PROXY` env (default `http://localhost:3000` for host dev; compose sets `http://api:3000`); `server.host: true` and `VITE_USE_POLLING` for container HMR.
- `src/api/movies.js` — axios client, one exported function per endpoint. It sends `main_actors` **as an array** on write (the backend controller joins it to a comma-string; the client must NOT join, that double-conversion caused a 500).
- `src/pages/MovieListPage.jsx` — debounced **live search**: `useEffect` depends on `[filters]` and refetches 300ms after the user pauses typing (setTimeout + `ignore`/`clearTimeout` cleanup). No Search button. Has a "Create New Movie" toolbar button that mounts `<Movie isCreating …/>`.
- `src/pages/Movie.jsx` — reusable editable form card with two modes via the `isCreating` prop: edit mode shows Edit/Delete (`updateMovie`/`deleteMovie`), create mode shows Create/Cancel (`createMovie` + `onDone`/`onCancel` callbacks). Edits `main_actors` as comma-string, splits/trims/filters into an array only when building the payload.
- `src/pages/MoviesStrip.jsx` — filmstrip of poster cards (2 per row via `chunkArray(movies, 2)`); posters resolved at build time with `import.meta.glob("../assets/*.{png,jpeg,jpg,webp}")` (prefers `.jpeg`, falls back to `0.jpeg`); `navigate(/movie/${id})` on click.
- `src/pages/MoviePage.jsx` — route `/movie/:id`: `useParams` + `getMovie`, renders `<Movie key={movie.id} movie={movie}/>` (the `key` remounts the form per movie so state resets on navigation).
- `src/main.jsx` wraps `<App/>` in `<BrowserRouter>`; `App.jsx` has only `<Routes>` for `/` (list) and `/movie/:id` (detail).
- ESLint (the Vite template's `eslint-plugin-react-hooks` v7 rules) is strict: **no synchronous setState in effects** → all data fetching uses the inline-async + `ignore` cleanup pattern, and UI resets live in event handlers. `npm run lint` must stay clean.

Known frontend gotchas:
- `main_actors` round-trips as a **string** from the API (e.g. `"John Carter, Maya Lin"`), must be split to array before POST/PUT; never join in the axios client.
- The SPA has no production integration yet — Express still serves the old HTML; the next step is to serve the built `frontend/dist` from Express and retire the `.html` files.

---

## 9. Testing & CI

Local tests: `cd movie-platform-rest-api && npm test` (runs Jest). The single test (`movies.test.js`) builds a minimal Express app mounting the movies router at `/movies` and asserts that posting a movie with `genere: "Historical Drama"` returns **400** with the exact validation error message.

⚠️ The test does NOT require a database (validation short-circuits before DB access), so `npm test` works without Postgres locally.

CI (`.github/workflows/node.js.yml`):
- Triggers: push / PR to `main`.
- Working dir: `movie-platform-rest-api`.
- Service container `postgres:16` (same credentials as compose) on port 5432.
- Steps: `actions/checkout@v4` → setup-node 22.x (npm cache, `cache-dependency-path` points to the app's `package-lock.json`) → `npm ci` → `npm run migrate` → `npm run seed` → `npm test` with DB env vars set to the service container.

---

## 10. Configuration & environment variables

| Env var | Default | Used by |
|---|---|---|
| `PORT` | `3000` | Express listen |
| `DB_HOST` | `localhost` | `pg.Pool` |
| `DB_PORT` | `5432` | `pg.Pool` (parsed as int) |
| `DB_USER` | `postgres` | `pg.Pool` |
| `DB_PASSWORD` | `postgres` | `pg.Pool` |
| `DB_NAME` | `movie_platform` | `pg.Pool` |

Set in compose for the `api` service; set in CI workflow. When running the app on the host (not containerized), defaults point to a local Postgres with the same credentials.

npm scripts (`movie-platform-rest-api/package.json`):
- `npm start` → `node index.js`
- `npm run dev` → `nodemon index.js`
- `npm test` → `jest`
- `npm run migrate` → `node database/migrations/createTables.js`
- `npm run seed` → `node database/seeds/seedMovies.js` (supports `--force` to wipe & reseed)

---

## 11. Planned / desired improvements

- **Serve the built React SPA from Express and retire the HTML+Axios pages** (replace the two `.html` files + their routes in `index.js`, and update the root endpoint menu JSON). This is the remaining step of the React migration.
- The "Create New Movie" flow now exists in the SPA (toolbar button → `<Movie isCreating/>`), but it uses a blank form — the old UI's "random payload from `movies-list-post-requests.json`" convenience is not ported.
- The root-level `node_modules/` is legacy and should be removable.
- Remove/clean the stale SQLite artifacts (`database/movie_platform.sqlite3` and its gitignore entries).
- Potential cleanups: unify `main_actors` handling (array vs comma-string), type corrections, adding DB-backed integration tests, and proper input validation for PATCH.

---

## 14. Dev log

### 2026-08-10 — React SPA migration (scaffold → create flow)
- Scaffolded `frontend/` with `npm create vite@latest frontend -- --template react` (React 19, Vite 8, ESLint), installed `axios` + `react-router-dom`; added Vite `/api` proxy → `http://localhost:3000` in `vite.config.js`.
- Fixed `docker-entrypoint.sh` CRLF line endings (24 `\r\n` broke the container); added `.gitattributes` (`*.sh text eol=lf`) and ran `git add --renormalize .`. Stale podman containers were the other cause — fixed with `podman-compose down && podman-compose up -d --build`.
- Built the SPA: `api/movies.js` client, `MovieListPage` (debounced live filters, 300ms), `MoviesStrip` (poster grid, 2/row), `MoviePage` (`/movie/:id`), `Movie` (editable form).
- **Create flow (latest):** `Movie` gained an `isCreating` mode (blank form, Create/Cancel buttons → `createMovie`, `onDone`/`onCancel` callbacks); `MovieListPage` got a `.toolbar` "+ Create New Movie" button; `handleCreated` refreshes the list after a successful create.
- Fixed `main_actors.join is not a function` (500) — root cause was a **double conversion**: the api client was joining the array AND the backend controller joins it again. Removed `.join(", ")` from `createMovie`/`updateMovie` in the client; verified live (string → 500, array → 200).
- Styling in `index.css`: design vars + `.toolbar`, `.filters`, filmstrip, `.movie-card` form styles; posters `src/assets/0-7.jpeg` bundled via `import.meta.glob`.
- `App.jsx` routes are now just `/` and `/movie/:id`; `MovieDetailPage.jsx` is no longer routed but still exists in `pages/`.
- `npm run lint` and `npm run build` both pass.

### 2026-08-10 — frontend service in docker-compose
- Added `frontend/` as a third compose service (`db`, `api`, `frontend`): node:22-alpine image running the **Vite dev server** on :5173.
- `frontend/Dockerfile` + `.dockerignore`; compose bind-mounts `./frontend:/app` with a `frontend-node-modules` named volume so container deps aren't shadowed by the host.
- Made `vite.config.js` container-friendly: `server.host: true`, proxy target now `process.env.VITE_API_PROXY || "http://localhost:3000"`, and `VITE_USE_POLLING=true` (set in compose) enables polling-based HMR for Windows bind mounts.
- Verified: `docker compose config` OK; image builds with podman; full stack up (`podman-compose up -d frontend`) — `http://localhost:5173/` returns 200 and the `/api` proxy reaches the api container (200).

### Next session (Step 13+)
1. Serve the built `frontend/dist` from Express (`express.static` + catch-all → `index.html`), retire `load-all-movies.html` / `single-movie.html` and their routes, update the root menu JSON in `index.js`.
2. Decide whether to `.gitignore` `frontend/dist`.
3. Commit `frontend/` + `.gitattributes` (currently untracked).

---

## 12. Known quirks & gotchas (read before editing)

1. **Express 5** — router and async error semantics differ from Express 4; keep that in mind when touching middleware/routes.
2. **`genere` misspelling** is used consistently (column, field, filters, frontend, JSON). Do not "fix" one place without updating all.
3. **`main_actors` is a string in DB but array in API**; controller joins on write only.
4. **Validation error message contains the typo "Invaild"** and the Jest test asserts the exact string.
5. **DELETE is a soft delete** (`active_record=0`); the row is never removed.
6. **PATCH only updates `views`** regardless of body content.
7. Migration script **drops and recreates** the table on every container startup, then the seed script only inserts if the table is empty (unless `--force`). So DB data is rebuilt on each `podman-compose up`.
8. The seed script's `main_actors.join(", ")` assumes arrays are provided (they are, in `seedMovies.js`).
9. Frontend hardcodes `http://localhost:3000` — will break if the API port changes.
10. `index.js` contains the endpoint "menu" JSON and serves static files — new routes should be reflected there too.

---

## 13. Quick-start commands

```
# Full stack (from repo root), Docker:
docker compose up --build

# Podman:
podman-compose up --build

# Run app without containers (needs a reachable Postgres with movie_platform db):
cd movie-platform-rest-api
npm install
npm run migrate
npm run seed
npm start        # or: npm run dev
npm test         # unit tests (no DB needed)
```

Verify: open `http://localhost:3000/` (API menu), `http://localhost:3000/load-all-movies`, `http://localhost:3000/single-movie`, and `http://localhost:5173/` (React SPA).
