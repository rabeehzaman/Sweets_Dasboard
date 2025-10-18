"use client"

import * as React from "react"
import { useState } from "react"
import { useLocale } from "@/i18n/locale-provider"
import { LoanWithCalculations, BankType, LoanStatus } from "@/types/loans"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"

interface LoansTableProps {
  loans: LoanWithCalculations[]
}

export function LoansTable({ loans }: LoansTableProps) {
  const { t, isArabic } = useLocale()
  const [searchTerm, setSearchTerm] = useState("")
  const [bankFilter, setBankFilter] = useState<"all" | BankType>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all")

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = loan.bank.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBank = bankFilter === "all" || loan.bank === bankFilter
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    return matchesSearch && matchesBank && matchesStatus
  })

  // Sort by maturity date (active loans first, then by date)
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1
    if (a.status !== "closed" && b.status === "closed") return -1
    return new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const getStatusBadge = (status: LoanStatus) => {
    const statusConfig = {
      active: { label: t("loans.status.active"), className: "bg-blue-100 text-blue-800" },
      closed: { label: t("loans.status.closed"), className: "bg-green-100 text-green-800" },
      overdue: { label: t("loans.status.overdue"), className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getBankBadge = (bank: BankType) => {
    const className = bank === "Ahli Bank"
      ? "border-blue-400 text-blue-600"
      : "border-red-400 text-red-600"
    return <Badge variant="outline" className={className}>{bank}</Badge>
  }

  const getRemainingDaysDisplay = (loan: LoanWithCalculations) => {
    if (loan.status === "closed") {
      return <span className="text-green-600">{t("loans.completed")}</span>
    }

    if (loan.remainingDays < 0) {
      return <span className="text-red-600 font-semibold">{t("loans.overdue")}</span>
    }

    if (loan.remainingDays === 0) {
      return <span className="text-orange-600 font-semibold">{t("loans.due_today")}</span>
    }

    const color = loan.remainingDays <= 30 ? "text-orange-500" : "text-green-600"
    return (
      <span className={color}>
        {loan.remainingDays} {t("loans.days_remaining")}
      </span>
    )
  }

  const handleExport = () => {
    // Prepare CSV data
    const headers = [
      t("loans.table.bank"),
      t("loans.table.initiation_date"),
      t("loans.table.maturity_date"),
      t("loans.table.time_remaining"),
      t("loans.table.original_amount"),
      t("loans.table.repayment_amount"),
      t("loans.table.remaining_amount"),
      t("loans.table.status"),
    ]

    const rows = sortedLoans.map(loan => [
      loan.bank,
      formatDate(loan.initiationDate),
      formatDate(loan.maturityDate),
      loan.status === "closed" ? "Completed" : loan.remainingDays < 0 ? "Overdue" : `${loan.remainingDays} days`,
      loan.originalAmount.toString(),
      loan.repaymentAmount.toString(),
      loan.remainingAmount.toString(),
      loan.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `loans_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg">{t("loans.table.title")}</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              {t("loans.table.description")} ({filteredLoans.length} {t("loans.table.loans")})
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="h-11 sm:h-9 w-full sm:w-auto shrink-0">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="ml-2 sm:ml-0">{t("loans.export")}</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("loans.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 sm:h-10"
            />
          </div>
          <Select value={bankFilter} onValueChange={(value) => setBankFilter(value as "all" | BankType)}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="h-11 sm:h-10">{t("loans.filters.all_banks")}</SelectItem>
              <SelectItem value="Ahli Bank" className="h-11 sm:h-10">Ahli Bank</SelectItem>
              <SelectItem value="Khaleej Bank" className="h-11 sm:h-10">Khaleej Bank</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | LoanStatus)}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="h-11 sm:h-10">{t("loans.filters.all_status")}</SelectItem>
              <SelectItem value="active" className="h-11 sm:h-10">{t("loans.status.active")}</SelectItem>
              <SelectItem value="closed" className="h-11 sm:h-10">{t("loans.status.closed")}</SelectItem>
              <SelectItem value="overdue" className="h-11 sm:h-10">{t("loans.status.overdue")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {sortedLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t("loans.no_loans")}
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedLoans.map((loan, index) => {
                const paymentProgress = loan.originalAmount > 0
                  ? ((loan.originalAmount - loan.remainingAmount) / loan.originalAmount) * 100
                  : 0

                return (
                  <div
                    key={loan.id}
                    className={`bg-card border rounded-lg shadow-sm overflow-hidden ${
                      loan.status === "overdue"
                        ? "border-red-300 dark:border-red-800"
                        : loan.status === "closed"
                        ? "border-green-300 dark:border-green-800 opacity-70"
                        : "border-blue-300 dark:border-blue-800"
                    }`}
                  >
                    {/* Header: Loan Number & Status */}
                    <div className="bg-muted/30 p-3 flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">
                          {t("loans.table.loan")} #{index + 1}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        {getStatusBadge(loan.status)}
                        {getBankBadge(loan.bank)}
                      </div>
                    </div>

                    {/* Content: Amounts & Dates */}
                    <div className="p-3 space-y-3">
                      {/* Amount Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] uppercase text-muted-foreground mb-1 font-medium">
                            {t("loans.table.original_amount")}
                          </div>
                          <div className="text-base font-bold text-foreground">
                            {formatCurrency(loan.originalAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-muted-foreground mb-1 font-medium">
                            {t("loans.table.remaining_amount")}
                          </div>
                          <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(loan.remainingAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{t("loans.kpi.payment_rate")}</span>
                          <span className="font-semibold">{Math.round(paymentProgress)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              loan.status === "closed"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates & Time Remaining */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-1">
                            {t("loans.table.initiation_date")}
                          </div>
                          <div className="font-medium">{formatDate(loan.initiationDate)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-1">
                            {t("loans.table.maturity_date")}
                          </div>
                          <div className="font-medium">{formatDate(loan.maturityDate)}</div>
                        </div>
                      </div>

                      {/* Time Remaining */}
                      <div className="pt-2 border-t">
                        <div className="text-[10px] text-muted-foreground mb-1">
                          {t("loans.table.time_remaining")}
                        </div>
                        <div className="font-semibold text-sm">{getRemainingDaysDisplay(loan)}</div>
                      </div>

                      {/* Repayment Amount */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          {t("loans.table.repayment_amount")}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(loan.repaymentAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>{t("loans.table.bank")}</TableHead>
                <TableHead>{t("loans.table.initiation_date")}</TableHead>
                <TableHead>{t("loans.table.maturity_date")}</TableHead>
                <TableHead>{t("loans.table.time_remaining")}</TableHead>
                <TableHead className="text-right">{t("loans.table.original_amount")}</TableHead>
                <TableHead className="text-right">{t("loans.table.repayment_amount")}</TableHead>
                <TableHead className="text-right">{t("loans.table.remaining_amount")}</TableHead>
                <TableHead>{t("loans.table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("loans.no_loans")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedLoans.map((loan, index) => (
                  <TableRow key={loan.id} className={loan.status === "closed" ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{getBankBadge(loan.bank)}</TableCell>
                    <TableCell>{formatDate(loan.initiationDate)}</TableCell>
                    <TableCell>{formatDate(loan.maturityDate)}</TableCell>
                    <TableCell>{getRemainingDaysDisplay(loan)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(loan.originalAmount)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(loan.repaymentAmount)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(loan.remainingAmount)}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
