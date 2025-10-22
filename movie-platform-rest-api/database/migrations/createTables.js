const database = require('../../config/database.cjs');

async function createTables(){
    try{
        const db = await database.connect();
        await new Promise((resolve, reject)=>{
            db.run(`
                CREATE TABLE IF NOT EXISTS movies(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                release_year INTEGER,
                genere TEXT NOT NULL CHECK(genere IN ('Drama', 'Action', 'Comedy', 'Fantasy', 'Romance', 'Horror', 'Western', 'Science fiction', 'Adventure', 'Documentary', 'Animation')),
                synopsis TEXT NOT NULL,
                country TEXT NOT NULL,
                views INTEGER DEFAULT 0,
                directed_by TEXT NOT NULL,
                main_actors TEST NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                active_record INTEGER DEFAULT 1
                )
                `,(err)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve();
                    }
                });
        });

        console.log('movies table has benn created succsessfully');
        await database.disconnect();
    }catch(error){
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

createTables();