"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VehicleLoanManager } from "@/components/vehicle-instalments/vehicle-loan-manager"
import { useLocale } from "@/i18n/locale-provider"

export default function VehicleInstalmentsPage() {
  const { t } = useLocale()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t("vehicleInstalments.title")}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t("vehicleInstalments.description")}</p>
        </div>

        <VehicleLoanManager />
      </div>
    </DashboardLayout>
  )
}
