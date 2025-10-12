"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VendorAgingBalance } from "@/components/vendors/vendor-aging-balance"
import { VendorKPICards } from "@/components/vendors/vendor-kpi-cards"
import { LocationFilter } from "@/components/filters/location-filter"
import { useLocationFilter } from "@/contexts/location-filter-context"
import { useLocale } from "@/i18n/locale-provider"

export default function VendorsPage() {
  const { t } = useLocale()
  const { selectedLocations } = useLocationFilter()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 mb-6 w-full max-w-full overflow-x-hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{t("pages.vendors.title")}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("pages.vendors.description")}
          </p>
        </div>

        {/* Master Location Filter */}
        <div className="bg-muted/30 p-4 rounded-lg border">
          <LocationFilter excludeChildLocations={true} />
        </div>
      </div>

      {/* Vendor Dashboard Components */}
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* KPI Cards Row */}
        <VendorKPICards locationIds={selectedLocations} />

        {/* Vendor Aging Balance */}
        <VendorAgingBalance locationIds={selectedLocations} />
      </div>
    </DashboardLayout>
  )
}