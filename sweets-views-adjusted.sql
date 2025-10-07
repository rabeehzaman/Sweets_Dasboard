-- ============================================================================
-- SWEETS DEPARTMENT DATABASE VIEW MIGRATION (ADJUSTED VERSION)
-- Creates views using SWEETS existing table names - no table renaming needed
-- ============================================================================

-- IMPORTANT: This script uses SWEETS table naming convention:
-- • fifo_mapping_table (not fifo_mapping)
-- • stock_in_flow_table (not stock_in_flow)
-- • stock_out_flow_table (not stock_out_flow)
-- • bill_item (not bill_items)

-- ============================================================================
-- STEP 1: CREATE MISSING TABLES ONLY
-- These tables exist in MADA but not in SWEETS
-- ============================================================================

-- Create sales_persons table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_persons (
    id SERIAL PRIMARY KEY,
    sales_person_id TEXT UNIQUE,
    name TEXT,
    email TEXT,
    status TEXT,
    last_modified_time TEXT,
    created_time TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create warehouses table if it doesn't exist
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_id TEXT UNIQUE,
    warehouse_name TEXT,
    last_modified_time TEXT,
    created_time TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE CORE VIEW - profit_analysis_view_current
-- Using SWEETS table names (fifo_mapping_table, stock_in_flow_table, etc.)
-- ============================================================================

CREATE OR REPLACE VIEW profit_analysis_view_current AS
-- Main invoice data
SELECT
    i.invoice_number AS "Inv No",
    i.invoice_date::date AS "Inv Date",
    ii.item_name AS "Item",
    CASE
        WHEN ii.quantity ~ '^[0-9.]+$' THEN CAST(ii.quantity AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.quantity, '[^0-9.]', '', 'g') AS NUMERIC)
    END AS "Qty",
    CASE
        WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END AS "Sale Price",
    -- Add 15% VAT
    ROUND(CASE
        WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END * 1.15, 2) AS "SaleWithVAT",
    -- Cost calculation from FIFO (using SWEETS table names)
    COALESCE(SUM(CASE
        WHEN fm.total_bcy ~ '^[0-9.]+$' THEN CAST(fm.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(fm.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END), 0) AS "Cost",
    -- Profit calculation
    ROUND(CASE
        WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END - COALESCE(SUM(CASE
        WHEN fm.total_bcy ~ '^[0-9.]+$' THEN CAST(fm.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(fm.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END), 0), 2) AS "Profit",
    -- Profit percentage
    ROUND(
        CASE
            WHEN NULLIF(CASE
                WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
                ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
            END, 0) IS NOT NULL THEN
                ((CASE
                    WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
                    ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
                END - COALESCE(SUM(CASE
                    WHEN fm.total_bcy ~ '^[0-9.]+$' THEN CAST(fm.total_bcy AS NUMERIC)
                    ELSE CAST(REGEXP_REPLACE(fm.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
                END), 0)) / NULLIF(CASE
                    WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
                    ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
                END, 0)) * 100
            ELSE 0
        END, 2) AS "Profit %",
    c.customer_name AS "Customer Name",
    COALESCE(b.branch_name, 'No Branch') AS "Branch Name",
    -- Unit calculations
    ROUND(CASE
        WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END / NULLIF(CASE
        WHEN ii.quantity ~ '^[0-9.]+$' THEN CAST(ii.quantity AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.quantity, '[^0-9.]', '', 'g') AS NUMERIC)
    END, 0), 2) AS "Unit Price",
    ROUND(COALESCE(SUM(CASE
        WHEN fm.total_bcy ~ '^[0-9.]+$' THEN CAST(fm.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(fm.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END), 0) / NULLIF(CASE
        WHEN ii.quantity ~ '^[0-9.]+$' THEN CAST(ii.quantity AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.quantity, '[^0-9.]', '', 'g') AS NUMERIC)
    END, 0), 2) AS "Unit Cost",
    ROUND((CASE
        WHEN ii.total_bcy ~ '^[0-9.]+$' THEN CAST(ii.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END - COALESCE(SUM(CASE
        WHEN fm.total_bcy ~ '^[0-9.]+$' THEN CAST(fm.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(fm.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END), 0)) / NULLIF(CASE
        WHEN ii.quantity ~ '^[0-9.]+$' THEN CAST(ii.quantity AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(ii.quantity, '[^0-9.]', '', 'g') AS NUMERIC)
    END, 0), 2) AS "Unit Profit",
    sp.name AS "Sales Person Name",
    i.invoice_status AS "Invoice Status"
FROM invoices i
JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
-- Using SWEETS table names
LEFT JOIN stock_out_flow_table sof ON ii.item_id = sof.invoice_item_id
LEFT JOIN fifo_mapping_table fm ON sof.stock_out_flow_id = fm.stock_out_flow_id
LEFT JOIN stock_in_flow_table sif ON fm.stock_in_flow_id = sif.stock_in_flow_id
JOIN customers c ON i.customer_id = c.customer_id
LEFT JOIN sales_persons sp ON i.sales_person_id = sp.sales_person_id
LEFT JOIN branch b ON i.branch_id = b.branch_id
WHERE i.invoice_status != 'Void'
GROUP BY i.invoice_number, i.invoice_date, ii.item_name, ii.quantity,
         ii.total_bcy, c.customer_name, b.branch_name, sp.name, i.invoice_status

UNION ALL

-- Credit notes (negative values)
SELECT
    cn.credit_note_number AS "Inv No",
    cn.credit_note_date::date AS "Inv Date",
    cni.item_name AS "Item",
    CASE
        WHEN cni.quantity ~ '^[0-9.]+$' THEN CAST(cni.quantity AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(cni.quantity, '[^0-9.]', '', 'g') AS NUMERIC)
    END AS "Qty",
    -1 * CASE
        WHEN cni.total ~ '^[0-9.]+$' THEN CAST(cni.total AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(cni.total, '[^0-9.]', '', 'g') AS NUMERIC)
    END AS "Sale Price",
    ROUND(-1 * CASE
        WHEN cni.total ~ '^[0-9.]+$' THEN CAST(cni.total AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(cni.total, '[^0-9.]', '', 'g') AS NUMERIC)
    END * 1.15, 2) AS "SaleWithVAT",
    -- Using SWEETS table name
    -1 * COALESCE(SUM(CASE
        WHEN sif.total_bcy ~ '^[0-9.]+$' THEN CAST(sif.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(sif.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END), CASE
        WHEN cni.total ~ '^[0-9.]+$' THEN CAST(cni.total AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(cni.total, '[^0-9.]', '', 'g') AS NUMERIC)
    END) AS "Cost",
    ROUND(-1 * CASE
        WHEN cni.total ~ '^[0-9.]+$' THEN CAST(cni.total AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(cni.total, '[^0-9.]', '', 'g') AS NUMERIC)
    END - (-1 * COALESCE(SUM(CASE
        WHEN sif.total_bcy ~ '^[0-9.]+$' THEN CAST(sif.total_bcy AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(sif.total_bcy, '[^0-9.]', '', 'g') AS NUMERIC)
    END), CASE
        WHEN cni.total ~ '^[0-9.]+$' THEN CAST(cni.total AS NUMERIC)
        ELSE CAST(REGEXP_REPLACE(cni.total, '[^0-9.]', '', 'g') AS NUMERIC)
    END)), 2) AS "Profit",
    0 AS "Profit %",
    c.customer_name AS "Customer Name",
    COALESCE(b.branch_name, 'No Branch') AS "Branch Name",
    0 AS "Unit Price",
    0 AS "Unit Cost",
    0 AS "Unit Profit",
    sp.name AS "Sales Person Name",
    cn.credit_note_status AS "Invoice Status"
FROM credit_notes cn
LEFT JOIN credit_note_items cni ON cn.creditnotes_id = cni.creditnotes_id
-- Using SWEETS table name
LEFT JOIN stock_in_flow_table sif ON cni.item_id = sif.credit_notes_item_id
LEFT JOIN customers c ON cn.customer_id = c.customer_id
LEFT JOIN sales_persons sp ON cn.sales_person_id = sp.sales_person_id
LEFT JOIN branch b ON cn.branch_id = b.branch_id
WHERE cn.credit_note_status != 'Void'
GROUP BY cn.credit_note_number, cn.credit_note_date, cni.item_name,
         cni.quantity, cni.total, c.customer_name, b.branch_name, sp.name, cn.credit_note_status;

-- ============================================================================
-- STEP 3: CREATE customer_balance_aging VIEW
-- No changes needed - uses standard table names
-- ============================================================================

CREATE OR REPLACE VIEW customer_balance_aging AS
SELECT
    c.customer_id,
    c.customer_name,
    c.display_name,
    c.company_name,
    c.customer_owner_id AS customer_owner,
    sp.name AS customer_owner_name,
    sp.email AS customer_owner_email,
    -- Custom owner name mapping (adjust as needed for SWEETS)
    CASE
        WHEN c.customer_owner_id = '9465000000096758' THEN 'Owner 1'
        WHEN c.customer_owner_id = '9465000015598322' THEN 'Owner 2'
        WHEN c.customer_owner_id = '9465000000096828' THEN 'Owner 3'
        WHEN c.customer_owner_id = '9465000006136989' THEN 'Owner 4'
        WHEN c.customer_owner_id = '9465000013757632' THEN 'Owner 5'
        ELSE 'Unknown Owner'
    END AS customer_owner_name_custom,
    -- Total balance calculation
    COALESCE(SUM(CASE
        WHEN i.balance_bcy IS NOT NULL AND i.balance_bcy != ''
        THEN CAST(REPLACE(i.balance_bcy, ',', '') AS NUMERIC)
        ELSE 0
    END), 0) AS total_balance,
    -- Aging buckets
    COALESCE(SUM(CASE
        WHEN i.age_tier = '1. 0 - 30 days' AND i.balance_bcy IS NOT NULL AND i.balance_bcy != ''
        THEN CAST(REPLACE(i.balance_bcy, ',', '') AS NUMERIC)
        ELSE 0
    END), 0) AS current_0_30,
    COALESCE(SUM(CASE
        WHEN i.age_tier = '2. 31 - 60 days' AND i.balance_bcy IS NOT NULL AND i.balance_bcy != ''
        THEN CAST(REPLACE(i.balance_bcy, ',', '') AS NUMERIC)
        ELSE 0
    END), 0) AS past_due_31_60,
    COALESCE(SUM(CASE
        WHEN i.age_tier = '3. 61 - 90 days' AND i.balance_bcy IS NOT NULL AND i.balance_bcy != ''
        THEN CAST(REPLACE(i.balance_bcy, ',', '') AS NUMERIC)
        ELSE 0
    END), 0) AS past_due_61_90,
    COALESCE(SUM(CASE
        WHEN i.age_tier = '4. 91 - 180 days' AND i.balance_bcy IS NOT NULL AND i.balance_bcy != ''
        THEN CAST(REPLACE(i.balance_bcy, ',', '') AS NUMERIC)
        ELSE 0
    END), 0) AS past_due_91_180,
    COALESCE(SUM(CASE
        WHEN i.age_tier = '5. Above 180 days' AND i.balance_bcy IS NOT NULL AND i.balance_bcy != ''
        THEN CAST(REPLACE(i.balance_bcy, ',', '') AS NUMERIC)
        ELSE 0
    END), 0) AS past_due_over_180,
    COUNT(i.invoice_id) AS total_invoices,
    MAX(i.invoice_date) AS last_invoice_date,
    c.status AS customer_status
FROM customers c
LEFT JOIN invoices i ON c.customer_id = i.customer_id
    AND i.invoice_status NOT IN ('Void', 'Draft')
LEFT JOIN sales_persons sp ON c.customer_owner_id = sp.sales_person_id
GROUP BY c.customer_id, c.customer_name, c.display_name,
         c.company_name, c.customer_owner_id, c.status, sp.name, sp.email
-- No filtering for SWEETS - show all customers
ORDER BY total_balance DESC;

-- ============================================================================
-- STEP 4: CREATE customer_balance_aging_filtered VIEW
-- No filtering for SWEETS - just alias to main view
-- ============================================================================

CREATE OR REPLACE VIEW customer_balance_aging_filtered AS
SELECT * FROM customer_balance_aging
ORDER BY total_balance DESC;

-- ============================================================================
-- STEP 5: CREATE vendor_bills_filtered VIEW
-- No filtering for SWEETS - show all vendor bills
-- ============================================================================

CREATE OR REPLACE VIEW vendor_bills_filtered AS
SELECT
    b.bill_id,
    b.vendor_id,
    b.bill_status,
    b.bill_date,
    b.total_bcy,
    b.balance_bcy,
    b.age_in_days,
    v.vendor_name
FROM bills b
JOIN vendors v ON b.vendor_id = v.vendor_id
WHERE b.vendor_id IS NOT NULL;

-- ============================================================================
-- STEP 6: CREATE top_overdue_customers VIEW
-- No filtering for SWEETS - show all customers with overdue calculations
-- ============================================================================

CREATE OR REPLACE VIEW top_overdue_customers AS
SELECT
    customer_id,
    customer_name,
    display_name,
    company_name,
    customer_owner,
    customer_owner_name_custom,
    total_balance,
    (past_due_31_60 + past_due_61_90 + past_due_91_180 + past_due_over_180) AS total_overdue,
    CASE
        WHEN total_balance > 0
        THEN ROUND(((past_due_31_60 + past_due_61_90 + past_due_91_180 + past_due_over_180) / total_balance) * 100, 2)
        ELSE 0
    END AS overdue_percentage,
    past_due_31_60,
    past_due_61_90,
    past_due_91_180,
    past_due_over_180,
    total_invoices,
    last_invoice_date,
    customer_status
FROM customer_balance_aging
-- No WHERE clause filtering for SWEETS
ORDER BY total_overdue DESC;

-- ============================================================================
-- STEP 7: CREATE AGGREGATE VIEWS
-- These views depend on profit_analysis_view_current
-- ============================================================================

-- Create profit_totals_view
CREATE OR REPLACE VIEW profit_totals_view AS
SELECT
    SUM("Sale Price") as total_taxable_sales,
    SUM("SaleWithVAT") as total_revenue,
    SUM("Cost") as total_cost,
    SUM("Profit") as total_profit,
    COUNT(*) as total_invoices,
    COUNT(DISTINCT "Inv No") as unique_invoices,
    COUNT(DISTINCT "Branch Name") as branch_count,
    AVG("Sale Price") as avg_sale_price,
    AVG("Profit %") as avg_profit_margin,
    CASE
        WHEN SUM("SaleWithVAT") > 0
        THEN (SUM("Profit") / SUM("SaleWithVAT")) * 100
        ELSE 0
    END as overall_profit_margin
FROM profit_analysis_view_current;

-- Create profit_by_branch_view
CREATE OR REPLACE VIEW profit_by_branch_view AS
SELECT
    "Branch Name" as branch_name,
    SUM("Sale Price") as branch_taxable_sales,
    SUM("SaleWithVAT") as branch_revenue,
    SUM("Cost") as branch_cost,
    SUM("Profit") as branch_profit,
    COUNT(*) as branch_invoices,
    COUNT(DISTINCT "Inv No") as unique_branch_invoices,
    AVG("Sale Price") as avg_branch_sale_price,
    CASE
        WHEN SUM("SaleWithVAT") > 0
        THEN (SUM("Profit") / SUM("SaleWithVAT")) * 100
        ELSE 0
    END as branch_profit_margin,
    MIN("Inv Date") as first_transaction_date,
    MAX("Inv Date") as last_transaction_date
FROM profit_analysis_view_current
GROUP BY "Branch Name"
ORDER BY branch_taxable_sales DESC;

-- ============================================================================
-- STEP 8: CREATE RPC FUNCTIONS FOR OPTIMIZED QUERIES
-- ============================================================================

-- Function: get_dashboard_kpis
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filter TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_taxable_sales NUMERIC;
    total_revenue NUMERIC;
    total_cost NUMERIC;
    gross_profit NUMERIC;
    total_expenses NUMERIC;
    net_profit NUMERIC;
    gross_profit_margin NUMERIC;
    net_profit_margin NUMERIC;
BEGIN
    -- Calculate sales and cost from profit_analysis_view_current
    SELECT
        COALESCE(SUM("Sale Price"), 0),
        COALESCE(SUM("SaleWithVAT"), 0),
        COALESCE(SUM("Cost"), 0),
        COALESCE(SUM("Profit"), 0)
    INTO
        total_taxable_sales,
        total_revenue,
        total_cost,
        gross_profit
    FROM profit_analysis_view_current
    WHERE (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filter IS NULL OR "Branch Name" = branch_filter);

    -- Calculate total expenses from expense_details_view
    SELECT COALESCE(SUM(amount), 0)
    INTO total_expenses
    FROM expense_details_view
    WHERE (start_date IS NULL OR date >= start_date)
        AND (end_date IS NULL OR date <= end_date)
        AND (branch_filter IS NULL OR branch_name = branch_filter);

    -- Calculate net profit and margins
    net_profit := gross_profit - total_expenses;

    gross_profit_margin := CASE
        WHEN total_taxable_sales > 0 THEN (gross_profit / total_taxable_sales) * 100
        ELSE 0
    END;

    net_profit_margin := CASE
        WHEN total_taxable_sales > 0 THEN (net_profit / total_taxable_sales) * 100
        ELSE 0
    END;

    -- Build result JSON
    SELECT json_build_object(
        'totalTaxableSales', total_taxable_sales,
        'totalRevenue', total_revenue,
        'totalCost', total_cost,
        'grossProfit', gross_profit,
        'totalExpenses', total_expenses,
        'netProfit', net_profit,
        'grossProfitMargin', gross_profit_margin,
        'netProfitMargin', net_profit_margin,
        'totalInvoices', COUNT(*),
        'uniqueInvoices', COUNT(DISTINCT "Inv No"),
        'totalQuantity', COALESCE(SUM("Qty"), 0),
        'averageOrderValue', CASE
            WHEN COUNT(DISTINCT "Inv No") > 0
            THEN total_revenue / COUNT(DISTINCT "Inv No")
            ELSE 0
        END,
        'dateRange', json_build_object(
            'from', start_date,
            'to', end_date,
            'actualFrom', MIN("Inv Date"),
            'actualTo', MAX("Inv Date")
        )
    ) INTO result
    FROM profit_analysis_view_current
    WHERE (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filter IS NULL OR "Branch Name" = branch_filter);

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: get_branch_summary
CREATE OR REPLACE FUNCTION get_branch_summary(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'branchName', "Branch Name",
            'taxableSales', COALESCE(SUM("Sale Price"), 0),
            'revenue', COALESCE(SUM("SaleWithVAT"), 0),
            'cost', COALESCE(SUM("Cost"), 0),
            'profit', COALESCE(SUM("Profit"), 0),
            'invoices', COUNT(*),
            'uniqueInvoices', COUNT(DISTINCT "Inv No"),
            'profitMargin', CASE
                WHEN SUM("SaleWithVAT") > 0
                THEN (SUM("Profit") / SUM("SaleWithVAT")) * 100
                ELSE 0
            END,
            'averageOrderValue', CASE
                WHEN COUNT(DISTINCT "Inv No") > 0
                THEN COALESCE(SUM("SaleWithVAT"), 0) / COUNT(DISTINCT "Inv No")
                ELSE 0
            END
        )
    ) INTO result
    FROM profit_analysis_view_current
    WHERE (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
    GROUP BY "Branch Name"
    ORDER BY SUM("Sale Price") DESC;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES - Run these to test the setup
-- ============================================================================

-- Test 1: Check if main view exists and has data
-- SELECT COUNT(*) FROM profit_analysis_view_current;

-- Test 2: Check aggregated totals
-- SELECT * FROM profit_totals_view;

-- Test 3: Check branch summary
-- SELECT * FROM profit_by_branch_view LIMIT 5;

-- Test 4: Check customer aging
-- SELECT COUNT(*) FROM customer_balance_aging;

-- Test 5: Check vendor bills
-- SELECT COUNT(*) FROM vendor_bills_filtered;

-- Test 6: Test KPIs function
-- SELECT get_dashboard_kpis();

-- Test 7: Test branch summary function
-- SELECT get_branch_summary();

-- ============================================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ============================================================================
/*
-- Drop views in reverse order (dependencies first)
DROP VIEW IF EXISTS profit_by_branch_view CASCADE;
DROP VIEW IF EXISTS profit_totals_view CASCADE;
DROP VIEW IF EXISTS top_overdue_customers CASCADE;
DROP VIEW IF EXISTS customer_balance_aging_filtered CASCADE;
DROP VIEW IF EXISTS vendor_bills_filtered CASCADE;
DROP VIEW IF EXISTS customer_balance_aging CASCADE;
DROP VIEW IF EXISTS profit_analysis_view_current CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_dashboard_kpis(DATE, DATE);
DROP FUNCTION IF EXISTS get_branch_summary(DATE, DATE);

-- Drop created tables
DROP TABLE IF EXISTS sales_persons CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
*/

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================