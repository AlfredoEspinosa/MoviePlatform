const express = require('express')
const router = express.Router();
const{getAllMovies, getMovie, updateMovie, createMovie, updateMovieViews, deleteMovie} = require('../controllers/movieController');

router.route('/')
.get(getAllMovies)
.post(createMovie);

router.route('/:id')
.get(getMovie)
.put(updateMovie)
.patch(updateMovieViews)
.delete(deleteMovie);

module.exports = router;