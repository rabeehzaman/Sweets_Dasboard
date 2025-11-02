'use client';

import { useState } from 'react';
import type { CashTransaction } from '@/types/cash';
import { ENTITY_TYPE_LABELS, ENTITY_TYPE_COLORS } from '@/types/cash';
import { formatCurrency } from '@/lib/formatting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Banknote, Building2 } from 'lucide-react';

interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface CashTransactionsTableProps {
  transactions: CashTransaction[];
  isLoading: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function CashTransactionsTable({
  transactions,
  isLoading,
  pagination,
  onPageChange
}: CashTransactionsTableProps) {
  // Use server-side pagination if available, otherwise fallback to client-side
  const totalPages = pagination?.totalPages || Math.ceil(transactions.length / 50);
  const currentPage = pagination?.currentPage || 1;
  const totalCount = pagination?.totalCount || transactions.length;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-12 text-center">
          <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters to see more transactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Cash Transactions ({totalCount.toLocaleString()} records)
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Trans #</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Debit (In)</TableHead>
                <TableHead className="text-right">Credit (Out)</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const entityType = transaction.entity_type as keyof typeof ENTITY_TYPE_LABELS;

                // For transfer_fund, show transfer account; otherwise show customer/vendor
                let partyName = '-';
                if (transaction.entity_type === 'transfer_fund' && transaction.transfer_account_name) {
                  partyName = transaction.debit_or_credit === 'debit'
                    ? `From: ${transaction.transfer_account_name}`
                    : `To: ${transaction.transfer_account_name}`;
                } else {
                  partyName = transaction.customer_name || transaction.vendor_name || '-';
                }

                return (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium whitespace-nowrap">
                      {transaction.transaction_date}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.account_type === 'Bank' ? (
                          <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Banknote className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                        <span className="truncate" title={transaction.account_name}>
                          {transaction.account_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={ENTITY_TYPE_COLORS[entityType]}>
                        {ENTITY_TYPE_LABELS[entityType] || transaction.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={partyName}>
                      {partyName}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={transaction.branch_name || '-'}>
                      {transaction.branch_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.debit_amount > 0 ? (
                        <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                          <ArrowDown className="h-3 w-3" />
                          {formatCurrency(transaction.debit_amount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.credit_amount > 0 ? (
                        <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {formatCurrency(transaction.credit_amount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={transaction.reference_no || '-'}>
                      {transaction.reference_no || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalCount)} of{' '}
              {totalCount} transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
