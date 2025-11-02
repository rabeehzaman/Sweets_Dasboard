'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { CashSummaryCards } from '@/components/cash/cash-summary-cards';
import { CashFiltersComponent } from '@/components/cash/cash-filters';
import { CashTransactionsTable } from '@/components/cash/cash-transactions-table';
import { useCashTransactions } from '@/hooks/use-cash-transactions';
import { useCashKPIs } from '@/hooks/use-cash-kpis';
import type { CashFilters } from '@/types/cash';

export default function CashPage() {
  const [filters, setFilters] = useState<CashFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const {
    data: transactions = [],
    pagination,
    isLoading: isLoadingTransactions
  } = useCashTransactions(filters, currentPage, pageSize);

  const { data: kpis, isLoading: isLoadingKPIs } = useCashKPIs(filters);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 w-full max-w-full">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">💰 Cash & Bank Transactions</h2>
        </div>

        {/* Summary Cards */}
        <CashSummaryCards kpis={kpis} isLoading={isLoadingKPIs} />

        {/* Filters */}
        <CashFiltersComponent filters={filters} onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1); // Reset to page 1 when filters change
        }} />

        {/* Transactions Table */}
        <CashTransactionsTable
          transactions={transactions}
          isLoading={isLoadingTransactions}
          pagination={pagination}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
