import { useNavigate } from "react-router-dom";

// Import every poster from src/assets at build time (Vite pattern).
// import.meta.glob turns each file into its served URL.
const postersByFile = Object.fromEntries(
  Object.entries(
    import.meta.glob("../assets/*.{png,jpeg,jpg,webp}", {
      eager: true,
      import: "default",
    })
  ).map(([path, url]) => [path.split("/").pop(), url])
);

// Pick the best image for a movie id: prefer jpeg (smaller), then png/jpg/webp.
const posterFor = (id) =>
  postersByFile[`${id}.jpeg`] ||
  postersByFile[`${id}.png`] ||
  postersByFile[`${id}.jpg`] ||
  postersByFile[`${id}.webp`];

// Placeholder used when a movie has no poster (0.jpeg or 0.png).
const DEFAULT_POSTER = posterFor(0);

export default function MoviesStrip({ moviesChunck }) {
  const navigate = useNavigate();

  return (
    <ul>
      {moviesChunck.map((movie) => (
        <li key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)}>
          <h2>{movie.title}</h2>
          <img
            src={posterFor(movie.id) || DEFAULT_POSTER}
            alt={`${movie.title} poster`}
            onError={(event) => {
              event.target.src = DEFAULT_POSTER;
            }}
          />
        </li>
      ))}
    </ul>
  );
}
