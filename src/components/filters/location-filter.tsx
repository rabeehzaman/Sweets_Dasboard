"use client"

import * as React from "react"
import { MapPin } from "lucide-react"
import { useLocationFilter } from "@/contexts/location-filter-context"
import { MultiSelect } from "@/components/ui/multi-select"
import { useLocale } from "@/i18n/locale-provider"

interface LocationFilterProps {
  className?: string
  showLabel?: boolean
  showDescription?: boolean
  excludeChildLocations?: boolean // If true, hide child locations (Nashad, Nisam) - for Vendors page only
}

export function LocationFilter({
  className = "",
  showLabel = true,
  showDescription = true,
  excludeChildLocations = false
}: LocationFilterProps) {
  const { t } = useLocale()
  const { selectedLocations, setSelectedLocations, branches, filteredBranches, loadingBranches } = useLocationFilter()

  // Use filteredBranches (grouped) only for Vendors page, otherwise show all branches including children
  const displayBranches = excludeChildLocations ? filteredBranches : branches

  const options = React.useMemo(() =>
    displayBranches.map(branch => ({
      value: branch.location_name, // Use location_name for filtering (RPC functions expect name, not ID)
      label: branch.location_name
    })),
    [displayBranches]
  )

  return (
    <div className={`flex flex-col sm:flex-row gap-3 items-start sm:items-center ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{t("vendors.location_filter.label")}</span>
        </div>
      )}
      <MultiSelect
        options={options}
        value={selectedLocations}
        onValueChange={setSelectedLocations}
        placeholder={t("vendors.location_filter.all_locations")}
        searchPlaceholder={t("vendors.aging.search_placeholder")}
        disabled={loadingBranches}
        loading={loadingBranches}
        className="w-full sm:w-auto sm:min-w-[300px]"
        maxDisplay={2}
      />
      {showDescription && (
        <p className="text-xs text-muted-foreground">
          {selectedLocations.length === 0
            ? t("vendors.location_filter.filter_description")
            : `Filtering by ${selectedLocations.length} location${selectedLocations.length > 1 ? 's' : ''}`
          }
        </p>
      )}
    </div>
  )
}
