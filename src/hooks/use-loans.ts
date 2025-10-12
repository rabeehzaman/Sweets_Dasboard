"use client"

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { loansDb } from '@/lib/firebase-loans';
import { useAuth } from '@/contexts/auth-context';
import { Loan, Payment, LoanWithCalculations, BankType, LoanStatus } from '@/types/loans';

interface UseLoansResult {
  loans: LoanWithCalculations[];
  loading: boolean;
  error: string | null;
}

export function useLoans(): UseLoansResult {
  const { permissions } = useAuth();
  const [loans, setLoans] = useState<LoanWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loansQuery = query(collection(loansDb, 'loans'), orderBy('createdAt', 'desc'));

    // Real-time listener
    const unsubscribe = onSnapshot(
      loansQuery,
      async (snapshot) => {
        try {
          const loansData: Loan[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              personInCharge: data.personInCharge,
              initiationDate: data.initiationDate.toDate(),
              maturityDate: data.maturityDate.toDate(),
              originalAmount: data.originalAmount,
              repaymentAmount: data.repaymentAmount,
              bank: data.bank as BankType,
              status: data.status as LoanStatus,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            };
          });

          // Fetch payments for all loans
          const loansWithCalculations: LoanWithCalculations[] = await Promise.all(
            loansData.map(async (loan) => {
              const paymentsQuery = query(
                collection(loansDb, 'payments'),
                where('loanId', '==', loan.id)
              );
              const paymentsSnapshot = await getDocs(paymentsQuery);

              const payments: Payment[] = paymentsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  loanId: data.loanId,
                  amount: data.amount,
                  principalAmount: data.principalAmount,
                  interestAmount: data.interestAmount,
                  paymentDate: data.paymentDate.toDate(),
                  description: data.description,
                  createdAt: data.createdAt.toDate(),
                };
              });

              // Calculate totals
              const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
              const calculatedRemainingAmount = Math.max(0, loan.repaymentAmount - totalPaid);

              // Calculate remaining days
              const today = new Date();
              const maturityDate = new Date(loan.maturityDate);
              const remainingDays = Math.ceil((maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              // Auto-calculate status based on actual loan state
              let status: LoanStatus;
              if (calculatedRemainingAmount === 0) {
                status = 'closed';  // Fully paid
              } else if (remainingDays < 0) {
                status = 'overdue';  // Past maturity date
              } else {
                status = 'active';  // Still active
              }

              const remainingAmount = status === 'closed' ? 0 : calculatedRemainingAmount;
              const isOverdue = status === 'overdue';

              return {
                ...loan,
                status,  // Use calculated status instead of database status
                totalPaid,
                remainingAmount,
                remainingDays,
                isOverdue,
              };
            })
          );

          // Apply permission-based filtering if user has loan filter rules
          let filteredLoans = loansWithCalculations;
          if (permissions?.loanFilterRules && !permissions.isAdmin) {
            const { show_overdue, remaining_days_threshold } = permissions.loanFilterRules;

            filteredLoans = loansWithCalculations.filter(loan => {
              // Show overdue loans
              if (show_overdue && loan.status === 'overdue') {
                return true;
              }

              // Show loans with remaining days below threshold
              if (remaining_days_threshold && loan.remainingDays < remaining_days_threshold && loan.status !== 'closed') {
                return true;
              }

              // If neither condition met, filter it out
              return false;
            });
          }

          setLoans(filteredLoans);
          setLoading(false);
        } catch (err) {
          console.error('Error processing loans:', err);
          setError(err instanceof Error ? err.message : 'Failed to load loans');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching loans:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [permissions]);

  return { loans, loading, error };
}
