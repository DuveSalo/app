-- ============================================================================
-- Normalize payment notification links.
-- ----------------------------------------------------------------------------
-- Approved bank-transfer payments should route subscribed users to the durable
-- billing page, not the transient bank-transfer status/recovery flow.
--
-- Rejected payments intentionally keep `/bank-transfer/status` because that
-- page shows the rejection reason and lets the user upload a new receipt.
--
-- This forward migration preserves the latest admin_approve_payment behavior
-- from 20260417170000_clear_trial_on_bank_transfer_approval.sql, including:
-- - clearing trial_ends_at on approval,
-- - setting subscription_renewal_date,
-- - keeping subscriptions.next_billing_time aligned with current_period_end.
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_approve_payment(
  p_payment_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_plan_key TEXT DEFAULT NULL,
  p_plan_name TEXT DEFAULT NULL,
  p_amount NUMERIC DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_payment_status TEXT;
  v_period_start DATE;
  v_period_end DATE;
  v_amount NUMERIC;
  v_plan_key TEXT;
  v_plan_name TEXT;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  SELECT company_id, status, period_start, period_end, amount
  INTO v_company_id, v_payment_status, v_period_start, v_period_end, v_amount
  FROM manual_payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  IF v_payment_status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Payment % is not pending (current status: %)', p_payment_id, COALESCE(v_payment_status, 'null');
  END IF;

  IF p_amount IS NULL THEN
    p_amount := v_amount;
  END IF;

  IF p_plan_key IS NULL THEN
    SELECT selected_plan INTO v_plan_key FROM companies WHERE id = v_company_id;
  ELSE
    v_plan_key := p_plan_key;
  END IF;

  IF p_plan_name IS NULL THEN
    v_plan_name := CASE v_plan_key
      WHEN 'basic'    THEN 'Básico'
      WHEN 'standard' THEN 'Estándar'
      WHEN 'premium'  THEN 'Premium'
      WHEN 'trial'    THEN 'Prueba Gratis'
      ELSE INITCAP(COALESCE(v_plan_key, 'Sin plan'))
    END;
  ELSE
    v_plan_name := p_plan_name;
  END IF;

  UPDATE manual_payments
  SET status = 'approved',
      reviewed_at = NOW(),
      reviewed_by = p_admin_id,
      updated_at = NOW()
  WHERE id = p_payment_id;

  UPDATE companies
  SET subscription_status = 'active',
      bank_transfer_status = 'active',
      is_subscribed = true,
      selected_plan = COALESCE(p_plan_key, selected_plan),
      subscription_renewal_date = v_period_end,
      trial_ends_at = NULL,
      updated_at = NOW()
  WHERE id = v_company_id;

  UPDATE subscriptions
  SET status = 'active',
      activated_at = NOW(),
      current_period_start = v_period_start,
      current_period_end = v_period_end,
      next_billing_time = v_period_end,
      amount = p_amount,
      updated_at = NOW()
  WHERE company_id = v_company_id
    AND payment_provider = 'bank_transfer'
    AND status = 'approval_pending';

  IF NOT FOUND THEN
    INSERT INTO subscriptions (
      company_id, payment_provider, plan_key, plan_name,
      amount, currency, status, activated_at,
      current_period_start, current_period_end, next_billing_time
    ) VALUES (
      v_company_id, 'bank_transfer', COALESCE(v_plan_key, 'basic'), v_plan_name,
      p_amount, 'ARS', 'active', NOW(),
      v_period_start, v_period_end, v_period_end
    );
  END IF;

  INSERT INTO activity_logs (action, admin_id, target_id, target_type, metadata)
  VALUES (
    'approve_payment',
    p_admin_id,
    p_payment_id,
    'manual_payment',
    jsonb_build_object(
      'company_id', v_company_id,
      'plan_key', v_plan_key,
      'amount', p_amount,
      'admin_email', p_admin_email
    )
  );

  INSERT INTO notifications (company_id, type, category, title, message, link, related_table, related_id, is_read)
  VALUES (
    v_company_id,
    'success',
    'payment',
    'Pago aprobado',
    'Tu transferencia bancaria fue aprobada. Tu suscripción está activa.',
    '/settings?tab=billing',
    'manual_payments',
    p_payment_id,
    false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_approve_payment TO authenticated;

-- Repair existing approved payment notifications only.
-- Do NOT rewrite rejected payment notifications: they need the status/recovery page.
UPDATE notifications
SET link = '/settings?tab=billing'
WHERE type = 'success'
  AND category = 'payment'
  AND title = 'Pago aprobado'
  AND related_table = 'manual_payments'
  AND link = '/bank-transfer/status';

NOTIFY pgrst, 'reload schema';
