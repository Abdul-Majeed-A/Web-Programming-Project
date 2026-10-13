import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const initDatabase = async () => {
  console.log('Connecting to MySQL host to initialize ProjectPulse database...');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
    console.log('Connected to MySQL server.');

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying schema.sql...');
    await connection.query(schemaSql);
    console.log('Schema created successfully.');

    // Read and run seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('Applying seed.sql...');
    await connection.query(seedSql);
    console.log('Seed data inserted successfully.');

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

initDatabase();
