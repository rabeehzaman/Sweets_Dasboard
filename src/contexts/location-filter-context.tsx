"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Branch {
  location_id: string
  location_name: string
}

interface LocationFilterContextType {
  selectedLocations: string[]
  setSelectedLocations: (locations: string[]) => void
  branches: Branch[] // All business branches (including children like Nashad, Nisam)
  filteredBranches: Branch[] // Grouped branches (children grouped with parents - for Vendors page only)
  loadingBranches: boolean
  errorBranches: string | null
}

const LocationFilterContext = React.createContext<LocationFilterContextType | undefined>(undefined)

const STORAGE_KEY = "selected_locations"

export function LocationFilterProvider({ children }: { children: React.ReactNode }) {
  const { permissions } = useAuth()

  const [selectedLocations, setSelectedLocationsState] = React.useState<string[]>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Clear old stored IDs (numeric values) - we now use location_name instead
          // Old format: ["6817763000000151088"], New format: ["Khaleel / الخليل"]
          if (parsed.length > 0 && !isNaN(Number(parsed[0]))) {
            localStorage.removeItem(STORAGE_KEY)
            return []
          }
          return parsed
        } catch (e) {
          console.error("Error parsing stored locations:", e)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
    return []
  })

  const [branches, setBranches] = React.useState<Branch[]>([]) // All business branches
  const [filteredBranches, setFilteredBranches] = React.useState<Branch[]>([]) // Grouped branches (for Vendors only)
  const [loadingBranches, setLoadingBranches] = React.useState(true)
  const [errorBranches, setErrorBranches] = React.useState<string | null>(null)

  // Fetch branches once on mount
  React.useEffect(() => {
    async function fetchBranches() {
      try {
        setLoadingBranches(true)
        setErrorBranches(null)

        const { data, error } = await supabase
          .from('branch')
          .select('location_id, location_name')
          .not('location_id', 'is', null)
          .order('location_name')

        if (error) throw error

        // Filter out warehouse locations (containing WH or Van)
        let businessLocations = (data || []).filter(branch => {
          const name = branch.location_name?.toLowerCase() || ''
          return !name.includes(' wh') && !name.includes('van')
        })

        console.log('🔍 LocationFilter Debug:', {
          totalBranches: data?.length,
          businessLocations: businessLocations.length,
          hasPermissions: !!permissions,
          allowedBranches: permissions?.allowedBranches,
          isAdmin: permissions?.isAdmin,
          willFilter: permissions?.allowedBranches && permissions.allowedBranches.length > 0 && !permissions.isAdmin
        })

        // Apply permission-based filtering if user has restricted access
        if (permissions?.allowedBranches && permissions.allowedBranches.length > 0 && !permissions.isAdmin) {
          const beforeFilter = businessLocations.length
          businessLocations = businessLocations.filter(branch =>
            permissions.allowedBranches.includes(branch.location_name)
          )
          console.log('🔍 After permission filter:', {
            before: beforeFilter,
            after: businessLocations.length,
            filtered: businessLocations.map(b => b.location_name)
          })
        }

        // Set all business branches (includes children like Nashad, Nisam)
        setBranches(businessLocations)

        // Create grouped branches (children grouped with parents - for Vendors page only)
        const parentLocations = new Map<string, Branch>()

        businessLocations.forEach(branch => {
          const name = branch.location_name || ''

          // Check if this is a child location (contains " - ")
          if (name.includes(' - ')) {
            // Extract parent name (e.g., "Nashad - Frozen / ثلاجة" → "Frozen / ثلاجة")
            const parts = name.split(' - ')
            const parentName = parts[1]

            // Find the parent location
            const parent = businessLocations.find(b => b.location_name === parentName)
            if (parent && !parentLocations.has(parent.location_id)) {
              parentLocations.set(parent.location_id, parent)
            }
          } else {
            // This is a parent location, add it
            if (!parentLocations.has(branch.location_id)) {
              parentLocations.set(branch.location_id, branch)
            }
          }
        })

        setFilteredBranches(Array.from(parentLocations.values()))
      } catch (err) {
        console.error('Error fetching branches:', err)
        setErrorBranches(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoadingBranches(false)
      }
    }

    fetchBranches()
  }, [permissions])

  // Update localStorage when selectedLocations changes
  const setSelectedLocations = React.useCallback((locations: string[]) => {
    setSelectedLocationsState(locations)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
    }
  }, [])

  const value = React.useMemo(
    () => ({
      selectedLocations,
      setSelectedLocations,
      branches,
      filteredBranches,
      loadingBranches,
      errorBranches
    }),
    [selectedLocations, setSelectedLocations, branches, filteredBranches, loadingBranches, errorBranches]
  )

  return (
    <LocationFilterContext.Provider value={value}>
      {children}
    </LocationFilterContext.Provider>
  )
}

export function useLocationFilter() {
  const context = React.useContext(LocationFilterContext)
  if (context === undefined) {
    throw new Error("useLocationFilter must be used within a LocationFilterProvider")
  }
  return context
}
