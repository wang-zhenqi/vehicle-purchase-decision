import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppStateV1, CarDraft, GlobalParams, Assumptions } from '@/domain/types'
import demoStateJson from '@/data/demo-state.json'
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

  resetAll: () => void
  loadDemo: () => void

  exportJsonBlob: () => Blob
  importJsonText: (text: string) => void
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** 只合并当前 `GlobalParams` 已知字段，忽略旧版导出中的已删除键 */
function mergeGlobals(raw: unknown): GlobalParams {
  const out: GlobalParams = { ...defaultAppState.globals }
  if (!isObject(raw)) return out
  for (const key of Object.keys(out) as (keyof GlobalParams)[]) {
    const v = raw[key as string]
    if (typeof v === 'number' && Number.isFinite(v)) out[key] = v
  }
  return out
}

function migrateToV1(raw: unknown): AppStateV1 {
  if (!isObject(raw)) return structuredClone(defaultAppState)

  const merged: AppStateV1 = {
    schemaVersion: 1,
    cars: Array.isArray(raw.cars) ? (raw.cars as CarDraft[]) : defaultAppState.cars,
    globals: mergeGlobals(raw.globals),
    assumptions: {
      ...defaultAppState.assumptions,
      ...(isObject(raw.assumptions) ? (raw.assumptions as Assumptions) : {}),
    },
  }

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

      resetAll: () =>
        set({
          ...structuredClone(defaultAppState),
          ui: { activeTab: 'cars' },
        }),

      loadDemo: () =>
        set({
          ...migrateToV1(demoStateJson),
          ui: { activeTab: 'results' },
        }),

      exportJsonBlob: () => {
        const s = get()
        const payload = {
          schemaVersion: s.schemaVersion,
          cars: s.cars,
          globals: s.globals,
          assumptions: s.assumptions,
          exportedAt: new Date().toISOString(),
        }
        return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
      },

      importJsonText: (text) => {
        try {
          const raw = JSON.parse(text) as unknown
          const migrated = migrateToV1(raw)
          set({ ...migrated, ui: { activeTab: get().ui.activeTab } })
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          alert(`导入失败：JSON 格式不正确或内容不符合预期。\n\n${msg}`)
        }
      },
    }),
    {
      name: 'vehicle-purchase-calculator:v1',
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        cars: s.cars,
        globals: s.globals,
        assumptions: s.assumptions,
      }),
    },
  ),
)
