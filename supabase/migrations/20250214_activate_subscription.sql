-- Activate subscription for company 319cefdc-55cc-45a7-8f62-4e1748bb32b5
-- MP preapproval 50998bcfcf5d4911b618838ce22bdda9 is already authorized

UPDATE subscriptions
SET status = 'authorized',
    next_payment_date = '2026-03-09T15:10:38.000-04:00',
    updated_at = NOW()
WHERE company_id = '319cefdc-55cc-45a7-8f62-4e1748bb32b5'
  AND status = 'pending';

UPDATE companies
SET is_subscribed = true,
    subscription_status = 'active',
    selected_plan = 'basic',
    subscription_renewal_date = '2026-03-09T15:10:38.000-04:00'
WHERE id = '319cefdc-55cc-45a7-8f62-4e1748bb32b5';

NOTIFY pgrst, 'reload schema';
