import { Pool } from "pg";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as path from 'node:path';

export const registerDatabase = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
  const db = drizzle(pool, { schema });
  fastify.decorate("db", db);

  try {
    const migrationsPath = path.resolve(
      process.cwd(),
      "src/database/migrations"
    );

    await migrate(db, {
      migrationsFolder: migrationsPath,
    });
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to migrate database ${String(error)}`);
  }
};
