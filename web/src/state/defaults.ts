import type { AppStateV1, CarDraft } from '@/domain/types'

export function newCarDraft(partial?: Partial<CarDraft>): CarDraft {
  const id = partial?.id ?? crypto.randomUUID()
  return {
    id,
    name: partial?.name ?? '新车方案',
    energyType: partial?.energyType ?? 'PHEV',

    fuelConsumptionLPer100km: partial?.fuelConsumptionLPer100km ?? 6.5,
    electricityConsumptionKWhPer100km: partial?.electricityConsumptionKWhPer100km ?? 18,
    phevElectricKmRatioPct: partial?.phevElectricKmRatioPct ?? 70,

    guidePriceCny: partial?.guidePriceCny ?? 280_000,
    dealerDiscountCny: partial?.dealerDiscountCny ?? 30_000,
    purchaseTaxCny: partial?.purchaseTaxCny ?? 0,
    insuranceYear1Cny: partial?.insuranceYear1Cny ?? 5_500,
    dealerPlateFeeCny: partial?.dealerPlateFeeCny ?? 500,
    manufacturerSubsidyCny: partial?.manufacturerSubsidyCny ?? 10_000,
    oldCarTradeInCny: partial?.oldCarTradeInCny ?? 0,
    otherFeesCny: partial?.otherFeesCny ?? 0,

    residualRate5yPct: partial?.residualRate5yPct ?? 55,

    annualInsuranceCny: partial?.annualInsuranceCny,
    annualMaintenanceCny: partial?.annualMaintenanceCny,
  }
}

export const defaultAppState: AppStateV1 = {
  schemaVersion: 1,
  cars: [],
  globals: {
    annualMileageKm: 10_125,
    oilPriceCnyPerL: 7.5,

    homeOffpeakPowerCnyPerKwh: 0.3,
    homePeakPowerCnyPerKwh: 0.6,
    publicPowerCnyPerKwh: 1.2,
    homeOffpeakChargePct: 70,
    homePeakChargePct: 15,
    publicChargePct: 15,

    loanMonthlyRatePct: 0.25,
    downPaymentPct: 50,
    loanTermMonths: 60,

    bluePlateAuctionAvgCny: 15_442,
    greenPlateFeeCny: 500,
    plateTransferFeeCny: 500,
    zhongshanPlateFeeCny: 1000,
    bluePlateLotteryWaitMonths: 6,

    plateWaitInconvenienceCnyPerMonth: 0,
    plateProcessHourlyValueCny: 200,
    plateProcessHoursTransfer: 2,
    plateProcessHoursAuction: 2,
    plateProcessHoursLottery: 1,
    plateProcessHoursGreen: 1,
    plateProcessHoursBlueToGreen: 2,
  },
  assumptions: {
    baolaiAnnualInsuranceCny: 2604,
    baolaiAnnualFuelCny: 7444,
    baolaiAnnualMaintenanceCny: 2400,
    baolaiResidualIfSoldCny: 8000,
    baolaiRepairReserveCnyPerYear: 3500,

    opportunityCostAnnualRatePct: 3,

    newCarInsuranceAvgFactorOfYear1: 0.85,
    newCarMaintenanceRateOfLandingPerYear: 0.008,

    monthlyPaymentLimitCny: 3000,
  },
  planGen: {
    includeKeepBaoLai: true,
    includeDropBaoLai: true,
    includeTransfer: true,
    includeAuction: true,
    includeLottery: true,
    includeGreen: true,
  },
}
