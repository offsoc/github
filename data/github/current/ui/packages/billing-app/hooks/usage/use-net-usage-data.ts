import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import useRequest from '../use-request'
import {REPO_USAGE_ROUTE, NET_USAGE_ROUTE} from '../../routes'

import {DEFAULT_GROUP_TYPE, ERRORS, GROUP_BY_NONE_TYPE, GROUP_BY_SKU_TYPE} from '../../constants'
import {RequestState, UsageGrouping, UsagePeriod} from '../../enums'

import type {
  NetUsageLineItem,
  UsageLineItem,
  ProductUsageLineItem,
  Filters,
  OtherUsageLineItem,
} from '../../types/usage'

type UseNetUsageDataParams = {
  filters: Filters
}

function useNetUsageData({filters}: UseNetUsageDataParams) {
  const [netUsageLineItems, setNetUsageLineItems] = useState<NetUsageLineItem[]>([])
  const [otherUsage, setOtherUsage] = useState<OtherUsageLineItem[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)
  const {addToast} = useToastContext()

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
    route: [UsageGrouping.ORG, UsageGrouping.REPO].includes(getGroupType()) ? REPO_USAGE_ROUTE : NET_USAGE_ROUTE,
    reqParams: {
      customer_id: filters.customer.id,
      group: getGroupType().toString(),
      period: (filters.period?.type ?? UsagePeriod.DEFAULT).toString(),
      product: filters.product?.toString() ?? '',
      query: filters.searchQuery,
    },
    onStart: () => {
      setNetUsageLineItems([])
      setOtherUsage([])
      setRequestState(RequestState.LOADING)
    },
    onSuccess: response => {
      setNetUsageLineItems(response.data.usage)
      setOtherUsage(response.data.other ?? [])
      setRequestState(RequestState.IDLE)
    },
    onError: () => {
      setRequestState(RequestState.ERROR)
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: ERRORS.QUERY_USAGE_ERROR,
      })
    },
  })
  const netUsage: UsageLineItem[] = []

  // this exists to handle the situation where we have hit the REPO_USAGE_ROUTE and need to just return the raw repo usage
  // we could probably stand to do some refactoring here as the shape of the object returned by REPO_USAGE_ROUTE is
  //    very different than that returned by NET_USAGE_ROUTE / USAGE_ROUTE
  if ([UsageGrouping.ORG, UsageGrouping.REPO].includes(getGroupType())) {
    for (const netUsageLineItem of netUsageLineItems) {
      netUsage.push(netUsageLineItem)
    }
  } else {
    for (const netUsageLineItem of netUsageLineItems) {
      const usageLineItem: ProductUsageLineItem = {
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
      }
      netUsage.push(usageLineItem)
    }
  }

  return {netUsage, otherUsage, requestState}
}

export default useNetUsageData
