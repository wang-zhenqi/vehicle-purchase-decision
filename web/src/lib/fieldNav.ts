export type FieldTab = 'cars' | 'globals' | 'assumptions' | 'results'

export function tabFromFieldPath(path: string): FieldTab | null {
  if (path.startsWith('globals.')) return 'globals'
  if (path.startsWith('assumptions.')) return 'assumptions'
  if (path.startsWith('cars.')) return 'cars'
  return null
}

export function selectorForFieldPath(path: string) {
  // We standardize on data-field="...".
  return `[data-field="${CSS.escape(path)}"]`
}

export function focusFieldByPath(path: string) {
  const selector = selectorForFieldPath(path)
  const el = document.querySelector<HTMLElement>(selector)
  if (!el) return false
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  if (typeof (el as HTMLInputElement).focus === 'function') (el as HTMLInputElement).focus()
  // Flash highlight
  el.classList.add('ring-2', 'ring-ring')
  window.setTimeout(() => el.classList.remove('ring-2', 'ring-ring'), 900)
  return true
}

