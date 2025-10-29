const { json } = require('express');
const database = require('../config/database.cjs');
const { errorHandler, notFound } = require('../middleware/errorMiddleware');

//Helper function to parse main_actorsJSON
const parseMainActors = (mainActors) => {
    try {
        return mainActors ? mainActors.split(',').map(actor => actor.trim()) : [];
    } catch {
        return [];
    }
};


// @desc Get all movies with filtering (if any filter as query)
// @route GET /api/movies

const getAllMovies = async (req, res) => {
    const db = await database.connect();
    const { title, release_year, genere, country, directed_by, main_actors } = req.query;
    const params = [];
    let sql = `SELECT * FROM movies WHERE active_record=1`;

    //Adding filters
    if (title) {
        sql += ` AND title LIKE ?`;
        params.push(title);
    }

    if (release_year) {
        sql += ` AND release_year=?`;
        params.push(release_year);
    }

    if (genere) {
        sql += ` AND genere=?`;
        params.push(genere);
    }

    if (country) {
        console.log(country);
        sql += ` AND country=?`;
        params.push(country);
    }

    if (directed_by) {
        sql += ` AND directed_by LIKE ?`;
        params.push(`%${directed_by}%`);
    }

    if (main_actors) {
        sql += ` AND main_actors LIKE ?`;
        params.push(`%${main_actors}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return errorHandler(err,req,res);
        }

        const movies = rows.map(row => ({
            ...row,
            main_actors: row.main_actors
        }));

        if(movies.length <= 0){
          return res.status(404).json({
            success: false,
            error: "There are  no records matching search criteria"
          });
        }

        return res.json({
            success: true,
            count: movies.length,
            data: movies
        });
    });

    await database.disconnect();
};

const getDropDownMovies = async (req, res)=>{
    try{
        const db = await database.connect();
        const sql =  `SELECT id, title FROM movies WHERE active_record=1`;

        db.all(sql,[], (err, rows)=>{

            const dropDownMovies = rows.map(row=>({
                ... row
            }));
            
            if(err) return errorHandler(err,req, res);

            res.json({
                success: true,
                data: dropDownMovies
            });
        });
    }catch(err){
        return errorHandler(err, req, res);
    }
}

const getMovie = async (req, res) => {
    const movieId = parseInt(req.params.id);
    const db = await database.connect();

    db.get(`SELECT * FROM movies WHERE id = ? AND active_record=1`, [movieId], (err, row) => {
        if (err) {
            return errorHandler(err, req, res);
        }

        if (!row) {
            return notFound(req, res);
        }

        //Parse mainactors
        const movie = {
            ...row,
        };

        res.json({
            success: true,
            data: movie
        });
    });
    await database.disconnect();
};

const updateMovie = async (req, res) => {
  const movieId = req.params.id;
  const {
    title, release_year, genere, synopsis,
    country, views, directed_by, main_actors
  } = req.body;

  try {
    const db = await database.connect();

    db.get(`SELECT * FROM movies WHERE id = ?`, [movieId], (err, row) => {
      if (err) {
        return errorHandler(err, req, res);
      }

      if (!row) {
        return notFound(req, res);
      }

      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (release_year !== undefined) {
        updates.push('release_year = ?');
        params.push(release_year);
      }
      if (genere !== undefined) {
        updates.push('genere = ?');
        params.push(genere);
      }
      if (synopsis !== undefined) {
        updates.push('synopsis = ?');
        params.push(synopsis);
      }
      if (country !== undefined) {
        updates.push('country = ?');
        params.push(country);
      }
      if (views !== undefined) {
        updates.push('views = ?');
        params.push(views);
      }
      if (directed_by !== undefined) {
        updates.push('directed_by = ?');
        params.push(directed_by);
      }
      if (main_actors !== undefined) {
        updates.push('main_actors = ?');
        params.push(main_actors.join(', '));
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(movieId);

      const sql = `UPDATE movies SET ${updates.join(', ')} WHERE id = ?`;

      db.run(sql, params, function (err) {
        if (err) {
          return errorHandler(err, req, res);
        }

        // Fetch updated movie after successful update
        db.get(`SELECT * FROM movies WHERE id = ?`, [movieId], (err, updatedRow) => {
          if (err) {
            return errorHandler(err, req, res);
          }

          res.json({
            success: true,
            data: updatedRow
          });
        });
      });
    });
  } catch (err) {
        return errorHandler(err, req, res);
  }
};

const createMovie = async (req, res)=>{
    const {title, release_year, genere, synopsis, country, views, directed_by, main_actors } = req.body;
    const db = await database.connect();

    const sql = db.prepare(
        `INSERT INTO movies (title, release_year, genere, synopsis, country, views, directed_by, main_actors) VALUES(?,?,?,?,?,?,?,?)`
    );

    sql.run([title, release_year, genere, synopsis, country, views, directed_by, main_actors.join(", ")], (err)=>{
        if(err) return errorHandler(err, req, res);
        res.json({
            success: true,
            data: `Movie inserted: ${JSON.stringify(req.body)}`
        });
    });
    
    sql.finalize();
    await database.disconnect();
    console.log("createMovie method was executed")

    return res;
};


const updateMovieViews = async (req, res)=>{
    const movieId = req.params.id;

    const db = await database.connect();
    let {views} = req.body;

     const sql = `UPDATE movies SET views = ? WHERE id = ?`;

    db.run(sql, [views, movieId], function(err) {
        if (err) return errorHandler(err,req,res);
        res.json({ success: true, updated: this.changes });
    });

    console.log("updateMovieViews method was executed")

    return res;
};

const deleteMovie = async (req, res)=>{
    const movieId = req.params.id;

    const db = await database.connect();

     const sql = `UPDATE movies SET active_record = ? WHERE id = ?`;

    db.run(sql, [0, movieId], function(err) {
        if (err) return errorHandler(err, req, res);
        res.json({ success: true, updated:  `Movie with Id: ${movieId} Deleted` });
    });
};


module.exports = {
    getAllMovies,
    getMovie,
    getDropDownMovies,
    updateMovie,
    createMovie,
    updateMovieViews,
    deleteMovie
}