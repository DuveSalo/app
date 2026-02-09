# Database Helper - Prisma (Subscriptions)

Implementation of `src/lib/db/subscriptions.ts` using Prisma ORM.

## Prerequisites

- `prisma` and `@prisma/client` installed
- PostgreSQL database (AWS RDS, Neon, Supabase, self-hosted, etc.)

## Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model Subscription {
  id                          String    @id @default(uuid()) @db.Uuid
  user_email                  String    @db.VarChar(255)
  reason                      String
  mercadopago_preapproval_id  String?
  mercadopago_payer_id        String?
  status                      String    @default("pending") @db.VarChar(20)
  amount                      Decimal   @db.Decimal(10, 2)
  currency_id                 String    @default("ARS") @db.VarChar(3)
  frequency                   Int       @default(1)
  frequency_type              String    @default("months") @db.VarChar(10)
  external_reference          String?
  next_payment_date           DateTime? @db.Timestamptz()
  created_at                  DateTime  @default(now()) @db.Timestamptz()
  updated_at                  DateTime  @default(now()) @db.Timestamptz()

  @@index([user_email])
  @@index([status])
  @@index([mercadopago_preapproval_id])
  @@index([user_email, status])
  @@map("subscriptions")
}
```

Then run:

```bash
npx prisma migrate dev --name add_subscriptions
```

**Note:** If using `assets/migration.sql` directly instead of Prisma migrations, run `npx prisma db pull` to sync the schema from the existing database.

## Implementation

```typescript
// src/lib/db/subscriptions.ts
import { prisma } from '@/lib/prisma';

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
  const subscription = await prisma.subscription.create({
    data: {
      user_email: data.user_email,
      reason: data.reason,
      status: data.status,
      amount: data.amount,
      currency_id: data.currency_id,
      frequency: data.frequency,
      frequency_type: data.frequency_type,
      external_reference: data.external_reference,
    },
    select: { id: true },
  });
  return subscription;
}

export async function updateSubscription(id: string, data: SubscriptionUpdate) {
  await prisma.subscription.update({
    where: { id },
    data: {
      ...data,
      next_payment_date: data.next_payment_date ? new Date(data.next_payment_date) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    },
  });
}

export async function getSubscriptionStatus(id: string) {
  return prisma.subscription.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
}

export async function getSubscriptionByPreapprovalId(preapprovalId: string) {
  return prisma.subscription.findFirst({
    where: { mercadopago_preapproval_id: preapprovalId },
    select: { id: true, status: true },
  });
}

export async function getUserActiveSubscription(email: string) {
  return prisma.subscription.findFirst({
    where: { user_email: email, status: 'authorized' },
    orderBy: { created_at: 'desc' },
    select: { id: true, status: true },
  });
}
```
