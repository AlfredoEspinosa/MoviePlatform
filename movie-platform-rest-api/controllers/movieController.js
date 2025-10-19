const database = require('../config/database.cjs');

//Helper function to parse main_actorsJSON
const parseMainActors = (mainActors) =>{
    try{
        console.log(mainActors);
        return mainActors ? mainActors.split(',').map(actor => actor.trim()) : [];
    }catch{
        return [];
    }
};

// @desc Get all movies with filtering (if any filter as query)
// @route GET /api/movies

const getAllMovies = async (req, res)=>{
    const db = await database.connect();
    await new Promise((resolve, reject)=>{
        const {title, release_year, genere, synopsis, country, views, directed_by, main_actors} = req.query;
        const params = [];
        let sql = `SELECT * FROM movies WHERE active_record=1`;
        
        db.all(sql,params, (err, rows)=>{
            if(err){
                return res.status(500).json({
                    success: false,
                    error: 'Database Error'
                }); 
            }

            const movies = rows.map(row=>({
                ... row,
                main_actors: parseMainActors(row.main_actors)
            }));

            res.json({
                success: true,
                count: movies.length,
                data: movies
            });
        })
    });

    await database.disconnect();
};

module.exports = {
    getAllMovies
}