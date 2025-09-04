import { sql } from 'drizzle-orm';
import {
    boolean,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';


export const userSchema = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    password: varchar('password', { length: 255 }).notNull(),
    email: varchar('email', { length: 64 }).notNull(),
    is_email_verified: boolean().default(false).notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    unique('user_email_key').on(t.email),
    index('userid_idx').on(t.id),
    index('user_email_idx').on(t.email),
  ]
);

export const refreshTokenSchema = pgTable(
  'refresh_token',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => userSchema.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 512 }).notNull(),
  },
  (t) => [
    index('refresh_user_idx').on(t.userId),
    unique('refresh_token_key').on(t.token),
  ]
);

export const emailVerificatoinTokenSchema = pgTable(
  'verification_token',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => userSchema.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 512 }).notNull(),
    valid: boolean().default(true).notNull()
  },
  (t) => [
    index('verification_user_idx').on(t.userId),
    unique('verification_token_key').on(t.token),
  ]
);