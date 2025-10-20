const sqlite3 = require('sqlite3');
const path = require('path');

class DatabaseConfig {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'database', 'movie_platform.sqlite3');
        this.db = null;
    }

    connect() {
        console.log(this.dbPath);

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(new Error(`Data Base connection error: ${err.message}`));
                } else {
                    console.log('Successfully connected to movie_platform Data Base');
                    resolve(this.db);
                }
            });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(new Error(`An error occurred while closing connection from movie platofmr Data Base: ${err.message}`));
                    } else {
                        console.log('Data Base connection closed successfully');
                        resolve();
                    }
                });
            }
        });
    }

    getDatabase() {
        if (!this.db) {
            throw new Error('Database not connected.');
        }
        return this.db;
    }
}

module.exports = new DatabaseConfig();

