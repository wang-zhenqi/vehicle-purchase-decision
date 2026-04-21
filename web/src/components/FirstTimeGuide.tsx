import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const LS_KEY = 'vehicleCalc_usageGuideExpanded'

export function FirstTimeGuide() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(LS_KEY) !== '0'
  })

  useEffect(() => {
    window.localStorage.setItem(LS_KEY, open ? '1' : '0')
  }, [open])

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="h-auto flex-1 justify-between gap-2 px-2 py-2 font-normal sm:px-3">
            <span className="text-left text-sm font-medium sm:text-base">第一次使用？看这里：怎么填、结果是什么意思</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-70 transition-transform', open && 'rotate-180')} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="space-y-4 border-t px-3 pb-4 pt-3 text-sm sm:px-4">
          <section className="space-y-2">
            <div className="font-medium text-foreground">建议填写顺序</div>
            <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">车型</span>：添加备选车，按导购/报价填写价格与能耗；可添加多辆对比。
              </li>
              <li>
                <span className="text-foreground">全局</span>：里程、油价/电价与充电占比、贷款、牌照相关费用——影响所有方案。
              </li>
              <li>
                <span className="text-foreground">假设</span>：宝来每年油费/保险/维保等基线；下方开关决定生成哪些「保留/淘汰宝来 × 上牌方式」组合。
              </li>
              <li>
                <span className="text-foreground">结果</span>：看排序与差额；需要时点开「追溯」核对公式与数字来源。
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              不确定填什么时，可先点工具栏「加载示例」再改数值。数据保存在本机浏览器，可用 JSON 备份。
            </p>
          </section>

          <section className="space-y-2">
            <div className="font-medium text-foreground">结果页里常见指标</div>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">5 年总成本（合计）</span>：本模型下该方案约 5 年的总花费，等于下方「购车成本」+「贷款利息」。用于和宝来基线、其他方案排序对比。
              </li>
              <li>
                <span className="font-medium text-foreground">购车成本</span>：不含贷款利息；含落地价、牌照费、机会成本、能耗、保险、维保等，并扣除估算残值与（若淘汰）宝来卖出残值。明细见「追溯」。
              </li>
              <li>
                <span className="font-medium text-foreground">贷款利息</span>：按当前全局里的月供、期数、月息估算的利息合计；本金偿还不算作「费用」。
              </li>
              <li>
                <span className="font-medium text-foreground">5 年残值</span>：按车型卡片里的保值率估算的期末残值，在购车成本里已作为扣减项列出，这里单独标出便于理解。
              </li>
              <li>
                <span className="font-medium text-foreground">Δ vs 宝来</span>：该方案 5 年总成本减去「继续开宝来」5 年基线；负数表示比继续开宝来便宜（在模型假设下）。
              </li>
              <li>
                <span className="font-medium text-foreground">月供 / 红线</span>：按全局贷款参数估算；超过你在假设里设的「月供红线」会提示，便于现金流感受。
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <div className="font-medium text-foreground">其他提示</div>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>「追溯」里点击路径标签可跳到对应输入框并短暂高亮。</li>
              <li>「敏感性分析」需先在排行榜里「设为分析对象」，再看关键参数加减百分之几对总成本的影响。</li>
              <li>输出是辅助决策的简化模型，非财务或法律意见；参数可按你家实际情况改。</li>
            </ul>
          </section>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
