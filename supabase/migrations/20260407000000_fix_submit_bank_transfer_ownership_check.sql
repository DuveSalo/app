-- Fix: verify the caller owns p_company_id before executing.
-- SECURITY DEFINER bypasses RLS, so we must enforce ownership manually.

CREATE OR REPLACE FUNCTION submit_bank_transfer_payment(
  p_company_id UUID,
  p_amount NUMERIC,
  p_period_start DATE,
  p_period_end DATE,
  p_plan_key TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id UUID;
  v_plan_name TEXT;
BEGIN
  -- Guard: caller must own the company
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  -- Guard: prevent duplicate pending submissions
  IF EXISTS (
    SELECT 1 FROM manual_payments
    WHERE company_id = p_company_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'duplicate_pending_payment';
  END IF;

  -- Resolve human-readable plan name from key
  v_plan_name := CASE p_plan_key
    WHEN 'basic'    THEN 'Básico'
    WHEN 'standard' THEN 'Estándar'
    WHEN 'premium'  THEN 'Premium'
    WHEN 'trial'    THEN 'Prueba Gratis'
    ELSE INITCAP(COALESCE(p_plan_key, 'Sin plan'))
  END;

  -- Insert manual payment record
  INSERT INTO manual_payments (
    company_id,
    amount,
    period_start,
    period_end,
    status
  )
  VALUES (
    p_company_id,
    p_amount,
    p_period_start,
    p_period_end,
    'pending'
  )
  RETURNING id INTO v_payment_id;

  -- Update company payment method and plan
  UPDATE companies
  SET
    payment_method = 'bank_transfer',
    bank_transfer_status = 'pending',
    selected_plan = p_plan_key,
    subscription_status = 'pending'
  WHERE id = p_company_id;

  -- Clean up stale bank_transfer subscriptions before inserting new approval_pending row
  DELETE FROM subscriptions
  WHERE company_id = p_company_id
    AND payment_provider = 'bank_transfer'
    AND status IN ('approval_pending', 'cancelled');

  -- Create approval_pending subscription so the billing UI shows immediately
  INSERT INTO subscriptions (
    company_id,
    payment_provider,
    plan_key,
    plan_name,
    amount,
    currency,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    p_company_id,
    'bank_transfer',
    p_plan_key,
    v_plan_name,
    p_amount,
    'ARS',
    'approval_pending',
    p_period_start,
    p_period_end
  );

  RETURN v_payment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_bank_transfer_payment TO authenticated;
