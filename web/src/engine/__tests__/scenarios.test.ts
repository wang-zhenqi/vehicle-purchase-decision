import { describe, expect, it } from 'vitest'

import { buildPlanVariants, FULL_PLAN_GENERATION } from '@/engine/scenarios'
import { newCarDraft } from '@/state/defaults'

describe('buildPlanVariants', () => {
  it('淘汰宝来 + HEV：只有指标落到新车，不出现蓝牌竞价', () => {
    const car = newCarDraft({ energyType: 'HEV' })
    const variants = buildPlanVariants(car, FULL_PLAN_GENERATION).filter((v) => !v.keepBaoLai)
    expect(variants).toHaveLength(1)
    expect(variants[0].newCarPlateMode).toBe('transferBlue')
    expect(variants.some((v) => v.newCarPlateMode === 'auctionBlue')).toBe(false)
  })

  it('淘汰宝来 + PHEV：只有指标落到新车，不出现单独绿牌', () => {
    const car = newCarDraft({ energyType: 'PHEV' })
    const variants = buildPlanVariants(car, FULL_PLAN_GENERATION).filter((v) => !v.keepBaoLai)
    expect(variants).toHaveLength(1)
    expect(variants[0].newCarPlateMode).toBe('transferBlue')
    expect(variants.some((v) => v.newCarPlateMode === 'newGreen')).toBe(false)
  })

  it('保留宝来 + PHEV：可出现绿牌双车与指标迁移', () => {
    const car = newCarDraft({ energyType: 'PHEV' })
    const variants = buildPlanVariants(car, FULL_PLAN_GENERATION).filter((v) => v.keepBaoLai)
    const modes = new Set(variants.map((v) => v.newCarPlateMode))
    expect(modes.has('newGreen')).toBe(true)
    expect(modes.has('transferBlue')).toBe(true)
    expect(modes.has('auctionBlue')).toBe(false)
  })

  it('保留宝来 + HEV：可出现竞价与指标迁移', () => {
    const car = newCarDraft({ energyType: 'HEV' })
    const variants = buildPlanVariants(car, FULL_PLAN_GENERATION).filter((v) => v.keepBaoLai)
    const modes = new Set(variants.map((v) => v.newCarPlateMode))
    expect(modes.has('auctionBlue')).toBe(true)
    expect(modes.has('transferBlue')).toBe(true)
  })
})
