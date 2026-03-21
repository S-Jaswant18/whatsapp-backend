import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectionUrl = process.env.DATABASE_URL.replace('/whatsapp_bulk_db', '');

async function createDatabase() {
    try {
        const connection = await mysql.createConnection(connectionUrl);
        console.log('Connected to MySQL server');
        await connection.query('CREATE DATABASE IF NOT EXISTS whatsapp_bulk_db');
        console.log('Database whatsapp_bulk_db created or already exists');
        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    }
}

createDatabase();
