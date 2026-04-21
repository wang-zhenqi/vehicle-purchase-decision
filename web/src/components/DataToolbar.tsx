import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { computeBaoLaiCost, computeNewCarCost } from '@/engine/calculator'
import { buildPlanVariants } from '@/engine/scenarios'
import { useAppStore } from '@/state/store'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function DataToolbar() {
  const exportJsonBlob = useAppStore((s) => s.exportJsonBlob)
  const importJsonText = useAppStore((s) => s.importJsonText)
  const loadDemo = useAppStore((s) => s.loadDemo)
  const resetAll = useAppStore((s) => s.resetAll)

  const cars = useAppStore((s) => s.cars)
  const globals = useAppStore((s) => s.globals)
  const assumptions = useAppStore((s) => s.assumptions)
  const planGen = useAppStore((s) => s.planGen)

  const fileRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        className="w-full sm:w-auto"
        variant="secondary"
        onClick={() => downloadBlob(exportJsonBlob(), `购车决策导出_${new Date().toISOString().slice(0, 10)}.json`)}
      >
        导出 JSON
      </Button>

      <Button className="w-full sm:w-auto" variant="outline" onClick={() => fileRef.current?.click()}>
        导入 JSON
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const text = await f.text()
          importJsonText(text)
          e.target.value = ''
        }}
      />

      <Button
        className="w-full sm:w-auto"
        variant="outline"
        onClick={() => {
          const baseline5 = computeBaoLaiCost(assumptions, 5).total
          const lines: string[] = []
          lines.push('购车决策计算器 CSV 导出')
          lines.push('')
          lines.push('方案,子标题,5年总成本,Δvs宝来(5年),月供')
          for (const car of cars) {
            for (const v of buildPlanVariants(car, planGen)) {
              const r5 = computeNewCarCost({ car, globals, assumptions, plan: v, years: 5 })
              const delta = r5.total - baseline5
              lines.push(
                [`${car.name}｜${v.label}`, `${car.energyType}｜${v.keepBaoLai ? '保留宝来' : '淘汰宝来'}`, `${Math.round(r5.total)}`, `${Math.round(delta)}`, `${Math.round(r5.monthlyPayment)}`].join(
                  ',',
                ),
              )
            }
          }
          const csv = '\uFEFF' + lines.join('\n')
          downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `购车决策_${new Date().toISOString().slice(0, 10)}.csv`)
        }}
      >
        导出 CSV
      </Button>

      <Button className="w-full sm:w-auto" variant="outline" onClick={() => loadDemo()}>
        加载示例
      </Button>

      <Button
        className="w-full sm:w-auto"
        variant="destructive"
        onClick={() => {
          if (confirm('确定清空本地数据并恢复默认？')) resetAll()
        }}
      >
        清空
      </Button>
    </div>
  )
}
