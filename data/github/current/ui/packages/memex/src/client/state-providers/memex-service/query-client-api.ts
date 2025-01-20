import type {QueryClient} from '@tanstack/react-query'

import type {MemexServiceData} from '../../api/memex/contracts'
import {useMemexServiceQuery} from './use-memex-service-query'

export function setMemexServiceQueryData(queryClient: QueryClient, newQueryData: MemexServiceData) {
  queryClient.setQueryData<MemexServiceData>(useMemexServiceQuery.getKey(), newQueryData)
}

export function getMemexServiceQueryData(queryClient: QueryClient) {
  return queryClient.getQueryData<MemexServiceData>(useMemexServiceQuery.getKey())
}
