import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/state/store'

export function GlobalsSection() {
  const g = useAppStore((s) => s.globals)
  const set = useAppStore((s) => s.setGlobals)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">全局参数</div>
        <div className="text-sm text-muted-foreground">这些参数通常不随车型变化（油价/电价/贷款/牌照费用假设等）。</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用车与能源价格</CardTitle>
          <CardDescription>PHEV 会用到“加权电价”。三项充电占比建议合计 100%。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>年均行驶里程（km/年）</Label>
            <Input data-field="globals.annualMileageKm" inputMode="numeric" value={g.annualMileageKm} onChange={(e) => set({ annualMileageKm: Number(e.target.value) })} />
          </div>
          <div>
            <Label>油价（元/L）</Label>
            <Input data-field="globals.oilPriceCnyPerL" inputMode="decimal" value={g.oilPriceCnyPerL} onChange={(e) => set({ oilPriceCnyPerL: Number(e.target.value) })} />
          </div>
          <div>
            <Label>家庭谷时电价（元/kWh）</Label>
            <Input data-field="globals.homeOffpeakPowerCnyPerKwh" inputMode="decimal" value={g.homeOffpeakPowerCnyPerKwh} onChange={(e) => set({ homeOffpeakPowerCnyPerKwh: Number(e.target.value) })} />
          </div>
          <div>
            <Label>家庭峰时电价（元/kWh）</Label>
            <Input data-field="globals.homePeakPowerCnyPerKwh" inputMode="decimal" value={g.homePeakPowerCnyPerKwh} onChange={(e) => set({ homePeakPowerCnyPerKwh: Number(e.target.value) })} />
          </div>
          <div>
            <Label>公共桩电价（元/kWh）</Label>
            <Input data-field="globals.publicPowerCnyPerKwh" inputMode="decimal" value={g.publicPowerCnyPerKwh} onChange={(e) => set({ publicPowerCnyPerKwh: Number(e.target.value) })} />
          </div>
          <div>
            <Label>谷时充电占比（%）</Label>
            <Input data-field="globals.homeOffpeakChargePct" inputMode="numeric" value={g.homeOffpeakChargePct} onChange={(e) => set({ homeOffpeakChargePct: Number(e.target.value) })} />
          </div>
          <div>
            <Label>峰时充电占比（%）</Label>
            <Input data-field="globals.homePeakChargePct" inputMode="numeric" value={g.homePeakChargePct} onChange={(e) => set({ homePeakChargePct: Number(e.target.value) })} />
          </div>
          <div>
            <Label>公共充电占比（%）</Label>
            <Input data-field="globals.publicChargePct" inputMode="numeric" value={g.publicChargePct} onChange={(e) => set({ publicChargePct: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>贷款参数</CardTitle>
          <CardDescription>当前模型：首付按落地价比例计算；月供按等额本息；利息成本计入总成本（本金偿还不计入）。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>贷款月息（%，例如 0.25）</Label>
            <Input data-field="globals.loanMonthlyRatePct" inputMode="decimal" value={g.loanMonthlyRatePct} onChange={(e) => set({ loanMonthlyRatePct: Number(e.target.value) })} />
          </div>
          <div>
            <Label>首付比例（%）</Label>
            <Input data-field="globals.downPaymentPct" inputMode="numeric" value={g.downPaymentPct} onChange={(e) => set({ downPaymentPct: Number(e.target.value) })} />
          </div>
          <div>
            <Label>贷款期数（月）</Label>
            <Input data-field="globals.loanTermMonths" inputMode="numeric" value={g.loanTermMonths} onChange={(e) => set({ loanTermMonths: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>牌照费用假设</CardTitle>
          <CardDescription>这些是“可替换的参考输入”。真实政策/费用请以办理时为准。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>蓝牌竞价平均价格（元）</Label>
            <Input data-field="globals.bluePlateAuctionAvgCny" inputMode="numeric" value={g.bluePlateAuctionAvgCny} onChange={(e) => set({ bluePlateAuctionAvgCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>绿牌上牌费（元）</Label>
            <Input data-field="globals.greenPlateFeeCny" inputMode="numeric" value={g.greenPlateFeeCny} onChange={(e) => set({ greenPlateFeeCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>号牌迁移/换牌费用（元）</Label>
            <Input data-field="globals.plateTransferFeeCny" inputMode="numeric" value={g.plateTransferFeeCny} onChange={(e) => set({ plateTransferFeeCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>中山上牌费用（元）</Label>
            <Input data-field="globals.zhongshanPlateFeeCny" inputMode="numeric" value={g.zhongshanPlateFeeCny} onChange={(e) => set({ zhongshanPlateFeeCny: Number(e.target.value) })} />
          </div>
          <div>
            <Label>蓝牌摇号等待时长（月，占位）</Label>
            <Input
              data-field="globals.bluePlateLotteryWaitMonths"
              inputMode="numeric"
              value={g.bluePlateLotteryWaitMonths}
              onChange={(e) => set({ bluePlateLotteryWaitMonths: Number(e.target.value) })}
            />
            <div className="mt-1 text-xs text-muted-foreground">后续如果你希望把“等待成本”货币化，我们可以把它接进模型。</div>
          </div>
        </CardContent>
      </Card>

      <Separator />
    </div>
  )
}
