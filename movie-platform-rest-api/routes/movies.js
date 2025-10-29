const express = require('express')
const router = express.Router();
const { validateMovieRecord } = require('../middleware/validationMiddleware');
const{getAllMovies, getMovie, getDropDownMovies,updateMovie, createMovie, updateMovieViews, deleteMovie} = require('../controllers/movieController');

router.route('/')
.get(getAllMovies)
.post(createMovie);

router.route('/dropdown-movies')
.get(getDropDownMovies);

router.route('/:id')
.get(getMovie)
.put(validateMovieRecord, updateMovie)
.patch(updateMovieViews)
.delete(deleteMovie);

module.exports = router;