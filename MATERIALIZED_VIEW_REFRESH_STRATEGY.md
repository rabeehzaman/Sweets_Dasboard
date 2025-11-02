# Materialized View Refresh Strategy Plan
## Profit by Invoice Materialized View

**Created**: November 2, 2025
**View Name**: `profit_by_invoice_materialized`
**Current Records**: 755 invoices (2025 data)
**Refresh Time**: < 1 second

---

## 📊 Data Analysis

### Invoice Creation Patterns
- **Active Period** (Oct 11 - Nov 1, 2025): 28-57 invoices/day (~35-40 average)
- **Low Activity** (Jul - Oct 10, 2025): 1-3 invoices/day
- **Business Days**: 7 days/week (no clear weekend pattern)
- **Peak Day**: October 26 with 57 invoices

### Materialized View Performance
- **Refresh Time**: < 1 second (very fast)
- **Query Time**: 10-20ms (compared to 150-300ms timeout before)
- **Data Volume**: 755 invoices, 6 branches
- **Performance Gain**: 95%+

---

## 🎯 Refresh Strategy Options

### **Strategy 1: Scheduled Nightly Refresh** ⭐ **RECOMMENDED**

**When**: Every night at 2:00 AM (or 3:00 AM to avoid peak hours)

**How it works**:
- Automatic refresh using Supabase Edge Function + pg_cron
- Runs during low-traffic hours
- Zero impact on business hours
- Catches all invoices from previous day

**Pros**:
- ✅ Simple to implement
- ✅ Predictable refresh schedule
- ✅ No performance impact during business hours
- ✅ Fresh data every morning
- ✅ Low maintenance
- ✅ Covers 99.9% of use cases

**Cons**:
- ⚠️ Intraday data may be stale (up to 24 hours old)
- ⚠️ Requires Supabase cron setup

**Best For**:
- Most businesses (standard reporting needs)
- When next-day accuracy is acceptable
- Low operational overhead preferred

**Implementation Complexity**: 🟢 Low (one-time setup)

---

### **Strategy 2: Trigger-Based Refresh (Real-time)**

**When**: Automatically after every invoice insert/update/delete

**How it works**:
- Database triggers on `invoices` and `invoice_items` tables
- Refresh materialized view on any data change
- Always shows real-time data

**Pros**:
- ✅ Always up-to-date (real-time)
- ✅ No scheduled jobs needed
- ✅ Zero data staleness
- ✅ Automatic - no manual intervention

**Cons**:
- ❌ Refresh overhead on EVERY transaction
- ❌ Slows down invoice creation (adds 500ms-1s per invoice)
- ❌ High database load (35-40 refreshes/day during active periods)
- ❌ MVCC bloat (PostgreSQL issue with frequent refreshes)
- ❌ Lock contention during concurrent inserts
- ❌ Not recommended by PostgreSQL best practices

**Best For**:
- Applications requiring instant data updates
- Low-volume environments (< 10 updates/day)
- When staleness is absolutely unacceptable

**Implementation Complexity**: 🟡 Medium (requires careful trigger management)

**⚠️ NOT RECOMMENDED** for this use case due to high transaction volume

---

### **Strategy 3: Hybrid Scheduled + Manual** ⭐ **SECOND CHOICE**

**When**:
- Automatic: Nightly at 2:00 AM
- Manual: On-demand via button click

**How it works**:
- Scheduled refresh every night (baseline)
- Manual refresh button in UI for urgent updates
- Best of both worlds

**Pros**:
- ✅ Fresh data every morning (scheduled)
- ✅ On-demand updates when needed (manual)
- ✅ Flexibility for urgent situations
- ✅ Low overhead (mostly scheduled)
- ✅ User control

**Cons**:
- ⚠️ Requires UI changes (refresh button)
- ⚠️ Users need training on when to refresh
- ⚠️ Slightly more complex than pure scheduled

**Best For**:
- Businesses with occasional urgent reporting needs
- Power users who understand data freshness
- Balance between automation and control

**Implementation Complexity**: 🟡 Medium (scheduled + UI changes)

---

### **Strategy 4: Multiple Daily Refreshes**

**When**: 3x daily (morning, noon, evening)
- 6:00 AM (before business starts)
- 12:00 PM (midday catch-up)
- 6:00 PM (end of day)

