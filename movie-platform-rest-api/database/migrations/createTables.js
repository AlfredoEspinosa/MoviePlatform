const database = require("../../config/database.cjs");

async function createTables() {
  try {
    const client = await database.connect();
    await client.query(`DROP TABLE IF EXISTS movies`);
    await client.query(`
            CREATE TABLE IF NOT EXISTS movies(
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                release_year INTEGER,
                genere TEXT NOT NULL CHECK(genere IN ('Drama', 'Action', 'Comedy', 'Fantasy', 'Romance', 'Horror', 'Western', 'Science fiction', 'Adventure', 'Documentary', 'Animation')),
                synopsis TEXT NOT NULL,
                country TEXT NOT NULL,
                views INTEGER DEFAULT 0,
                directed_by TEXT NOT NULL,
                main_actors TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                active_record INTEGER DEFAULT 1
            )
        `);
    console.log("movies table created successfully");
    database.disconnect(client);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

createTables();
