"use client"

import { useState, useEffect, useRef } from 'react'
import {
  getOptimizedKPIs,
  getOptimizedProfitByItem,
  getOptimizedProfitByCustomer,
  getOptimizedProfitByInvoice,
  getOptimizedStockReport,
  getProfitByItemTotals,
  getProfitByInvoiceTotals,
  getItemFilterOptions,
  getCustomerFilterOptions,
  getInvoiceFilterOptions,
  getWarehouseFilterOptions,
  getInvoiceItems,
  formatDateForRPC,
  type OptimizedKPIs,
  type OptimizedTransaction,
  type OptimizedCustomer,
  type OptimizedInvoice,
  type OptimizedStock,
  type PaginationInfo,
  type ProfitByItemTotals,
  type ProfitByInvoiceTotals,
  type FilterOption,
  type InvoiceItem
} from '@/lib/database-optimized'
import type { DateRange } from '@/components/dashboard/date-filter'

// =============================================================================
// OPTIMIZED KPI HOOK
// =============================================================================

export function useOptimizedKPIs(dateRange?: DateRange, locationIds?: string[]) {
  const [kpis, setKpis] = useState<OptimizedKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create stable dependency key for locationIds array (sort a copy to avoid mutation)
  const locationKey = locationIds ? [...locationIds].sort().join(',') : ''

  useEffect(() => {
    async function loadKPIs() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        // Handle multiple locations by fetching each and aggregating
        if (locationIds && locationIds.length >= 2) {
          console.log('🚀 Loading KPIs for multiple locations:', { startDate, endDate, locations: locationIds })

          // Fetch KPIs for each location
          const kpisPromises = locationIds.map(locationId =>
            getOptimizedKPIs(startDate, endDate, locationId)
          )
          const allKpis = await Promise.all(kpisPromises)

          console.log('🔍 DEBUG allKpis array before aggregation:', allKpis)

          // Aggregate KPIs from all locations
          // NOTE: RPC returns snake_case properties, need to access them correctly
          const aggregated = allKpis.reduce((acc, curr, index) => {
            console.log(`🔍 DEBUG reduce iteration ${index}:`, { acc, curr })
            if (!curr) return acc
            if (!acc) return curr

            return {
              totalTaxableSales: (acc.total_taxable_sales || acc.totalTaxableSales || 0) + (curr.total_taxable_sales || 0),
              totalRevenue: (acc.total_revenue || acc.totalRevenue || 0) + (curr.total_revenue || 0),
              totalCost: (acc.total_cost || acc.totalCost || 0) + (curr.total_cost || 0),
              grossProfit: (acc.gross_profit || acc.grossProfit || 0) + (curr.gross_profit || 0),
              totalExpenses: (acc.total_expenses || acc.totalExpenses || 0) + (curr.total_expenses || 0),
              netProfit: (acc.net_profit || acc.netProfit || 0) + (curr.net_profit || 0),
              grossProfitMargin: 0, // Will recalculate below
              netProfitMargin: 0, // Will recalculate below
              totalStockValue: (acc.total_stock_value || acc.totalStockValue || 0) + (curr.total_stock_value || 0),
              netVatPayable: (acc.net_vat_payable || acc.netVatPayable || 0) + (curr.net_vat_payable || 0),
              totalInvoices: (acc.total_invoices || acc.totalInvoices || 0) + (curr.total_invoices || 0),
              uniqueInvoices: (acc.total_invoices || acc.uniqueInvoices || 0) + (curr.total_invoices || 0),
              totalQuantity: (acc.total_quantity || acc.totalQuantity || 0) + (curr.total_quantity || 0),
              averageOrderValue: 0, // Will recalculate below
              dailyAvgSales: 0, // Will recalculate below
              dateRange: acc.dateRange || curr.dateRange
            }
          }, null as OptimizedKPIs | null)

          if (aggregated && aggregated.totalRevenue) {
            // Recalculate percentage-based metrics
            aggregated.grossProfitMargin = (aggregated.grossProfit / aggregated.totalRevenue) * 100
            aggregated.netProfitMargin = (aggregated.netProfit / aggregated.totalRevenue) * 100
            aggregated.averageOrderValue = aggregated.uniqueInvoices > 0
              ? aggregated.totalRevenue / aggregated.uniqueInvoices
              : 0

            // Calculate date range for daily average
            const from = dateRange?.from || new Date()
            const to = dateRange?.to || new Date()
            const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)))
            aggregated.dailyAvgSales = aggregated.totalRevenue / days
          }

          console.log('🔍 DEBUG aggregated KPIs object:', aggregated)
          setKpis(aggregated)
          console.log('✅ Aggregated KPIs loaded for multiple locations:', { locations: locationIds.length })
        } else {
          // Single location or all locations
          const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
          console.log('🚀 Loading optimized KPIs:', { startDate, endDate, branchFilter })

          const result = await getOptimizedKPIs(startDate, endDate, branchFilter)

          if (result) {
            // Convert snake_case to camelCase to match KPI card expectations
            const camelCaseKpis: OptimizedKPIs = {
              totalTaxableSales: result.total_taxable_sales || 0,
              totalRevenue: result.total_revenue || 0,
              totalCost: result.total_cost || 0,
              grossProfit: result.gross_profit || 0,
              totalExpenses: result.total_expenses || 0,
              netProfit: result.net_profit || 0,
              grossProfitMargin: result.gross_profit_margin || 0,
              netProfitMargin: result.net_profit_margin || 0,
              totalStockValue: result.total_stock_value || 0,
              netVatPayable: result.net_vat_payable || 0,
              totalInvoices: result.total_invoices || 0,
              uniqueInvoices: result.total_invoices || 0, // Use total_invoices for uniqueInvoices
              totalQuantity: result.total_quantity || 0,
              averageOrderValue: result.average_order_value || 0,
              dailyAvgSales: result.daily_avg_sales || 0,
              dateRange: result.dateRange
            }
            setKpis(camelCaseKpis)
            console.log('✅ KPIs loaded successfully')
          } else {
            setError('Failed to load KPIs')
            console.error('❌ KPIs loading failed')
          }
        }
      } catch (err) {
        console.error('❌ Error loading KPIs:', err)
        setError('Failed to load KPIs')
        setKpis(null)
      } finally {
        setLoading(false)
      }
    }

    loadKPIs()
  }, [dateRange?.from?.getTime(), dateRange?.to?.getTime(), locationKey])

  return { kpis, loading, error }
}

