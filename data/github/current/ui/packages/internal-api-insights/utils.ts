import type {QueryLog, TraceNode, GroupedLogs, TraceData} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tryGetNumber(item: any, paths: string[], threshold: number): number | undefined {
  let current = item

  for (const path of paths) {
    const sub_paths = path.split('/')
    for (const sub_path of sub_paths) {
      if (current && current[sub_path]) {
        current = current[sub_path]
      }
    }

    if (current && !Array.isArray(current) && Math.round(parseFloat(current) * 10) / 10 >= threshold) {
      return parseFloat(current)
    }
    current = item
  }

  return undefined
}

export function findSqlQueries(queries: QueryLog[], root: TraceNode) {
  if (root['sql']) {
    queries.push({
      query: root['sql'] as string,
      digested_query: root['digested_sql'] as string,
      duration: root['duration_ms'] as number,
      result: root['result_count'] as number,
      cluster_name: root['cluster_name'] as string,
      fallbacks: root['fallbacks'] as string[],
      backtrace: root['backtrace'] as string[],
    })
  }

  const keys = Object.keys(root)
  for (const key of keys) {
    if (key !== 'flamegraph' && typeof root[key] === 'object' && root[key] !== null) {
      findSqlQueries(queries, root[key] as TraceNode)
    }
  }
}

export function findSqlNPlusOne(root: TraceNode) {
  if (root['execution']) {
    const n_plus_one = (root['execution'] as TraceNode)['n_plus1_sql_queries']
    if (n_plus_one) {
      return n_plus_one as TraceNode[]
    }
  }

  return []
}

export function findEsQueries(queries: QueryLog[], root: TraceNode) {
  if (root['elastomer']) {
    const calls = (root['elastomer'] as TraceNode)['calls'] as TraceNode[]
    for (const call of calls) {
      queries.push({
        query: call['body'] as string,
        duration: call['duration_ms'] as number,
        result: call['count'],
      })
    }
  }
  const keys = Object.keys(root)
  for (const key of keys) {
    if (key !== 'flamegraph' && typeof root[key] === 'object' && root[key] !== null) {
      findEsQueries(queries, root[key] as TraceNode)
    }
  }
}

export function tryGetRemoteUrl(absoluteUrl: string) {
  const match = absoluteUrl.match(/(?:\/workspaces\/github\/|\/build\/)(.*):([0-9]+)/)
  if (match) {
    return {
      remoteUrl: `https://github.com/github/github/blob/master/${match[1]}#L${match[2]}`,
      relativePath: match[1],
      line: match[2],
    }
  }

  return undefined
}

export function getLinkFromBacktrace(backtrace: string[] | string | undefined | object): string | undefined {
  if (backtrace === undefined || (Array.isArray(backtrace) && backtrace.length === 0)) {
    return undefined
  }

  const backtraceLine = Array.isArray(backtrace) ? backtrace[0] : backtrace
  if (!backtraceLine) {
    return undefined
  }

  if (typeof backtraceLine !== 'string') {
    return undefined
  }

  const url = tryGetRemoteUrl(backtraceLine)
  if (url === undefined) {
    return undefined
  }

  return url.remoteUrl
}

export function groupMySqlQueriesByCluster(queries: QueryLog[]): GroupedLogs {
  return queries.reduce((acc, log) => {
    const cluster_name = log.cluster_name || 'unknown'
    if (!acc[cluster_name]) {
      acc[cluster_name] = []
    }
    acc[cluster_name]?.push(log)
    return acc
  }, {} as GroupedLogs)
}

export function getAllUsedClusters(traces: TraceData): string[] {
  const clusters = new Set<string>()
  for (const trace of traces) {
    const sqlQueries = new Array<QueryLog>()
    findSqlQueries(sqlQueries, trace)
    for (const query of sqlQueries) {
      if (query.cluster_name) {
        clusters.add(query.cluster_name)
      }
    }
  }
  return Array.from(clusters)
}
