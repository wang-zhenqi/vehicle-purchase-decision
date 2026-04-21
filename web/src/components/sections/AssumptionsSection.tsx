import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/state/store'

export function AssumptionsSection() {
  const a = useAppStore((s) => s.assumptions)
  const setA = useAppStore((s) => s.setAssumptions)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">关键假设</div>
        <div className="text-sm text-muted-foreground">
          宝来继续开的年度开销、机会成本、月供红线等。「结果」里用卡片切换不同保留/上牌组合，无需在此勾选枚举开关。
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>继续开宝来（基线）</CardTitle>
          <CardDescription>对应结果页里的“继续开宝来”。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>年均油费（元/年）</Label>
            <Input data-field="assumptions.baolaiAnnualFuelCny" inputMode="numeric" value={a.baolaiAnnualFuelCny} onChange={(e) => setA({ baolaiAnnualFuelCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>年均保险（元/年）</Label>
            <Input data-field="assumptions.baolaiAnnualInsuranceCny" inputMode="numeric" value={a.baolaiAnnualInsuranceCny} onChange={(e) => setA({ baolaiAnnualInsuranceCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>年均维保（元/年）</Label>
            <Input data-field="assumptions.baolaiAnnualMaintenanceCny" inputMode="numeric" value={a.baolaiAnnualMaintenanceCny} onChange={(e) => setA({ baolaiAnnualMaintenanceCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>若卖出：估计残值（元）</Label>
            <Input data-field="assumptions.baolaiResidualIfSoldCny" inputMode="numeric" value={a.baolaiResidualIfSoldCny} onChange={(e) => setA({ baolaiResidualIfSoldCny: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <Label>大修风险准备金（元/年）</Label>
            <Input data-field="assumptions.baolaiRepairReserveCnyPerYear" inputMode="numeric" value={a.baolaiRepairReserveCnyPerYear} onChange={(e) => setA({ baolaiRepairReserveCnyPerYear: Number(e.target.value) })} />
            <div className="mt-1 text-xs text-muted-foreground">这是“每年预留”，用于模拟老车突发大修风险；你可以按保守/激进调整。</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>新车成本模型的简化规则</CardTitle>
          <CardDescription>这些规则的目的，是让模型在第一期就能跑通；后续可以改成按年曲线/分项录入。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>机会成本年化收益率（%）</Label>
            <Input data-field="assumptions.opportunityCostAnnualRatePct" inputMode="decimal" value={a.opportunityCostAnnualRatePct} onChange={(e) => setA({ opportunityCostAnnualRatePct: Number(e.target.value) })} />
          </div>
          <div>
            <Label>新车保险：年均相对首年的系数</Label>
            <Input
              data-field="assumptions.newCarInsuranceAvgFactorOfYear1"
              inputMode="decimal"
              value={a.newCarInsuranceAvgFactorOfYear1}
              onChange={(e) => setA({ newCarInsuranceAvgFactorOfYear1: Number(e.target.value) })}
            />
            <div className="mt-1 text-xs text-muted-foreground">默认 0.85：年均保险 ≈ 首年保险 × 0.85。</div>
          </div>
          <div className="sm:col-span-2">
            <Label>新车维保：每年占落地价比例（小数）</Label>
            <Input
              data-field="assumptions.newCarMaintenanceRateOfLandingPerYear"
              inputMode="decimal"
              value={a.newCarMaintenanceRateOfLandingPerYear}
              onChange={(e) => setA({ newCarMaintenanceRateOfLandingPerYear: Number(e.target.value) })}
            />
            <div className="mt-1 text-xs text-muted-foreground">默认 0.008：每年维保 ≈ 落地价 × 0.8%。若车型卡片填写了“年均维保覆盖”，将优先生效。</div>
          </div>
          <div>
            <Label>月供红线（元/月，用于结果提示）</Label>
            <Input data-field="assumptions.monthlyPaymentLimitCny" inputMode="numeric" value={a.monthlyPaymentLimitCny} onChange={(e) => setA({ monthlyPaymentLimitCny: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Separator />
    </div>
  )
}