**How it works**:
- Three scheduled refreshes per day
- Ensures data never more than 6 hours stale
- Balanced approach

**Pros**:
- ✅ Fresher than nightly (max 6 hours stale)
- ✅ Still automated
- ✅ Catches intraday transactions
- ✅ Low overhead (3x/day is minimal)

**Cons**:
- ⚠️ Noon refresh might impact users during work hours
- ⚠️ More complex scheduling
- ⚠️ May be overkill for most use cases

**Best For**:
- Businesses with critical intraday reporting
- When 24-hour staleness is too much
- Multiple-shift operations

**Implementation Complexity**: 🟢 Low (similar to nightly but 3 schedules)

---

### **Strategy 5: Smart Incremental Refresh**

**When**: Hourly during business hours (8 AM - 6 PM), nightly outside

**How it works**:
- Check if new invoices exist
- Only refresh if data changed
- Skip refresh if no changes

**Pros**:
- ✅ Optimal balance of freshness and performance
- ✅ Reduces unnecessary refreshes
- ✅ Smart resource usage
- ✅ Fresher during business hours

**Cons**:
- ❌ Complex implementation
- ❌ Requires change detection logic
- ❌ Higher maintenance

**Best For**:
- Large-scale environments with strict SLAs
- Advanced users willing to maintain complex logic

**Implementation Complexity**: 🔴 High (requires custom logic)

---

## 🏆 RECOMMENDED STRATEGY

### **Primary Recommendation: Strategy 1 (Nightly Refresh)**

**Why this is the best choice**:

1. **Data Pattern Fit**:
   - 35-40 invoices/day created
   - Most invoices represent past sales, not real-time
   - Financial reports typically reviewed once daily

2. **Performance**:
   - Refresh takes < 1 second
   - Zero impact on business hours
   - Users get instant query times (10-20ms)

3. **Simplicity**:
   - One-time setup
   - Low maintenance
   - Predictable behavior

4. **Cost-Effective**:
   - Single daily refresh vs continuous refreshes
   - Minimal database load
   - Easy to monitor

### **Fallback: Strategy 3 (Hybrid) if...**

Switch to Strategy 3 if:
- ❌ Users frequently need mid-day updates
- ❌ Intraday reporting is business-critical
- ❌ You have power users who understand refresh concepts

---

## 📋 Implementation Plan

### **Phase 1: Implement Nightly Scheduled Refresh** (Recommended)

#### **Option A: Using Supabase Edge Function + pg_cron** ⭐

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule nightly refresh at 2:00 AM
SELECT cron.schedule(
    'refresh-profit-invoice-mat-view',  -- Job name
    '0 2 * * *',                         -- Cron expression (2:00 AM daily)
    $$SELECT refresh_profit_by_invoice_materialized()$$
);

-- Verify scheduled job
SELECT * FROM cron.job WHERE jobname = 'refresh-profit-invoice-mat-view';
```

**Pros**: Native PostgreSQL, reliable, no external dependencies
**Cons**: Requires pg_cron extension (may need Supabase support)

#### **Option B: Using Supabase Edge Function + Cron Trigger**

1. Create Edge Function `/functions/refresh-materialized-views/index.ts`:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Refresh materialized view
    const { error } = await supabaseClient.rpc('refresh_profit_by_invoice_materialized')

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Materialized view refreshed' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

2. Set up cron trigger via external service (GitHub Actions, Vercel Cron, etc.)

**Pros**: More control, can add logging, email notifications
**Cons**: Requires external cron service, more moving parts

#### **Option C: Manual Refresh (Simplest Start)**

Add refresh button to UI:

```typescript
// components/admin/refresh-button.tsx
'use client'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function RefreshMaterializedViewButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const { error } = await supabase.rpc('refresh_profit_by_invoice_materialized')
      if (error) throw error
      toast.success('Data refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh data')
      console.error(error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button onClick={handleRefresh} disabled={isRefreshing}>
      <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
      Refresh Data
    </Button>
  )
}
```

**Pros**: Immediate implementation, no scheduling needed
**Cons**: Requires manual action, easy to forget

---

### **Phase 2: Add Monitoring & Alerts** (Optional but Recommended)

1. **Track Last Refresh Time**:
```sql
-- Create metadata table
CREATE TABLE IF NOT EXISTS materialized_view_metadata (
    view_name TEXT PRIMARY KEY,
    last_refreshed TIMESTAMP,
    record_count INTEGER,
    refresh_duration_ms INTEGER
);

