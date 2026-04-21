import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppStateV1, CarDraft, GlobalParams, Assumptions, PlanGenerationOptions } from '@/domain/types'
import { defaultAppState, newCarDraft } from '@/state/defaults'

type AppStore = AppStateV1 & {
  ui: {
    activeTab: 'cars' | 'globals' | 'assumptions' | 'results'
  }

  setActiveTab: (t: AppStore['ui']['activeTab']) => void

  addCar: (partial?: Partial<CarDraft>) => void
  removeCar: (id: string) => void
  updateCar: (id: string, patch: Partial<CarDraft>) => void

  setGlobals: (patch: Partial<GlobalParams>) => void
  setAssumptions: (patch: Partial<Assumptions>) => void
  setPlanGen: (patch: Partial<PlanGenerationOptions>) => void

  resetAll: () => void
  loadDemo: () => void

  exportJsonBlob: () => Blob
  importJsonText: (text: string) => void
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function migrateToV1(raw: unknown): AppStateV1 {
  if (!isObject(raw)) return structuredClone(defaultAppState)

  // Very small migration layer: unknown -> V1 by merging defaults
  const merged: AppStateV1 = {
    schemaVersion: 1,
    cars: Array.isArray(raw.cars) ? (raw.cars as CarDraft[]) : defaultAppState.cars,
    globals: { ...defaultAppState.globals, ...(isObject(raw.globals) ? (raw.globals as GlobalParams) : {}) },
    assumptions: {
      ...defaultAppState.assumptions,
      ...(isObject(raw.assumptions) ? (raw.assumptions as Assumptions) : {}),
    },
    planGen: {
      ...defaultAppState.planGen,
      ...(isObject(raw.planGen) ? (raw.planGen as PlanGenerationOptions) : {}),
    },
  }

  // Ensure each car has required fields
  merged.cars = merged.cars.map((c) => newCarDraft({ ...c, id: typeof c.id === 'string' ? c.id : crypto.randomUUID() }))

  return merged
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...structuredClone(defaultAppState),
      ui: { activeTab: 'cars' },

      setActiveTab: (t) => set({ ui: { activeTab: t } }),

      addCar: (partial) => set((s) => ({ cars: [...s.cars, newCarDraft(partial)] })),
      removeCar: (id) => set((s) => ({ cars: s.cars.filter((c) => c.id !== id) })),
      updateCar: (id, patch) =>
        set((s) => ({
          cars: s.cars.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      setGlobals: (patch) => set((s) => ({ globals: { ...s.globals, ...patch } })),
      setAssumptions: (patch) => set((s) => ({ assumptions: { ...s.assumptions, ...patch } })),
      setPlanGen: (patch) => set((s) => ({ planGen: { ...s.planGen, ...patch } })),

      resetAll: () =>
        set({
          ...structuredClone(defaultAppState),
          ui: { activeTab: 'cars' },
        }),

      loadDemo: () =>
        set({
          ...structuredClone(defaultAppState),
          ui: { activeTab: 'results' },
          cars: [
            newCarDraft({
              name: '传祺向往 M8 PHEV（示例）',
              energyType: 'PHEV',
              guidePriceCny: 292_000,
              dealerDiscountCny: 0,
              insuranceYear1Cny: 7000,
              manufacturerSubsidyCny: 0,
              fuelConsumptionLPer100km: 6.2,
              electricityConsumptionKWhPer100km: 20,
              phevElectricKmRatioPct: 65,
              residualRate5yPct: 52,
            }),
            newCarDraft({
              name: '丰田赛那 HEV（示例）',
              energyType: 'HEV',
              guidePriceCny: 278_000,
              dealerDiscountCny: 0,
              insuranceYear1Cny: 7000,
              manufacturerSubsidyCny: 0,
              fuelConsumptionLPer100km: 6.0,
              residualRate5yPct: 58,
            }),
          ],
        }),

      exportJsonBlob: () => {
        const s = get()
        const payload = {
          schemaVersion: s.schemaVersion,
          cars: s.cars,
          globals: s.globals,
          assumptions: s.assumptions,
          planGen: s.planGen,
          exportedAt: new Date().toISOString(),
        }
        return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
      },

      importJsonText: (text) => {
        const raw = JSON.parse(text) as unknown
        const migrated = migrateToV1(raw)
        set({ ...migrated, ui: { activeTab: get().ui.activeTab } })
      },
    }),
    {
      name: 'vehicle-purchase-calculator:v1',
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        cars: s.cars,
        globals: s.globals,
        assumptions: s.assumptions,
        planGen: s.planGen,
      }),
    },
  ),
)
