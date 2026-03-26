-- Fix admin_approve_payment RPC to be idempotent for subscription activation:
-- 1. Try to UPDATE an existing approval_pending bank_transfer subscription -> active
-- 2. If NOT FOUND (legacy data or race), INSERT a new active subscription row
--
-- This handles:
-- a) Normal new flow: submit creates approval_pending, approve activates it
-- b) Legacy data: approved payments with 0 subscription rows

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
  v_period_start TEXT;
  v_period_end TEXT;
  v_amount NUMERIC;
  v_plan_key TEXT;
  v_plan_name TEXT;
BEGIN
  -- Get payment details
  SELECT company_id, period_start, period_end, amount
  INTO v_company_id, v_period_start, v_period_end, v_amount
  FROM manual_payments
  WHERE id = p_payment_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  -- Resolve amount: caller override takes precedence
  IF p_amount IS NULL THEN
    p_amount := v_amount;
  END IF;

  -- Resolve plan key from company if not provided
  IF p_plan_key IS NULL THEN
    SELECT selected_plan INTO v_plan_key FROM companies WHERE id = v_company_id;
  ELSE
    v_plan_key := p_plan_key;
  END IF;

  -- Resolve plan name
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

  -- 1. Update payment status
  UPDATE manual_payments
  SET status = 'approved',
      reviewed_at = NOW(),
      reviewed_by = p_admin_id,
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- 2. Update company subscription status
  UPDATE companies
  SET subscription_status = 'active',
      bank_transfer_status = 'active',
      is_subscribed = true,
      selected_plan = COALESCE(p_plan_key, selected_plan),
      subscription_renewal_date = v_period_end::date,
      updated_at = NOW()
  WHERE id = v_company_id;

  -- 3. Idempotent subscription activation:
  --    Try to activate an existing approval_pending subscription first.
  --    Fall back to INSERT for legacy data where no subscription row exists.
  UPDATE subscriptions
  SET status = 'active',
      activated_at = NOW(),
      current_period_start = v_period_start::date,
      current_period_end = v_period_end::date,
      amount = p_amount,
      updated_at = NOW()
  WHERE company_id = v_company_id
    AND payment_provider = 'bank_transfer'
    AND status = 'approval_pending';

  IF NOT FOUND THEN
    INSERT INTO subscriptions (
      company_id,
      payment_provider,
      plan_key,
      plan_name,
      amount,
      currency,
      status,
      activated_at,
      current_period_start,
      current_period_end
    ) VALUES (
      v_company_id,
      'bank_transfer',
      COALESCE(v_plan_key, 'basic'),
      v_plan_name,
      p_amount,
      'ARS',
      'active',
      NOW(),
      v_period_start,
      v_period_end
    );
  END IF;

  -- 4. Insert activity log
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

  -- 5. Insert notification
  INSERT INTO notifications (company_id, type, category, title, message, link, related_table, related_id, is_read)
  VALUES (
    v_company_id,
    'success',
    'payment',
    'Pago aprobado',
    'Tu transferencia bancaria fue aprobada. Tu suscripción está activa.',
    '/bank-transfer/status',
    'manual_payments',
    p_payment_id,
    false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_approve_payment TO authenticated;
