import { useEffect, useState } from "react";
import {
  getDropdownMovies,
  getMovie,
  updateMovie,
  updateViews,
  deleteMovie,
} from "../api/movies";

export default function MovieDetailPage() {
  const [dropdown, setDropdown] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [movie, setMovie] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // Effect 1: load dropdown once on mount
  useEffect(() => {
    let ignore = false;
    const loadDropdown = async () => {
      try {
        const response = await getDropdownMovies();
        if (!ignore) setDropdown(response.data);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.error || err.message);
      }
    };
    loadDropdown();
    return () => {
      ignore = true;
    };
  }, []);

  // Effect 2: load the movie when a movie is selected
  useEffect(() => {
    if (!selectedId) return;
    let ignore = false;
    const loadMovie = async () => {
      try {
        const response = await getMovie(selectedId);
        if (!ignore) {
          const m = response.data;
          setMovie(m);
          setForm({ ...m, main_actors: m.main_actors });
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(err.response?.data?.error || err.message);
      }
    };
    loadMovie();
    return () => {
      ignore = true;
    };
  }, [selectedId]);

  // Controlled input handler (works for every field via the "name" attribute)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) {
      setMovie(null);
      setForm({});
      setError(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(null);
    try {
      const payload = {
        title: form.title,
        release_year: Number(form.release_year),
        genere: form.genere,
        synopsis: form.synopsis,
        country: form.country,
        views: Number(form.views),
        directed_by: form.directed_by,
        main_actors: form.main_actors.split(",").map((a) => a.trim()),
      };
      await updateMovie(selectedId, payload);
      setMessage("Movie updated successfully");
      const response = await getMovie(selectedId);
      setMovie(response.data);
      setForm({ ...response.data, main_actors: response.data.main_actors });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleIncreaseViews = async () => {
    setMessage("");
    setError(null);
    try {
      const newViews = Number(form.views) + Math.floor(Math.random() * 1000);
      await updateViews(selectedId, newViews);
      setForm((prev) => ({ ...prev, views: newViews }));
      setMessage("Views updated");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    setMessage("");
    setError(null);
    try {
      await deleteMovie(selectedId);
      setMessage("Movie deleted");
      setDropdown((prev) => prev.filter((m) => String(m.id) !== selectedId));
      setSelectedId("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h1>Movie Platform</h1>
      <h2>Select a movie to view details</h2>

      <label>Choose a movie: </label>
      <select value={selectedId} onChange={handleSelectChange}>
        <option value="">-- Select a movie --</option>
        {dropdown.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {movie && (
        <form onSubmit={handleUpdate} style={{ marginTop: "20px" }}>
          <p>
            <strong>Title:</strong>{" "}
            <input name="title" value={form.title} onChange={handleChange} />
          </p>
          <p>
            <strong>Release Year:</strong>{" "}
            <input
              name="release_year"
              value={form.release_year}
              onChange={handleChange}
            />
          </p>
          <p>
            <strong>Country:</strong>{" "}
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </p>
          <p>
            <strong>Genere:</strong>{" "}
            <input name="genere" value={form.genere} onChange={handleChange} />
          </p>
          <p>
            <strong>Directed by:</strong>{" "}
            <input
              name="directed_by"
              value={form.directed_by}
              onChange={handleChange}
            />
          </p>
          <p>
            <strong>Main Actors (comma separated):</strong>{" "}
            <input
              name="main_actors"
              value={form.main_actors}
              onChange={handleChange}
            />
          </p>
          <p>
            <strong>Synopsis:</strong>{" "}
            <textarea
              name="synopsis"
              value={form.synopsis}
              onChange={handleChange}
              rows="4"
              cols="50"
            />
          </p>
          <p>
            <strong>Views:</strong> {Number(form.views).toLocaleString()}
          </p>
          <button type="submit">Update Movie (PUT)</button>{" "}
          <button type="button" onClick={handleIncreaseViews}>
            Increase Views (PATCH)
          </button>{" "}
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        </form>
      )}
    </div>
  );
}
