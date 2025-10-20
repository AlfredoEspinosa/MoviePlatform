const express = require('express')
const router = express.Router();
const{getAllMovies, getMovie} = require('../controllers/movieController');

router.route('/')
.get(getAllMovies);

router.route('/:id')
.get(getMovie);

module.exports = router;