import {useQuery} from '@tanstack/react-query'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import {reactFetch} from '@github-ui/verified-fetch'
import {reportTraceData} from '@github-ui/internal-api-insights'
import type {NavigationCounterPageData} from '../payloads/tab-counts'

export function useTabCountsPageData(initialData?: NavigationCounterPageData) {
  const apiURL = usePageDataUrl(PageData.tabCounts)

  return useQuery<NavigationCounterPageData, Error>({
    queryKey: [PageData.tabCounts, apiURL],
    queryFn: async () => {
      const result = await reactFetch(apiURL)
      if (!result.ok) throw new Error(`HTTP ${result.status}`)
      const json = await result.json()
      reportTraceData(json)
      return json
    },
    initialData,
  })
}
