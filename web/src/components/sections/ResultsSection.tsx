import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { TraceTree } from '@/components/trace/TraceTree'
import { computeBaoLaiCost, computeNewCarCost } from '@/engine/calculator'
import { buildPlanVariants } from '@/engine/scenarios'
import type { TraceNode } from '@/engine/trace'
import { validateState } from '@/engine/validate'
import { useAppStore } from '@/state/store'

type Row = {
  key: string
  title: string
  subtitle: string
  energy: string
  total5: number
  delta5: number
  monthly: number
  overMonthlyLimit: boolean
  trace5: TraceNode
}

export function ResultsSection() {
  const cars = useAppStore((s) => s.cars)
  const globals = useAppStore((s) => s.globals)
  const assumptions = useAppStore((s) => s.assumptions)
  const planGen = useAppStore((s) => s.planGen)

  const [traceOpen, setTraceOpen] = useState(false)
  const [traceTitle, setTraceTitle] = useState('追溯')
  const [traceNode, setTraceNode] = useState<TraceNode | null>(null)

  const issues = useMemo(() => validateState({ schemaVersion: 1, cars, globals, assumptions, planGen }), [cars, globals, assumptions, planGen])

  const baseline5 = useMemo(() => computeBaoLaiCost(assumptions, 5), [assumptions])
  const baseline10 = useMemo(() => computeBaoLaiCost(assumptions, 10), [assumptions])

  const rows = useMemo(() => {
    const out: Row[] = []
    for (const car of cars) {
      const variants = buildPlanVariants(car, planGen)
      for (const v of variants) {
        const r5 = computeNewCarCost({ car, globals, assumptions, plan: v, years: 5 })
        out.push({
          key: `${car.id}:${v.keepBaoLai ? 'K' : 'D'}:${v.newCarPlateMode}`,
          title: `${car.name}｜${v.label}`,
          subtitle: `${car.energyType}｜${v.keepBaoLai ? '保留宝来' : '淘汰宝来'}`,
          energy: car.energyType,
          total5: r5.total,
          delta5: r5.total - baseline5.total,
          monthly: r5.monthlyPayment,
          overMonthlyLimit: r5.monthlyPayment > assumptions.monthlyPaymentLimitCny,
          trace5: r5.totalTrace,
        })
      }
    }
    out.sort((a, b) => a.total5 - b.total5)
    return out
  }, [cars, globals, assumptions, planGen, baseline5.total])

  const bestKey = rows.length ? rows[0]?.key : null

  function openTrace(title: string, node: TraceNode) {
    setTraceTitle(title)
    setTraceNode(node)
    setTraceOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-lg font-semibold">结果</div>
          <div className="text-sm text-muted-foreground">默认按 5 年总成本排序。点击“追溯”查看公式树。</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => openTrace('5年｜继续开宝来｜追溯', baseline5.trace)}>
            追溯：宝来基线（5年）
          </Button>
        </div>
      </div>

      {issues.length ? (
        <Card>
          <CardHeader>
            <CardTitle>校验提示</CardTitle>
            <CardDescription>不影响你继续试用，但会影响解释一致性。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.map((i, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <span className="mr-2 font-medium">{i.level === 'error' ? '错误' : '警告'}</span>
                <span className="text-muted-foreground">{i.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>基线：继续开宝来</CardTitle>
          <CardDescription>
            5年：{Math.round(baseline5.total).toLocaleString('zh-CN')} 元；10年：{Math.round(baseline10.total).toLocaleString('zh-CN')} 元
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">建议你把“基线追溯”和某个新车方案追溯对照阅读。</div>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => openTrace('10年｜继续开宝来｜追溯', baseline10.trace)}>
            追溯：宝来基线（10年）
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>新车方案排行榜（5年）</CardTitle>
          <CardDescription>移动端可横向滑动表格。绿色高亮为当前排序下的最优项。</CardDescription>
        </CardHeader>
        <CardContent>
          {cars.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂无备选车型。</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">当前方案枚举开关组合下没有生成任何新车方案。请到「关键假设」打开更多组合。</div>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3">方案</th>
                    <th className="py-2 pr-3">5年总成本</th>
                    <th className="py-2 pr-3">Δ vs 宝来</th>
                    <th className="py-2 pr-3">月供</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isBest = r.key === bestKey
                    return (
                      <tr key={r.key} className="border-b">
                        <td className="py-3 pr-3 align-top">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.subtitle}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{r.energy}</Badge>
                            {isBest ? <Badge variant="success">当前最优</Badge> : null}
                            {r.overMonthlyLimit ? <Badge variant="danger">月供超红线</Badge> : <Badge variant="secondary">月供OK</Badge>}
                          </div>
                        </td>
                        <td className="py-3 pr-3 align-top tabular-nums">{Math.round(r.total5).toLocaleString('zh-CN')}</td>
                        <td className="py-3 pr-3 align-top tabular-nums">
                          <span className={r.delta5 <= 0 ? 'text-emerald-700' : 'text-red-700'}>
                            {r.delta5 <= 0 ? '-' : '+'}
                            {Math.abs(Math.round(r.delta5)).toLocaleString('zh-CN')}
                          </span>
                        </td>
                        <td className="py-3 pr-3 align-top tabular-nums">{Math.round(r.monthly).toLocaleString('zh-CN')}</td>
                        <td className="py-3 align-top">
                          <Button variant="outline" className="w-full" onClick={() => openTrace(`${r.title}｜5年追溯`, r.trace5)}>
                            追溯
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Dialog open={traceOpen} onOpenChange={setTraceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{traceTitle}</DialogTitle>
            <DialogDescription>展开节点可看到中间量与输入来源路径（sources 后续会在 UI 里进一步可视化）。</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70dvh] overflow-y-auto pr-1">{traceNode ? <TraceTree node={traceNode} /> : null}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
