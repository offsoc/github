import {getInsightsUrl} from '@github-ui/internal-api-insights'

import {usePageDataContext} from '../contexts/PageDataContext'
import type {PageDataName} from '../payloads/page-data'

export function usePageDataUrl(pageDataName: PageDataName, params?: string) {
  const {basePageDataUrl} = usePageDataContext()
  let baseUrl = `${basePageDataUrl}/page_data/${pageDataName}`

  if (params) baseUrl += `?${params}`

  const url = getInsightsUrl(baseUrl)

  return url
}
