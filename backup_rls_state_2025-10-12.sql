-- =====================================================
-- RLS OPTIMIZATION BACKUP - 2025-10-12
-- =====================================================
-- This file contains the original state of RLS functions
-- and policies before optimization changes.
-- To restore, run this file against the database.
-- =====================================================

-- =====================================================
-- BACKUP: Original Function Definitions (WITHOUT STABLE/SECURITY DEFINER)
-- =====================================================

-- Function: is_admin_user()
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_branch_permissions
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- Function: is_branch_allowed(TEXT)
CREATE OR REPLACE FUNCTION is_branch_allowed(p_branch_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Admin can see all branches
  IF is_admin_user() THEN
    RETURN TRUE;
  END IF;

  -- Check if branch is in user's allowed list
  RETURN p_branch_name = ANY(get_user_branches());
END;
$$;

-- Function: get_user_branches()
CREATE OR REPLACE FUNCTION get_user_branches()
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  v_branches TEXT[];
BEGIN
  -- Return all branches if admin
  IF is_admin_user() THEN
    RETURN ARRAY(SELECT location_name FROM branch WHERE location_name IS NOT NULL);
  END IF;

  -- Return user's allowed branches
  SELECT allowed_branches INTO v_branches
  FROM user_branch_permissions
  WHERE user_id = auth.uid();

  RETURN COALESCE(v_branches, ARRAY[]::TEXT[]);
END;
$$;

-- =====================================================
-- BACKUP: Original stock_out_flow_table RLS Policy
-- =====================================================

DROP POLICY IF EXISTS "branch_access_stock_out_flow" ON stock_out_flow_table;

CREATE POLICY "branch_access_stock_out_flow" ON stock_out_flow_table
FOR SELECT
TO public
USING (
  is_admin_user()
  OR EXISTS (
    SELECT 1 FROM branch b
    WHERE b.location_id = stock_out_flow_table.location_id
    AND is_branch_allowed(b.location_name)
  )
);

-- =====================================================
-- RESTORE INSTRUCTIONS
-- =====================================================
-- To restore original state:
-- 1. Run this file: psql -f backup_rls_state_2025-10-12.sql
-- 2. Or use Supabase SQL Editor to paste and execute
-- =====================================================
