import mysql from "mysql2/promise";

async function test() {
  try {
  const conn = await mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "admin123",
  database: "SignVision_db",
  port: 3307
});

    console.log("Connected!");
    const [rows] = await conn.query("SELECT 1");
    console.log(rows);

    await conn.end();
  } catch (err) {
    console.error(err);
  }
}

test();