const express = require('express');
const movieRoutes = require('./routes/movies');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/api/movies', movieRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Node.js Server 💻',
        endpoints: {
            'GET /api/movies': 'Get all movies (filters: title, release_year, genere, country, directed_by, main_actors)',
            'GET /api/movies/:id': 'Get a single movie by Id',
            'PUT /api/movies/:id': 'Update a movie record by Id',
            'POST /api/movies' : 'Create a movie record',
            'PATCH /api/movies/:id': 'Update partially as patch by Id',
            'DELETE /api/movies/:id': 'Delete a movie record by Id'
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is up and running and listening in port ${PORT}`);
})