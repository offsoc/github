import {reportTraceData} from '@github-ui/internal-api-insights'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import {reactFetch} from '@github-ui/verified-fetch'
import {useSuspenseQuery} from '@tanstack/react-query'
import type {CodeButtonData} from '../payloads/code-button'

export function useCodeButtonData(initialData?: CodeButtonData) {
  const apiURL = usePageDataUrl(PageData.codeButton)

  return useSuspenseQuery<CodeButtonData, Error>({
    queryKey: [PageData.codeButton, apiURL],
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
