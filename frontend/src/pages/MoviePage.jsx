import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMovie } from "../api/movies";
import Movie from "./Movie";

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const response = await getMovie(id);
        if (!ignore) {
          setMovie(response.data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(err.response?.data?.error || err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <Link to="/">← Back to Movie List</Link>
      {movie && <Movie key={movie.id} movie={movie} />}
    </div>
  );
}
