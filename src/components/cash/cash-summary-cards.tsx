'use client';

import { ArrowDown, ArrowUp, Banknote, Building2 } from 'lucide-react';
import type { CashKPIs } from '@/types/cash';
import { formatCurrency } from '@/lib/formatting';

interface CashSummaryCardsProps {
  kpis: CashKPIs | undefined;
  isLoading: boolean;
}

export function CashSummaryCards({ kpis, isLoading }: CashSummaryCardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="rounded-lg border bg-card p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const netCashFlowPositive = kpis.net_cash_flow >= 0;
  const bankPercentage = kpis.bank_total + kpis.cash_total > 0
    ? (kpis.bank_total / (kpis.bank_total + kpis.cash_total)) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Debits */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
            <ArrowDown className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(kpis.total_debits)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Money In
            </p>
          </div>
        </div>
      </div>

      {/* Total Credits */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
            <ArrowUp className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(kpis.total_credits)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Money Out
            </p>
          </div>
        </div>
      </div>

      {/* Net Cash Flow */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
            {netCashFlowPositive ? (
              <ArrowUp className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-bold ${netCashFlowPositive ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(kpis.net_cash_flow))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {netCashFlowPositive ? 'Deficit' : 'Surplus'}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Transactions</p>
            <Banknote className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{kpis.transaction_count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Records
            </p>
          </div>
        </div>
      </div>

      {/* Bank Total - Spans 2 columns on large screens */}
      <div className="rounded-lg border bg-card lg:col-span-2">
        <div className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Bank Accounts</p>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(kpis.bank_total)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis.bank_transactions.toLocaleString()} transactions ({bankPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Total - Spans 2 columns on large screens */}
      <div className="rounded-lg border bg-card lg:col-span-2">
        <div className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Cash Accounts</p>
            <Banknote className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(kpis.cash_total)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis.cash_transactions.toLocaleString()} transactions ({(100 - bankPercentage).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
