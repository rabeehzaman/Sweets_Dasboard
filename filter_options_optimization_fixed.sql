-- ============================================================================
-- FILTER OPTIONS OPTIMIZATION - TYPE CASTING FIX
-- ============================================================================
-- Fixes the "operator does not exist: text >= date" error by casting
-- invoice_date column to date type before comparison
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS get_customer_filter_options_2025(text, text, text[]);
DROP FUNCTION IF EXISTS get_invoice_filter_options_2025(text, text, text[]);

-- ============================================================================
-- 1. get_customer_filter_options_2025 - FIXED TYPE CASTING
-- ============================================================================
CREATE OR REPLACE FUNCTION get_customer_filter_options_2025(
  p_start_date text DEFAULT '2025-01-01',
  p_end_date text DEFAULT CURRENT_DATE::text,
  p_location_ids text[] DEFAULT NULL
)
RETURNS TABLE (
  customer_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    c.customer_name::text
  FROM invoices i
  INNER JOIN customers c ON i.customer_id = c.customer_id
  WHERE
    -- Date filter with explicit casting on BOTH sides
    i.invoice_date::date >= p_start_date::date
    AND i.invoice_date::date <= p_end_date::date
    -- 2025 data only
    AND EXTRACT(YEAR FROM i.invoice_date::date) = 2025
    -- Location filter using indexed location_id column
    AND (
      p_location_ids IS NULL
      OR i.location_id = ANY(p_location_ids)
    )
    -- Exclude null/empty customer names
    AND c.customer_name IS NOT NULL
    AND c.customer_name != ''
  ORDER BY c.customer_name;
END;
$$;

COMMENT ON FUNCTION get_customer_filter_options_2025 IS 'Get distinct customer names for filter dropdown using indexed location_id filtering. Fixed type casting for text invoice_date column.';

-- ============================================================================
-- 2. get_invoice_filter_options_2025 - FIXED TYPE CASTING
-- ============================================================================
CREATE OR REPLACE FUNCTION get_invoice_filter_options_2025(
  p_start_date text DEFAULT '2025-01-01',
  p_end_date text DEFAULT CURRENT_DATE::text,
  p_location_ids text[] DEFAULT NULL
)
RETURNS TABLE (
  invoice_no text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    i.invoice_number::text as invoice_no
  FROM invoices i
  WHERE
    -- Date filter with explicit casting on BOTH sides
    i.invoice_date::date >= p_start_date::date
    AND i.invoice_date::date <= p_end_date::date
    -- 2025 data only
    AND EXTRACT(YEAR FROM i.invoice_date::date) = 2025
    -- Location filter using indexed location_id column
    AND (
      p_location_ids IS NULL
      OR i.location_id = ANY(p_location_ids)
    )
    -- Exclude null/empty invoice numbers
    AND i.invoice_number IS NOT NULL
    AND i.invoice_number != ''
  ORDER BY i.invoice_number DESC;
END;
$$;

COMMENT ON FUNCTION get_invoice_filter_options_2025 IS 'Get distinct invoice numbers for filter dropdown using indexed location_id filtering. Fixed type casting for text invoice_date column.';

-- ============================================================================
-- 3. VERIFICATION QUERIES
-- ============================================================================

-- Test customer filter options (all locations)
SELECT 'Customer filter test (all locations):' as test;
SELECT customer_name
FROM get_customer_filter_options_2025('2025-10-01', '2025-10-13', NULL)
LIMIT 5;

-- Test customer filter options (specific location)
SELECT 'Customer filter test (specific location):' as test;
SELECT customer_name
FROM get_customer_filter_options_2025(
  '2025-10-01',
  '2025-10-13',
  ARRAY['6817763000000946016']::text[]  -- Frozen branch
)
LIMIT 5;

-- Test invoice filter options (all locations)
SELECT 'Invoice filter test (all locations):' as test;
SELECT invoice_no
FROM get_invoice_filter_options_2025('2025-10-01', '2025-10-13', NULL)
LIMIT 5;

-- Test invoice filter options (specific location)
SELECT 'Invoice filter test (specific location):' as test;
SELECT invoice_no
FROM get_invoice_filter_options_2025(
  '2025-10-01',
  '2025-10-13',
  ARRAY['6817763000000946016']::text[]  -- Frozen branch
)
LIMIT 5;

-- ============================================================================
-- Expected results:
-- ✅ Both functions should execute without "text >= date" error
-- ✅ Customer names should be returned sorted alphabetically
-- ✅ Invoice numbers should be returned sorted descending
-- ✅ Location filtering should work correctly using indexed location_id
-- ============================================================================
