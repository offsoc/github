import {useSuspenseQuery} from '@tanstack/react-query'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import {reactFetch} from '@github-ui/verified-fetch'
import {reportTraceData} from '@github-ui/internal-api-insights'
import type {StatusChecksPageData} from '../payloads/status-checks'

export function useStatusChecksPageData({pullRequestHeadSha}: {pullRequestHeadSha: string}) {
  const apiURL = usePageDataUrl(PageData.statusChecks)

  return useSuspenseQuery<StatusChecksPageData, Error>({
    queryKey: [PageData.statusChecks, apiURL, pullRequestHeadSha],
    queryFn: async () => {
      const result = await reactFetch(apiURL)
      if (!result.ok) throw new Error(`HTTP ${result.status}`)
      const json = await result.json()
      reportTraceData(json)
      return json
    },
  })
}
