const express = require('express');
const path = require('path'); // Import path module for directory handling
const movieRoutes = require('./routes/movies');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/api/movies', movieRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.json({
        message: 'Node.js Server 💻',
        endpoints: {
            'GET /api/movies': 'Get all movies (filters: title, release_year, genere, country, directed_by, main_actors)',
            'GET /api/movies/dropdown-movies': 'Get {id, title} for all registered movies',
            'GET /api/movies/:id': 'Get a single movie by Id',
            'PUT /api/movies/:id': 'Update a movie record by Id',
            'POST /api/movies' : 'Create a movie record',
            'PATCH /api/movies/:id': 'Update partially as patch by Id',
            'DELETE /api/movies/:id': 'Delete a movie record by Id'
        },
        axiosRequests:{
            '/load-all-movies ': 'Get The complete list of movies registered in the database',
            '/single-movie': 'Get a single movie record by Id to be selected from a dropdown list'
        }
    });
});

app.get('/load-all-movies', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'load-all-movies.html'));
    });

app.get('/test-single-movie', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'single-movie.html'));
    });

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is up and running and listening in port ${PORT}`);
})