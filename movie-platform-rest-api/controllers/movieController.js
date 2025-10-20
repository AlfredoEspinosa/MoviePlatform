const database = require('../config/database.cjs');

//Helper function to parse main_actorsJSON
const parseMainActors = (mainActors) =>{
    try{
        return mainActors ? mainActors.split(',').map(actor => actor.trim()) : [];
    }catch{
        return [];
    }
};

// @desc Get all movies with filtering (if any filter as query)
// @route GET /api/movies

const getAllMovies = async (req, res)=>{
    const db = await database.connect();
        const {title, release_year, genere, country, directed_by, main_actors} = req.query;
        const params = [];
        let sql = `SELECT * FROM movies WHERE active_record=1`;

        //Adding filters
        if(title){
            sql+=` AND titile LIKE ?`;
            params.push(title);
        }

        if(release_year){
            sql+=` AND release_year=?`;
            params.push(release_year);
        }

        if(genere){
            sql+=` AND genere=?`;
            params.push(genere);
        }

        if(country){
            console.log(country);
            sql+=` AND country=?`;
            params.push(country);
        }

        if(directed_by){
            sql+=` AND directed_by LIKE ?`;
                params.push(`%${directed_by}%`);            
        }

        if(main_actors){
            sql+=` AND main_actors LIKE ?`;
            params.push(`%${main_actors}%`);
        }
        
        db.all(sql,params, (err, rows)=>{
            if(err){
                return res.status(500).json({
                    success: false,
                    error: `Database Error: ${err}`
                }); 
            }

        const movies = rows.map(row=>({
            ... row,
            main_actors: parseMainActors(row.main_actors)
        }));

        return res.json({
                success: true,
                count: movies.length,
                data: movies
        });
    });

    await database.disconnect();
};

const getMovie = async (req,res)=>{
    const movieId = parseInt(req.params.id);
    const db =  await database.connect();

    db.get(`SELECT * FROM movies WHERE id = ? AND active_record=1`,[movieId], (err, row)=>{
            if(err){
                return res.status(500).json({
                    success: false,
                    error: `Database error: ${err}`
                });
            }
            
            if(!row){
                return res.status(404).json({
                    success: false,
                    error: `Movie with id: ${movieId} was not found`
                })
            }

            //Parse mainactors
            const movie = {
                ... row,
                main_actors: parseMainActors(row.main_actors)
            };

            res.json({
                success:true,
                data: movie
            });
        });
    await database.disconnect();
};

module.exports = {
    getAllMovies,
    getMovie
}