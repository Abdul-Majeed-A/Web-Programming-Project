import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'projectpulse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'projectpulse'}`);
    connection.release();
  } catch (err) {
    console.error(`[Database Warning] Could not connect to MySQL: ${err.message}`);
    console.error(`[Database Hint] Verify MySQL80 is running and credentials in .env match (DB_USER=${process.env.DB_USER}, DB_PASSWORD=${process.env.DB_PASSWORD})`);
  }
})();

export const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

export default pool;
