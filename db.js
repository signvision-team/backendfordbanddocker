// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin123', 
  database: 'SignVision_db',
  port: 3307, // <--- ADD THIS LINE if your Docker is using 3307
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database on port 3307');
    connection.release();
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
  }
})();

module.exports = pool;