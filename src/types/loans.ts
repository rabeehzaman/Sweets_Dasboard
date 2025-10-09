export type BankType = 'Ahli Bank' | 'Khaleej Bank';
export type LoanStatus = 'active' | 'closed' | 'overdue';

export interface Loan {
  id: string;
  personInCharge: string;
  initiationDate: Date;
  maturityDate: Date;
  originalAmount: number;
  repaymentAmount: number;
  bank: BankType;
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: Date;
  description?: string;
  createdAt: Date;
}

export interface LoanWithCalculations extends Loan {
  totalPaid: number;
  remainingAmount: number;
  remainingDays: number;
  isOverdue: boolean;
}
