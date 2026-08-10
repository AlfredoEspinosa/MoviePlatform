# Study Guide — React SPA concepts used in MoviePlatform

Review this before next session. Each section points to the exact file + line in `frontend/src/` that demonstrates the concept, plus a 1-line takeaway and a "try it" idea.

---

## 1. How the app is wired together

```
index.html (Vite entry)
  └─ main.jsx      <BrowserRouter>  →  makes routing available everywhere
       └─ App.jsx  <Routes>:
            ├─ "/"           → <MovieListPage/>   (the list + search + create)
            └─ "/movie/:id"  → <MoviePage/>       (detail + edit form)
```

- **Vite dev proxy** (`frontend/vite.config.js`): `/api` requests are forwarded to `http://localhost:3000`, so the browser never hits CORS.
- **API client** (`frontend/src/api/movies.js`): one axios function per backend endpoint. Components never call axios directly.

**Takeaway:** the router decides *which page renders* based on the URL; pages fetch their own data.

---

## 2. Hooks cheat-sheet (the ones we used)

| Hook | What it does | Where we used it |
|---|---|---|
| `useState` | Store data that changes (form fields, list, loading, error) | every page |
| `useEffect` | Run code after render — usually a fetch | `MovieListPage.jsx`, `MoviePage.jsx` |
| `useParams` | Read the `:id` out of the URL | `MoviePage.jsx` |
| `useNavigate` | Programmatic navigation (e.g. after delete) | `Movie.jsx`, `MoviesStrip.jsx` |
| `useRef` | (not used yet) — remembers a value without re-rendering | — |

---

## 3. The `useEffect` data-fetch pattern (async + `ignore`)

ESLint forbids setting state synchronously inside an effect, so fetching looks like this:

```jsx
useEffect(() => {
  let ignore = false;                        // 1. flag for THIS run
  const load = async () => {
    const res = await getMovies(filters);    // 2. slow network call
    if (!ignore) setMovies(res.data);        // 3. only apply if still current
  };
  load();
  return () => { ignore = true; };           // 4. cleanup runs before next effect
}, [filters]);                               // 5. re-runs when filters change
```

- Without `ignore`, a **stale response** (from a previous keystroke) could overwrite newer data.
- The cleanup function runs before every re-run AND on unmount.

**Try it:** remove the `ignore` flag, type fast in the Title filter, and watch old results flash in.

---

## 4. Debouncing (don't fetch on every keystroke)

In `MovieListPage.jsx` the effect wraps the fetch in `setTimeout(300)` and cleans up:

```jsx
useEffect(() => {
  let ignore = false;
  const timer = setTimeout(async () => {
    const res = await getMovies(filters);
    if (!ignore) setMovies(res.data);
  }, 300);
  return () => { ignore = true; clearTimeout(timer); };
}, [filters]);
```

- `clearTimeout(timer)` **cancels** the pending request when you type again — only the last pause after 300ms triggers a fetch.

**Try it:** reduce to 0ms and note how many requests fire in the Network tab while typing.

---

## 5. Controlled inputs (React owns the form)

In `Movie.jsx` every input reads from `form` state and writes back through `handleChange`:

```jsx
<input name="title" value={form.title} onChange={handleChange} />

const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));  // update one field, keep the rest
};
```

- Because `value={form.title}`, the DOM input is a "controlled" component: **React is the single source of truth**, not the browser.

**Try it:** remove `value={...}` and observe that typing appears but `form` never changes.

---

## 6. Reusing a component with `isCreating` (conditional rendering + callbacks)

`Movie.jsx` is one component with **two modes**:

- `isCreating=false` → Edit + Delete buttons, calls `updateMovie`/`deleteMovie`.
- `isCreating=true` → Create + Cancel buttons, calls `createMovie`, then `onDone()`.

The parent (`MovieListPage.jsx`) controls it with state and **callbacks**:

```jsx
const [creating, setCreating] = useState(false);

{creating && (
  <Movie
    isCreating
    onDone={handleCreated}          // parent refreshes list
    onCancel={() => setCreating(false)}  // parent hides the form
  />
)}
```

**Takeaway:** props can be *data* (movie) or *behavior* (callbacks) — this is how children talk back to parents.

---

## 7. The `key` remount trick

In `MoviePage.jsx`:

```jsx
<Movie key={movie.id} movie={movie} />
```

When the URL id changes, React sees a **different key** → it unmounts the old form and mounts a fresh one, so all `useState` inside resets automatically. No manual "clear the form" code needed.

**Try it:** remove `key={movie.id}` and navigate from one movie to another — the old form's state lingers.

---

## 8. The `main_actors` lesson (client vs. server contract)

- Backend stores `main_actors` as a **comma-joined string** in PostgreSQL.
- Backend **expects an array** on POST/PUT and joins it itself.
- The frontend edits it as a comma-string, then converts **at the last moment** in `Movie.jsx`:

```js
main_actors: form.main_actors.split(",").map((a) => a.trim()).filter(Boolean),
```

- ⚠️ We previously had `.join(", ")` in the axios client **and** in the backend controller → `main_actors.join is not a function` (500). Rule: **convert once, on the way out, in the component — never in the client.**

**Takeaway:** when frontend and backend disagree on a shape, fix it in ONE place and document it (see `CONTEXT.md` §6/§8).

---

## 9. Bundling images at build time with `import.meta.glob`

`MoviesStrip.jsx` can't know the poster filenames ahead of time, so it imports them dynamically:

```js
const posters = import.meta.glob("../assets/*.{png,jpeg,jpg,webp}", { eager: true });
```

This makes Vite bundle every matching file and gives a map of path → URL at build time. New posters (`7.jpeg`, …) are picked up with no code changes.

**Takeaway:** `eager: true` loads them at build (simpler); lazy loading is possible when you have many images.

---

## 10. Quick self-quiz

1. Why do we need the `ignore` flag in effects? What happens without it?
2. What does the effect cleanup function do, and when does it run?
3. What does `key={movie.id}` actually change in React's behavior?
4. Who joins `main_actors` into a comma-string — the client or the server?
5. `useParams` vs `useNavigate` — what is each for?
6. If you wanted a 1-second debounce, which number changes?

*Answers are all in the sections above — re-read the relevant one before peeking at the code.*

---

## Next session: Step 13 preview

Serve the built React app from Express so `http://localhost:3000` shows the SPA directly:
1. `npm run build` in `frontend/` → produces `frontend/dist`.
2. In `movie-platform-rest-api/index.js`: `express.static` the dist folder + a catch-all route sending `index.html`.
3. Retire `load-all-movies.html` / `single-movie.html` and their routes; update the root menu JSON.
4. Commit `frontend/` + `.gitattributes`.
