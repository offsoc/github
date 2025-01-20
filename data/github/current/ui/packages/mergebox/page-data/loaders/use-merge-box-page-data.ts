import {useSuspenseQuery} from '@tanstack/react-query'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import {reactFetch} from '@github-ui/verified-fetch'
import {reportTraceData} from '@github-ui/internal-api-insights'
import type {MergeBoxPageData} from '../payloads/merge-box'

export function useMergeBoxPageData({
  mergeMethod,
  bypassRequirements = false,
}: {
  mergeMethod: string
  bypassRequirements?: boolean
}) {
  const searchParams = new URLSearchParams()
  searchParams.append('merge_method', mergeMethod)
  searchParams.append('bypass_requirements', bypassRequirements.toString())
  const apiURL = `${usePageDataUrl(PageData.mergeBox)}?${searchParams.toString()}`

  return useSuspenseQuery<MergeBoxPageData, Error>({
    queryKey: [PageData.mergeBox, apiURL, mergeMethod, bypassRequirements],
    queryFn: async () => {
      const result = await reactFetch(apiURL)
      if (!result.ok) throw new Error(`HTTP ${result.status}`)
      const json = await result.json()
      reportTraceData(json)
      return json
    },
  })
}
