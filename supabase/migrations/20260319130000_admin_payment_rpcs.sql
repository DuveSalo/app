-- RPC: aprobar pago manual
-- Ejecuta todas las escrituras en una sola transacción para garantizar atomicidad.
-- p_plan_key y p_plan_name son opcionales: si se omiten, selected_plan no se modifica.
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
  v_period_end TEXT;
  v_amount NUMERIC;
BEGIN
  -- Get company_id and period_end from payment
  SELECT company_id, period_end, amount
  INTO v_company_id, v_period_end, v_amount
  FROM manual_payments
  WHERE id = p_payment_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  -- Use provided amount or fall back to stored amount
  IF p_amount IS NULL THEN
    p_amount := v_amount;
  END IF;

  -- 1. Update payment status
  UPDATE manual_payments
  SET status = 'approved',
      reviewed_at = NOW(),
      reviewed_by = p_admin_id,
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- 2. Update company subscription status
  --    Only override selected_plan if caller supplied one; otherwise keep existing.
  UPDATE companies
  SET subscription_status = 'active',
      bank_transfer_status = 'active',
      is_subscribed = true,
      selected_plan = COALESCE(p_plan_key, selected_plan),
      subscription_renewal_date = v_period_end,
      updated_at = NOW()
  WHERE id = v_company_id;

  -- 3. Insert activity log
  INSERT INTO activity_logs (action, admin_id, target_id, target_type, metadata)
  VALUES (
    'approve_payment',
    p_admin_id,
    p_payment_id,
    'manual_payment',
    jsonb_build_object(
      'company_id', v_company_id,
      'plan_key', p_plan_key,
      'amount', p_amount,
      'admin_email', p_admin_email
    )
  );

  -- 4. Insert notification
  INSERT INTO notifications (company_id, type, category, title, message, link, related_table, related_id, is_read)
  VALUES (
    v_company_id,
    'system',
    'system',
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

-- RPC: rechazar pago manual
-- Ejecuta todas las escrituras en una sola transacción para garantizar atomicidad.
CREATE OR REPLACE FUNCTION admin_reject_payment(
  p_payment_id UUID,
  p_admin_id UUID,
  p_admin_email TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT company_id INTO v_company_id
  FROM manual_payments
  WHERE id = p_payment_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  -- 1. Update payment status
  UPDATE manual_payments
  SET status = 'rejected',
      rejection_reason = p_reason,
      reviewed_at = NOW(),
      reviewed_by = p_admin_id,
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- 2. Insert activity log
  INSERT INTO activity_logs (action, admin_id, target_id, target_type, metadata)
  VALUES (
    'reject_payment',
    p_admin_id,
    p_payment_id,
    'manual_payment',
    jsonb_build_object(
      'company_id', v_company_id,
      'reason', p_reason,
      'admin_email', p_admin_email
    )
  );

  -- 3. Insert notification
  INSERT INTO notifications (company_id, type, category, title, message, link, related_table, related_id, is_read)
  VALUES (
    v_company_id,
    'info',
    'payment',
    'Pago rechazado',
    COALESCE('Tu transferencia fue rechazada: ' || p_reason, 'Tu transferencia bancaria fue rechazada. Por favor contacta soporte.'),
    '/bank-transfer/status',
    'manual_payments',
    p_payment_id,
    false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_reject_payment TO authenticated;
