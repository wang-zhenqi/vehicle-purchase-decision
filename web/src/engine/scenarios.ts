import type { CarDraft, PlanGenerationOptions, PlanVariant } from '@/domain/types'

/**
 * 方案枚举（家庭约束：不放弃现有蓝牌指标）
 *
 * - 淘汰宝来：指标必须落到新车上 → 仅「蓝牌迁入/指标迁移」类（transferBlue），不会出现「再竞价一张蓝牌」或「单独上绿牌丢蓝牌」。
 * - 保留宝来 + HEV：第二张车需蓝牌 → 竞价（auctionBlue）；或宝来挂外地、指标迁新车（transferBlue）。
 * - 保留宝来 + PHEV：双车常见为宝来蓝牌 + 新车绿牌（newGreen）；若要把指标挂到 PHEV 上且宝来外地牌，用 transferBlue（费用口径同迁移费，非深圳「蓝换绿」政策路径）。
 */
export function buildPlanVariants(car: CarDraft, opts: PlanGenerationOptions): PlanVariant[] {
  const out: PlanVariant[] = []

  if (opts.includeDropBaoLai && opts.includeTransfer) {
    if (car.energyType === 'HEV') {
      out.push({ keepBaoLai: false, newCarPlateMode: 'transferBlue', label: '淘汰宝来 + 蓝牌指标落到新车（HEV）' })
    } else {
      out.push({
        keepBaoLai: false,
        newCarPlateMode: 'transferBlue',
        label: '淘汰宝来 + 蓝牌指标落到新车（PHEV，保留蓝牌口径）',
      })
    }
  }

  if (opts.includeKeepBaoLai) {
    if (car.energyType === 'HEV') {
      if (opts.includeAuction)
        out.push({ keepBaoLai: true, newCarPlateMode: 'auctionBlue', label: '保留宝来 + 新蓝牌竞价（第二张蓝牌）' })
      if (opts.includeTransfer)
        out.push({
          keepBaoLai: true,
          newCarPlateMode: 'transferBlue',
          label: '保留宝来 + 蓝牌指标迁到新车（宝来挂外地牌，HEV）',
        })
    } else {
      if (opts.includeGreen)
        out.push({ keepBaoLai: true, newCarPlateMode: 'newGreen', label: '保留宝来 + 新车直接绿牌（双车）' })
      if (opts.includeTransfer)
        out.push({
          keepBaoLai: true,
          newCarPlateMode: 'transferBlue',
          label: '保留宝来 + 蓝牌指标迁到新车（宝来挂外地牌，PHEV）',
        })
    }
  }

  const key = (p: PlanVariant) => `${p.keepBaoLai ? 'K' : 'D'}:${p.newCarPlateMode}`
  const seen = new Set<string>()
  return out.filter((p) => {
    const k = key(p)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
