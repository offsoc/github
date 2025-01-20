import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

export type IntroducedAndPreventedResult = Array<{
  label: string
  data: Array<{
    x: string
    y: number
  }>
}>

interface UseIntroducedAndPreventedChartDataParams {
  query: string
  startDate: string
  endDate: string
}
export function useIntroducedAndPreventedChartData({
  query,
  startDate,
  endDate,
}: UseIntroducedAndPreventedChartDataParams): UseQueryResult<IntroducedAndPreventedResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['introduced-prevented', query, startDate, endDate],
    queryFn: () => {
      const path = paths.introducedAndPreventedPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
