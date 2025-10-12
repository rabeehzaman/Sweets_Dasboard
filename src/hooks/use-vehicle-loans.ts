'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Vehicle, VehicleFilters, PaymentCalculation, VehicleWithPayment } from '@/types/vehicle-loans'

// Helper function to parse date from database
const parseDate = (dateStr: string): Date => {
  return new Date(dateStr)
}

// Helper function to calculate payment details
export const calculatePaymentDetails = (vehicle: Vehicle): PaymentCalculation => {
  const startDate = parseDate(vehicle.first_installment_date)
  const today = new Date()

  // Calculate how many payments have been made
  let paidMonths = 0
  const paymentDate = new Date(startDate)

  while (paymentDate <= today && paidMonths < vehicle.total_months) {
    paidMonths++
    paymentDate.setMonth(paymentDate.getMonth() + 1)
  }

  // Ensure we don't exceed total months
  paidMonths = Math.min(paidMonths, vehicle.total_months)

  const paidAmount = paidMonths * vehicle.installment
  const totalRepayment = vehicle.total_months * vehicle.installment
  const remainingAmount = totalRepayment - paidAmount
  const remainingMonths = vehicle.total_months - paidMonths
  const progressPercentage = (paidMonths / vehicle.total_months) * 100

  // Calculate next payment date
  const nextPaymentDate = new Date(startDate)
  nextPaymentDate.setMonth(startDate.getMonth() + paidMonths)

  const daysUntilNext = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntilNext < 0 && remainingMonths > 0

  return {
    paidMonths,
    paidAmount,
    totalRepayment,
    remainingAmount,
    remainingMonths,
    progressPercentage,
    nextPaymentDate,
    daysUntilNext: Math.max(0, daysUntilNext),
    isOverdue
  }
}

export function useVehicleLoans(filters?: VehicleFilters) {
  const { permissions } = useAuth()
  const [vehicles, setVehicles] = useState<VehicleWithPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [
    filters?.department,
    filters?.owner,
    filters?.deductionDay,
    filters?.searchQuery,
    filters?.paymentStatus,
    permissions?.vehicleInstalmentDepartments,
    permissions?.isAdmin
  ])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('vehicle_loans')
        .select('*')
        .order('plate_number', { ascending: true })

      // Apply filters
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department', filters.department)
      }

      if (filters?.owner && filters.owner !== 'all') {
        query = query.eq('owner_name', filters.owner)
      }

      if (filters?.deductionDay) {
        query = query.eq('deduction_day', filters.deductionDay)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (data) {
        // Calculate payment details for each vehicle
        const vehiclesWithPayment: VehicleWithPayment[] = data.map(vehicle => ({
          ...vehicle,
          payment: calculatePaymentDetails(vehicle)
        }))

        // Apply client-side filters
        let filtered = vehiclesWithPayment

        // Search filter
        if (filters?.searchQuery && filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase().trim()
          filtered = filtered.filter(vehicle => {
            const searchFields = [
              vehicle.plate_number.toLowerCase(),
              vehicle.vehicle_maker.toLowerCase(),
              vehicle.vehicle_model.toLowerCase(),
              vehicle.installment.toString(),
              vehicle.department.toLowerCase(),
              vehicle.owner_name.toLowerCase(),
              vehicle.body_type.toLowerCase(),
              vehicle.plate_number.replace(/[\s()]/g, '').toLowerCase()
            ]
            return searchFields.some(field => field.includes(query))
          })
        }

        // Payment status filter
        if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
          filtered = filtered.filter(vehicle => {
            const payment = vehicle.payment
            if (!payment) return false

            if (filters.paymentStatus === 'active') {
              return payment.remainingMonths > 0
            } else if (filters.paymentStatus === 'completed') {
              return payment.remainingMonths === 0
            } else if (filters.paymentStatus === '36+') {
              return payment.remainingMonths >= 36
            } else if (filters.paymentStatus?.includes('-')) {
              const [min, max] = filters.paymentStatus.split('-').map(Number)
              return payment.remainingMonths >= min && payment.remainingMonths < max
            }
            return true
          })
        }

        // Permission-based filtering for vehicle departments
        if (permissions?.vehicleInstalmentDepartments &&
            permissions.vehicleInstalmentDepartments.length > 0 &&
            !permissions.isAdmin) {
          filtered = filtered.filter(vehicle =>
            permissions.vehicleInstalmentDepartments.includes(vehicle.department)
          )
        }

        setVehicles(filtered)
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalVehicles: vehicles.length,
      totalInstallments: vehicles.reduce((sum, v) => sum + v.installment, 0),
      departments: new Set(vehicles.map(v => v.department)).size
    }
  }, [vehicles])

  return {
    vehicles,
    loading,
    error,
    summary,
    refetch: fetchVehicles
  }
}
