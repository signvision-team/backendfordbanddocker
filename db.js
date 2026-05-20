import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "admin123",
  database: "SignVision_db",
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ DB Connected Successfully");
    conn.release();
  } catch (err) {
    console.log("❌ DB ERROR:", err);
  }
})();

export default pool;