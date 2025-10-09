'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Car, Filter, CalendarDays, Clock, Calendar, Timer, AlertCircle,
  Sparkles, ChevronDown, ChevronUp, DollarSign, CheckCircle,
  Clock4, TrendingUp, Target, Search, X, Building2, Download
} from 'lucide-react'
import { useVehicleLoans, calculatePaymentDetails } from '@/hooks/use-vehicle-loans'
import { useDepartmentOptions, useOwnerOptions, useDeductionDayOptions } from '@/hooks/use-vehicle-filters'
import type { Vehicle, PaymentCalculation } from '@/types/vehicle-loans'
import { formatCurrencyTable, formatNumber, formatDateSA } from '@/lib/formatting'
import { useLocale } from '@/i18n/locale-provider'

// Helper functions for countdown calculation
const getNextDeductionDate = (day: number) => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()

  if (currentDay <= day) {
    return new Date(today.getFullYear(), currentMonth, day)
  } else {
    return new Date(today.getFullYear(), currentMonth + 1, day)
  }
}

const getCountdown = (targetDate: Date) => {
  const diff = targetDate.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  }
}

const getDepartmentColor = (department: string) => {
  switch (department.toLowerCase()) {
    case 'frozen': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    case 'qurban': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'waleed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    case 'mada': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    case 'jebreel': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300'
    case 'team babu': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    case 'hassan': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300'
    case 'osaimi': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
    case 'madinah': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
}

const getDeductionDateColor = (day: number) => {
  switch (day) {
    case 6: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200'
    case 8: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200'
    case 9: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200'
    case 14: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200'
    case 15: return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300 border-cyan-200'
    case 27: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200'
  }
}

// Export function
const exportToCSV = (vehicles: Vehicle[]) => {
  // CSV Headers
  const headers = [
    'Plate Number',
    'Plate Type',
    'Body Type',
    'Vehicle Maker',
    'Vehicle Model',
    'Model Year',
    'Color',
    'Owner',
    'Department',
    'Monthly Installment',
    'Deduction Day',
    'First Installment',
    'Total Months',
    'Last Installment',
    'Paid Months',
    'Paid Amount',
    'Remaining Months',
    'Remaining Amount',
    'Progress %'
  ]

  // Build CSV rows
  const rows = vehicles.map(vehicle => {
    const payment = calculatePaymentDetails(vehicle)
    return [
      vehicle.plate_number,
      vehicle.plate_type,
      vehicle.body_type,
      vehicle.vehicle_maker,
      vehicle.vehicle_model,
      vehicle.model_year,
      vehicle.major_color,
      vehicle.owner_name,
      vehicle.department,
      vehicle.installment,
      vehicle.deduction_day,
      vehicle.first_installment_date,
      vehicle.total_months,
      vehicle.last_installment_date,
      payment.paidMonths,
      payment.paidAmount,
      payment.remainingMonths,
      payment.remainingAmount,
      payment.progressPercentage.toFixed(2)
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `vehicle-instalments-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function VehicleLoanManager() {
  const { t } = useLocale()
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all')
  const [selectedOwner, setSelectedOwner] = React.useState<string>('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('active')
  const [selectedDeductionDay, setSelectedDeductionDay] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [countdownTick, setCountdownTick] = React.useState(0)

  // Real-time countdown update (every minute, isolated from data fetching)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTick(prev => prev + 1)
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  // Fetch data with filters
  const { vehicles, loading, summary } = useVehicleLoans({
    department: selectedDepartment,
    owner: selectedOwner,
    paymentStatus: selectedPaymentStatus,
    deductionDay: selectedDeductionDay !== 'all' ? parseInt(selectedDeductionDay) : undefined,
    searchQuery
  })

  // Get filter options
  const { options: departmentOptions } = useDepartmentOptions()
  const { options: ownerOptions } = useOwnerOptions()
  const { options: deductionDayOptions } = useDeductionDayOptions()

  const toggleRowExpansion = React.useCallback((plateNumber: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(plateNumber)) {
        newSet.delete(plateNumber)
      } else {
        newSet.add(plateNumber)
      }
      return newSet
    })
  }, [])

  // KPI calculations for countdown cards
  const kpiData = React.useMemo(() => {
    const sixthVehicles = vehicles.filter(v => v.deduction_day === 6)
    const midMonthVehicles = vehicles.filter(v => v.deduction_day === 8 || v.deduction_day === 9)
    const midLateVehicles = vehicles.filter(v => v.deduction_day === 14 || v.deduction_day === 15)

    return [
      {
        title: t('vehicleInstalments.kpi.early_month'),
        vehicles: sixthVehicles,
        totalAmount: sixthVehicles.reduce((sum, v) => sum + v.installment, 0),
        nextDate: getNextDeductionDate(6),
        bgGradient: "from-red-400 via-pink-400 to-red-500",
        icon: Clock,
        urgency: true
      },
      {
        title: t('vehicleInstalments.kpi.mid_month'),
        vehicles: midMonthVehicles,
        totalAmount: midMonthVehicles.reduce((sum, v) => sum + v.installment, 0),
        nextDate: getNextDeductionDate(8),
        bgGradient: "from-orange-400 via-amber-400 to-orange-500",
        icon: Calendar,
        urgency: false
      },
      {
        title: t('vehicleInstalments.kpi.mid_late'),
        vehicles: midLateVehicles,
        totalAmount: midLateVehicles.reduce((sum, v) => sum + v.installment, 0),
        nextDate: getNextDeductionDate(14),
        bgGradient: "from-blue-400 via-cyan-400 to-blue-500",
        icon: Timer,
        urgency: false
      }
    ]
  }, [vehicles, t])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vehicleInstalments.kpi.total_vehicles')}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vehicleInstalments.kpi.total_installments')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyTable(summary.totalInstallments)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vehicleInstalments.kpi.departments')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.departments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card with Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>{t('vehicleInstalments.title')}</CardTitle>
              <CardDescription>{t('vehicleInstalments.description')}</CardDescription>
            </div>
            <Button
              onClick={() => exportToCSV(vehicles)}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={vehicles.length === 0}
            >
              <Download className="h-4 w-4" />
              {t('common.export')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                placeholder={t('vehicleInstalments.filters.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 min-h-[44px]"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 h-8 w-8 p-0 transform -translate-y-1/2 min-h-[32px] min-w-[32px]"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-semibold">{t('common.filters')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Department Filter */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('vehicleInstalments.filters.department')}
                </label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Owner Filter */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('vehicleInstalments.filters.owner')}
                </label>
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger className="w-full min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('vehicleInstalments.filters.payment_status')}
                </label>
                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger className="w-full min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Exclude Completed)</SelectItem>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="0-6">Less than 6 months</SelectItem>
                    <SelectItem value="6-12">6 months - 1 year</SelectItem>
                    <SelectItem value="12-18">1 year - 1.5 years</SelectItem>
                    <SelectItem value="18-24">1.5 years - 2 years</SelectItem>
                    <SelectItem value="24-30">2 years - 2.5 years</SelectItem>
                    <SelectItem value="30-36">2.5 years - 3 years</SelectItem>
                    <SelectItem value="36+">More than 3 years</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deduction Day Filter */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('vehicleInstalments.filters.deduction_date')}
                </label>
                <Select value={selectedDeductionDay} onValueChange={setSelectedDeductionDay}>
                  <SelectTrigger className="w-full min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deductionDayOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile View - Summary Card */}
          <div className="md:hidden mb-4">
            <div className="bg-muted/50 border-2 border-primary/20 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('vehicleInstalments.kpi.total_vehicles')}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {vehicles.length} {vehicles.length !== 1 ? 'vehicles' : 'vehicle'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatCurrencyTable(vehicles.reduce((sum: number, v: Vehicle) => sum + v.installment, 0))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('vehicleInstalments.kpi.total_installments')}
              </div>
            </div>
          </div>

          {/* Mobile View - Vehicle Cards */}
          <div className="md:hidden space-y-2.5">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle: Vehicle, index: number) => {
                const payment = vehicle.payment || calculatePaymentDetails(vehicle)
                const isExpanded = expandedRows.has(vehicle.plate_number)

                return (
                  <div
                    key={vehicle.id}
                    className="bg-card border border-border rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Card Header - Clickable */}
                    <div
                      className="p-3 space-y-2.5 cursor-pointer active:bg-muted/50 transition-colors"
                      onClick={() => toggleRowExpansion(vehicle.plate_number)}
                    >
                      {/* Plate & Type */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="text-sm font-bold text-primary truncate">
                            {vehicle.plate_number.split(' (')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({vehicle.plate_number.split(' (')[1]?.replace(')', '')})
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {vehicle.plate_type}
                        </Badge>
                      </div>

                      {/* Vehicle Details */}
                      <div className="text-sm font-medium break-words leading-tight">
                        {vehicle.vehicle_maker} {vehicle.vehicle_model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.body_type} • {vehicle.model_year} • {vehicle.major_color}
                      </div>

                      {/* Department & Owner */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge className={getDepartmentColor(vehicle.department)}>
                          {vehicle.department}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {vehicle.owner_name}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-2 border-t">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {payment.paidMonths}/{vehicle.total_months} months ({payment.progressPercentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={payment.progressPercentage} className="h-2" />
                      </div>

                      {/* Installment & Deduction Day */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                        <div>
                          <div className="text-muted-foreground mb-0.5">Monthly Payment</div>
                          <div className="font-bold text-base text-blue-700 dark:text-blue-400">
                            {formatCurrencyTable(vehicle.installment)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground mb-0.5">Deduction Day</div>
                          <Badge variant="outline" className={`font-mono text-sm ${getDeductionDateColor(vehicle.deduction_day)}`}>
                            {vehicle.deduction_day}th
                          </Badge>
                        </div>
                      </div>

                      {/* Expand Indicator */}
                      <div className="flex justify-center pt-2">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="bg-muted/30 border-t p-3 space-y-3">
                        <PaymentTimelineCard payment={payment} vehicle={vehicle} t={t} />
                        <PaymentStatusCard payment={payment} t={t} />
                        <NextPaymentCard payment={payment} vehicle={vehicle} t={t} />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t('common.no_data')}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <VehicleTable
              vehicles={vehicles}
              expandedRows={expandedRows}
              toggleRowExpansion={toggleRowExpansion}
              t={t}
            />
            {vehicles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t('common.no_data')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Countdown KPI Cards */}
      <CountdownCards kpiData={kpiData} countdownTick={countdownTick} />
    </div>
  )
}

// Extracted VehicleTable component
function VehicleTable({ vehicles, expandedRows, toggleRowExpansion, t }: any) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Expand</TableHead>
            <TableHead className="w-32">{t('vehicleInstalments.table.plate_number')}</TableHead>
            <TableHead className="w-20">Type</TableHead>
            <TableHead>{t('vehicleInstalments.table.vehicle_details')}</TableHead>
            <TableHead>{t('vehicleInstalments.table.owner')}</TableHead>
            <TableHead>{t('vehicleInstalments.table.department')}</TableHead>
            <TableHead>{t('vehicleInstalments.table.payment_status')}</TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {t('vehicleInstalments.table.deduction_date')}
              </div>
            </TableHead>
            <TableHead className="text-right">{t('vehicleInstalments.table.installment')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Total Row */}
          <TableRow className="bg-muted/50 font-semibold border-b-2">
            <TableCell className="text-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </TableCell>
            <TableCell colSpan={4} className="text-lg">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span>Total ({vehicles.length} vehicles)</span>
              </div>
            </TableCell>
            <TableCell className="text-lg">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {vehicles.length > 1 ? 'Multiple' : vehicles[0]?.department || 'N/A'}
              </Badge>
            </TableCell>
            <TableCell className="text-lg">
              <Badge variant="outline" className="text-sm px-3 py-1">Portfolio</Badge>
            </TableCell>
            <TableCell className="text-lg">
              <Badge variant="outline" className="text-sm px-3 py-1">Various</Badge>
            </TableCell>
            <TableCell className="text-right text-lg font-mono">
              <Badge variant="default" className="text-base px-4 py-2 bg-green-600 hover:bg-green-700">
                {formatCurrencyTable(vehicles.reduce((sum: number, v: Vehicle) => sum + v.installment, 0))}
              </Badge>
            </TableCell>
          </TableRow>
          {vehicles.map((vehicle: Vehicle, index: number) => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
              index={index}
              isExpanded={expandedRows.has(vehicle.plate_number)}
              toggleRowExpansion={toggleRowExpansion}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Extracted VehicleRow component
function VehicleRow({ vehicle, index, isExpanded, toggleRowExpansion, t }: any) {
  const payment = vehicle.payment || calculatePaymentDetails(vehicle)
  const isProfit = payment.remainingAmount >= 0

  return (
    <>
      <TableRow
        className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
          isExpanded ? 'bg-muted/40 shadow-sm border-l-4 border-l-primary' : ''
        } ${index % 2 === 0 ? 'bg-muted/10' : 'bg-background'}`}
        onClick={() => toggleRowExpansion(vehicle.plate_number)}
      >
        <TableCell className="py-4 pl-4">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-mono font-medium">
          <div className="space-y-1">
            <div className="text-sm font-bold">
              {vehicle.plate_number.split(' (')[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              ({vehicle.plate_number.split(' (')[1]?.replace(')', '')})
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-xs">{vehicle.plate_type}</Badge>
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <div className="font-medium">{vehicle.vehicle_maker} {vehicle.vehicle_model}</div>
            <div className="text-sm text-muted-foreground">{vehicle.body_type}</div>
            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="text-xs">{vehicle.model_year}</Badge>
              <span className="text-muted-foreground">{vehicle.major_color}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap">
          <div className="text-sm">{vehicle.owner_name}</div>
        </TableCell>
        <TableCell>
          <Badge className={getDepartmentColor(vehicle.department)}>{vehicle.department}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">
                {payment.paidMonths}/{vehicle.total_months} months
              </div>
              <Progress value={payment.progressPercentage} className="h-2 w-20" />
            </div>
            <div className="text-xs text-muted-foreground">{payment.progressPercentage.toFixed(0)}%</div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`font-mono text-sm px-3 py-1 ${getDeductionDateColor(vehicle.deduction_day)}`}>
            {vehicle.deduction_day}th
          </Badge>
        </TableCell>
        <TableCell className="text-right font-mono">
          <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            {formatCurrencyTable(vehicle.installment)}
          </Badge>
        </TableCell>
      </TableRow>

      {/* Expanded Payment Details */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9} className="p-0">
            <div className="bg-gradient-to-r from-muted/30 to-muted/20 border-t-2 border-primary/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PaymentTimelineCard payment={payment} vehicle={vehicle} t={t} />
                <PaymentStatusCard payment={payment} t={t} />
                <NextPaymentCard payment={payment} vehicle={vehicle} t={t} />
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// Helper card components
function PaymentTimelineCard({ payment, vehicle, t }: any) {
  return (
    <Card className="border-blue-300 dark:border-blue-600 shadow-md bg-white dark:bg-gray-900/90">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-blue-600" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
            {t('vehicleInstalments.table.payment_timeline')}
          </h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.start_date')}</span>
            <span className="font-medium">{formatDateSA(vehicle.first_installment_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.end_date')}</span>
            <span className="font-medium">{formatDateSA(vehicle.last_installment_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.duration')}</span>
            <span className="font-medium">{vehicle.total_months} {t('vehicleInstalments.table.months')}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <Progress value={payment.progressPercentage} className="h-3 mb-2" />
            <div className="text-center text-xs text-blue-600 dark:text-blue-400 font-medium">
              {payment.progressPercentage.toFixed(1)}% Complete
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentStatusCard({ payment, t }: any) {
  return (
    <Card className="border-green-300 dark:border-green-600 shadow-md bg-white dark:bg-gray-900/90">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-green-600" />
          <h4 className="font-semibold text-green-900 dark:text-green-100">
            {t('vehicleInstalments.table.payment_status')}
          </h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.paid_amount')}</span>
            <span className="font-medium text-green-600">{formatCurrencyTable(payment.paidAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.total_repayment')}</span>
            <span className="font-medium">{formatCurrencyTable(payment.totalRepayment)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.remaining')}</span>
            <span className="font-medium text-orange-600">{formatCurrencyTable(payment.remainingAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('vehicleInstalments.table.months_left')}</span>
            <span className="font-medium">{payment.remainingMonths} {t('vehicleInstalments.table.months')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NextPaymentCard({ payment, vehicle, t }: any) {
  const isOverdue = payment.isOverdue
  const daysUntilNext = payment.daysUntilNext

  return (
    <Card className={`shadow-md ${
      isOverdue
        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-950/20'
        : daysUntilNext <= 7
          ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
          : 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-900/90'
    }`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Timer className={`h-4 w-4 ${
            isOverdue ? 'text-red-600' : daysUntilNext <= 7 ? 'text-yellow-600' : 'text-blue-600'
          }`} />
          <h4 className={`font-semibold ${
            isOverdue ? 'text-red-900 dark:text-red-100'
            : daysUntilNext <= 7 ? 'text-yellow-900 dark:text-yellow-100'
            : 'text-blue-900 dark:text-blue-100'
          }`}>{t('vehicleInstalments.table.next_payment')}</h4>
        </div>
        <div className="space-y-2 text-sm">
          {payment.remainingMonths > 0 ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('vehicleInstalments.table.due_date')}</span>
                <span className="font-medium">{formatDateSA(payment.nextPaymentDate.toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('vehicleInstalments.table.amount')}</span>
                <span className="font-medium">{formatCurrencyTable(vehicle.installment)}</span>
              </div>
              <div className={`text-center p-2 rounded text-sm font-medium ${
                isOverdue ? 'bg-red-100 text-red-800'
                : daysUntilNext <= 7 ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
              }`}>
                {isOverdue ? (
                  <div className="flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {t('vehicleInstalments.table.overdue')}
                  </div>
                ) : daysUntilNext === 0 ? (
                  <div className="flex items-center justify-center gap-1">
                    <Clock4 className="h-4 w-4" />
                    {t('vehicleInstalments.table.due_today')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <Timer className="h-4 w-4" />
                    {t('vehicleInstalments.table.due_in_days', { days: daysUntilNext })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center p-3 bg-green-100 text-green-800 rounded font-medium flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {t('vehicleInstalments.table.loan_completed')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Countdown Cards
function CountdownCards({ kpiData, countdownTick }: any) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {kpiData.map((kpi: any, index: number) => {
        // countdownTick forces re-calculation every minute
        const countdown = getCountdown(kpi.nextDate)
        const IconComponent = kpi.icon
        const isUrgent = countdown.days <= 3

        return (
          <Card
            key={index}
            className={`relative overflow-hidden backdrop-blur-sm border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
              isUrgent ? 'border-red-300 shadow-red-100' : 'border-white/20 shadow-lg'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-90`} />

            {isUrgent && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
            )}

            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <IconComponent className={`h-6 w-6 ${isUrgent ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{kpi.title}</h3>
                    <p className="text-white/80 text-sm">{kpi.vehicles.length} vehicles</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-4 text-2xl font-bold mb-2">
                  <div className="text-center">
                    <div className="text-3xl">{countdown.days}</div>
                    <div className="text-xs text-white/80">DAYS</div>
                  </div>
                  <div className="text-white/60">:</div>
                  <div className="text-center">
                    <div className="text-3xl">{countdown.hours}</div>
                    <div className="text-xs text-white/80">HRS</div>
                  </div>
                  <div className="text-white/60">:</div>
                  <div className="text-center">
                    <div className="text-3xl">{countdown.minutes}</div>
                    <div className="text-xs text-white/80">MIN</div>
                  </div>
                </div>

                {isUrgent && (
                  <div className="flex items-center gap-1 text-yellow-200 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">URGENT - Due Soon!</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-sm text-white/80">Total Amount</div>
                  <div className="text-xl font-bold">{formatCurrencyTable(kpi.totalAmount)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
