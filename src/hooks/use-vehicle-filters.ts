'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface FilterOption {
  value: string
  label: string
}

export function useDepartmentOptions() {
  const { permissions } = useAuth()
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()
  }, [permissions])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_loans')
        .select('department')
        .order('department')

      if (error) throw error

      if (data) {
        let uniqueDepartments = Array.from(new Set(data.map(row => row.department)))

        // Apply permission-based filtering if user has restricted access
        if (permissions?.vehicleInstalmentDepartments && permissions.vehicleInstalmentDepartments.length > 0 && !permissions.isAdmin) {
          uniqueDepartments = uniqueDepartments.filter(dept =>
            permissions.vehicleInstalmentDepartments.includes(dept)
          )
        }

        setOptions([
          { value: 'all', label: 'All Departments' },
          ...uniqueDepartments.map(dept => ({ value: dept, label: dept }))
        ])
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
    } finally {
      setLoading(false)
    }
  }

  return { options, loading }
}

export function useOwnerOptions() {
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_loans')
        .select('owner_name')
        .order('owner_name')

      if (error) throw error

      if (data) {
        const uniqueOwners = Array.from(new Set(data.map(row => row.owner_name)))
        setOptions([
          { value: 'all', label: 'All Owners' },
          ...uniqueOwners.map(owner => ({ value: owner, label: owner }))
        ])
      }
    } catch (err) {
      console.error('Error fetching owners:', err)
    } finally {
      setLoading(false)
    }
  }

  return { options, loading }
}

export function useDeductionDayOptions() {
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeductionDays()
  }, [])

  const fetchDeductionDays = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_loans')
        .select('deduction_day')
        .order('deduction_day')

      if (error) throw error

      if (data) {
        const uniqueDays = Array.from(new Set(data.map(row => row.deduction_day)))
          .sort((a, b) => a - b)

        setOptions([
          { value: 'all', label: 'All Dates' },
          ...uniqueDays.map(day => ({
            value: day.toString(),
            label: `${day}th of month`
          }))
        ])
      }
    } catch (err) {
      console.error('Error fetching deduction days:', err)
    } finally {
      setLoading(false)
    }
  }

  return { options, loading }
}
