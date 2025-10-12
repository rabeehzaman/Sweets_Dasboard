"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useLast7DaysSummary } from "@/hooks/use-last-7-days-summary"
import { formatCurrencyTable } from "@/lib/formatting"
import { useLocale } from "@/i18n/locale-provider"
import { format } from "date-fns"

interface Last7DaysSummaryProps {
  locationIds?: string[]
}

export function Last7DaysSummary({ locationIds }: Last7DaysSummaryProps) {
  const { data, loading, error } = useLast7DaysSummary(locationIds)
  const { t, isArabic } = useLocale()

  // Format date range - must be before early returns to follow Rules of Hooks
  const dateRangeText = React.useMemo(() => {
    if (!data) return ''
    try {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`
    } catch {
      return `${data.start_date} - ${data.end_date}`
    }
  }, [data?.start_date, data?.end_date])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('last7Days.title')}</CardTitle>
          <CardDescription>{t('last7Days.loading')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <p className="text-muted-foreground">{t('last7Days.loadingData')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('last7Days.title')}</CardTitle>
          <CardDescription className="text-destructive">
            {t('last7Days.errorLoadingData')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('last7Days.title')}</CardTitle>
          <CardDescription>{t('last7Days.noData')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('last7Days.noDataLast7Days')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isArabic ? "text-right" : ""}>
          {t('last7Days.title')}
        </CardTitle>
        <CardDescription className={isArabic ? "text-right" : ""}>
          {dateRangeText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          <MetricCard
            label={t('last7Days.totalSales')}
            value={formatCurrencyTable(data.total_sales)}
            isArabic={isArabic}
          />
          <MetricCard
            label={t('last7Days.taxableSales')}
            value={formatCurrencyTable(data.taxable_sales)}
            isArabic={isArabic}
          />
          <MetricCard
            label={t('last7Days.costOfGoodsSold')}
            value={formatCurrencyTable(data.cost_of_goods_sold)}
            isArabic={isArabic}
          />
          <MetricCard
            label={t('last7Days.grossProfit')}
            value={formatCurrencyTable(data.gross_profit)}
            valueClassName={data.gross_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
            isArabic={isArabic}
          />
          <MetricCard
            label={t('last7Days.gpPercentage')}
            value={`${data.gp_percentage.toFixed(2)}%`}
            valueClassName={data.gp_percentage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
            isArabic={isArabic}
          />
          <MetricCard
            label={t('last7Days.expenses')}
            value={formatCurrencyTable(data.expenses)}
            isArabic={isArabic}
          />
          <MetricCard
            label={t('last7Days.netProfit')}
            value={formatCurrencyTable(data.net_profit)}
            valueClassName={data.net_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
            isArabic={isArabic}
          />
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table className="table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.totalSales')}
                </TableHead>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.taxableSales')}
                </TableHead>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.costOfGoodsSold')}
                </TableHead>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.grossProfit')}
                </TableHead>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.gpPercentage')}
                </TableHead>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.expenses')}
                </TableHead>
                <TableHead className="font-semibold text-center text-xs lg:text-sm px-2">
                  {t('last7Days.netProfit')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  {formatCurrencyTable(data.total_sales)}
                </TableCell>
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  {formatCurrencyTable(data.taxable_sales)}
                </TableCell>
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  {formatCurrencyTable(data.cost_of_goods_sold)}
                </TableCell>
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  <span className={data.gross_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {formatCurrencyTable(data.gross_profit)}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  <span className={data.gp_percentage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {data.gp_percentage.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  {formatCurrencyTable(data.expenses)}
                </TableCell>
                <TableCell className="font-medium text-center text-xs lg:text-sm px-2">
                  <span className={data.net_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {formatCurrencyTable(data.net_profit)}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// MetricCard component for mobile view
interface MetricCardProps {
  label: string
  value: string
  valueClassName?: string
  isArabic: boolean
}

function MetricCard({ label, value, valueClassName, isArabic }: MetricCardProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border bg-card ${isArabic ? 'flex-row-reverse' : ''}`}>
      <span className={`text-sm font-medium text-muted-foreground ${isArabic ? 'text-right' : 'text-left'}`}>
        {label}
      </span>
      <span className={`text-base font-semibold ${valueClassName || ''} ${isArabic ? 'text-left' : 'text-right'}`}>
        {value}
      </span>
    </div>
  )
}
