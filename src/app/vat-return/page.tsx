"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VATReturnSummary } from "@/components/vat-return/vat-return-summary"
import { VATReturnTables } from "@/components/vat-return/vat-return-tables"
import { MonthFilter, type DateRange } from "@/components/dashboard/month-filter"
import { BranchFilter, type BranchFilterValue } from "@/components/dashboard/branch-filter"
import { useLocale } from "@/i18n/locale-provider"

export default function VATReturnPage() {
  const { t, isArabic } = useLocale()

  // MonthFilter will set the initial date range automatically
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [branchFilter, setBranchFilter] = React.useState<BranchFilterValue>(undefined)

  return (
    <DashboardLayout>
      {/* Page Header with Filters */}
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-full overflow-x-hidden ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight truncate ${isArabic ? 'text-right' : ''}`}>
            {t("vatReturn.title")}
          </h2>
          <p className={`text-sm sm:text-base text-muted-foreground ${isArabic ? 'text-right' : ''}`}>
            {t("vatReturn.description")}
          </p>
        </div>
        <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto max-w-full overflow-x-hidden ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <BranchFilter
            value={branchFilter}
            onValueChange={setBranchFilter}
            className="w-full sm:w-auto min-h-[44px]"
            dateRange={dateRange}
          />
          <MonthFilter
            onDateRangeChange={setDateRange}
            className="w-full sm:w-auto min-h-[44px]"
          />
        </div>
      </div>

      {/* VAT Summary Cards */}
      <VATReturnSummary dateRange={dateRange} branchFilter={branchFilter} />

      {/* VAT Return Tables (Tabbed) */}
      <VATReturnTables dateRange={dateRange} branchFilter={branchFilter} />
    </DashboardLayout>
  )
}
