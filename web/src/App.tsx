import type { ReactNode } from 'react'
import { AssumptionsSection } from '@/components/sections/AssumptionsSection'
import { CarsSection } from '@/components/sections/CarsSection'
import { GlobalsSection } from '@/components/sections/GlobalsSection'
import { ResultsSection } from '@/components/sections/ResultsSection'
import { DataToolbar } from '@/components/DataToolbar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/state/store'

function App() {
  const activeTab = useAppStore((s) => s.ui.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold sm:text-lg">购车决策量化计算器</div>
            <div className="text-xs text-muted-foreground sm:text-sm">本地计算 · 可追溯 · 可导入导出（JSON/CSV）</div>
          </div>
          <div className="hidden sm:block sm:max-w-[520px]">
            <DataToolbar />
          </div>
        </div>

        <div className="mx-auto hidden max-w-5xl px-4 pb-3 sm:block">
          <div className="flex flex-wrap gap-2">
            <TabButton active={activeTab === 'cars'} onClick={() => setActiveTab('cars')}>
              车型
            </TabButton>
            <TabButton active={activeTab === 'globals'} onClick={() => setActiveTab('globals')}>
              全局
            </TabButton>
            <TabButton active={activeTab === 'assumptions'} onClick={() => setActiveTab('assumptions')}>
              假设
            </TabButton>
            <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')}>
              结果
            </TabButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:pb-10">
        <div className="mb-4 sm:hidden">
          <DataToolbar />
        </div>

        {activeTab === 'cars' ? <CarsSection /> : null}
        {activeTab === 'globals' ? <GlobalsSection /> : null}
        {activeTab === 'assumptions' ? <AssumptionsSection /> : null}
        {activeTab === 'results' ? <ResultsSection /> : null}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/90 backdrop-blur sm:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-1 px-2 py-2">
          <MobileNavButton active={activeTab === 'cars'} onClick={() => setActiveTab('cars')} label="车型" />
          <MobileNavButton active={activeTab === 'globals'} onClick={() => setActiveTab('globals')} label="全局" />
          <MobileNavButton active={activeTab === 'assumptions'} onClick={() => setActiveTab('assumptions')} label="假设" />
          <MobileNavButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="结果" />
        </div>
      </nav>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button type="button" size="sm" variant={active ? 'default' : 'outline'} onClick={onClick}>
      {children}
    </Button>
  )
}

function MobileNavButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-11 rounded-md text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
      )}
    >
      {label}
    </button>
  )
}

export default App
