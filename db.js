import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

db.getConnection()
  .then((conn) => {
    console.log("✅ DB Connected Successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ DB ERROR FULL:", err);
  });
export default db;