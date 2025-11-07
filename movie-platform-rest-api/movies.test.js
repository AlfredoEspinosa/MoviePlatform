// movies.test.js
const request = require('supertest');
const express = require('express');
const moviesRouter = require('./routes/movies');


const app = express();
app.use(express.json()); 
app.use('/movies', moviesRouter);

describe('POST /movies', () => {
    test('should respond 400 Bad Request - Invalid Genere', async () => {
        const random = parseInt(Math.random() * (1000 - 1) + 1);
        const newMovie = {
            title: `Title Test - ${random}`,
            release_year: random,
            genere: 'Historical Drama',
            synopsis: `Test Synopsis : ${random}`,
            country: `Yugoslavia`,
            views: random,
            directed_by: `Random Guy ${random}`,
            main_actors: [`Main actor ${random}`, `Main actreess ${random}`]
        }

        const response = await request(app).post('/movies').send(newMovie);

        expect(response.statusCode).toBe(400);
        console.log(response.body);
        expect(response.body).toEqual(
            {
                "success": false,
                "error": "Bad Request - Invaild data:  Invalid genere, please choose one of the following list [\"Drama\",\"Action\",\"Comedy\",\"Fantasy\",\"Romance\",\"Horror\",\"Western\",\"Science fiction\",\"Adventure\",\"Documentary\",\"Animation\"]"
            }
        );
    });
});