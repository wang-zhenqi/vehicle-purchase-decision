import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { landingPrice } from '@/engine/calculator'
import { useAppStore } from '@/state/store'

export function CarsSection() {
  const cars = useAppStore((s) => s.cars)
  const addCar = useAppStore((s) => s.addCar)
  const removeCar = useAppStore((s) => s.removeCar)
  const updateCar = useAppStore((s) => s.updateCar)

  const hint = useMemo(() => {
    if (cars.length === 0) return '点击“添加车型”开始。你可以同时对比多辆备选车。'
    return '每个字段修改后会自动保存到本地浏览器（可导出备份）。'
  }, [cars.length])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">备选车型</div>
          <div className="text-sm text-muted-foreground">{hint}</div>
        </div>
        <div className="flex gap-2">
          <Button className="w-full sm:w-auto" onClick={() => addCar()}>
            添加车型
          </Button>
        </div>
      </div>

      {cars.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>还没有车型</CardTitle>
            <CardDescription>建议先添加 1-3 个备选车，再去看结果页的对比。</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {cars.map((car) => {
          const lp = landingPrice(car)
          return (
            <Card key={car.id}>
              <CardHeader className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <Label htmlFor={`name-${car.id}`}>车型名称</Label>
                      <Input
                        id={`name-${car.id}`}
                        data-field={`cars.${car.id}.name`}
                        value={car.name}
                        onChange={(e) => updateCar(car.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`energy-${car.id}`}>能源类型</Label>
                      <select
                        id={`energy-${car.id}`}
                        data-field={`cars.${car.id}.energyType`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={car.energyType}
                        onChange={(e) => updateCar(car.id, { energyType: e.target.value as typeof car.energyType })}
                      >
                        <option value="PHEV">PHEV（插电混动）</option>
                        <option value="HEV">HEV（油电混动）</option>
                      </select>
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full sm:w-auto" onClick={() => removeCar(car.id)}>
                    删除
                  </Button>
                </div>
                <CardDescription>
                  落地价（不含牌照策略费用）：<span className="font-medium text-foreground">{Math.round(lp).toLocaleString('zh-CN')} 元</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>油耗（L/100km）</Label>
                    <Input
                      data-field={`cars.${car.id}.fuelConsumptionLPer100km`}
                      inputMode="decimal"
                      value={car.fuelConsumptionLPer100km}
                      onChange={(e) => updateCar(car.id, { fuelConsumptionLPer100km: Number(e.target.value) })}
                    />
                  </div>
                  {car.energyType === 'PHEV' ? (
                    <>
                      <div>
                        <Label>电耗（kWh/100km）</Label>
                        <Input
                          data-field={`cars.${car.id}.electricityConsumptionKWhPer100km`}
                          inputMode="decimal"
                          value={car.electricityConsumptionKWhPer100km}
                          onChange={(e) => updateCar(car.id, { electricityConsumptionKWhPer100km: Number(e.target.value) })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>用电里程占比（%）</Label>
                        <Input
                          data-field={`cars.${car.id}.phevElectricKmRatioPct`}
                          inputMode="numeric"
                          value={car.phevElectricKmRatioPct}
                          onChange={(e) => updateCar(car.id, { phevElectricKmRatioPct: Number(e.target.value) })}
                        />
                        <div className="mt-1 text-xs text-muted-foreground">指你实际用车中，由电驱动的里程占比（用于拆分油/电能耗）。</div>
                      </div>
                    </>
                  ) : null}
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>指导价（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.guidePriceCny`}
                      inputMode="numeric"
                      value={car.guidePriceCny}
                      onChange={(e) => updateCar(car.id, { guidePriceCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>厂家优惠（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.dealerDiscountCny`}
                      inputMode="numeric"
                      value={car.dealerDiscountCny}
                      onChange={(e) => updateCar(car.id, { dealerDiscountCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>购置税（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.purchaseTaxCny`}
                      inputMode="numeric"
                      value={car.purchaseTaxCny}
                      onChange={(e) => updateCar(car.id, { purchaseTaxCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>首年保险（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.insuranceYear1Cny`}
                      inputMode="numeric"
                      value={car.insuranceYear1Cny}
                      onChange={(e) => updateCar(car.id, { insuranceYear1Cny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>店端上牌费（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.dealerPlateFeeCny`}
                      inputMode="numeric"
                      value={car.dealerPlateFeeCny}
                      onChange={(e) => updateCar(car.id, { dealerPlateFeeCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>厂家置换补贴（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.manufacturerSubsidyCny`}
                      inputMode="numeric"
                      value={car.manufacturerSubsidyCny}
                      onChange={(e) => updateCar(car.id, { manufacturerSubsidyCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>旧车折抵（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.oldCarTradeInCny`}
                      inputMode="numeric"
                      value={car.oldCarTradeInCny}
                      onChange={(e) => updateCar(car.id, { oldCarTradeInCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>其他费用（元）</Label>
                    <Input
                      data-field={`cars.${car.id}.otherFeesCny`}
                      inputMode="numeric"
                      value={car.otherFeesCny}
                      onChange={(e) => updateCar(car.id, { otherFeesCny: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>5年保值率（%）</Label>
                    <Input
                      data-field={`cars.${car.id}.residualRate5yPct`}
                      inputMode="decimal"
                      value={car.residualRate5yPct}
                      onChange={(e) => updateCar(car.id, { residualRate5yPct: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>覆盖：年均保险（元/年，可选）</Label>
                    <Input
                      data-field={`cars.${car.id}.annualInsuranceCny`}
                      inputMode="numeric"
                      placeholder="留空则按首年×系数估算"
                      value={car.annualInsuranceCny ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        updateCar(car.id, { annualInsuranceCny: v === '' ? undefined : Number(v) })
                      }}
                    />
                  </div>
                  <div>
                    <Label>覆盖：年均维保（元/年，可选）</Label>
                    <Input
                      data-field={`cars.${car.id}.annualMaintenanceCny`}
                      inputMode="numeric"
                      placeholder="留空则按落地价×比例估算"
                      value={car.annualMaintenanceCny ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        updateCar(car.id, { annualMaintenanceCny: v === '' ? undefined : Number(v) })
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
