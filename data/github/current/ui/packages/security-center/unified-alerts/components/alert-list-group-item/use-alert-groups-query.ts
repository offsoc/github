import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import type {GroupKey} from '../../types'

interface AlertGroup {
  key: string
  name: string
  countCritical: number
  countHigh: number
  countMedium: number
  countLow: number
  total: number
}

export interface AlertGroupsResult {
  alertGroups: AlertGroup[]
  previous?: string
  next?: string
}

type AlertGroupsQueryResult = UseQueryResult<AlertGroupsResult>

interface UseAlertGroupsQueryParams {
  groupKey: GroupKey
  query?: string
  cursor?: string
}
export function useAlertGroupsQuery({groupKey, query, cursor}: UseAlertGroupsQueryParams): AlertGroupsQueryResult {
  if (groupKey === 'none') {
    throw new Error('Cannot fetch groups without a key')
  }

  const paths = usePaths()

  let params: {[key: string]: string | number | undefined} = {
    query,
    cursor,
  }

  // filter empty values from object
  params = Object.fromEntries(Object.entries(params).filter(([_, v]) => v))

  return useQuery({
    queryKey: ['groups', groupKey, params],
    queryFn: () => {
      const path = paths.unifiedAlertsGroupsPath({groupKey, ...params})
      return fetchJson(path)
    },
  })
}
