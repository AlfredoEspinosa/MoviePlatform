import axios from "axios";

const api = axios.create({
  baseURL: "/api/movies",
});

// GET /api/movies?title=...&genere=...
export const getMovies = async (filters = {}) => {
  const { data } = await api.get("/", { params: filters });
  return data;
};

// GET /api/movies/dropdown-movies
export const getDropdownMovies = async () => {
  const { data } = await api.get("/dropdown-movies");
  return data;
};

// GET /api/movies/:id
export const getMovie = async (id) => {
  const { data } = await api.get(`/${id}`);
  return data;
};

// POST /api/movies
export const createMovie = async (movie) => {
  const { data } = await api.post("/", movie);
  return data;
};

// PUT /api/movies/:id
export const updateMovie = async (id, movie) => {
  const { data } = await api.put(`/${id}`, movie);
  return data;
};

// PATCH /api/movies/:id  (only views)
export const updateViews = async (id, views) => {
  const { data } = await api.patch(`/${id}`, { views });
  return data;
};

// DELETE /api/movies/:id (soft delete) 
export const deleteMovie = async (id) => {
  const { data } = await api.delete(`/${id}`);
  return data;
};
