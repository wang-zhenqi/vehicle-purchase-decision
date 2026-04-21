import type { TraceNode } from '@/engine/trace'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

function formatValue(n: TraceNode) {
  const v = n.value
  if (n.unit === 'CNY') return `${Math.round(v).toLocaleString('zh-CN')} 元`
  if (n.unit?.includes('%')) return `${v}%`
  return `${v}${n.unit ? ` ${n.unit}` : ''}`
}

export function TraceTree({ node, depth = 0 }: { node: TraceNode; depth?: number }) {
  const hasChildren = !!node.children?.length

  if (!hasChildren) {
    return (
      <div className={cn('flex items-start justify-between gap-3 py-1 text-sm', depth === 0 && 'font-medium')}>
        <div className="min-w-0">
          <div className="text-foreground">{node.label}</div>
          {node.formula ? <div className="text-xs text-muted-foreground">{node.formula}</div> : null}
        </div>
        <div className="shrink-0 tabular-nums text-foreground">{formatValue(node)}</div>
      </div>
    )
  }

  return (
    <Collapsible defaultOpen={depth < 1} className="py-1">
      <div className={cn('flex items-start justify-between gap-3', depth === 0 && 'font-medium')}>
        <CollapsibleTrigger className="min-w-0 text-left text-sm text-foreground underline-offset-4 hover:underline">
          {node.label}
        </CollapsibleTrigger>
        <div className="shrink-0 tabular-nums text-sm text-foreground">{formatValue(node)}</div>
      </div>
      {node.formula ? <div className="mt-1 text-xs text-muted-foreground">{node.formula}</div> : null}

      <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="ml-3 border-l pl-3">
          {node.children!.map((c) => (
            <TraceTree key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
