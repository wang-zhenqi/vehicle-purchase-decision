export type EnergyType = 'HEV' | 'PHEV'

export type NewCarPlateMode =
  | 'transferBlue'
  | 'auctionBlue'
  | 'lotteryBlue'
  | 'newGreen'
  | 'blueToGreen'

export type CarDraft = {
  id: string
  name: string
  energyType: EnergyType

  fuelConsumptionLPer100km: number
  electricityConsumptionKWhPer100km: number
  phevElectricKmRatioPct: number

  guidePriceCny: number
  dealerDiscountCny: number
  purchaseTaxCny: number
  insuranceYear1Cny: number
  dealerPlateFeeCny: number
  manufacturerSubsidyCny: number
  oldCarTradeInCny: number
  otherFeesCny: number

  residualRate5yPct: number

  // Optional knobs (defaults fall back to globals)
  annualInsuranceCny?: number
  annualMaintenanceCny?: number
}

export type GlobalParams = {
  annualMileageKm: number
  oilPriceCnyPerL: number

  homeOffpeakPowerCnyPerKwh: number
  homePeakPowerCnyPerKwh: number
  publicPowerCnyPerKwh: number
  homeOffpeakChargePct: number
  homePeakChargePct: number
  publicChargePct: number

  loanMonthlyRatePct: number
  downPaymentPct: number
  loanTermMonths: number

  bluePlateAuctionAvgCny: number
  greenPlateFeeCny: number
  plateTransferFeeCny: number
  zhongshanPlateFeeCny: number
  bluePlateLotteryWaitMonths: number
}

export type Assumptions = {
  baolaiAnnualInsuranceCny: number
  baolaiAnnualFuelCny: number
  baolaiAnnualMaintenanceCny: number
  baolaiResidualIfSoldCny: number
  baolaiRepairReserveCnyPerYear: number

  opportunityCostAnnualRatePct: number

  newCarInsuranceAvgFactorOfYear1: number // e.g. 0.85
  newCarMaintenanceRateOfLandingPerYear: number // e.g. 0.008 means 0.8%/yr of landing

  monthlyPaymentLimitCny: number
}

export type PlanGenerationOptions = {
  includeKeepBaoLai: boolean
  includeDropBaoLai: boolean
  includeTransfer: boolean
  includeAuction: boolean
  includeLottery: boolean
  includeGreen: boolean
}

export type PlanVariant = {
  keepBaoLai: boolean
  newCarPlateMode: NewCarPlateMode
  label: string
}

export type AppStateV1 = {
  schemaVersion: 1
  cars: CarDraft[]
  globals: GlobalParams
  assumptions: Assumptions
  planGen: PlanGenerationOptions
}