// =============================================================================
// OPTIMIZED PROFIT BY ITEM HOOK
// =============================================================================

export function useOptimizedProfitByItem(
  dateRange?: DateRange,
  locationIds?: string[],
  pageSize: number = 10000,
  itemFilter?: string,
  customerFilter?: string,
  invoiceFilter?: string
) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [data, setData] = useState<OptimizedTransaction[]>([])
  const [allData, setAllData] = useState<OptimizedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showingAll, setShowingAll] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    pageSize: pageSize,
    currentOffset: 0,
    hasMore: false,
    totalPages: 0
  })

  const loadPage = async (offset: number = 0) => {
    try {
      setLoading(true)
      setError(null)

      const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
      const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

      console.log('📊 Loading profit by item page:', { offset, pageSize, startDate, endDate, branchFilter, itemFilter, customerFilter, invoiceFilter, locationIds })

      const result = await getOptimizedProfitByItem(startDate, endDate, branchFilter, itemFilter, customerFilter, invoiceFilter, pageSize, offset)

      if (result) {
        // Client-side filtering when multiple locations are selected
        let filteredData = result.data
        if (locationIds && locationIds.length >= 2) {
          filteredData = result.data.filter(item =>
            item.branch_name && locationIds.includes(item.branch_name)
          )
          console.log('🔍 Filtered items by locations:', { original: result.data.length, filtered: filteredData.length, locations: locationIds })
        }

        setData(filteredData)
        setPagination({
          ...result.pagination,
          totalCount: filteredData.length
        })
        console.log('✅ Profit by item loaded:', { records: filteredData.length, total: filteredData.length })
      } else {
        setError('Failed to load profit by item data')
        setData([])
        setPagination({
          totalCount: 0,
          pageSize,
          currentOffset: offset,
          hasMore: false,
          totalPages: 0
        })
      }
    } catch (err) {
      console.error('❌ Error loading profit by item:', err)
      setError('Failed to load profit by item data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      setLoadingMore(true)
      setError(null)

      const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
      const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

      console.log('📊 Loading ALL profit by item data:', { startDate, endDate, branchFilter, itemFilter, customerFilter, invoiceFilter })

      // Load all data by requesting a very large page size
      const result = await getOptimizedProfitByItem(startDate, endDate, branchFilter, itemFilter, customerFilter, invoiceFilter, 10000, 0)

      if (result) {
        // Client-side filtering when multiple locations are selected
        let filteredData = result.data
        if (locationIds && locationIds.length >= 2) {
          filteredData = result.data.filter(item =>
            item.branch_name && locationIds.includes(item.branch_name)
          )
          console.log('🔍 Filtered all items by locations:', { original: result.data.length, filtered: filteredData.length })
        }

        setAllData(filteredData)
        setShowingAll(true)
        console.log('✅ All profit by item data loaded:', { records: filteredData.length })
      } else {
        setError('Failed to load all profit by item data')
      }
    } catch (err) {
      console.error('❌ Error loading all profit by item data:', err)
      setError('Failed to load all profit by item data')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    // Reset states when filters change
    setShowingAll(false)
    setAllData([])
    loadPage(0) // Load first page when dependencies change
  }, [dateRange, locationIds, pageSize, itemFilter, customerFilter, invoiceFilter])

  const nextPage = () => {
    if (pagination.hasMore) {
      const nextOffset = pagination.currentOffset + pageSize
      loadPage(nextOffset)
    }
  }

  const prevPage = () => {
    if (pagination.currentOffset > 0) {
      const prevOffset = Math.max(0, pagination.currentOffset - pageSize)
      loadPage(prevOffset)
    }
  }

  const goToPage = (page: number) => {
    const offset = page * pageSize
    if (offset >= 0 && offset < pagination.totalCount) {
      loadPage(offset)
    }
  }

  return {
    data: showingAll ? allData : data,
    loading,
    loadingMore,
    error,
    pagination,
    showingAll,
    hasMore: !showingAll && pagination.totalCount > pageSize,
    nextPage,
    prevPage,
    goToPage,
    loadAllData,
    refresh: () => loadPage(pagination.currentOffset)
  }
}

