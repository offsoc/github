import {useSuspenseQuery} from '@tanstack/react-query'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import {reactFetch} from '@github-ui/verified-fetch'
import {reportTraceData} from '@github-ui/internal-api-insights'
import type {CommitsPageData} from '../payloads/commits'

export function useCommitsPageData(initialData?: CommitsPageData) {
  const apiURL = usePageDataUrl(PageData.commits)

  return useSuspenseQuery<CommitsPageData, Error>({
    queryKey: [PageData.commits, apiURL],
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
