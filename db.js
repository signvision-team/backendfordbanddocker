const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});



(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ DB Connected Successfully");
    conn.release();
  } catch (err) {
    console.log("❌ DB ERROR:", err.message);
  }
})();

module.exports = pool;