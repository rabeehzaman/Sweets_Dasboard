-- ============================================================================
-- MULTI-LOCATION FILTER OPTIMIZATION
-- ============================================================================
-- This migration updates all RPC functions to accept TEXT[] arrays for
-- branch filtering, enabling efficient database-level filtering for multiple
-- locations instead of inefficient client-side filtering.
--
-- Date: 2025-10-13
-- Issue: Multi-location filter causes delays/timeouts due to:
--   1. Multiple separate DB calls (N calls for N locations)
--   2. Fetching all data then filtering client-side
--   3. Inefficient hybrid approach
--
-- Solution: Pure database filtering using WHERE branch IN (...) with arrays
-- ============================================================================

-- ============================================================================
-- FUNCTION 1: get_dashboard_kpis_2025 (KPIs with multi-branch support)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_kpis_2025(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL  -- Changed from TEXT to TEXT[]
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
    total_stock_value NUMERIC;
    net_vat_payable NUMERIC;
BEGIN
    -- Calculate sales and cost from profit_analysis_view_current (2025 data only)
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
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters));  -- Changed to ANY()

    -- Calculate total expenses from expense_details_view (2025 data only)
    SELECT COALESCE(SUM(amount), 0)
    INTO total_expenses
    FROM expense_details_view
    WHERE EXTRACT(YEAR FROM date::DATE) = 2025
        AND (start_date IS NULL OR date >= start_date)
        AND (end_date IS NULL OR date <= end_date)
        AND (branch_filters IS NULL OR branch_name = ANY(branch_filters));  -- Changed to ANY()

    -- Calculate total stock value from stock_in_flow_table
    SELECT COALESCE(SUM(CAST(REGEXP_REPLACE(COALESCE(s.total_bcy, '0'), '[^0-9.-]', '', 'g') AS NUMERIC)), 0)
    INTO total_stock_value
    FROM stock_in_flow_table s
    LEFT JOIN branch b ON s.location_id = b.location_id
    WHERE (branch_filters IS NULL OR b.location_name = ANY(branch_filters));  -- Changed to ANY()

    -- Calculate VAT payable (output VAT - input VAT)
    WITH vat_output AS (
        SELECT COALESCE(SUM("SaleWithVAT" - "Sale Price"), 0) as output_vat
        FROM profit_analysis_view_current
        WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
            AND (start_date IS NULL OR "Inv Date" >= start_date)
            AND (end_date IS NULL OR "Inv Date" <= end_date)
            AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))
    ),
    vat_input AS (
        SELECT COALESCE(SUM(CAST(REGEXP_REPLACE(COALESCE(vat_amount, '0'), '[^0-9.-]', '', 'g') AS NUMERIC)), 0) as input_vat
        FROM bills b
        LEFT JOIN branch br ON b.location_id = br.location_id
        WHERE EXTRACT(YEAR FROM bill_date::DATE) = 2025
            AND (start_date IS NULL OR bill_date >= start_date)
            AND (end_date IS NULL OR bill_date <= end_date)
            AND (branch_filters IS NULL OR br.location_name = ANY(branch_filters))
    )
    SELECT (output_vat - input_vat) INTO net_vat_payable
    FROM vat_output, vat_input;

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

    -- Build result JSON with aggregated data
    SELECT json_build_object(
        'totalTaxableSales', total_taxable_sales,
        'totalRevenue', total_revenue,
        'totalCost', total_cost,
        'grossProfit', gross_profit,
        'totalExpenses', total_expenses,
        'netProfit', net_profit,
        'grossProfitMargin', gross_profit_margin,
        'netProfitMargin', net_profit_margin,
        'totalStockValue', total_stock_value,
        'netVatPayable', net_vat_payable,
        'totalInvoices', COUNT(*),
        'uniqueInvoices', COUNT(DISTINCT "Inv No"),
        'totalQuantity', COALESCE(SUM("Qty"), 0),
        'averageOrderValue', CASE
            WHEN COUNT(DISTINCT "Inv No") > 0
            THEN total_revenue / COUNT(DISTINCT "Inv No")
            ELSE 0
        END,
        'dailyAvgSales', CASE
            WHEN start_date IS NOT NULL THEN
                CASE
                    WHEN (LEAST(COALESCE(end_date, CURRENT_DATE), CURRENT_DATE) - start_date + 1) > 0
                    THEN total_revenue / (LEAST(COALESCE(end_date, CURRENT_DATE), CURRENT_DATE) - start_date + 1)
                    ELSE 0
                END
            ELSE
                CASE
                    WHEN EXTRACT(DAY FROM CURRENT_DATE) > 0
                    THEN total_revenue / EXTRACT(DAY FROM CURRENT_DATE)
                    ELSE 0
                END
        END,
        'dateRange', json_build_object(
            'from', start_date,
            'to', end_date
        )
    ) INTO result
    FROM profit_analysis_view_current
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters));

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 2: get_profit_by_item_2025_filtered (with multi-branch support)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_profit_by_item_2025_filtered(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL,  -- Changed from TEXT to TEXT[]
    item_filter TEXT DEFAULT NULL,
    customer_filter TEXT DEFAULT NULL,
    invoice_filter TEXT DEFAULT NULL,
    page_limit INT DEFAULT 10000,
    page_offset INT DEFAULT 0
)
RETURNS TABLE (
    inv_no TEXT,
    inv_date TEXT,
    item TEXT,
    qty NUMERIC,
    sale_price NUMERIC,
    sale_with_vat NUMERIC,
    cost NUMERIC,
    profit NUMERIC,
    profit_percent NUMERIC,
    customer_name TEXT,
    branch_name TEXT,
    unit_price NUMERIC,
    unit_cost NUMERIC,
    unit_profit NUMERIC,
    sales_person_name TEXT,
    invoice_status TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_data AS (
        SELECT
            "Inv No",
            "Inv Date"::TEXT,
            "Item",
            "Qty",
            "Sale Price",
            "SaleWithVAT",
            "Cost",
            "Profit",
            "Profit %",
            "Customer Name",
            "Branch Name",
            "Unit Price",
            "Unit Cost",
            "Unit Profit",
            "Sales Person Name",
            "Invoice Status",
            COUNT(*) OVER() as total_count
        FROM profit_analysis_view_current
        WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
            AND (start_date IS NULL OR "Inv Date" >= start_date)
            AND (end_date IS NULL OR "Inv Date" <= end_date)
            AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))  -- Changed to ANY()
            AND (item_filter IS NULL OR "Item" ILIKE '%' || item_filter || '%')
            AND (customer_filter IS NULL OR "Customer Name" ILIKE '%' || customer_filter || '%')
            AND (invoice_filter IS NULL OR "Inv No" ILIKE '%' || invoice_filter || '%')
        ORDER BY "Inv Date" DESC, "Inv No" DESC
        LIMIT page_limit OFFSET page_offset
    )
    SELECT
        "Inv No",
        "Inv Date",
        "Item",
        "Qty",
        "Sale Price",
        "SaleWithVAT",
        "Cost",
        "Profit",
        "Profit %",
        "Customer Name",
        "Branch Name",
        "Unit Price",
        "Unit Cost",
        "Unit Profit",
        "Sales Person Name",
        "Invoice Status",
        total_count
    FROM filtered_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 3: get_profit_by_customer_2025 (with multi-branch support)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_profit_by_customer_2025(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL,  -- Changed from TEXT to TEXT[]
    customer_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    customer_name TEXT,
    branch_name TEXT,
    total_invoices BIGINT,
    total_quantity NUMERIC,
    total_sale_price NUMERIC,
    total_sale_with_vat NUMERIC,
    total_cost NUMERIC,
    total_profit NUMERIC,
    profit_margin_percent NUMERIC,
    first_transaction_date TEXT,
    last_transaction_date TEXT,
    total_line_items BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        "Customer Name",
        "Branch Name",
        COUNT(DISTINCT "Inv No") as total_invoices,
        SUM("Qty") as total_quantity,
        SUM("Sale Price") as total_sale_price,
        SUM("SaleWithVAT") as total_sale_with_vat,
        SUM("Cost") as total_cost,
        SUM("Profit") as total_profit,
        CASE
            WHEN SUM("Sale Price") > 0 THEN (SUM("Profit") / SUM("Sale Price")) * 100
            ELSE 0
        END as profit_margin_percent,
        MIN("Inv Date")::TEXT as first_transaction_date,
        MAX("Inv Date")::TEXT as last_transaction_date,
        COUNT(*) as total_line_items
    FROM profit_analysis_view_current
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))  -- Changed to ANY()
        AND (customer_filter IS NULL OR "Customer Name" ILIKE '%' || customer_filter || '%')
    GROUP BY "Customer Name", "Branch Name"
    ORDER BY total_profit DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 4: get_profit_by_invoice_2025_filtered (with multi-branch support)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_profit_by_invoice_2025_filtered(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL,  -- Changed from TEXT to TEXT[]
    customer_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    invoice_number TEXT,
    invoice_date TEXT,
    customer_name TEXT,
    branch_name TEXT,
    sale_value NUMERIC,
    profit NUMERIC,
    margin NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        "Inv No" as invoice_number,
        "Inv Date"::TEXT as invoice_date,
        "Customer Name" as customer_name,
        "Branch Name" as branch_name,
        SUM("SaleWithVAT") as sale_value,
        SUM("Profit") as profit,
        CASE
            WHEN SUM("Sale Price") > 0 THEN (SUM("Profit") / SUM("Sale Price")) * 100
            ELSE 0
        END as margin
    FROM profit_analysis_view_current
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))  -- Changed to ANY()
        AND (customer_filter IS NULL OR "Customer Name" ILIKE '%' || customer_filter || '%')
    GROUP BY "Inv No", "Inv Date", "Customer Name", "Branch Name"
    ORDER BY "Inv Date" DESC, "Inv No" DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 5: Filter options functions (with multi-branch support)
