/**
 * One-time script to create MercadoPago preapproval plans.
 *
 * Usage:
 *   MP_ACCESS_TOKEN=APP_USR-xxx npx tsx scripts/mp-create-plans.ts
 *
 * This creates 3 monthly plans (Basic, Standard, Premium) in ARS.
 * Save the returned plan IDs as Supabase secrets:
 *   MP_PLAN_ID_BASIC, MP_PLAN_ID_STANDARD, MP_PLAN_ID_PREMIUM
 */

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error('Error: MP_ACCESS_TOKEN environment variable is required.');
  console.error('Usage: MP_ACCESS_TOKEN=APP_USR-xxx npx tsx scripts/mp-create-plans.ts');
  process.exit(1);
}

const BASE_URL = 'https://api.mercadopago.com';

const plans = [
  { key: 'basic', name: 'Escuela Segura - Plan Basic', amount: 25000 },
  { key: 'standard', name: 'Escuela Segura - Plan Standard', amount: 49000 },
  { key: 'premium', name: 'Escuela Segura - Plan Premium', amount: 89000 },
];

async function createPlan(plan: { key: string; name: string; amount: number }) {
  const body = {
    reason: plan.name,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: plan.amount,
      currency_id: 'ARS',
    },
    back_url: 'https://escuelasegura.com/#/subscribe',
  };

  const response = await fetch(`${BASE_URL}/preapproval_plan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create plan "${plan.key}": HTTP ${response.status} - ${JSON.stringify(error)}`,
    );
  }

  const data = await response.json();
  return { key: plan.key, id: data.id, status: data.status };
}

async function main() {
  console.log('Creating MercadoPago preapproval plans...\n');

  const results: { key: string; id: string; status: string }[] = [];

  for (const plan of plans) {
    try {
      const result = await createPlan(plan);
      results.push(result);
      console.log(`  ${plan.key}: ${result.id} (status: ${result.status})`);
    } catch (err) {
      console.error(`  ${plan.key}: FAILED -`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\n--- Supabase Secrets ---');
  console.log('Run these commands to set the plan IDs:\n');
  for (const r of results) {
    const envKey = `MP_PLAN_ID_${r.key.toUpperCase()}`;
    console.log(`  supabase secrets set ${envKey}=${r.id}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
