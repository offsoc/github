import {ssrSafeWindow, ssrSafeLocation} from '@github-ui/ssr-utils'

// TODO: do not export those constants and instead provide functions to push and read data
export const TraceDataKey = 'GraphQLTraces'
export const TraceDataRefreshCallbackKey = 'GraphQLTracingRefresh'

export const disabledClusters = getDisabledClusters()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportTraceData(json: any) {
  if (!ssrSafeWindow) return
  if (!isTracingEnabled()) return
  if (!json) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = ssrSafeWindow as {[key: string]: any} | undefined

  if (rootWindowContent && !rootWindowContent[TraceDataKey]) {
    rootWindowContent[TraceDataKey] = []
  }

  if (rootWindowContent && json['__trace']) {
    rootWindowContent[TraceDataKey].push(json['__trace'])
    if (typeof rootWindowContent[TraceDataRefreshCallbackKey] === 'function') {
      rootWindowContent[TraceDataRefreshCallbackKey]()
    }
  }
}

export function isTracingEnabled() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = ssrSafeWindow as {[key: string]: any} | undefined

  return (
    new URLSearchParams(ssrSafeLocation.search).get('_tracing') === 'true' ||
    (rootWindowContent && rootWindowContent[TraceDataKey] !== undefined)
  )
}

function clustersDisabled() {
  return disabledClusters.length > 0
}

export function getInsightsUrl(url: string) {
  if (!isTracingEnabled() && !clustersDisabled()) return url

  const urlObject = new URL(url, ssrSafeLocation.origin)

  if (isTracingEnabled()) {
    urlObject.searchParams.set('_tracing', 'true')
  }

  if (clustersDisabled()) {
    urlObject.searchParams.set('disable_clusters', disabledClusters.join(','))
  }

  return urlObject.pathname + urlObject.search
}

function getDisabledClusters() {
  return decodeURIComponent(new URLSearchParams(ssrSafeLocation.search).get('disable_clusters') || '')
    .split(',')
    .filter(c => c !== '')
}

export function isClusterDisabled(cluster: string) {
  return disabledClusters.indexOf(cluster) > -1
}

export function toggleClusterState(cluster: string) {
  const index = disabledClusters.indexOf(cluster)

  if (index > -1) {
    disabledClusters.splice(index, 1)
  } else {
    disabledClusters.push(cluster)
  }

  const params = new URLSearchParams(ssrSafeLocation.search)
  params.set('disable_clusters', disabledClusters.join(','))

  const url = ssrSafeLocation
  url.search = params.toString()
}
