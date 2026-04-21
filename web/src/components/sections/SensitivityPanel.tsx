import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Assumptions, CarDraft, GlobalParams, PlanVariant } from '@/domain/types'
import { computeNewCarCost } from '@/engine/calculator'

type SelectedPlan = {
  car: CarDraft
  variant: PlanVariant
  title: string
  total5: number
}

type ParamKey =
  | 'globals.oilPriceCnyPerL'
  | 'globals.annualMileageKm'
  | 'globals.loanMonthlyRatePct'
  | 'assumptions.opportunityCostAnnualRatePct'
  | 'car.residualRate5yPct'
  | 'car.phevElectricKmRatioPct'

const paramMeta: Record<
  ParamKey,
  { label: string; unit: string; applies: (p: SelectedPlan) => boolean }
> = {
  'globals.oilPriceCnyPerL': { label: '油价', unit: '元/L', applies: () => true },
  'globals.annualMileageKm': { label: '年均里程', unit: 'km/年', applies: () => true },
  'globals.loanMonthlyRatePct': { label: '贷款月息', unit: '%', applies: () => true },
  'assumptions.opportunityCostAnnualRatePct': { label: '机会成本收益率', unit: '%/年', applies: () => true },
  'car.residualRate5yPct': { label: '5年保值率', unit: '%', applies: () => true },
  'car.phevElectricKmRatioPct': { label: '用电里程占比', unit: '%', applies: (p) => p.car.energyType === 'PHEV' },
}

function applyDelta(base: number, deltaPct: number) {
  return base * (1 + deltaPct / 100)
}

function formatCny(n: number) {
  return Math.round(n).toLocaleString('zh-CN')
}

export function SensitivityPanel({
  selected,
  globals,
  assumptions,
  onClear,
}: {
  selected: SelectedPlan | null
  globals: GlobalParams
  assumptions: Assumptions
  onClear: () => void
}) {
  const [deltaPct, setDeltaPct] = useState(10)
  const [enabled, setEnabled] = useState<Record<ParamKey, boolean>>({
    'globals.oilPriceCnyPerL': true,
    'globals.annualMileageKm': true,
    'globals.loanMonthlyRatePct': false,
    'assumptions.opportunityCostAnnualRatePct': false,
    'car.residualRate5yPct': true,
    'car.phevElectricKmRatioPct': false,
  })

  const rows = useMemo(() => {
    if (!selected) return []

    const p = selected
    const keys = (Object.keys(enabled) as ParamKey[])
      .filter((k) => enabled[k])
      .filter((k) => paramMeta[k].applies(p))

    return keys.map((key) => {
      const baseTotal = p.total5

      const lower = computeWithParam(key, -Math.abs(deltaPct))
      const upper = computeWithParam(key, +Math.abs(deltaPct))

      const lowerDelta = lower.total - baseTotal
      const upperDelta = upper.total - baseTotal

      return {
        key,
        label: paramMeta[key].label,
        unit: paramMeta[key].unit,
        lowerTotal: lower.total,
        upperTotal: upper.total,
        lowerDelta,
        upperDelta,
      }

      function computeWithParam(k: ParamKey, dPct: number) {
        const g2: GlobalParams = { ...globals }
        const a2: Assumptions = { ...assumptions }
        const c2: CarDraft = { ...p.car }

        if (k === 'globals.oilPriceCnyPerL') g2.oilPriceCnyPerL = applyDelta(g2.oilPriceCnyPerL, dPct)
        if (k === 'globals.annualMileageKm') g2.annualMileageKm = applyDelta(g2.annualMileageKm, dPct)
        if (k === 'globals.loanMonthlyRatePct') g2.loanMonthlyRatePct = applyDelta(g2.loanMonthlyRatePct, dPct)
        if (k === 'assumptions.opportunityCostAnnualRatePct')
          a2.opportunityCostAnnualRatePct = applyDelta(a2.opportunityCostAnnualRatePct, dPct)
        if (k === 'car.residualRate5yPct') c2.residualRate5yPct = applyDelta(c2.residualRate5yPct, dPct)
        if (k === 'car.phevElectricKmRatioPct') c2.phevElectricKmRatioPct = applyDelta(c2.phevElectricKmRatioPct, dPct)

        const r = computeNewCarCost({ car: c2, globals: g2, assumptions: a2, plan: p.variant, years: 5 })
        return r
      }
    })
  }, [assumptions, deltaPct, enabled, globals, selected])

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>敏感性分析（5年）</CardTitle>
            <CardDescription>
              对「选中的方案」把勾选的参数按 ±X% 变动，看 5 年总成本怎么变；表格中「影响区间」是相对基准总成本的增减范围（元），不是百分比。
            </CardDescription>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClear} disabled={!selected}>
            取消选择
          </Button>
        </div>

        {selected ? (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium">{selected.title}</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="outline">{selected.car.energyType}</Badge>
              <Badge variant="secondary">基准总成本：{formatCny(selected.total5)} 元</Badge>
            </div>
          </div>
        ) : (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            请先在“新车方案排行榜”里点击「设为分析对象」。
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>扰动幅度（%）</Label>
            <Input
              inputMode="numeric"
              value={deltaPct}
              onChange={(e) => setDeltaPct(Number(e.target.value))}
              disabled={!selected}
            />
            <div className="mt-1 text-xs text-muted-foreground">例如填 10 表示分别计算 -10% 与 +10%。</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="text-sm font-medium">选择要分析的参数</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(paramMeta) as ParamKey[]).map((k) => {
              const disabledByType = selected ? !paramMeta[k].applies(selected) : true
              const checked = enabled[k] && !disabledByType
              return (
                <label
                  key={k}
                  className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <span className="min-w-0">
                    {paramMeta[k].label} <span className="text-muted-foreground">({paramMeta[k].unit})</span>
                    <div className="mt-1 text-xs text-muted-foreground">{k}</div>
                  </span>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    disabled={!selected || disabledByType}
                    onChange={(e) => setEnabled((s) => ({ ...s, [k]: e.target.checked }))}
                  />
                </label>
              )
            })}
          </div>
        </div>

        <Separator />

        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3">参数</th>
                <th className="py-2 pr-3">- {Math.abs(deltaPct)}%</th>
                <th className="py-2 pr-3">+ {Math.abs(deltaPct)}%</th>
                <th className="py-2 pr-3">影响区间（Δ vs 基准）</th>
              </tr>
            </thead>
            <tbody>
              {selected ? (
                rows.length ? (
                  rows.map((r) => (
                    <tr key={r.key} className="border-b">
                      <td className="py-3 pr-3 align-top">
                        <div className="font-medium">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.key}</div>
                      </td>
                      <td className="py-3 pr-3 align-top tabular-nums">{formatCny(r.lowerTotal)}</td>
                      <td className="py-3 pr-3 align-top tabular-nums">{formatCny(r.upperTotal)}</td>
                      <td className="py-3 pr-3 align-top tabular-nums">
                        <span className={Math.max(r.lowerDelta, r.upperDelta) <= 0 ? 'text-emerald-700' : 'text-red-700'}>
                          {`${Math.round(Math.min(r.lowerDelta, r.upperDelta)).toLocaleString('zh-CN')} ~ ${Math.round(Math.max(r.lowerDelta, r.upperDelta)).toLocaleString('zh-CN')}`}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      当前没有可用的参数（可能都被关闭，或选中车型类型不适用）。
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td className="py-3 text-muted-foreground" colSpan={4}>
                    请先选择分析对象。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

