-- SWEETS Dashboard Phase 4 Fixes
-- Fixes for SAR currency format and missing views
-- Date: 2025-09-30

-- Helper function to convert SAR currency strings to numeric
-- Handles formats like "SAR 1,234.56" or "SAR 1234.56"
CREATE OR REPLACE FUNCTION parse_sar_currency(currency_text TEXT)
RETURNS NUMERIC AS $$
BEGIN
    RETURN CAST(
        REGEXP_REPLACE(
            REGEXP_REPLACE(COALESCE(currency_text, '0'), 'SAR\s*', '', 'g'),
            ',', '', 'g'
        ) AS NUMERIC
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 1. FIX: Customer Balance Aging View
-- ============================================================================
DROP VIEW IF EXISTS customer_balance_aging CASCADE;

CREATE OR REPLACE VIEW customer_balance_aging AS
WITH customer_invoices AS (
    SELECT
        i.customer_id,
        i.invoice_id,
        i.invoice_number,
        i.invoice_date,
        i.due_date,
        i.age_in_days,
        i.age_tier,
        parse_sar_currency(i.balance_bcy) as balance,
        i.invoice_status
    FROM invoices i
    WHERE parse_sar_currency(i.balance_bcy) > 0
),
customer_aging_buckets AS (
    SELECT
        customer_id,
        SUM(balance) as total_balance,
        SUM(CASE WHEN age_in_days BETWEEN 0 AND 30 THEN balance ELSE 0 END) as current_0_30,
        SUM(CASE WHEN age_in_days BETWEEN 31 AND 60 THEN balance ELSE 0 END) as past_due_31_60,
        SUM(CASE WHEN age_in_days BETWEEN 61 AND 90 THEN balance ELSE 0 END) as past_due_61_90,
        SUM(CASE WHEN age_in_days BETWEEN 91 AND 180 THEN balance ELSE 0 END) as past_due_91_180,
        SUM(CASE WHEN age_in_days > 180 THEN balance ELSE 0 END) as past_due_over_180,
        COUNT(*) as invoice_count,
        MAX(due_date) as latest_due_date,
        MIN(due_date) as earliest_due_date
    FROM customer_invoices
    GROUP BY customer_id
)
SELECT
    cab.customer_id,
    COALESCE(c.customer_name, 'Unknown Customer') as customer_name,
    COALESCE(sp.name, 'Unassigned') as customer_owner_name_custom,
    cab.total_balance,
    cab.current_0_30,
    cab.past_due_31_60,
    cab.past_due_61_90,
    cab.past_due_91_180,
    cab.past_due_over_180,
    cab.invoice_count,
    cab.latest_due_date,
    cab.earliest_due_date,
    CASE
        WHEN cab.past_due_over_180 > 0 THEN 'Very High Risk'
        WHEN cab.past_due_91_180 > 0 THEN 'High Risk'
        WHEN cab.past_due_61_90 > 0 THEN 'Medium Risk'
        WHEN cab.past_due_31_60 > 0 THEN 'Low Risk'
        ELSE 'Current'
    END as risk_category
FROM customer_aging_buckets cab
LEFT JOIN customers c ON cab.customer_id = c.customer_id
LEFT JOIN sales_persons sp ON c.sales_person_id = sp.sales_person_id
WHERE cab.total_balance > 0
ORDER BY cab.total_balance DESC;

-- ============================================================================
-- 2. FIX: Customer Balance Aging Filtered (No filter for SWEETS - show all)
-- ============================================================================
DROP VIEW IF EXISTS customer_balance_aging_filtered CASCADE;

CREATE OR REPLACE VIEW customer_balance_aging_filtered AS
SELECT * FROM customer_balance_aging;

-- ============================================================================
-- 3. FIX: Top Overdue Customers View
-- ============================================================================
DROP VIEW IF EXISTS top_overdue_customers CASCADE;

CREATE OR REPLACE VIEW top_overdue_customers AS
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(sp.name, 'Unassigned') as sales_person,
    parse_sar_currency(i.balance_bcy) as outstanding_amount,
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    i.age_in_days,
    i.age_tier,
    CASE
        WHEN i.age_in_days > 180 THEN 'Very High Risk'
        WHEN i.age_in_days > 90 THEN 'High Risk'
        WHEN i.age_in_days > 60 THEN 'Medium Risk'
        WHEN i.age_in_days > 30 THEN 'Low Risk'
        ELSE 'Current'
    END as risk_level
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.customer_id
LEFT JOIN sales_persons sp ON c.sales_person_id = sp.sales_person_id
WHERE parse_sar_currency(i.balance_bcy) > 0
ORDER BY i.age_in_days DESC, parse_sar_currency(i.balance_bcy) DESC
LIMIT 100;

-- ============================================================================
-- 4. CREATE: Vendor Balance Aging View
-- ============================================================================
DROP VIEW IF EXISTS vendor_balance_aging_view CASCADE;

CREATE OR REPLACE VIEW vendor_balance_aging_view AS
WITH vendor_bills AS (
    SELECT
        b.vendor_id,
        b.bill_id,
        b.bill_number,
        b.bill_date,
        b.due_date,
        b.age_in_days,
        b.age_in_tier,
        parse_sar_currency(b.balance_bcy) as balance,
        b.bill_status
    FROM bills b
    WHERE parse_sar_currency(b.balance_bcy) > 0
),
vendor_aging_buckets AS (
    SELECT
        vendor_id,
        SUM(balance) as total_outstanding,
        SUM(CASE WHEN age_in_days BETWEEN 0 AND 30 THEN balance ELSE 0 END) as current_0_30,
        SUM(CASE WHEN age_in_days BETWEEN 31 AND 60 THEN balance ELSE 0 END) as past_due_31_60,
        SUM(CASE WHEN age_in_days BETWEEN 61 AND 90 THEN balance ELSE 0 END) as past_due_61_90,
        SUM(CASE WHEN age_in_days BETWEEN 91 AND 180 THEN balance ELSE 0 END) as past_due_91_180,
        SUM(CASE WHEN age_in_days > 180 THEN balance ELSE 0 END) as past_due_over_180,
        COUNT(*) as bill_count,
        MAX(due_date) as latest_due_date,
        MIN(due_date) as earliest_due_date
    FROM vendor_bills
    GROUP BY vendor_id
)
SELECT
    vab.vendor_id,
    COALESCE(v.vendor_name, v.display_name, 'Unknown Vendor') as "Vendor Name",
    vab.total_outstanding as "Total Outstanding",
    vab.current_0_30 as "Current (0-30)",
    vab.past_due_31_60 as "Past Due (31-60)",
    vab.past_due_61_90 as "Past Due (61-90)",
    vab.past_due_91_180 as "Past Due (91-180)",
    vab.past_due_over_180 as "Past Due (>180)",
    vab.bill_count as "Bill Count",
    vab.latest_due_date as "Latest Due Date",
    vab.earliest_due_date as "Earliest Due Date",
    CASE
        WHEN vab.past_due_over_180 > 0 THEN 'Critical'
        WHEN vab.past_due_91_180 > 0 THEN 'High'
        WHEN vab.past_due_61_90 > 0 THEN 'Medium'
        WHEN vab.past_due_31_60 > 0 THEN 'Low'
        ELSE 'Current'
    END as "Risk Level"
FROM vendor_aging_buckets vab
LEFT JOIN vendors v ON vab.vendor_id = v.vendor_id
WHERE vab.total_outstanding > 0
ORDER BY vab.total_outstanding DESC;

-- ============================================================================
-- 5. FIX: Get Branch Summary Function (remove nested aggregates)
-- ============================================================================
DROP FUNCTION IF EXISTS get_branch_summary(DATE, DATE, TEXT);

CREATE OR REPLACE FUNCTION get_branch_summary(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    branch_name TEXT,
    total_sales NUMERIC,
    total_profit NUMERIC,
    profit_margin NUMERIC,
    invoice_count BIGINT,
    avg_sale_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH branch_data AS (
        SELECT
            COALESCE(b.name, 'No Branch') as branch_name,
            SUM(pav."SaleWithVAT") as total_sales,
            SUM(pav."Profit") as total_profit,
            COUNT(DISTINCT pav."Inv No") as invoice_count
        FROM profit_analysis_view_current pav
        LEFT JOIN branch b ON pav."Branch Name" = b.name
        WHERE
            (start_date IS NULL OR pav."Inv Date"::DATE >= start_date)
            AND (end_date IS NULL OR pav."Inv Date"::DATE <= end_date)
            AND (branch_filter IS NULL OR pav."Branch Name" = branch_filter)
        GROUP BY b.name
    )
    SELECT
        bd.branch_name,
        COALESCE(bd.total_sales, 0) as total_sales,
        COALESCE(bd.total_profit, 0) as total_profit,
        CASE
            WHEN bd.total_sales > 0 THEN ROUND((bd.total_profit / bd.total_sales) * 100, 2)
            ELSE 0
        END as profit_margin,
        bd.invoice_count,
        CASE
            WHEN bd.invoice_count > 0 THEN ROUND(bd.total_sales / bd.invoice_count, 2)
            ELSE 0
        END as avg_sale_value
    FROM branch_data bd
    ORDER BY bd.total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE: Branch Performance Comparison View (if needed)
-- ============================================================================
DROP VIEW IF EXISTS branch_performance_comparison CASCADE;

CREATE OR REPLACE VIEW branch_performance_comparison AS
WITH branch_receivables AS (
    SELECT
        COALESCE(sp.name, 'Unassigned') as branch_name,
        SUM(parse_sar_currency(i.balance_bcy)) as total_receivables,
        COUNT(DISTINCT i.customer_id) as customer_count
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.customer_id
    LEFT JOIN sales_persons sp ON c.sales_person_id = sp.sales_person_id
    WHERE parse_sar_currency(i.balance_bcy) > 0
    GROUP BY sp.name
)
SELECT
    branch_name,
    total_receivables,
    customer_count,
    CASE
        WHEN customer_count > 0 THEN ROUND(total_receivables / customer_count, 2)
        ELSE 0
    END as avg_receivable_per_customer
FROM branch_receivables
ORDER BY total_receivables DESC;

-- ============================================================================
-- 7. GRANT permissions
-- ============================================================================
GRANT SELECT ON customer_balance_aging TO anon, authenticated;
GRANT SELECT ON customer_balance_aging_filtered TO anon, authenticated;
GRANT SELECT ON top_overdue_customers TO anon, authenticated;
GRANT SELECT ON vendor_balance_aging_view TO anon, authenticated;
GRANT SELECT ON branch_performance_comparison TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_branch_summary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION parse_sar_currency TO anon, authenticated;

-- ============================================================================
-- Verification queries
-- ============================================================================
-- Test the views
-- SELECT COUNT(*) FROM customer_balance_aging;
-- SELECT COUNT(*) FROM vendor_balance_aging_view;
-- SELECT COUNT(*) FROM top_overdue_customers;
-- SELECT * FROM get_branch_summary('2024-01-01', '2024-12-31', NULL);