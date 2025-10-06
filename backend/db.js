import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "reformher",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "reformher",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;