// =============================================================================
// OPTIMIZED PROFIT BY CUSTOMER HOOK
// =============================================================================

export function useOptimizedProfitByCustomer(dateRange?: DateRange, locationIds?: string[], customerFilter?: string) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [data, setData] = useState<OptimizedCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        console.log('👥 Loading profit by customer:', { startDate, endDate, branchFilter, customerFilter, locationIds })

        const result = await getOptimizedProfitByCustomer(startDate, endDate, branchFilter, customerFilter)

        if (result) {
          // Client-side filtering when multiple locations are selected
          let filteredData = result
          if (locationIds && locationIds.length >= 2) {
            filteredData = result.filter(customer =>
              customer.branch_name && locationIds.includes(customer.branch_name)
            )
            console.log('🔍 Filtered customers by locations:', { original: result.length, filtered: filteredData.length, locations: locationIds })
          }

          setData(filteredData)
          console.log('✅ Profit by customer loaded:', { customers: filteredData.length })
        } else {
          setError('Failed to load profit by customer data')
          setData([])
        }
      } catch (err) {
        console.error('❌ Error loading profit by customer:', err)
        setError('Failed to load profit by customer data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [dateRange, locationIds, customerFilter])

  return { data, loading, error }
}

// =============================================================================
// OPTIMIZED PROFIT BY INVOICE HOOK
// =============================================================================

export function useOptimizedProfitByInvoice(
  dateRange?: DateRange,
  locationIds?: string[],
  pageSize: number = 10000,
  customerFilter?: string,
  invoiceFilter?: string
) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [data, setData] = useState<OptimizedInvoice[]>([])
  const [allData, setAllData] = useState<OptimizedInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showingAll, setShowingAll] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    pageSize: pageSize,
    currentOffset: 0,
    hasMore: false,
    totalPages: 0
  })

  const loadPage = async (offset: number = 0) => {
    try {
      setLoading(true)
      setError(null)

      const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
      const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

      console.log('📋 Loading profit by invoice page:', { offset, pageSize, startDate, endDate, branchFilter, customerFilter, invoiceFilter })

      const result = await getOptimizedProfitByInvoice(startDate, endDate, branchFilter, customerFilter, invoiceFilter, pageSize, offset)

      if (result) {
        // Client-side filtering when multiple locations are selected
        let filteredData = result.data
        if (locationIds && locationIds.length >= 2) {
          filteredData = result.data.filter(invoice =>
            invoice.branch_name && locationIds.includes(invoice.branch_name)
          )
          console.log('🔍 Filtered invoices by locations:', { original: result.data.length, filtered: filteredData.length, locations: locationIds })
        }

        setData(filteredData)
        setPagination({
          ...result.pagination,
          totalCount: filteredData.length
        })
        console.log('✅ Profit by invoice loaded:', { records: filteredData.length, total: filteredData.length })
      } else {
        setError('Failed to load profit by invoice data')
        setData([])
        setPagination({
          totalCount: 0,
          pageSize,
          currentOffset: offset,
          hasMore: false,
          totalPages: 0
        })
      }
    } catch (err) {
      console.error('❌ Error loading profit by invoice:', err)
      setError('Failed to load profit by invoice data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      setLoadingMore(true)
      setError(null)

      const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
      const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

      console.log('📋 Loading ALL profit by invoice data:', { startDate, endDate, branchFilter, customerFilter, invoiceFilter })

      // Load all data by requesting a very large page size
      const result = await getOptimizedProfitByInvoice(startDate, endDate, branchFilter, customerFilter, invoiceFilter, 10000, 0)

      if (result) {
        // Client-side filtering when multiple locations are selected
        let filteredData = result.data
        if (locationIds && locationIds.length >= 2) {
          filteredData = result.data.filter(invoice =>
            invoice.branch_name && locationIds.includes(invoice.branch_name)
          )
          console.log('🔍 Filtered all invoices by locations:', { original: result.data.length, filtered: filteredData.length })
        }

        setAllData(filteredData)
        setShowingAll(true)
        console.log('✅ All profit by invoice data loaded:', { records: filteredData.length })
      } else {
        setError('Failed to load all profit by invoice data')
      }
    } catch (err) {
      console.error('❌ Error loading all profit by invoice data:', err)
      setError('Failed to load all profit by invoice data')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    // Reset states when filters change
    setShowingAll(false)
    setAllData([])
    loadPage(0) // Load first page when dependencies change
  }, [dateRange, locationIds, pageSize, customerFilter, invoiceFilter])

  const nextPage = () => {
    if (pagination.hasMore) {
      const nextOffset = pagination.currentOffset + pageSize
      loadPage(nextOffset)
    }
  }

  const prevPage = () => {
    if (pagination.currentOffset > 0) {
      const prevOffset = Math.max(0, pagination.currentOffset - pageSize)
      loadPage(prevOffset)
    }
  }

  const goToPage = (page: number) => {
    const offset = page * pageSize
    if (offset >= 0 && offset < pagination.totalCount) {
      loadPage(offset)
    }
  }

  return {
    data: showingAll ? allData : data,
    loading,
    loadingMore,
    error,
    pagination,
    showingAll,
    hasMore: !showingAll && pagination.totalCount > pageSize,
    nextPage,
    prevPage,
    goToPage,
    loadAllData,
    refresh: () => loadPage(pagination.currentOffset)
  }
}

