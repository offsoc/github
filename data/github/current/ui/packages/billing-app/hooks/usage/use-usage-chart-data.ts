import {useState} from 'react'
import useRequest from '../use-request'
import {USAGE_CHART_DATA_ROUTE} from '../../routes'

import {DEFAULT_GROUP_TYPE, GROUP_BY_NONE_TYPE, GROUP_BY_SKU_TYPE} from '../../constants'
import {RequestState, UsagePeriod} from '../../enums'

import type {Filters, UsageChartData} from '../../types/usage'

type UseUsageChartDataParams = {
  filters: Filters
  useUsageChartDataEndpoint: boolean
}

function useUsageChartData({filters, useUsageChartDataEndpoint}: UseUsageChartDataParams) {
  const [usageChartData, setUsageChartData] = useState<UsageChartData[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)

  const getGroupType = () => {
    // TODO: Make filters required
    // If we can't find the currently selected group, we fall back to default.
    const groupSelection = filters.group?.type ?? DEFAULT_GROUP_TYPE
    const isCurrentHourSelected = filters.period?.type === UsagePeriod.THIS_HOUR
    const isOrgorRepoQuery = filters.searchQuery.startsWith('org:') || filters.searchQuery.startsWith('repo:')
    // In this case, we need to request the data by SKU for the expandable usage table.
    if (isOrgorRepoQuery && groupSelection === GROUP_BY_NONE_TYPE && !isCurrentHourSelected) {
      return GROUP_BY_SKU_TYPE
    } else return groupSelection
  }

  useRequest({
    route: USAGE_CHART_DATA_ROUTE,
    reqParams: {
      customer_id: filters.customer.id,
      group: getGroupType().toString(),
      period: (filters.period?.type ?? UsagePeriod.DEFAULT).toString(),
      product: filters.product?.toString() ?? '',
      query: filters.searchQuery,
    },
    noop: !useUsageChartDataEndpoint,
    onStart: () => {
      setUsageChartData([])
      setRequestState(RequestState.LOADING)
    },
    onSuccess: response => {
      setUsageChartData(response.data.usage)
      setRequestState(RequestState.IDLE)
    },
    onError: () => {
      setRequestState(RequestState.ERROR)
      // addToast({
      //   type: 'error',
      //   message: ERRORS.QUERY_USAGE_ERROR,
      // })
    },
  })

  return {usageChartData, requestState}
}

export default useUsageChartData
