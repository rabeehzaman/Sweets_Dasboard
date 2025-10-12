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
          <CardTitle>{isArabic ? "أداء آخر 7 أيام" : "Last 7 Days Performance"}</CardTitle>
          <CardDescription>{isArabic ? "جاري التحميل..." : "Loading..."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <p className="text-muted-foreground">{isArabic ? "جاري تحميل البيانات..." : "Loading data..."}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "أداء آخر 7 أيام" : "Last 7 Days Performance"}</CardTitle>
          <CardDescription className="text-destructive">
            {isArabic ? "خطأ في تحميل البيانات" : "Error loading data"}
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
          <CardTitle>{isArabic ? "أداء آخر 7 أيام" : "Last 7 Days Performance"}</CardTitle>
          <CardDescription>{isArabic ? "لا توجد بيانات" : "No data available"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isArabic ? "لا توجد بيانات للأيام السبعة الماضية" : "No data available for the last 7 days"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isArabic ? "text-right" : ""}>
          {isArabic ? "أداء آخر 7 أيام" : "Last 7 Days Performance"}
        </CardTitle>
        <CardDescription className={isArabic ? "text-right" : ""}>
          {dateRangeText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "إجمالي المبيعات" : "Total Sales"}
                </TableHead>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "المبيعات الخاضعة للضريبة" : "Taxable Sales"}
                </TableHead>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "تكلفة البضاعة المباعة" : "Cost of Goods Sold"}
                </TableHead>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "إجمالي الربح" : "Gross Profit"}
                </TableHead>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "نسبة الربح الإجمالي" : "GP%"}
                </TableHead>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "المصروفات" : "Expenses"}
                </TableHead>
                <TableHead className="font-semibold w-[14.28%]" style={{ textAlign: 'center' }}>
                  {isArabic ? "صافي الربح" : "Net Profit"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
                  {formatCurrencyTable(data.total_sales)}
                </TableCell>
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
                  {formatCurrencyTable(data.taxable_sales)}
                </TableCell>
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
                  {formatCurrencyTable(data.cost_of_goods_sold)}
                </TableCell>
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
                  <span className={data.gross_profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {formatCurrencyTable(data.gross_profit)}
                  </span>
                </TableCell>
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
                  <span className={data.gp_percentage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {data.gp_percentage.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
                  {formatCurrencyTable(data.expenses)}
                </TableCell>
                <TableCell className="font-medium" style={{ textAlign: 'center' }}>
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