// =============================================================================
// OPTIMIZED STOCK REPORT HOOK
// =============================================================================

export function useOptimizedStockReport(warehouseFilter?: string) {
  const [data, setData] = useState<OptimizedStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStockReport() {
      try {
        setLoading(true)
        setError(null)

        console.log('📦 Loading stock report with warehouse filter:', { warehouseFilter })

        const result = await getOptimizedStockReport(warehouseFilter)

        if (result) {
          setData(result)
          console.log('✅ Stock report loaded:', { items: result.length })
        } else {
          setError('Failed to load stock report')
          setData([])
        }
      } catch (err) {
        console.error('❌ Error loading stock report:', err)
        setError('Failed to load stock report')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadStockReport()
  }, [warehouseFilter])

  return { data, loading, error }
}

// =============================================================================
// TOTALS HOOKS (for accurate totals display)
// =============================================================================

export function useProfitByItemTotals(dateRange?: DateRange, locationIds?: string[], searchQuery?: string) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [totals, setTotals] = useState<ProfitByItemTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTotals() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        console.log('📊 Loading profit by item totals:', { startDate, endDate, branchFilter, searchQuery })

        const result = await getProfitByItemTotals(startDate, endDate, branchFilter, searchQuery)

        if (result) {
          setTotals(result)
          console.log('✅ Profit by item totals loaded')
        } else {
          setError('Failed to load profit by item totals')
          setTotals(null)
        }
      } catch (err) {
        console.error('❌ Error loading profit by item totals:', err)
        setError('Failed to load profit by item totals')
        setTotals(null)
      } finally {
        setLoading(false)
      }
    }

    loadTotals()
  }, [dateRange, locationIds, searchQuery])

  return { totals, loading, error }
}

