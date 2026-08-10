import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMovie, updateMovie, deleteMovie } from "../api/movies";

export default function Movie({
  movie,
  isCreating = false,
  onDone,
  onCancel,
}) {
  // Editable copy of the movie. In create mode we start from blank fields.
  const [form, setForm] = useState(() =>
    isCreating
      ? {
          title: "",
          release_year: "",
          genere: "",
          synopsis: "",
          country: "",
          views: "",
          directed_by: "",
          main_actors: "",
        }
      : {
          title: movie.title,
          release_year: movie.release_year,
          genere: movie.genere,
          synopsis: movie.synopsis,
          country: movie.country,
          views: movie.views,
          directed_by: movie.directed_by,
          main_actors: movie.main_actors,
        }
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
        main_actors: form.main_actors
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
      };
      if (isCreating) {
        await createMovie(payload);
        setMessage("Movie created successfully");
        if (onDone) onDone();
      } else {
        await updateMovie(movie.id, payload);
        setMessage("Movie updated successfully");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    setMessage("");
    setError(null);
    try {
      await deleteMovie(movie.id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <form className="movie-card" onSubmit={handleSubmit}>
      <h2>
        {isCreating ? "Create New Movie" : `${form.title} (${form.release_year})`}
      </h2>

      <label>Title</label>
      <input name="title" value={form.title} onChange={handleChange} />

      <label>Release Year</label>
      <input name="release_year" value={form.release_year} onChange={handleChange} />

      <label>Genere</label>
      <input name="genere" value={form.genere} onChange={handleChange} />

      <label>Country</label>
      <input name="country" value={form.country} onChange={handleChange} />

      <label>Directed by</label>
      <input name="directed_by" value={form.directed_by} onChange={handleChange} />

      <label>Main Actors (comma separated)</label>
      <input name="main_actors" value={form.main_actors} onChange={handleChange} />

      <label>Views</label>
      <input name="views" value={form.views} onChange={handleChange} />

      <label>Synopsis</label>
      <textarea name="synopsis" value={form.synopsis} onChange={handleChange} rows="4" />

      <div className="buttons">
        {isCreating ? (
          <>
            <button type="submit">Create</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="submit">Edit</button>
            <button type="button" className="delete" onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}
