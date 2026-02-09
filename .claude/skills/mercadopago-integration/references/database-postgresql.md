# Database Helper - Raw PostgreSQL (Subscriptions)

Implementation of `src/lib/db/subscriptions.ts` using `pg` (node-postgres) directly. Adapt for Drizzle, Kysely, or any other query builder.

## Prerequisites

- `pg` installed: `npm install pg`
- PostgreSQL database (AWS RDS, Neon, self-hosted, etc.)
- Run `assets/migration.sql` against your database

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Connection Pool

```typescript
// src/lib/db/pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export default pool;
```

## Implementation

```typescript
// src/lib/db/subscriptions.ts
import pool from './pool';

interface SubscriptionInsert {
  user_email: string;
  reason: string;
  status: 'pending';
  amount: number;
  currency_id: string;
  frequency: number;
  frequency_type: 'months' | 'days';
  external_reference?: string;
}

interface SubscriptionUpdate {
  status?: 'pending' | 'authorized' | 'paused' | 'cancelled';
  mercadopago_preapproval_id?: string;
  mercadopago_payer_id?: string;
  user_email?: string;
  next_payment_date?: string;
  updated_at?: string;
}

export async function createSubscription(data: SubscriptionInsert) {
  const { rows } = await pool.query(
    `INSERT INTO subscriptions (user_email, reason, status, amount, currency_id, frequency, frequency_type, external_reference)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [data.user_email, data.reason, data.status, data.amount, data.currency_id, data.frequency, data.frequency_type, data.external_reference]
  );
  return rows[0];
}

export async function updateSubscription(id: string, data: SubscriptionUpdate) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  values.push(id);
  await pool.query(
    `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );
}

export async function getSubscriptionStatus(id: string) {
  const { rows } = await pool.query(
    `SELECT id, status FROM subscriptions WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getSubscriptionByPreapprovalId(preapprovalId: string) {
  const { rows } = await pool.query(
    `SELECT id, status FROM subscriptions WHERE mercadopago_preapproval_id = $1`,
    [preapprovalId]
  );
  return rows[0] || null;
}

export async function getUserActiveSubscription(email: string) {
  const { rows } = await pool.query(
    `SELECT id, status FROM subscriptions
     WHERE user_email = $1 AND status = 'authorized'
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}
```

## Drizzle ORM Variant

If using Drizzle instead of raw `pg`:

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, varchar, numeric, integer, timestamp, text } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_email: varchar('user_email', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  mercadopago_preapproval_id: text('mercadopago_preapproval_id'),
  mercadopago_payer_id: text('mercadopago_payer_id'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency_id: varchar('currency_id', { length: 3 }).notNull().default('ARS'),
  frequency: integer('frequency').notNull().default(1),
  frequency_type: varchar('frequency_type', { length: 10 }).notNull().default('months'),
  external_reference: text('external_reference'),
  next_payment_date: timestamp('next_payment_date', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

```typescript
// src/lib/db/subscriptions.ts
import { db } from '@/lib/db/drizzle';
import { subscriptions } from './schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createSubscription(data: {
  user_email: string; reason: string; status: 'pending';
  amount: number; currency_id: string; frequency: number;
  frequency_type: 'months' | 'days'; external_reference?: string;
}) {
  const [sub] = await db.insert(subscriptions).values(data).returning({ id: subscriptions.id });
  return sub;
}

export async function updateSubscription(id: string, data: Record<string, unknown>) {
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function getSubscriptionStatus(id: string) {
  const [sub] = await db.select({ id: subscriptions.id, status: subscriptions.status })
    .from(subscriptions).where(eq(subscriptions.id, id));
  return sub || null;
}

export async function getSubscriptionByPreapprovalId(preapprovalId: string) {
  const [sub] = await db.select({ id: subscriptions.id, status: subscriptions.status })
    .from(subscriptions).where(eq(subscriptions.mercadopago_preapproval_id, preapprovalId));
  return sub || null;
}

export async function getUserActiveSubscription(email: string) {
  const [sub] = await db.select({ id: subscriptions.id, status: subscriptions.status })
    .from(subscriptions)
    .where(and(eq(subscriptions.user_email, email), eq(subscriptions.status, 'authorized')))
    .orderBy(desc(subscriptions.created_at))
    .limit(1);
  return sub || null;
}
```