export function useProfitByInvoiceTotals(dateRange?: DateRange, locationIds?: string[], searchQuery?: string) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [totals, setTotals] = useState<ProfitByInvoiceTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTotals() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        console.log('📋 Loading profit by invoice totals:', { startDate, endDate, branchFilter, searchQuery })

        const result = await getProfitByInvoiceTotals(startDate, endDate, branchFilter, searchQuery)

        if (result) {
          setTotals(result)
          console.log('✅ Profit by invoice totals loaded')
        } else {
          setError('Failed to load profit by invoice totals')
          setTotals(null)
        }
      } catch (err) {
        console.error('❌ Error loading profit by invoice totals:', err)
        setError('Failed to load profit by invoice totals')
        setTotals(null)
      } finally {
        setLoading(false)
      }
    }

    loadTotals()
  }, [dateRange, locationIds, searchQuery])

  return { totals, loading, error }
}
// =============================================================================
// FILTER OPTIONS HOOKS (for dropdown filters)
// =============================================================================

export function useItemFilterOptions(dateRange?: DateRange, locationIds?: string[]) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        console.log("📋 Loading item filter options:", { startDate, endDate, branchFilter })

        const result = await getItemFilterOptions(startDate, endDate, branchFilter)
        setOptions(result)
        console.log("✅ Item filter options loaded:", { count: result.length })
      } catch (err) {
        console.error("❌ Error loading item filter options:", err)
        setError("Failed to load item filter options")
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [dateRange, locationIds])

  return { options, loading, error }
}

