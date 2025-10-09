// Vehicle Loan Types

export interface Vehicle {
  id: string
  plate_number: string
  plate_type: string
  body_type: string
  vehicle_maker: string
  vehicle_model: string
  model_year: string
  major_color: string
  owner_name: string
  department: string
  installment: number
  deduction_day: number
  first_installment_date: string
  total_months: number
  last_installment_date: string
  branch_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface PaymentCalculation {
  paidMonths: number
  paidAmount: number
  totalRepayment: number
  remainingAmount: number
  remainingMonths: number
  progressPercentage: number
  nextPaymentDate: Date
  daysUntilNext: number
  isOverdue: boolean
}

export interface VehicleWithPayment extends Vehicle {
  payment?: PaymentCalculation
}

export interface VehicleFilterOptions {
  departments: string[]
  owners: string[]
  deductionDays: number[]
}

export interface VehicleFilters {
  department?: string
  owner?: string
  paymentStatus?: string
  deductionDay?: number
  searchQuery?: string
}

export interface CountdownKPI {
  title: string
  vehicles: Vehicle[]
  totalAmount: number
  nextDate: Date
  bgGradient: string
  urgency: boolean
}

export type PaymentStatusFilter =
  | 'all'
  | '0-6'
  | '6-12'
  | '12-18'
  | '18-24'
  | '24-30'
  | '30-36'
  | '36+'
  | 'completed'
