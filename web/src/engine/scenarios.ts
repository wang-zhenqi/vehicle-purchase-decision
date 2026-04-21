import type { CarDraft, PlanGenerationOptions, PlanVariant } from '@/domain/types'

export function buildPlanVariants(car: CarDraft, opts: PlanGenerationOptions): PlanVariant[] {
  const out: PlanVariant[] = []

  if (opts.includeDropBaoLai) {
    if (car.energyType === 'HEV') {
      if (opts.includeTransfer)
        out.push({ keepBaoLai: false, newCarPlateMode: 'transferBlue', label: '淘汰宝来 + 蓝牌迁入' })
      if (opts.includeAuction)
        out.push({ keepBaoLai: false, newCarPlateMode: 'auctionBlue', label: '淘汰宝来 + 蓝牌竞价' })
      if (opts.includeLottery)
        out.push({ keepBaoLai: false, newCarPlateMode: 'lotteryBlue', label: '淘汰宝来 + 蓝牌摇号' })
    } else {
      if (opts.includeGreen)
        out.push({ keepBaoLai: false, newCarPlateMode: 'newGreen', label: '淘汰宝来 + 直接绿牌' })
      if (opts.includeTransfer)
        out.push({ keepBaoLai: false, newCarPlateMode: 'blueToGreen', label: '淘汰宝来 + 蓝换绿' })
    }
  }

  if (opts.includeKeepBaoLai) {
    if (car.energyType === 'HEV') {
      if (opts.includeAuction)
        out.push({ keepBaoLai: true, newCarPlateMode: 'auctionBlue', label: '保留宝来 + 新蓝牌竞价' })
      if (opts.includeLottery)
        out.push({ keepBaoLai: true, newCarPlateMode: 'lotteryBlue', label: '保留宝来 + 新蓝牌摇号' })
      if (opts.includeTransfer)
        out.push({ keepBaoLai: true, newCarPlateMode: 'transferBlue', label: '保留宝来 + 蓝牌迁入（宝来外地牌）' })
    } else {
      if (opts.includeGreen)
        out.push({ keepBaoLai: true, newCarPlateMode: 'newGreen', label: '保留宝来 + 直接绿牌' })
      if (opts.includeTransfer)
        out.push({ keepBaoLai: true, newCarPlateMode: 'blueToGreen', label: '保留宝来 + 蓝换绿（宝来外地牌）' })
    }
  }

  // De-dupe identical variants (same keep + mode)
  const key = (p: PlanVariant) => `${p.keepBaoLai ? 'K' : 'D'}:${p.newCarPlateMode}`
  const seen = new Set<string>()
  return out.filter((p) => {
    const k = key(p)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
