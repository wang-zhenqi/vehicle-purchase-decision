import type { AppStateV1 } from '@/domain/types'

export type ValidationIssue = {
  level: 'error' | 'warning'
  message: string
  path?: string
}

export function validateState(state: AppStateV1): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const sumCharge =
    state.globals.homeOffpeakChargePct + state.globals.homePeakChargePct + state.globals.publicChargePct
  if (sumCharge !== 100) {
    issues.push({
      level: 'warning',
      message: `充电占比合计为 ${sumCharge}%（建议调整为 100%，否则加权电价解释会偏离你的真实假设）`,
      path: 'globals.chargeMix',
    })
  }

  if (state.cars.length === 0) {
    issues.push({
      level: 'warning',
      message: '尚未添加任何备选车型：结果页只会显示“继续开宝来”的基线。',
      path: 'cars',
    })
  }

  for (const car of state.cars) {
    if (!car.name.trim()) {
      issues.push({ level: 'error', message: '存在未命名车型', path: `cars.${car.id}.name` })
    }
    if (car.guidePriceCny <= 0) {
      issues.push({ level: 'error', message: `车型「${car.name || car.id}」指导价不合法`, path: `cars.${car.id}.guidePriceCny` })
    }
    if (car.energyType === 'PHEV') {
      if (car.electricityConsumptionKWhPer100km <= 0) {
        issues.push({
          level: 'warning',
          message: `车型「${car.name || car.id}」电耗为 0 或缺失：PHEV 用电段成本将显著偏低`,
          path: `cars.${car.id}.electricityConsumptionKWhPer100km`,
        })
      }
    }
  }

  if (state.globals.loanTermMonths <= 0) {
    issues.push({ level: 'error', message: '贷款期数必须大于 0', path: 'globals.loanTermMonths' })
  }

  return issues
}
