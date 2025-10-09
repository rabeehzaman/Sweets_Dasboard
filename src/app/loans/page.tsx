"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LoansTable } from "@/components/loans/loans-table"
import { useLoans } from "@/hooks/use-loans"
import { useLocale } from "@/i18n/locale-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, TrendingUp, Loader2, AlertCircle } from "lucide-react"

export default function LoansPage() {
  const { t } = useLocale()
  const { loans, loading, error } = useLoans()

  // Calculate KPIs
  const totalLoans = loans.length
  const activeLoans = loans.filter(loan => loan.status === 'active').length
  const totalAmount = loans
    .filter(loan => loan.status !== 'closed')
    .reduce((sum, loan) => sum + loan.originalAmount, 0)
  const totalRemaining = loans
    .filter(loan => loan.status !== 'closed')
    .reduce((sum, loan) => sum + loan.remainingAmount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t("loans.title")}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t("loans.description")}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">{t("loans.loading")}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">{t("loans.error")}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm sm:text-base font-medium">{t("loans.kpi.total_loans")}</CardTitle>
                  <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl sm:text-3xl font-bold">{totalLoans}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {activeLoans} {t("loans.kpi.active")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm sm:text-base font-medium">{t("loans.kpi.total_amount")}</CardTitle>
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{formatCurrency(totalAmount)}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("loans.kpi.original_borrowed")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm sm:text-base font-medium">{t("loans.kpi.remaining_amount")}</CardTitle>
                  <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{formatCurrency(totalRemaining)}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("loans.kpi.to_be_paid")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm sm:text-base font-medium">{t("loans.kpi.payment_rate")}</CardTitle>
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {totalAmount > 0 ? Math.round(((totalAmount - totalRemaining) / totalAmount) * 100) : 0}%
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("loans.kpi.paid_so_far")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Loans Table */}
            <LoansTable loans={loans} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
