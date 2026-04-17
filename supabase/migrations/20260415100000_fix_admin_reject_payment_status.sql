-- Fix: admin_reject_payment must update companies.subscription_status and bank_transfer_status.
-- Previously only manual_payments.status was set to 'rejected', leaving companies in 'pending'
-- state and causing rejected schools to appear as pending in admin views.
-- Rejected bank-transfer renewal payments must also suspend access until a later approval.

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_bank_transfer_status_check;

ALTER TABLE companies
  ADD CONSTRAINT companies_bank_transfer_status_check
    CHECK (bank_transfer_status IS NULL OR bank_transfer_status IN ('pending', 'active', 'suspended', 'rejected'));

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
  v_payment_status TEXT;
BEGIN
  -- Guard: caller must be an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  SELECT company_id, status INTO v_company_id, v_payment_status
  FROM manual_payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;

  IF v_payment_status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Payment % is not pending (current status: %)', p_payment_id, COALESCE(v_payment_status, 'null');
  END IF;

  -- 1. Update payment status
  UPDATE manual_payments
  SET status = 'rejected',
      rejection_reason = p_reason,
      reviewed_at = NOW(),
      reviewed_by = p_admin_id,
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- 2. Update company subscription status so rejected schools don't appear as pending
  UPDATE companies
  SET subscription_status = 'rejected',
      bank_transfer_status = 'rejected',
      is_subscribed = false,
      updated_at = NOW()
  WHERE id = v_company_id;

  -- 3. Suspend any currently active bank-transfer subscription for rejected renewals.
  UPDATE subscriptions
  SET status = 'suspended',
      suspended_at = NOW(),
      updated_at = NOW()
  WHERE company_id = v_company_id
    AND payment_provider = 'bank_transfer'
    AND status = 'active';

  -- 4. Insert activity log
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

  -- 5. Insert notification
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
