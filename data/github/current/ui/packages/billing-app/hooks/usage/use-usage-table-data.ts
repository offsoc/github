import {useState} from 'react'
import useRequest from '../use-request'
import {USAGE_TABLE_DATA_ROUTE} from '../../routes'

import {DEFAULT_GROUP_TYPE, GROUP_BY_NONE_TYPE, GROUP_BY_SKU_TYPE} from '../../constants'
import {RequestState, UsagePeriod, UsageGrouping} from '../../enums'

import type {Filters, NetUsageLineItem, ProductUsageLineItem} from '../../types/usage'

type UseUsageChartDataParams = {
  filters: Filters
  useUsageTableDataEndpoint?: boolean
}

function useUsageTableData({filters, useUsageTableDataEndpoint}: UseUsageChartDataParams) {
  const [usageTableData, setUsageTableData] = useState<NetUsageLineItem[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)

  const getGroupType = () => {
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
    route: USAGE_TABLE_DATA_ROUTE,
    reqParams: {
      customer_id: filters.customer.id,
      group: getGroupType().toString(),
      period: (filters.period?.type ?? UsagePeriod.DEFAULT).toString(),
      product: filters.product?.toString() ?? '',
      query: filters.searchQuery,
    },
    noop: !useUsageTableDataEndpoint,
    onStart: () => {
      setUsageTableData([])
      setRequestState(RequestState.LOADING)
    },
    onSuccess: response => {
      if ([UsageGrouping.ORG, UsageGrouping.REPO].includes(getGroupType())) {
        setUsageTableData(response.data.usage)
      } else {
        setUsageTableData(
          response.data.usage.map(
            (netUsageLineItem: NetUsageLineItem) =>
              ({
                appliedCostPerQuantity: netUsageLineItem.appliedCostPerQuantity,
                billedAmount: netUsageLineItem.grossAmount,
                discountAmount: netUsageLineItem.discountAmount,
                quantity: netUsageLineItem.quantity,
                fullQuantity: netUsageLineItem.fullQuantity,
                usageAt: netUsageLineItem.usageAt,
                totalAmount: netUsageLineItem.netAmount,
                sku: netUsageLineItem.sku,
                friendlySkuName: netUsageLineItem.friendlySkuName,
                product: netUsageLineItem.product,
                unitType: netUsageLineItem.unitType,
              }) as ProductUsageLineItem,
          ),
        )
      }

      setRequestState(RequestState.IDLE)
    },
    onError: () => {
      setRequestState(RequestState.ERROR)
    },
  })

  return {usageTableData, requestState}
}

export default useUsageTableData
