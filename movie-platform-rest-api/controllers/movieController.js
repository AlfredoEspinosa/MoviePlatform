const database = require("../config/database.cjs");
const { errorHandler, notFound } = require("../middleware/errorMiddleware");

// @desc Get all movies with filtering (if any filter as query)
// @route GET /api/movies

const getAllMovies = async (req, res) => {
  let client;
  try {
    client = await database.connect();
    const { title, release_year, genere, country, directed_by, main_actors } =
      req.query;
    const params = [];
    let sql = `SELECT * FROM movies WHERE active_record=1`;

    //Adding filters
    let paramIndex = 1;
    if (title) {
      sql += ` AND title LIKE $${paramIndex++}`;
      params.push(`%${title}%`);
    }

    if (release_year) {
      sql += ` AND release_year=$${paramIndex++}`;
      params.push(release_year);
    }

    if (genere) {
      sql += ` AND genere=$${paramIndex++}`;
      params.push(genere);
    }

    if (country) {
      console.log(country);
      sql += ` AND country=$${paramIndex++}`;
      params.push(country);
    }

    if (directed_by) {
      sql += ` AND directed_by LIKE $${paramIndex++}`;
      params.push(`%${directed_by}%`);
    }

    if (main_actors) {
      sql += ` AND main_actors LIKE $${paramIndex++}`;
      params.push(`%${main_actors}%`);
    }

    const result = await client.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "There are any movie matching the search criteria",
      });
    }

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

const getDropDownMovies = async (req, res) => {
  let client;
  try {
    client = await database.connect();
    const sql = `SELECT id, title FROM movies WHERE active_record=1`;

    const result = await client.query(sql);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

const getMovie = async (req, res) => {
  let client;
  try {
    const movieId = Number.parseInt(req.params.id);
    client = await database.connect();
    const result = await client.query(
      `SELECT * FROM movies WHERE id = $1 AND active_record=1`,
      [movieId],
    );

    if (result.rows.length === 0) {
      return notFound(req, res);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

const updateMovie = async (req, res) => {
  let client;
  const movieId = req.params.id;
  const {
    title,
    release_year,
    genere,
    synopsis,
    country,
    views,
    directed_by,
    main_actors,
  } = req.body;

  try {
    client = await database.connect();

    // Check if movie exists
    const checkResult = await client.query(
      `SELECT * FROM movies WHERE id = $1`,
      [movieId],
    );
    if (checkResult.rows.length === 0) {
      return notFound(req, res);
    }

    // Build SET clause
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (release_year !== undefined) {
      updates.push(`release_year = $${paramIndex++}`);
      params.push(release_year);
    }
    if (genere !== undefined) {
      updates.push(`genere = $${paramIndex++}`);
      params.push(genere);
    }
    if (synopsis !== undefined) {
      updates.push(`synopsis = $${paramIndex++}`);
      params.push(synopsis);
    }
    if (country !== undefined) {
      updates.push(`country = $${paramIndex++}`);
      params.push(country);
    }
    if (views !== undefined) {
      updates.push(`views = $${paramIndex++}`);
      params.push(views);
    }
    if (directed_by !== undefined) {
      updates.push(`directed_by = $${paramIndex++}`);
      params.push(directed_by);
    }
    if (main_actors !== undefined) {
      updates.push(`main_actors = $${paramIndex++}`);
      params.push(main_actors.join(", "));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(`${movieId}`);

    const sql = `UPDATE movies SET ${updates.join(", ")} WHERE id = $${paramIndex}`;

    await client.query(sql, params);

    // Fetch updated movie
    const updatedResult = await client.query(
      `SELECT * FROM movies WHERE id = $1`,
      [movieId],
    );

    res.json({
      success: true,
      data: updatedResult.rows[0],
    });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

const createMovie = async (req, res) => {
  let client;
  try {
    const {
      title,
      release_year,
      genere,
      synopsis,
      country,
      views,
      directed_by,
      main_actors,
    } = req.body;
    client = await database.connect();

    await client.query(
      `INSERT INTO movies (title, release_year, genere, synopsis, country, views, directed_by, main_actors) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        title,
        release_year,
        genere,
        synopsis,
        country,
        views,
        directed_by,
        main_actors.join(", "),
      ],
    );

    res.json({
      success: true,
      data: `Movie inserted: ${JSON.stringify(req.body)}`,
    });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

const updateMovieViews = async (req, res) => {
  let client;
  try {
    const movieId = req.params.id;
    client = await database.connect();
    let { views } = req.body;

    const result = await client.query(
      `UPDATE movies SET views = $1 WHERE id = $2`,
      [views, movieId],
    );

    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

const deleteMovie = async (req, res) => {
  let client;
  try {
    const movieId = req.params.id;
    client = await database.connect();

    await client.query(`UPDATE movies SET active_record = $1 WHERE id = $2`, [
      0,
      movieId,
    ]);

    res.json({ success: true, updated: `Movie with Id: ${movieId} Deleted` });
  } catch (err) {
    return errorHandler(err, req, res);
  } finally {
    if (client) {
      database.disconnect(client);
    }
  }
};

module.exports = {
  getAllMovies,
  getMovie,
  getDropDownMovies,
  updateMovie,
  createMovie,
  updateMovieViews,
  deleteMovie,
};
