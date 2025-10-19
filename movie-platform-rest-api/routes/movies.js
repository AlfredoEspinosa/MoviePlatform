const express = require('express')
const router = express.Router();
const{getAllMovies} = require('../controllers/movieController');

router.route('/')
.get(getAllMovies);

module.exports = router;