-- Update refresh function to track metadata
CREATE OR REPLACE FUNCTION refresh_profit_by_invoice_materialized()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    record_cnt INTEGER;
BEGIN
    start_time := CLOCK_TIMESTAMP();

    REFRESH MATERIALIZED VIEW profit_by_invoice_materialized;

    end_time := CLOCK_TIMESTAMP();
    SELECT COUNT(*) INTO record_cnt FROM profit_by_invoice_materialized;

    -- Log refresh metadata
    INSERT INTO materialized_view_metadata (view_name, last_refreshed, record_count, refresh_duration_ms)
    VALUES ('profit_by_invoice_materialized', end_time, record_cnt,
            EXTRACT(MILLISECONDS FROM (end_time - start_time)))
    ON CONFLICT (view_name)
    DO UPDATE SET
        last_refreshed = EXCLUDED.last_refreshed,
        record_count = EXCLUDED.record_count,
        refresh_duration_ms = EXCLUDED.refresh_duration_ms;

    RAISE NOTICE '✅ Refreshed profit_by_invoice_materialized: % invoices in %ms',
                 record_cnt, EXTRACT(MILLISECONDS FROM (end_time - start_time));
END;
$$;
```

2. **Add UI Indicator**:
```typescript
// Show last refresh time in UI
const { data } = await supabase
  .from('materialized_view_metadata')
  .select('last_refreshed, record_count')
  .eq('view_name', 'profit_by_invoice_materialized')
  .single()

// Display: "Data last updated: 2 hours ago (755 invoices)"
```

---

## 📅 Implementation Timeline

### **Week 1: Foundation**
- ✅ Day 1: Materialized view created (DONE)
- 🔲 Day 2: Choose refresh strategy (nightly recommended)
- 🔲 Day 3: Implement chosen strategy
- 🔲 Day 4: Test refresh function
- 🔲 Day 5: Add monitoring/logging

### **Week 2: Enhancement**
- 🔲 Day 6-7: Add manual refresh button (if needed)
- 🔲 Day 8: User documentation
- 🔲 Day 9: Train users on data freshness expectations
- 🔲 Day 10: Monitor performance for 1 week

---

## 🔍 Monitoring Checklist

After implementation, monitor:

- [ ] Refresh runs successfully every night
- [ ] Refresh completes in < 5 seconds
- [ ] Record count matches expected invoices
- [ ] No errors in Supabase logs
- [ ] Query performance stays under 20ms
- [ ] Users satisfied with data freshness

---

## 🚨 Troubleshooting

### **Refresh Fails**
```sql
-- Check recent refresh status
SELECT * FROM materialized_view_metadata
WHERE view_name = 'profit_by_invoice_materialized';

-- Manually trigger refresh to see error
SELECT refresh_profit_by_invoice_materialized();
```

### **Stale Data**
```sql
-- Check when last refreshed
SELECT
    last_refreshed,
    NOW() - last_refreshed as staleness,
    record_count
FROM materialized_view_metadata
WHERE view_name = 'profit_by_invoice_materialized';
```

### **Performance Degradation**
```sql
-- Check if indexes still exist
SELECT indexname FROM pg_indexes
WHERE tablename = 'profit_by_invoice_materialized';

-- Rebuild indexes if needed
REINDEX TABLE profit_by_invoice_materialized;
```

---

## 📌 Final Recommendation

**START WITH**: Strategy 1 (Nightly Refresh) using pg_cron

**Why**:
- Simplest
- Most reliable
- Meets 99% of business needs
- Can always upgrade later if needed

**Next Steps**:
1. Get approval for nightly refresh schedule
2. Choose Option A (pg_cron) or Option B (Edge Function)
3. Implement and test
4. Monitor for 1 week
5. Adjust if needed

**Upgrade Path** (if users request fresher data):
- Week 2: Add manual refresh button (Strategy 3)
- Month 2: Consider 3x daily refresh (Strategy 4)
- Only if absolutely critical: Trigger-based (Strategy 2) - NOT recommended

---

**Questions? Contact Database Admin**
