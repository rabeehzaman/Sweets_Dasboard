"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Warehouse, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Download, Building2, Package } from "lucide-react"
import { 
  useOptimizedProfitByInvoice, 
  useOptimizedStockReport,
  useCustomerFilterOptions,
  useInvoiceFilterOptions,
  useWarehouseFilterOptions,
  useInvoiceItems
} from "@/hooks/use-optimized-data"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrencyTable, formatNumber, formatDateSA } from "@/lib/formatting"
import { useLocale } from "@/i18n/locale-provider"
import { exportInvoicesToCSV, exportSingleInvoiceWithItemsToCSV, exportInvoicesWithExpandedItems, exportInvoicesDirectFromDB, exportInvoicesWithItemsDirectFromDB } from "@/lib/csv-export"
import type { DateRange } from "./date-filter"

interface OptimizedTabbedTablesProps {
  dateRange?: DateRange
  branchFilter?: string
}

export function OptimizedTabbedTables({ dateRange, branchFilter }: OptimizedTabbedTablesProps) {
  const { t } = useLocale()
  
  // Dual state management for immediate UI vs deferred content rendering
  const [activeTab, setActiveTab] = React.useState("invoices")     // Immediate visual feedback
  const [contentTab, setContentTab] = React.useState("invoices")   // Deferred content rendering
  const [switchingTab, setSwitchingTab] = React.useState(false)    // Transition state
  
  // Profit by invoice filters
  const [invoiceCustomerFilter, setInvoiceCustomerFilter] = React.useState<string | undefined>(undefined)
  const [invoiceNumberFilter, setInvoiceNumberFilter] = React.useState<string | undefined>(undefined)
  
  // Stock report filter
  const [warehouseFilter, setWarehouseFilter] = React.useState<string | undefined>(undefined)

  // Pagination is now handled server-side
  const itemsPerPage = 25

  // Async tab switching handler for immediate UI response
  const handleTabChange = React.useCallback((newTab: string) => {
    // Immediate visual feedback - tab becomes active instantly
    setActiveTab(newTab)
    setSwitchingTab(true)
    
    // Defer content rendering to next frame to allow UI to update first
    setTimeout(() => {
      setContentTab(newTab)
      setSwitchingTab(false)
    }, 0)
  }, [])

  // Data hooks
  const {
    data: invoiceData,
    loading: invoiceLoading,
    loadingMore: invoiceLoadingMore,
    showingAll: invoiceShowingAll,
    hasMore: invoiceHasMore,
    loadAllData: loadAllInvoiceData
  } = useOptimizedProfitByInvoice(dateRange, branchFilter, 10000, invoiceCustomerFilter, invoiceNumberFilter)

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Debug data status:', {
      invoiceData: invoiceData?.length || 0,
      invoiceLoading
    })
    if (invoiceData?.length > 0) {
      console.log('📋 Sample invoice data:', invoiceData[0])
    }
  }, [invoiceData, invoiceLoading])

  const {
    data: stockData,
    loading: stockLoading
  } = useOptimizedStockReport(warehouseFilter)

  // Get filter options for dropdown filters
  const {
    options: customerFilterOptions,
    loading: customerFilterOptionsLoading
  } = useCustomerFilterOptions(dateRange, branchFilter)

  const {
    options: invoiceFilterOptions,
    loading: invoiceFilterOptionsLoading
  } = useInvoiceFilterOptions(dateRange, branchFilter)

  const {
    options: warehouseFilterOptions,
    loading: warehouseFilterOptionsLoading
  } = useWarehouseFilterOptions()

  // Data is already filtered by database, no client-side filtering needed
  // However, we implement a simple pagination display for better UX
  const [showAllInvoices, setShowAllInvoices] = React.useState(false)
  const [expandedInvoices, setExpandedInvoices] = React.useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = React.useState(false)

  const displayInvoiceData = showAllInvoices ? invoiceData : invoiceData.slice(0, itemsPerPage)
  const displayStockData = stockData

  // Helper function to toggle invoice expansion
  const toggleInvoiceExpansion = React.useCallback((invoiceNo: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
      
      // Prevent automatic scroll to focus for mouse clicks
      if (event.type === 'click') {
        event.currentTarget.blur()
      }
    }
    
    setExpandedInvoices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(invoiceNo)) {
        newSet.delete(invoiceNo)
      } else {
        newSet.add(invoiceNo)
      }
      return newSet
    })
  }, [])

  // Helper function to get branch badge color
  const getBranchBadgeColor = (branchName: string) => {
    switch (branchName) {
      case 'Main Branch':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      case 'Asir S Man':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
      case 'Rashid S Man':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
      case 'MAJEED':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700'
      default:
        return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
    }
  }

  // Export handler functions
  const handleExportAllInvoices = async () => {
    setIsExporting(true)
    try {
      // Export directly from database with current filters
      await exportInvoicesDirectFromDB(
        dateRange?.from,
        dateRange?.to,
        branchFilter,
        invoiceCustomerFilter,
        invoiceNumberFilter
      )
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportWithExpandedItems = async () => {
    setIsExporting(true)
    try {
      // Export directly from database with current filters and fetch all items
      await exportInvoicesWithItemsDirectFromDB(
        dateRange?.from,
        dateRange?.to,
        branchFilter,
        invoiceCustomerFilter,
        invoiceNumberFilter
      )
    } catch (error) {
      console.error('Export with items failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSingleInvoice = async (invoice: Invoice, items?: InvoiceItem[]) => {
    setIsExporting(true)
    try {
      if (items && items.length > 0) {
        exportSingleInvoiceWithItemsToCSV(invoice, items)
      } else {
        exportInvoicesToCSV([invoice])
      }
    } catch (error) {
      console.error('Single invoice export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Component for expandable invoice row
  const ExpandableInvoiceRow = ({ invoice, index }: { invoice: Invoice, index: number }) => {
    const isExpanded = expandedInvoices.has(invoice.invoice_no)
    const { items, loading: itemsLoading } = useInvoiceItems(isExpanded ? invoice.invoice_no : undefined)
    
    
    const profitValue = invoice.total_profit || 0
    const profitPercentage = invoice.profit_margin_percent || 0
    const isProfit = profitValue >= 0
    
    return (
      <>
        {/* Main Invoice Row with enhanced styling */}
        <TableRow 
          key={`${invoice.invoice_no}-${index}`}
          className={`
            cursor-pointer transition-all duration-200 ease-in-out
            hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30
            ${isExpanded ? 'bg-muted/40 shadow-sm' : ''}
            ${index % 2 === 0 ? 'bg-muted/10' : 'bg-background'}
            border-l-4 border-transparent hover:border-l-primary/50
            ${isExpanded ? 'border-l-primary' : ''}
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:scroll-auto
          `}
          onClick={(e) => {
            // Remove focus immediately after click to prevent scroll-into-view
            setTimeout(() => {
              if (document.activeElement === e.currentTarget) {
                e.currentTarget.blur()
              }
            }, 0)
            toggleInvoiceExpansion(invoice.invoice_no, e)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleInvoiceExpansion(invoice.invoice_no, e)
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} invoice ${invoice.invoice_no} details for ${invoice.customer_name || 'Unknown Customer'}`}
        >
          <TableCell className="py-4 pl-4">
            <div className="flex items-center gap-3">
              <div className={`
                transition-transform duration-200 ease-in-out p-1 rounded-full
                ${isExpanded ? 'bg-primary/20 transform rotate-0' : 'hover:bg-muted'}
              `}>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-primary transition-colors duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors duration-200" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">{formatDateSA(invoice.inv_date)}</div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                  {items && items.length > 0 ? `${items.length} items` : 'Click to view items'}
                </div>
              </div>
            </div>
          </TableCell>
          
          <TableCell className="py-4">
            <div className="space-y-1">
              <div className="font-bold text-primary dark:text-primary">{invoice.invoice_no}</div>
              {invoice.branch_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium px-2 py-0.5 border ${getBranchBadgeColor(invoice.branch_name)}`}
                  >
                    {invoice.branch_name}
                  </Badge>
                </div>
              )}
            </div>
          </TableCell>
          
          <TableCell className="py-4">
            <div className="font-medium text-foreground dark:text-foreground max-w-[200px] truncate" title={invoice.customer_name}>
              {invoice.customer_name || 'Unknown Customer'}
            </div>
          </TableCell>
          
          <TableCell className="text-right py-4">
            <div className="font-semibold text-foreground">{formatCurrencyTable(invoice.total_sale_price || 0)}</div>
          </TableCell>
          
          <TableCell className="text-right py-4">
            <div className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrencyTable(invoice.total_cost || 0)}</div>
          </TableCell>
          
          <TableCell className="text-right py-4">
            <div className="flex items-center justify-end gap-2">
              {isProfit ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <Badge 
                variant={isProfit ? "default" : "destructive"}
                className={`font-semibold shadow-sm ${
                  isProfit 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {formatCurrencyTable(profitValue)}
              </Badge>
            </div>
          </TableCell>
          
          <TableCell className="text-right py-4">
            <Badge 
              variant={isProfit ? "default" : "destructive"}
              className={`font-semibold text-sm px-3 py-1 shadow-sm ${
                isProfit 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
              }`}
            >
              {profitPercentage.toFixed(1)}%
            </Badge>
          </TableCell>
        </TableRow>

        {/* Enhanced Expandable Items Section with smooth animation */}
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={7} className="p-0">
              <div className="bg-gradient-to-r from-muted/30 to-muted/20 border-t-2 border-primary/20 animate-in slide-in-from-top-1 duration-500 ease-out">
                {itemsLoading ? (
                  <div className="p-6 flex items-center justify-center" role="status" aria-live="polite">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      <span className="text-sm font-medium text-primary animate-pulse" id="loading-text">{t("common.loading")}</span>
                    </div>
                  </div>
                ) : items && items.length > 0 ? (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-muted">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-primary">
                        {t("tables.headers.invoice_items")} ({items.length} {t("tables.headers.items")})
                      </span>
                    </div>
                    
                    <div className="rounded-lg border border-muted/50 overflow-hidden shadow-sm">
                      <Table className="border-0" role="table" aria-label={`Invoice items for ${invoice.invoice_no}`}>
                        <TableHeader>
                          <TableRow className="bg-muted/50 border-b border-muted">
                            <TableHead className="text-xs font-semibold text-foreground py-3">{t("tables.headers.item_name")}</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground text-center py-3">{t("tables.headers.quantity")}</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground text-right py-3">{t("tables.headers.sale_price")}</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground text-right py-3">{t("tables.headers.cost")}</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground text-right py-3">{t("tables.headers.profit")}</TableHead>
                            <TableHead className="text-xs font-semibold text-foreground text-right py-3">{t("tables.headers.profit_percentage")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, itemIndex) => {
                            const itemProfit = item.profit || 0
                            const itemProfitPercent = item.profit_percentage || 0
                            const isItemProfit = itemProfit >= 0
                            
                            return (
                              <TableRow 
                                key={itemIndex} 
                                className={`
                                  border-muted/30 hover:bg-muted/20 transition-all duration-200 ease-in-out
                                  ${itemIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                                  hover:shadow-sm hover:scale-[1.001]
                                  animate-in fade-in-0 slide-in-from-left-1
                                `}
                                style={{ animationDelay: `${itemIndex * 50}ms` }}
                              >
                                <TableCell className="text-sm py-3 pl-4">
                                  <div className="max-w-[250px] truncate font-medium text-foreground" title={item.item_name}>
                                    {item.item_name}
                                  </div>
                                </TableCell>
                                
                                <TableCell className="text-center text-sm py-3">
                                  <span className="font-semibold bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 px-2 py-1 rounded-md border dark:border-blue-700">
                                    {formatNumber(item.quantity)}
                                  </span>
                                </TableCell>
                                
                                <TableCell className="text-right text-sm py-3">
                                  <div className="space-y-1">
                                    <div className="font-bold text-green-700 dark:text-green-400">
                                      {formatCurrencyTable(item.sale_price)}
                                    </div>
                                    <div className="text-xs bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded border dark:border-green-700">
                                      ({formatCurrencyTable(item.unit_price)}/u)
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell className="text-right text-sm py-3">
                                  <div className="space-y-1">
                                    <div className="font-bold text-orange-700 dark:text-orange-400">
                                      {formatCurrencyTable(item.cost)}
                                    </div>
                                    <div className="text-xs bg-orange-50 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-2 py-1 rounded border dark:border-orange-700">
                                      ({formatCurrencyTable(item.unit_cost)}/u)
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell className="text-right text-sm py-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-end gap-1">
                                      {isItemProfit ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                      )}
                                      <Badge 
                                        variant={isItemProfit ? "default" : "destructive"}
                                        className={`text-xs font-semibold ${
                                          isItemProfit 
                                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                            : 'bg-gradient-to-r from-red-500 to-red-600'
                                        }`}
                                      >
                                        {formatCurrencyTable(itemProfit)}
                                      </Badge>
                                    </div>
                                    <div className="text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 px-2 py-1 rounded border dark:border-slate-600">
                                      ({formatCurrencyTable(item.unit_profit)}/u)
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell className="text-right text-sm py-3">
                                  <Badge 
                                    variant={isItemProfit ? "default" : "destructive"}
                                    className={`text-xs font-bold px-3 py-1 ${
                                      isItemProfit 
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                                        : 'bg-gradient-to-r from-rose-500 to-rose-600'
                                    }`}
                                  >
                                    {itemProfitPercent.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {/* Enhanced Items Summary Row */}
                          <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5 border-t-2 border-primary/30 animate-in fade-in-0 slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${items.length * 50 + 200}ms` }}>
                            <TableCell className="font-bold text-sm py-4 pl-4">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="text-primary">
                                  {t("tables.headers.total")} ({items.length} {t("tables.headers.items")})
                                </span>
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-center font-bold text-sm py-4">
                              <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 px-3 py-2 rounded-lg border dark:border-blue-700">
                                {formatNumber(items.reduce((sum, item) => sum + item.quantity, 0))}
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right font-bold text-sm py-4">
                              <div className="text-green-700 dark:text-green-400 text-lg">
                                {formatCurrencyTable(items.reduce((sum, item) => sum + item.sale_price, 0))}
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right font-bold text-sm py-4">
                              <div className="text-orange-700 dark:text-orange-400 text-lg">
                                {formatCurrencyTable(items.reduce((sum, item) => sum + item.cost, 0))}
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right font-bold text-sm py-4">
                              <div className="flex items-center justify-end gap-2">
                                {items.reduce((sum, item) => sum + item.profit, 0) >= 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <Badge 
                                  variant={items.reduce((sum, item) => sum + item.profit, 0) >= 0 ? "default" : "destructive"}
                                  className={`text-sm font-bold px-4 py-2 shadow-md ${
                                    items.reduce((sum, item) => sum + item.profit, 0) >= 0
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                  }`}
                                >
                                  {formatCurrencyTable(items.reduce((sum, item) => sum + item.profit, 0))}
                                </Badge>
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right font-bold text-sm py-4">
                              <Badge 
                                variant={items.reduce((sum, item) => sum + item.profit, 0) >= 0 ? "default" : "destructive"}
                                className={`text-sm font-bold px-4 py-2 shadow-md ${
                                  items.reduce((sum, item) => sum + item.profit, 0) >= 0
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
                                    : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                                }`}
                              >
                                {items.reduce((sum, item) => sum + item.sale_price, 0) > 0 
                                  ? (((items.reduce((sum, item) => sum + item.profit, 0)) / (items.reduce((sum, item) => sum + item.sale_price, 0))) * 100).toFixed(1) 
                                  : 0}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center" role="status" aria-live="polite">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground font-medium">
                        {t("tables.no_items_found")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </>
    )
  }

  // Calculate totals from COMPLETE dataset (already filtered by database)
  const invoiceTotal = {
    salePrice: displayInvoiceData.reduce((sum, item) => sum + (item.total_sale_price || 0), 0),
    cost: displayInvoiceData.reduce((sum, item) => sum + (item.total_cost || 0), 0),
    profit: displayInvoiceData.reduce((sum, item) => sum + (item.total_profit || 0), 0)
  }

  const stockTotal = {
    stock: displayStockData.reduce((sum, item) => sum + (item.stock_quantity || 0), 0),
    stockInPcs: displayStockData.reduce((sum, item) => sum + (item.stock_in_pieces || 0), 0),
    totalCost: displayStockData.reduce((sum, item) => sum + (item.current_stock_value || 0), 0),
    totalCostWithVAT: displayStockData.reduce((sum, item) => sum + (item.stock_value_with_vat || 0), 0)
  }

  // Stock data filtering (still client-side as it's a single load)

  // Create loading component for individual tabs
  const TabLoadingState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-32">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>{message}</span>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tables.title")}</CardTitle>
        <CardDescription>
          {t("tables.description")}
          <div className="flex items-center gap-2 mt-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{t("messages.using_rpc")}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 min-h-[44px] h-auto">
            <TabsTrigger value="invoices" className="flex items-center gap-1 text-xs sm:text-sm min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t("tables.tabs.profit_by_invoice")}</span>
              <span className="sm:hidden">{t("tables.tabs.invoices")}</span>
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-1 text-xs sm:text-sm min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Warehouse className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t("tables.tabs.stock_report")}</span>
              <span className="sm:hidden">{t("tables.tabs.stock")}</span>
            </TabsTrigger>
          </TabsList>


          <TabsContent value="invoices" className="space-y-4">
            {contentTab !== "invoices" ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>{t("common.loading")}</span>
                </div>
              </div>
            ) : invoiceLoading ? (
              <TabLoadingState message={t("common.loading")} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("actions.show_all")} {displayInvoiceData.length} {showAllInvoices ? t("common.total") : `${itemsPerPage}`} {t("kpi.invoices")}
                    <span className="text-green-600 ml-2">• {t("tables.performance_note")}</span>
                  </div>
                </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-muted/50 p-3 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t("tables.filters_label")}</span>
              <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0 overflow-hidden">
                <SearchableSelect
                  options={customerFilterOptions}
                  value={invoiceCustomerFilter}
                  onValueChange={setInvoiceCustomerFilter}
                  placeholder={t("tables.filter_placeholders.customer")}
                  searchPlaceholder={t("tables.filter_placeholders.customer_search")}
                  className="w-full sm:w-[250px] sm:max-w-[250px] min-w-0 min-h-[44px]"
                  loading={customerFilterOptionsLoading}
                />
                <SearchableSelect
                  options={invoiceFilterOptions}
                  value={invoiceNumberFilter}
                  onValueChange={setInvoiceNumberFilter}
                  placeholder={t("tables.filter_placeholders.invoice")}
                  searchPlaceholder={t("tables.filter_placeholders.invoice_search")}
                  className="w-full sm:w-[200px] sm:max-w-[200px] min-w-0 min-h-[44px]"
                  loading={invoiceFilterOptionsLoading}
                />
              </div>
              {(invoiceCustomerFilter || invoiceNumberFilter) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setInvoiceCustomerFilter(undefined)
                    setInvoiceNumberFilter(undefined)
                  }}
                  className="whitespace-nowrap"
                >
                  Clear All
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting || displayInvoiceData.length === 0}
                    className="whitespace-nowrap flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        {t("actions.downloading")}
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        {t("actions.export_csv")}
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportAllInvoices}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("actions.export_all")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportWithExpandedItems}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t("actions.export_invoice_items")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border overflow-hidden">
              {/* Mobile View */}
              <div className="md:hidden">
                <div className="p-3 bg-muted/50 border-b space-y-2">
                  <div className="font-semibold text-sm">{t("common.total")}:</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.sale_price")}:</div>
                      <div className="font-medium">{formatCurrencyTable(invoiceTotal.salePrice)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.cost")}:</div>
                      <div className="font-medium">{formatCurrencyTable(invoiceTotal.cost)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.profit")}:</div>
                      <Badge variant={invoiceTotal.profit >= 0 ? "default" : "destructive"} className="text-xs">
                        {formatCurrencyTable(invoiceTotal.profit)}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.profit_percentage")}:</div>
                      <Badge variant={invoiceTotal.profit >= 0 ? "default" : "destructive"} className="text-xs">
                        {invoiceTotal.salePrice > 0 ? ((invoiceTotal.profit / invoiceTotal.salePrice) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-3">
                  {displayInvoiceData.map((invoice, index) => (
                    <div key={`${invoice.invoice_no}-${index}`} className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{invoice.invoice_no}</div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.customer_name || 'Unknown Customer'}
                          </div>
                        </div>
                        <Badge variant={(invoice.profit_margin_percent || 0) >= 0 ? "default" : "destructive"} className="text-xs">
                          {(invoice.profit_margin_percent || 0).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("tables.headers.date")}: {formatDateSA(invoice.inv_date)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.sale_price")}:</span><br/>
                          <span className="font-medium">{formatCurrencyTable(invoice.total_sale_price || 0)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.cost")}:</span><br/>
                          <span className="font-medium">{formatCurrencyTable(invoice.total_cost || 0)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.profit")}:</span><br/>
                          <Badge variant={(invoice.total_profit || 0) >= 0 ? "default" : "destructive"} className="text-xs">
                            {formatCurrencyTable(invoice.total_profit || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop View - Enhanced with Expandable Invoice Items */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tables.headers.date")}</TableHead>
                    <TableHead>{t("tables.headers.invoice_number")}</TableHead>
                    <TableHead>{t("tables.headers.customer_name")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.sale_price")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.cost")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.profit")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.profit_percentage")}</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead colSpan={3} className="bg-muted font-semibold">{t("tables.headers.total")}</TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatCurrencyTable(invoiceTotal.salePrice)}
                    </TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatCurrencyTable(invoiceTotal.cost)}
                    </TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatCurrencyTable(invoiceTotal.profit)}
                    </TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {invoiceTotal.salePrice > 0 ? ((invoiceTotal.profit / invoiceTotal.salePrice) * 100).toFixed(1) : 0}%
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayInvoiceData.map((invoice, index) => (
                    <ExpandableInvoiceRow key={`${invoice.invoice_no}-${index}`} invoice={invoice} index={index} />
                  ))}
                </TableBody>
                </Table>
              </div>
            </div>
            {!showAllInvoices && invoiceData.length > itemsPerPage && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setShowAllInvoices(true)}
                  variant="outline"
                  className="flex items-center gap-2 min-h-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Show all ${invoiceData.length} invoices instead of only ${itemsPerPage}`}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  {t("actions.show_all")} ({invoiceData.length} {t("kpi.invoices")})
                </Button>
              </div>
            )}
              </>
            )}
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            {contentTab !== "stock" ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>{t("common.loading")}</span>
                </div>
              </div>
            ) : stockLoading ? (
              <TabLoadingState message={t("common.loading")} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("actions.show_all")} {displayStockData.length} {t("tables.products_label")}
                    <span className="text-green-600 ml-2">• {t("tables.total_reflects_note")}</span>
                    <span className="text-blue-600 ml-2">• {t("tables.kpi_shows_note")}</span>
                  </div>
                </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-muted/50 p-3 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t("common.filter")}:</span>
              <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0 overflow-hidden">
                <SearchableSelect
                  options={warehouseFilterOptions}
                  value={warehouseFilter}
                  onValueChange={setWarehouseFilter}
                  placeholder={t("filters.filter_by_warehouse")}
                  searchPlaceholder={t("filters.search_warehouses")}
                  className="w-full sm:w-[250px] sm:max-w-[250px] min-w-0 min-h-[44px]"
                  loading={warehouseFilterOptionsLoading}
                />
              </div>
              {warehouseFilter && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setWarehouseFilter(undefined)}
                  className="whitespace-nowrap"
                >
                  {t("common.cancel")}
                </Button>
              )}
            </div>
            <div className="rounded-md border overflow-hidden">
              {/* Mobile View */}
              <div className="md:hidden">
                <div className="p-3 bg-muted/50 border-b space-y-2">
                  <div className="font-semibold text-sm">{t("common.total")}:</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.stock_qty")}:</div>
                      <div className="font-medium">{formatNumber(stockTotal.stock)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.stock_in_pcs")}:</div>
                      <div className="font-medium">{formatNumber(stockTotal.stockInPcs)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.total_cost")}:</div>
                      <div className="font-medium">{formatCurrencyTable(stockTotal.totalCost)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("tables.headers.total_cost_with_vat")}:</div>
                      <div className="font-medium">{formatCurrencyTable(stockTotal.totalCostWithVAT)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-3">
                  {displayStockData.map((stock, index) => (
                    <div key={`${stock.product_name}-${index}`} className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="text-sm font-medium truncate">{stock.product_name}</div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.stock_qty")}:</span><br/>
                          <span className="font-medium">{formatNumber(stock.stock_quantity || 0)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.stock_in_pcs")}:</span><br/>
                          <span className="font-medium">{formatNumber(stock.stock_in_pieces || 0)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.unit_cost_header")}:</span><br/>
                          <span className="font-medium">{formatCurrencyTable(stock.unit_cost || 0)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("tables.headers.total_cost")}:</span><br/>
                          <span className="font-medium">{formatCurrencyTable(stock.current_stock_value || 0)}</span>
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">{t("tables.headers.total_cost_with_vat")}:</span>
                        <span className="font-medium ml-1">{formatCurrencyTable(stock.stock_value_with_vat || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tables.headers.name")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.stock_qty")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.stock_in_pcs")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.unit_cost_header")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.total_cost")}</TableHead>
                    <TableHead className="text-right">{t("tables.headers.total_cost_with_vat")}</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="bg-muted font-semibold">{t("tables.headers.total")}</TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatNumber(stockTotal.stock)}
                    </TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatNumber(stockTotal.stockInPcs)}
                    </TableHead>
                    <TableHead className="bg-muted font-semibold text-right">-</TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatCurrencyTable(stockTotal.totalCost)}
                    </TableHead>
                    <TableHead className="bg-muted font-semibold text-right">
                      {formatCurrencyTable(stockTotal.totalCostWithVAT)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayStockData.map((stock, index) => (
                    <TableRow key={`${stock.product_name}-${index}`}>
                      <TableCell className="max-w-[300px] truncate">{stock.product_name}</TableCell>
                      <TableCell className="text-right">{formatNumber(stock.stock_quantity || 0)}</TableCell>
                      <TableCell className="text-right">{formatNumber(stock.stock_in_pieces || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrencyTable(stock.unit_cost || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrencyTable(stock.current_stock_value || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrencyTable(stock.stock_value_with_vat || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}