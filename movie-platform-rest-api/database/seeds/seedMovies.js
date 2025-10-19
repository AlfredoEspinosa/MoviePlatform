const database = require('../config/database.cjs');

const sampleMovies = [
  {
    "title": "Echoes of Tomorrow",
    "release_year": 2023,
    "genere": "Science fiction",
    "synopsis": "A scientist discovers a way to send messages to the past, but each message alters the future in unexpected ways.",
    "country": "USA",
    "views": 1250000,
    "directed_by": "Lana Rodriguez",
    "main_actors": ["John Carter", "Maya Lin"]
  },
  {
    "title": "Whispers in the Fog",
    "release_year": 2021,
    "genere": "Horror",
    "synopsis": "A small town is haunted by voices that only appear during heavy fog, revealing buried secrets.",
    "country": "UK",
    "views": 870000,
    "directed_by": "Elliot Graves",
    "main_actors": ["Clara Finch", "Tommy Bell"]
  },
  {
    "title": "La Última Canción",
    "release_year": 2022,
    "genere": "Drama",
    "synopsis": "A retired mariachi revisits his past through music, reconnecting with his estranged daughter.",
    "country": "Mexico",
    "views": 920000,
    "directed_by": "Alejandro Cruz",
    "main_actors": ["Gael García Bernal", "María León"]
  },
  {
    "title": "Sueños de Jade",
    "release_year": 2020,
    "genere": "Fantasy",
    "synopsis": "A young girl in Oaxaca discovers a jade amulet that opens portals to ancient Mesoamerican realms.",
    "country": "Mexico",
    "views": 780000,
    "directed_by": "Lucía Mendoza",
    "main_actors": ["Ximena Ayala", "Tenoch Huerta"]
  },
  {
    "title": "Pixel Hearts",
    "release_year": 2022,
    "genere": "Romance",
    "synopsis": "Two indie game developers fall in love while collaborating on a retro-style adventure game.",
    "country": "Canada",
    "views": 980000,
    "directed_by": "Sophie Tran",
    "main_actors": ["Liam Park", "Isabelle Chen"]
  },
  {
    "title": "El Camino del Jaguar",
    "release_year": 2023,
    "genere": "Adventure",
    "synopsis": "A biologist and a local guide trek through Chiapas to protect endangered jaguars from poachers.",
    "country": "Mexico",
    "views": 610000,
    "directed_by": "Carlos Ortega",
    "main_actors": ["Luis Gerardo Méndez", "Ilse Salas"]
  },
  {
    "title": "Laugh Track",
    "release_year": 2020,
    "genere": "Comedy",
    "synopsis": "A failed comedian discovers a magical microphone that makes everyone laugh uncontrollably.",
    "country": "Australia",
    "views": 620000,
    "directed_by": "Nina Brooks",
    "main_actors": ["Jake Monroe", "Tasha Singh"]
  },
  {
    "title": "Más Allá del Muro",
    "release_year": 2021,
    "genere": "Documentary",
    "synopsis": "Explores the lives of families separated by the US-Mexico border and their stories of resilience.",
    "country": "Mexico",
    "views": 430000,
    "directed_by": "Renata Salazar",
    "main_actors": ["Documentary Cast"]
  },
  {
    "title": "Starlight Express",
    "release_year": 2022,
    "genere": "Animation",
    "synopsis": "A group of space-faring animals must deliver a mysterious package across the galaxy before time runs out.",
    "country": "Japan",
    "views": 890000,
    "directed_by": "Hiro Tanaka",
    "main_actors": ["Voice Cast"]
  },
  {
    "title": "Corazón de Mezcal",
    "release_year": 2024,
    "genere": "Drama",
    "synopsis": "A young entrepreneur in Oaxaca fights to preserve traditional mezcal production against corporate interests.",
    "country": "Mexico",
    "views": 710000,
    "directed_by": "Jimena Ríos",
    "main_actors": ["Diego Luna", "Adriana Paz"]
  }
];

async function seedMovies(){
    try{
        const db = await database.connect();

        //Clear existing data if any exists
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM movies', (err)=>{
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });

        // Insert data to DB
        const insertStmt = db.prepare(`
            INSERT INTO movies (title, release_year, genere, synopsis, country, views, directed_by, main_actors)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)`
        );

        for(const movie of sampleMovies){
            await new Promise((resolve, reject)=>{
                console.log(movie);
                insertStmt.run(
                    [movie.title, movie.release_year, movie.genere, movie.synopsis, movie.country, movie.views, movie.directed_by, movie.main_actors.join(", ")],
                (err)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve();
                    }
                });
            });
        }

        insertStmt.finalize();
        console.log(`Seeded ${sampleMovies.length} movies successfully!` );
        await database.disconnect();
        
    }catch(error){
        console.log('seeding failed:', error.message);
        process.exit(1);
    }    
}

seedMovies();
