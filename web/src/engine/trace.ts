export type TraceSource =
  | { kind: 'input'; path: string }
  | { kind: 'global'; path: string }
  | { kind: 'assumption'; path: string }
  | { kind: 'constant'; note?: string }

export type TraceNode = {
  id: string
  label: string
  unit?: string
  value: number
  formula?: string
  sources?: TraceSource[]
  children?: TraceNode[]
}

let traceSeq = 0
export function resetTraceIds() {
  traceSeq = 0
}

export function nextTraceId(prefix: string) {
  traceSeq += 1
  return `${prefix}_${traceSeq}`
}

export function leafNumber(input: Omit<TraceNode, 'children'> & { children?: undefined }): TraceNode {
  return { ...input, children: undefined }
}

export function node(
  input: Omit<TraceNode, 'value'> & { value: number; children?: TraceNode[] },
): TraceNode {
  return { ...input, children: input.children?.length ? input.children : undefined }
}
