require("dotenv").config();
const database = require("../../config/database.cjs");

async function createTables() {
  try {
    const client = await database.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(10)
          CHECK (role IN ('user', 'admin'))
          DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      active_record INTEGER DEFAULT 1
      )`);

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

    await client.query(`
          CREATE TABLE IF NOT EXISTS refresh_tokens (
          id SERIAL PRIMARY KEY,
          jti TEXT NOT NULL UNIQUE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMP NOT NULL,
          revoked INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);

    await database.disconnect(client);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

createTables().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
