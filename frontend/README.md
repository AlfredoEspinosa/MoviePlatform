# MoviePlatform Frontend (React SPA)

This is the React single-page frontend for the MoviePlatform project. It is built with Vite + React 19 and consumes the REST API served by the Express backend.

For the full project setup (database, backend API, and how to run the whole stack with docker-compose/podman-compose), see the [main README](../README.md).

## Quick start

```
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173/` and proxies `/api` requests to the backend (`http://localhost:3000` by default, or the `api` container inside docker-compose).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Features

- Movie list with live (debounced) search/filter by title, country, director and genre.
- Create a new movie record from a form.
- Movie detail page (`/movie/:id`) with edit and soft-delete actions.

## Project structure

- `src/api/movies.js` — axios client with one function per API endpoint.
- `src/pages/` — page components: `MovieListPage`, `MoviePage`, `MoviesStrip`, `Movie`.
- `src/assets/` — movie poster images (bundled via `import.meta.glob`).
