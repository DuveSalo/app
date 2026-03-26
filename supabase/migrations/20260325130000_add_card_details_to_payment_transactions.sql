-- Add card detail columns to payment_transactions
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS payment_type_id TEXT,
  ADD COLUMN IF NOT EXISTS card_brand TEXT,
  ADD COLUMN IF NOT EXISTS card_last_four TEXT;

COMMENT ON COLUMN payment_transactions.payment_type_id IS 'credit_card or debit_card (from MercadoPago)';
COMMENT ON COLUMN payment_transactions.card_brand IS 'Card brand: visa, master, amex, etc.';
COMMENT ON COLUMN payment_transactions.card_last_four IS 'Last 4 digits of card number';
