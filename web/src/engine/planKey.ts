import type { PlanVariant } from '@/domain/types'

/** 方案变体在单车内的稳定键（不含车型 id） */
export function planVariantKey(v: PlanVariant): string {
  return `${v.keepBaoLai ? 'K' : 'D'}:${v.newCarPlateMode}`
}

export function rowKeyForCar(carId: string, v: PlanVariant): string {
  return `${carId}:${planVariantKey(v)}`
}
