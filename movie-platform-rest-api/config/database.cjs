const { Pool } = require("pg");

class DatabaseConfig {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "movie_platform",
    });
  }

  async connect() {
    const client = await this.pool.connect();
    console.log("Connected to PostgreSQL");
    return client;
  }

  async disconnect(client) {
    if (client) client.release();
  }

  getPool() {
    return this.pool;
  }
}

module.exports = new DatabaseConfig();
