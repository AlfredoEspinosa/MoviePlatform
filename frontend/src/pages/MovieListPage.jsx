import { useEffect, useState } from "react";
import { getMovies } from "../api/movies";
import { chunkArray } from "../utils/chunkArray";
import MoviesStrip from "./MoviesStrip";
import Movie from "./Movie";

export default function MovieListPage() {
  // State
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    title: "",
    genere: "",
    country: "",
    directed_by: "",
  });
  const [creating, setCreating] = useState(false);

  // Live search: fetch every time a filter changes, debounced 300ms.
  // Cleanup (return) cancels the pending timer and ignores stale responses.
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        const response = await getMovies(filters);
        if (!ignore) {
          setMovies(response.data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(err.response?.data?.error || err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Called by <Movie> after a successful create: hide the form and reload the list
  const handleCreated = async () => {
    setCreating(false);
    setLoading(true);
    try {
      const response = await getMovies(filters);
      setMovies(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Movie Platform</h1>

      <div className="toolbar">
        <button onClick={() => setCreating(true)}>+ Create New Movie</button>
      </div>

      {creating && (
        <Movie
          isCreating
          onDone={handleCreated}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Filters trigger the search automatically as you type/select */}
      <div className="filters">
        <input
          name="title"
          placeholder="Title"
          value={filters.title}
          onChange={handleFilterChange}
        />
        <input
          name="country"
          placeholder="Country"
          value={filters.country}
          onChange={handleFilterChange}
        />
        <input
          name="directed_by"
          placeholder="Directed by"
          value={filters.directed_by}
          onChange={handleFilterChange}
        />
        <select
          name="genere"
          value={filters.genere}
          onChange={handleFilterChange}
        >
          <option value="">-- Select Genere --</option>
          {[
            "Drama",
            "Action",
            "Comedy",
            "Fantasy",
            "Romance",
            "Horror",
            "Western",
            "Science fiction",
            "Adventure",
            "Documentary",
            "Animation",
          ].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading &&
        !error &&
        chunkArray(movies, 5).map((chunk, index) => (
          <MoviesStrip key={index} moviesChunck={chunk} />
        ))}
    </div>
  );
}