-- ============================================================================

-- Item filter options
CREATE OR REPLACE FUNCTION get_item_filter_options_2025(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL  -- Changed from TEXT to TEXT[]
)
RETURNS TABLE (item_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT "Item" as item_name
    FROM profit_analysis_view_current
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))
        AND "Item" IS NOT NULL
    ORDER BY item_name;
END;
$$ LANGUAGE plpgsql;

-- Customer filter options
CREATE OR REPLACE FUNCTION get_customer_filter_options_2025(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL  -- Changed from TEXT to TEXT[]
)
RETURNS TABLE (customer_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT "Customer Name" as customer_name
    FROM profit_analysis_view_current
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))
        AND "Customer Name" IS NOT NULL
    ORDER BY customer_name;
END;
$$ LANGUAGE plpgsql;

-- Invoice filter options
CREATE OR REPLACE FUNCTION get_invoice_filter_options_2025(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    branch_filters TEXT[] DEFAULT NULL  -- Changed from TEXT to TEXT[]
)
RETURNS TABLE (invoice_no TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT "Inv No" as invoice_no
    FROM profit_analysis_view_current
    WHERE EXTRACT(YEAR FROM "Inv Date"::DATE) = 2025
        AND (start_date IS NULL OR "Inv Date" >= start_date)
        AND (end_date IS NULL OR "Inv Date" <= end_date)
        AND (branch_filters IS NULL OR "Branch Name" = ANY(branch_filters))
        AND "Inv No" IS NOT NULL
    ORDER BY invoice_no DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION get_dashboard_kpis_2025 IS 'Get dashboard KPIs for 2025 with multi-branch support using TEXT[] array';
COMMENT ON FUNCTION get_profit_by_item_2025_filtered IS 'Get profit by item with multi-branch support using TEXT[] array';
COMMENT ON FUNCTION get_profit_by_customer_2025 IS 'Get profit by customer with multi-branch support using TEXT[] array';
COMMENT ON FUNCTION get_profit_by_invoice_2025_filtered IS 'Get profit by invoice with multi-branch support using TEXT[] array';
COMMENT ON FUNCTION get_item_filter_options_2025 IS 'Get item filter options with multi-branch support';
COMMENT ON FUNCTION get_customer_filter_options_2025 IS 'Get customer filter options with multi-branch support';
COMMENT ON FUNCTION get_invoice_filter_options_2025 IS 'Get invoice filter options with multi-branch support';
