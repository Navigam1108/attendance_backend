const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    max: 20, // Maximum number of clients in the pool (e.g., 20 for concurrent requests)
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed (30 seconds)
    connectionTimeoutMillis: 2000, // How long to wait for a new client connection to be established (2 seconds)
});

pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Successfully connected to PostgreSQL database!');
    client.release();
});

module.exports = pool;