// movies.test.js
const request = require("supertest");
const express = require("express");
const moviesRouter = require("../routes/movies");

const app = express();
app.use(express.json());
app.use("/movies", moviesRouter);

describe("POST /movies", () => {
  test("should respond 400 Bad Request - Invalid Genre", async () => {
    const random = parseInt(Math.random() * (1000 - 1) + 1);
    const newMovie = {
      title: `Title Test - ${random}`,
      release_year: random,
      genre: "Historical Drama",
      synopsis: `Test Synopsis : ${random}`,
      country: `Yugoslavia`,
      views: random,
      directed_by: `Random Guy ${random}`,
      main_actors: [`Main actor ${random}`, `Main actreess ${random}`],
    };

    const response = await request(app).post("/movies").send(newMovie);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "genre",
          location: "body",
          value: "Historical Drama",
          msg: expect.stringContaining("Invalid genre"),
        }),
      ]),
    );
  });
});
