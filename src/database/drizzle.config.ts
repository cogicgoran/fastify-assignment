import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config();
console.log('IN DRIZZLE CONF')

export const dbCredentials = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || 'master'
};

export default defineConfig({
    schema: './src/database/schema.ts',
    out: './src/database/migrations',
    dialect: 'postgresql',
    dbCredentials
});
