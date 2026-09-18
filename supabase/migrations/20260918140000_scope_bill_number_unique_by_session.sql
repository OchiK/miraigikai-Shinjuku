-- Replace the global bill number constraint with session-scoped constraints.

CREATE UNIQUE INDEX bills_session_bill_number_unique
  ON bills (council_session_id, bill_number)
  WHERE council_session_id IS NOT NULL AND bill_number != '';

CREATE UNIQUE INDEX bills_unassigned_bill_number_unique
  ON bills (bill_number)
  WHERE council_session_id IS NULL AND bill_number != '';

DROP INDEX IF EXISTS bills_bill_number_unique;
