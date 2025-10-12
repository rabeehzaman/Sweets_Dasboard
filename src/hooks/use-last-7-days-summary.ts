"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Last7DaysSummary {
  total_sales: number
  taxable_sales: number
  cost_of_goods_sold: number
  gross_profit: number
  gp_percentage: number
  expenses: number
  net_profit: number
  start_date: string
  end_date: string
}

export function useLast7DaysSummary(locationIds?: string[]) {
  const [data, setData] = useState<Last7DaysSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true)
        setError(null)

        // Pass the array of location IDs to the database function
        // The function now supports filtering by multiple branches
        const branchNames = locationIds && locationIds.length > 0 ? locationIds : null

        const { data: summary, error: fetchError } = await supabase.rpc('get_last_7_days_summary', {
          p_branch_names: branchNames
        })

        if (fetchError) {
          console.error('Error fetching last 7 days summary:', fetchError)
          setError(fetchError.message)
          return
        }

        if (!summary || summary.length === 0) {
          console.warn('No data returned from get_last_7_days_summary')
          setData(null)
          return
        }

        // RPC returns array with single row
        const summaryData = summary[0]

        setData({
          total_sales: parseFloat(summaryData.total_sales) || 0,
          taxable_sales: parseFloat(summaryData.taxable_sales) || 0,
          cost_of_goods_sold: parseFloat(summaryData.cost_of_goods_sold) || 0,
          gross_profit: parseFloat(summaryData.gross_profit) || 0,
          gp_percentage: parseFloat(summaryData.gp_percentage) || 0,
          expenses: parseFloat(summaryData.expenses) || 0,
          net_profit: parseFloat(summaryData.net_profit) || 0,
          start_date: summaryData.start_date,
          end_date: summaryData.end_date
        })
      } catch (err) {
        console.error('Error in fetchSummary:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [locationIds?.join(',')]) // Re-fetch when location filter changes

  return { data, loading, error }
}
