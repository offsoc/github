export type TraceData = TraceNode[]

export type TraceNode = {
  count: number
  [key: string]: string | number | object | TraceNode
}

export type QueryLog = {
  query: string
  digested_query?: string
  duration: number
  result?: number
  cluster_name?: string
  fallbacks?: string[]
  backtrace?: string[]
}

export type GroupedLogs = {[key: string]: QueryLog[]}
