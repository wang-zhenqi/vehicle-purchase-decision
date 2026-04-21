import { describe, expect, it } from 'vitest'

import { defaultAppState, newCarDraft } from '@/state/defaults'
import { buildPlanVariants } from '@/engine/scenarios'
import { computeBaoLaiCost, computeNewCarCost, landingPrice } from '@/engine/calculator'

describe('calculator engine', () => {
  it('landingPrice matches definition', () => {
    const car = newCarDraft({
      guidePriceCny: 300_000,
      dealerDiscountCny: 20_000,
      purchaseTaxCny: 10_000,
      insuranceYear1Cny: 6_000,
      dealerPlateFeeCny: 500,
      manufacturerSubsidyCny: 8_000,
      oldCarTradeInCny: 5_000,
      otherFeesCny: 1_200,
    })

    const naked = 300_000 - 20_000
    const expected =
      naked + 10_000 + 6_000 + 500 - 8_000 - 5_000 + 1_200

    expect(landingPrice(car)).toBe(expected)
  })

  it('trace total equals computed total (new car)', () => {
    const state = structuredClone(defaultAppState)
    const car = newCarDraft({
      name: 'Test',
      energyType: 'HEV',
      fuelConsumptionLPer100km: 6,
      guidePriceCny: 278_000,
      dealerDiscountCny: 0,
      purchaseTaxCny: 0,
      insuranceYear1Cny: 7_000,
      dealerPlateFeeCny: 500,
      manufacturerSubsidyCny: 0,
      oldCarTradeInCny: 0,
      otherFeesCny: 0,
      residualRate5yPct: 55,
    })

    const v = buildPlanVariants(car, state.planGen)[0]
    const r = computeNewCarCost({ car, globals: state.globals, assumptions: state.assumptions, plan: v, years: 5 })
    expect(Math.round(r.totalTrace.value)).toBe(Math.round(r.total))
  })

  it('trace total equals computed total (baolai baseline)', () => {
    const state = structuredClone(defaultAppState)
    const r = computeBaoLaiCost(state.assumptions, 5)
    expect(Math.round(r.trace.value)).toBe(Math.round(r.total))
  })
})

