# Database Helper - Supabase (Subscriptions)

Implementation of `src/lib/db/subscriptions.ts` using Supabase client.

## Prerequisites

- `@supabase/supabase-js` installed
- A server-side Supabase client (e.g., `createServiceClient` from `src/lib/supabase/server.ts`)
- Run `assets/migration.sql` in Supabase SQL Editor

## Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Never expose to frontend
```

## Implementation

```typescript
// src/lib/db/subscriptions.ts
import { createServiceClient } from '@/lib/supabase/server';

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
  const supabase = await createServiceClient();
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert(data)
    .select('id')
    .single();

  if (error || !subscription) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
  return subscription;
}

export async function updateSubscription(id: string, data: SubscriptionUpdate) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from('subscriptions')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

export async function getSubscriptionStatus(id: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getSubscriptionByPreapprovalId(preapprovalId: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('mercadopago_preapproval_id', preapprovalId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getUserActiveSubscription(email: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_email', email)
    .eq('status', 'authorized')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}
```

## Supabase Server Client Example

If the project doesn't have a server-side Supabase client yet:

```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

export async function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

## Optional: Row Level Security (RLS)

Enable RLS if using Supabase Auth. Add to migration:

```sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

-- Service role bypasses RLS (used by API routes)
-- No additional policy needed when using createServiceClient with service_role key
```
