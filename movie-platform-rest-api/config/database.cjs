const { Pool } = require("pg");

class DatabaseConfig {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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
