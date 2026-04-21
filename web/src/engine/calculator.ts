import type { Assumptions, CarDraft, GlobalParams, PlanVariant } from '@/domain/types'
import { monthlyPayment, totalLoanPayments, clamp01, clampNonNegative } from '@/engine/math'
import { leafNumber, nextTraceId, node, resetTraceIds, type TraceNode } from '@/engine/trace'

export function landingPrice(car: CarDraft) {
  const naked = car.guidePriceCny - car.dealerDiscountCny
  return (
    naked +
    car.purchaseTaxCny +
    car.insuranceYear1Cny +
    car.dealerPlateFeeCny -
    car.manufacturerSubsidyCny -
    car.oldCarTradeInCny +
    car.otherFeesCny
  )
}

export function traceLandingPrice(car: CarDraft): TraceNode {
  const naked = car.guidePriceCny - car.dealerDiscountCny
  const p = (field: string) => `cars.${car.id}.${field}`
  return node({
    id: nextTraceId('landing'),
    label: '落地价（不含牌照策略增量）',
    unit: 'CNY',
    value: landingPrice(car),
    formula:
      '裸车(指导价-优惠)+购置税+首年保险+店端上牌费-置换补贴-旧车折抵+其他费用',
    children: [
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '指导价',
        unit: 'CNY',
        value: car.guidePriceCny,
        sources: [{ kind: 'input', path: p('guidePriceCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '厂家优惠',
        unit: 'CNY',
        value: car.dealerDiscountCny,
        sources: [{ kind: 'input', path: p('dealerDiscountCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '购置税',
        unit: 'CNY',
        value: car.purchaseTaxCny,
        sources: [{ kind: 'input', path: p('purchaseTaxCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '首年保险',
        unit: 'CNY',
        value: car.insuranceYear1Cny,
        sources: [{ kind: 'input', path: p('insuranceYear1Cny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '店端上牌费',
        unit: 'CNY',
        value: car.dealerPlateFeeCny,
        sources: [{ kind: 'input', path: p('dealerPlateFeeCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '厂家置换补贴',
        unit: 'CNY',
        value: car.manufacturerSubsidyCny,
        sources: [{ kind: 'input', path: p('manufacturerSubsidyCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '旧车折抵',
        unit: 'CNY',
        value: car.oldCarTradeInCny,
        sources: [{ kind: 'input', path: p('oldCarTradeInCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_in'),
        label: '其他费用',
        unit: 'CNY',
        value: car.otherFeesCny,
        sources: [{ kind: 'input', path: p('otherFeesCny') }],
      }),
      leafNumber({
        id: nextTraceId('lp_mid'),
        label: '裸车价（中间量）',
        unit: 'CNY',
        value: naked,
        formula: '指导价 - 厂家优惠',
        children: undefined,
      }),
    ],
  })
}

export function weightedElectricityPriceCnyPerKwh(g: GlobalParams): TraceNode {
  const sumPct = g.homeOffpeakChargePct + g.homePeakChargePct + g.publicChargePct
  const w =
    sumPct > 0
      ? (g.homeOffpeakPowerCnyPerKwh * g.homeOffpeakChargePct +
          g.homePeakPowerCnyPerKwh * g.homePeakChargePct +
          g.publicPowerCnyPerKwh * g.publicChargePct) /
        sumPct
      : 0

  return node({
    id: nextTraceId('p_e'),
    label: '加权电价（按充电场景占比）',
    unit: 'CNY/kWh',
    value: w,
    formula: '(谷价*谷占比 + 峰价*峰占比 + 公共价*公共占比) / (占比合计)',
    children: [
      leafNumber({
        id: nextTraceId('p_e_in'),
        label: '谷时电价',
        unit: 'CNY/kWh',
        value: g.homeOffpeakPowerCnyPerKwh,
        sources: [{ kind: 'global', path: 'globals.homeOffpeakPowerCnyPerKwh' }],
      }),
      leafNumber({
        id: nextTraceId('p_e_in'),
        label: '峰时电价',
        unit: 'CNY/kWh',
        value: g.homePeakPowerCnyPerKwh,
        sources: [{ kind: 'global', path: 'globals.homePeakPowerCnyPerKwh' }],
      }),
      leafNumber({
        id: nextTraceId('p_e_in'),
        label: '公共桩电价',
        unit: 'CNY/kWh',
        value: g.publicPowerCnyPerKwh,
        sources: [{ kind: 'global', path: 'globals.publicPowerCnyPerKwh' }],
      }),
      leafNumber({
        id: nextTraceId('p_e_in'),
        label: '谷时充电占比',
        unit: '%',
        value: g.homeOffpeakChargePct,
        sources: [{ kind: 'global', path: 'globals.homeOffpeakChargePct' }],
      }),
      leafNumber({
        id: nextTraceId('p_e_in'),
        label: '峰时充电占比',
        unit: '%',
        value: g.homePeakChargePct,
        sources: [{ kind: 'global', path: 'globals.homePeakChargePct' }],
      }),
      leafNumber({
        id: nextTraceId('p_e_in'),
        label: '公共充电占比',
        unit: '%',
        value: g.publicChargePct,
        sources: [{ kind: 'global', path: 'globals.publicChargePct' }],
      }),
      leafNumber({
        id: nextTraceId('p_e_mid'),
        label: '占比合计',
        unit: '%',
        value: sumPct,
        formula: '谷占比+峰占比+公共占比',
      }),
    ],
  })
}

export function plateCostTrace(args: {
  energyType: CarDraft['energyType']
  keepBaoLai: boolean
  mode: PlanVariant['newCarPlateMode']
  g: GlobalParams
}): { total: number; trace: TraceNode } {
  const { energyType, keepBaoLai, mode, g } = args

  let newCar = 0
  let baolaiExtra = 0

  if (energyType === 'HEV') {
    if (mode === 'transferBlue') newCar = g.plateTransferFeeCny
    else if (mode === 'auctionBlue') newCar = g.bluePlateAuctionAvgCny
    else if (mode === 'lotteryBlue') newCar = 0
  } else {
    if (mode === 'newGreen') newCar = g.greenPlateFeeCny
    else if (mode === 'blueToGreen') newCar = g.plateTransferFeeCny
  }

  const migrating = mode === 'transferBlue' || mode === 'blueToGreen'
  if (keepBaoLai && migrating) baolaiExtra = g.zhongshanPlateFeeCny

  const total = newCar + baolaiExtra

  return {
    total,
    trace: node({
      id: nextTraceId('plate'),
      label: '牌照相关费用（新车 + 可能的宝来外地牌）',
      unit: 'CNY',
      value: total,
      formula: 'newCarPlateCost + baolaiExtraPlateCost',
      children: [
        leafNumber({
          id: nextTraceId('plate_in'),
          label: '新车上牌/竞价/迁移费用（按模式）',
          unit: 'CNY',
          value: newCar,
          sources: [
            { kind: 'global', path: 'globals.bluePlateAuctionAvgCny' },
            { kind: 'global', path: 'globals.greenPlateFeeCny' },
            { kind: 'global', path: 'globals.plateTransferFeeCny' },
          ],
        }),
        leafNumber({
          id: nextTraceId('plate_in'),
          label: '宝来外地牌（保留且发生指标迁移/蓝换绿时）',
          unit: 'CNY',
          value: baolaiExtra,
          sources: [{ kind: 'global', path: 'globals.zhongshanPlateFeeCny' }],
        }),
      ],
    }),
  }
}

export type NewCarCostResult = {
  years: number
  landing: number
  landingTrace: TraceNode
  plate: number
  plateTrace: TraceNode
  baolaiRecovery: number
  loanPrincipal: number
  monthlyPayment: number
  loanInterest: number
  opportunityCost: number
  energy: number
  energyTrace: TraceNode
  insurance: number
  maintenance: number
  residual: number
  total: number
  totalTrace: TraceNode
}

export function computeNewCarCost(args: {
  car: CarDraft
  globals: GlobalParams
  assumptions: Assumptions
  plan: PlanVariant
  years: number
}): NewCarCostResult {
  resetTraceIds()
  const { car, globals, assumptions, plan, years } = args
  const cp = (field: string) => `cars.${car.id}.${field}`

  const y = Math.max(0, years)
  const landing = landingPrice(car)
  const landingTrace = traceLandingPrice(car)

  const plate = plateCostTrace({
    energyType: car.energyType,
    keepBaoLai: plan.keepBaoLai,
    mode: plan.newCarPlateMode,
    g: globals,
  })

  const baolaiRecovery = plan.keepBaoLai ? 0 : assumptions.baolaiResidualIfSoldCny

  const downPayment = landing * clamp01(globals.downPaymentPct / 100)
  const loanPrincipal = clampNonNegative(landing - downPayment)
  const monthlyRate = globals.loanMonthlyRatePct / 100
  const months = Math.max(0, globals.loanTermMonths)
  const pay = monthlyPayment(loanPrincipal, monthlyRate, months)
  const totalPaid = totalLoanPayments(pay, months)
  const loanInterest = clampNonNegative(totalPaid - loanPrincipal)

  const opportunityCost = downPayment * (assumptions.opportunityCostAnnualRatePct / 100) * y

  const annualKm = clampNonNegative(globals.annualMileageKm)
  const oilPrice = clampNonNegative(globals.oilPriceCnyPerL)

  const elecPriceNode = weightedElectricityPriceCnyPerKwh(globals)
  const elecPrice = elecPriceNode.value

  let energy = 0
  let energyTrace: TraceNode

  if (car.energyType === 'HEV') {
    const litersPerKm = clampNonNegative(car.fuelConsumptionLPer100km) / 100
    energy = annualKm * litersPerKm * oilPrice * y
    energyTrace = node({
      id: nextTraceId('energy'),
      label: `${y}年能耗（HEV，全里程燃油）`,
      unit: 'CNY',
      value: energy,
      formula: '年均里程 * (L/100km/100) * 油价 * 年数',
      children: [
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '年均里程',
          unit: 'km/年',
          value: annualKm,
          sources: [{ kind: 'global', path: 'globals.annualMileageKm' }],
        }),
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '油耗',
          unit: 'L/100km',
          value: car.fuelConsumptionLPer100km,
          sources: [{ kind: 'input', path: cp('fuelConsumptionLPer100km') }],
        }),
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '油价',
          unit: 'CNY/L',
          value: oilPrice,
          sources: [{ kind: 'global', path: 'globals.oilPriceCnyPerL' }],
        }),
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '年数',
          unit: '年',
          value: y,
          sources: [{ kind: 'constant', note: '函数参数 years' }],
        }),
      ],
    })
  } else {
    const ratio = clamp01(car.phevElectricKmRatioPct / 100)
    const oilKmRatio = 1 - ratio
    const litersPerKm = clampNonNegative(car.fuelConsumptionLPer100km) / 100
    const kwhPerKm = clampNonNegative(car.electricityConsumptionKWhPer100km) / 100

    const fuelPart = annualKm * oilKmRatio * litersPerKm * oilPrice * y
    const elecPart = annualKm * ratio * kwhPerKm * elecPrice * y
    energy = fuelPart + elecPart

    energyTrace = node({
      id: nextTraceId('energy'),
      label: `${y}年能耗（PHEV，按用电里程占比拆分）`,
      unit: 'CNY',
      value: energy,
      formula: '燃油段 + 用电段',
      children: [
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '用电里程占比',
          unit: '%',
          value: car.phevElectricKmRatioPct,
          sources: [{ kind: 'input', path: cp('phevElectricKmRatioPct') }],
        }),
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '油耗',
          unit: 'L/100km',
          value: car.fuelConsumptionLPer100km,
          sources: [{ kind: 'input', path: cp('fuelConsumptionLPer100km') }],
        }),
        leafNumber({
          id: nextTraceId('energy_in'),
          label: '电耗',
          unit: 'kWh/100km',
          value: car.electricityConsumptionKWhPer100km,
          sources: [{ kind: 'input', path: cp('electricityConsumptionKWhPer100km') }],
        }),
        node({
          id: nextTraceId('energy_mid'),
          label: '燃油段成本',
          unit: 'CNY',
          value: fuelPart,
          formula: '年均里程 * 燃油里程占比 * (L/100km/100) * 油价 * 年数',
          children: [
            leafNumber({
              id: nextTraceId('energy_in'),
              label: '燃油里程占比（中间量）',
              unit: 'ratio',
              value: oilKmRatio,
              formula: '1 - 用电里程占比',
            }),
          ],
        }),
        node({
          id: nextTraceId('energy_mid'),
          label: '用电段成本',
          unit: 'CNY',
          value: elecPart,
          formula: '年均里程 * 用电里程占比 * (kWh/100km/100) * 加权电价 * 年数',
          children: [elecPriceNode],
        }),
      ],
    })
  }

  const avgInsurance =
    car.annualInsuranceCny ?? car.insuranceYear1Cny * assumptions.newCarInsuranceAvgFactorOfYear1
  const insurance = avgInsurance * y

  const maintenanceRate = car.annualMaintenanceCny
    ? car.annualMaintenanceCny / Math.max(1, landing)
    : assumptions.newCarMaintenanceRateOfLandingPerYear
  const maintenance = landing * maintenanceRate * y

  const residual = landing * clamp01(car.residualRate5yPct / 100)

  const total =
    landing +
    plate.total -
    baolaiRecovery +
    loanInterest +
    opportunityCost +
    energy +
    insurance +
    maintenance -
    residual

  const totalTrace = node({
    id: nextTraceId('total'),
    label: `${y}年总成本（简化模型）`,
    unit: 'CNY',
    value: total,
    formula:
      '落地价 + 牌照 - 淘汰宝来残值回收 + 贷款利息 + 机会成本 + 能耗 + 保险 + 维保 - 残值（注意：贷款本金偿还不计入费用）',
    children: [
      landingTrace,
      plate.trace,
      leafNumber({
        id: nextTraceId('total_in'),
        label: '淘汰宝来残值回收（若保留则为0）',
        unit: 'CNY',
        value: baolaiRecovery,
        sources: [{ kind: 'assumption', path: 'assumptions.baolaiResidualIfSoldCny' }],
      }),
      leafNumber({
        id: nextTraceId('total_in'),
        label: '贷款利息（按月息等额本息，期数用全局贷款期）',
        unit: 'CNY',
        value: loanInterest,
      }),
      leafNumber({
        id: nextTraceId('total_in'),
        label: '首付机会成本（线性：首付×年化×年数）',
        unit: 'CNY',
        value: opportunityCost,
      }),
      energyTrace,
      leafNumber({
        id: nextTraceId('total_in'),
        label: '保险（年均×年数）',
        unit: 'CNY',
        value: insurance,
      }),
      leafNumber({
        id: nextTraceId('total_in'),
        label: '维保（按落地价比例×年数，或车型覆盖）',
        unit: 'CNY',
        value: maintenance,
      }),
      leafNumber({
        id: nextTraceId('total_in'),
        label: '残值（按落地价×保值率）',
        unit: 'CNY',
        value: residual,
      }),
    ],
  })

  return {
    years: y,
    landing,
    landingTrace,
    plate: plate.total,
    plateTrace: plate.trace,
    baolaiRecovery,
    loanPrincipal,
    monthlyPayment: pay,
    loanInterest,
    opportunityCost,
    energy,
    energyTrace,
    insurance,
    maintenance,
    residual,
    total,
    totalTrace,
  }
}

export type BaoLaiCostResult = {
  total: number
  trace: TraceNode
}

export function computeBaoLaiCost(a: Assumptions, years: number): BaoLaiCostResult {
  resetTraceIds()
  const y = Math.max(0, years)

  const fuel = a.baolaiAnnualFuelCny * y
  const ins = a.baolaiAnnualInsuranceCny * y
  const maint = a.baolaiAnnualMaintenanceCny * y
  const risk = a.baolaiRepairReserveCnyPerYear * y

  const residualRate = Math.pow(0.85, y)
  const residual = a.baolaiResidualIfSoldCny * residualRate

  const total = fuel + ins + maint + risk - residual

  return {
    total,
    trace: node({
      id: nextTraceId('baolai'),
      label: `${y}年宝来基线总成本`,
      unit: 'CNY',
      value: total,
      formula: '油费+保险+维保+大修准备金-残值（残值按年折旧模型）',
      children: [
        leafNumber({
          id: nextTraceId('bl_in'),
          label: '年均油费',
          unit: 'CNY/年',
          value: a.baolaiAnnualFuelCny,
          sources: [{ kind: 'assumption', path: 'assumptions.baolaiAnnualFuelCny' }],
        }),
        leafNumber({
          id: nextTraceId('bl_in'),
          label: '年均保险',
          unit: 'CNY/年',
          value: a.baolaiAnnualInsuranceCny,
          sources: [{ kind: 'assumption', path: 'assumptions.baolaiAnnualInsuranceCny' }],
        }),
        leafNumber({
          id: nextTraceId('bl_in'),
          label: '年均维保',
          unit: 'CNY/年',
          value: a.baolaiAnnualMaintenanceCny,
          sources: [{ kind: 'assumption', path: 'assumptions.baolaiAnnualMaintenanceCny' }],
        }),
        leafNumber({
          id: nextTraceId('bl_in'),
          label: '大修风险准备金',
          unit: 'CNY/年',
          value: a.baolaiRepairReserveCnyPerYear,
          sources: [{ kind: 'assumption', path: 'assumptions.baolaiRepairReserveCnyPerYear' }],
        }),
        leafNumber({
          id: nextTraceId('bl_in'),
          label: '年数',
          unit: '年',
          value: y,
          sources: [{ kind: 'constant', note: '函数参数 years' }],
        }),
        node({
          id: nextTraceId('bl_mid'),
          label: '期末残值（模型）',
          unit: 'CNY',
          value: residual,
          formula: 'baolaiResidualIfSoldCny * 0.85^years',
          children: [
            leafNumber({
              id: nextTraceId('bl_in'),
              label: '当前估计残值（卖出价）',
              unit: 'CNY',
              value: a.baolaiResidualIfSoldCny,
              sources: [{ kind: 'assumption', path: 'assumptions.baolaiResidualIfSoldCny' }],
            }),
            leafNumber({
              id: nextTraceId('bl_mid'),
              label: '折旧因子',
              unit: 'ratio',
              value: residualRate,
              formula: '0.85^years',
              sources: [{ kind: 'constant', note: '模型假设：每年15%递减' }],
            }),
          ],
        }),
      ],
    }),
  }
}
