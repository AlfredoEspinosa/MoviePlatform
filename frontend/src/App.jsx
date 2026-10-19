import { Route, Routes } from "react-router-dom";
import MovieListPage from "./pages/MovieListPage";
import MoviePage from "./pages/MoviePage";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MovieListPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
      </Routes>
    </div>
  );
}