export function useCustomerFilterOptions(dateRange?: DateRange, locationIds?: string[]) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        console.log("👥 Loading customer filter options:", { startDate, endDate, branchFilter, locationIds })

        const result = await getCustomerFilterOptions(startDate, endDate, branchFilter)

        // Note: Customer options don't have branch_name, so we can't filter them directly
        // The server will handle this through the branchFilter parameter
        // For multiple locations, we show all customers (they'll be filtered when data is displayed)
        setOptions(result)
        console.log("✅ Customer filter options loaded:", { count: result.length })
      } catch (err) {
        console.error("❌ Error loading customer filter options:", err)
        setError("Failed to load customer filter options")
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [dateRange, locationIds])

  return { options, loading, error }
}

export function useInvoiceFilterOptions(dateRange?: DateRange, locationIds?: string[]) {
  const branchFilter = locationIds && locationIds.length === 1 ? locationIds[0] : undefined
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true)
        setError(null)

        const startDate = dateRange?.from ? formatDateForRPC(dateRange.from) : undefined
        const endDate = dateRange?.to ? formatDateForRPC(dateRange.to) : undefined

        console.log("📄 Loading invoice filter options:", { startDate, endDate, branchFilter })

        const result = await getInvoiceFilterOptions(startDate, endDate, branchFilter)
        setOptions(result)
        console.log("✅ Invoice filter options loaded:", { count: result.length })
      } catch (err) {
        console.error("❌ Error loading invoice filter options:", err)
        setError("Failed to load invoice filter options")
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [dateRange, locationIds])

  return { options, loading, error }
}

export function useWarehouseFilterOptions() {
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true)
        setError(null)

        console.log("🏪 Loading warehouse filter options")

        const result = await getWarehouseFilterOptions()

        setOptions(result)
        console.log("✅ Warehouse filter options loaded:", { count: result.length })
      } catch (err) {
        console.error("❌ Error loading warehouse filter options:", err)
        setError("Failed to load warehouse filter options")
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [])

  return { options, loading, error }
}

// =============================================================================
// INVOICE ITEMS HOOK
// =============================================================================

// Global cache to prevent duplicate loading across all hook instances
const invoiceItemsCache = new Map<string, { items: InvoiceItem[], loading: boolean, error: string | null }>()

export function useInvoiceItems(invoiceNumber?: string) {
  const [state, setState] = useState<{ items: InvoiceItem[], loading: boolean, error: string | null }>({
    items: [],
    loading: false,
    error: null
  })

  useEffect(() => {
    if (!invoiceNumber) {
      setState({ items: [], loading: false, error: null })
      return
    }

    const cacheKey = invoiceNumber

    // Check cache first
    if (invoiceItemsCache.has(cacheKey)) {
      const cachedData = invoiceItemsCache.get(cacheKey)!
      setState(cachedData)
      return
    }

    // Don't load if already loading
    if (state.loading) {
      return
    }

    async function loadItems() {
      setState({ items: [], loading: true, error: null })

      try {
        console.log("📋 Loading invoice items for:", invoiceNumber)
        const result = await getInvoiceItems(invoiceNumber)
        
        const newState = result === null 
          ? { items: [], loading: false, error: "Failed to load invoice items" }
          : { items: result, loading: false, error: null }
        
        // Cache the result
        invoiceItemsCache.set(cacheKey, newState)
        setState(newState)
        
        if (result !== null) {
          console.log("✅ Invoice items loaded:", { count: result.length })
        }
      } catch (err) {
        console.error("❌ Error loading invoice items:", err)
        const errorState = { items: [], loading: false, error: "Failed to load invoice items" }
        invoiceItemsCache.set(cacheKey, errorState)
        setState(errorState)
      }
    }

    loadItems()
  }, [invoiceNumber])

  return state
}

// Export function to access the global cache for export functionality
export function getInvoiceItemsFromCache(): Map<string, InvoiceItem[]> {
  const itemsMap = new Map<string, InvoiceItem[]>()
  for (const [key, value] of invoiceItemsCache.entries()) {
    if (key !== 'empty' && value.items.length > 0) {
      itemsMap.set(key, value.items)
    }
  }
  return itemsMap
}
