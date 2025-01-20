import {useEffect, useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import useRoute from '../use-route'
import {HTTPMethod, doRequest} from '../use-request'
import {USAGE_ROUTE} from '../../routes'

import {DEFAULT_GROUP_TYPE, ERRORS} from '../../constants'
import {RequestState, UsageGrouping, UsagePeriod} from '../../enums'
import {formatUsageDateForPeriod} from '../../utils/date'
import {groupLineItems} from '../../utils/group'
import {isProductUsageLineItem, isRepoUsageLineItem} from '../../utils/types'

import type {ProductUsageLineItem, UsageLineItem, Filters} from '../../types/usage'

type UseUsageSubTableDataParams = {
  lineItem: UsageLineItem
  open: boolean | undefined
  rawUsage: UsageLineItem[]
  filters: Filters
}
export default function useUsageSubTableData({lineItem, open, rawUsage, filters}: UseUsageSubTableDataParams) {
  const [usage, setUsage] = useState<ProductUsageLineItem[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)
  const {addToast} = useToastContext()

  const customerId = filters.customer.id
  // TODO: Make filters required
  const groupType = filters?.group?.type ?? DEFAULT_GROUP_TYPE
  const periodType = filters?.period?.type ?? UsagePeriod.DEFAULT

  const getUsageBySkuForDate = () => {
    const dateFilteredUsage = rawUsage.filter(
      item =>
        formatUsageDateForPeriod(lineItem.usageAt, periodType) === formatUsageDateForPeriod(item.usageAt, periodType),
    )
    return groupLineItems(dateFilteredUsage, UsageGrouping.SKU)
  }

  const getUsageGroupingBySKU = () => {
    return groupLineItems(rawUsage, UsageGrouping.SKU)
  }

  // Ensure the searchQuery is set correctly and will update the patch below
  const getSearchQuery = (): string => {
    if (isProductUsageLineItem(lineItem) && groupType === UsageGrouping.PRODUCT)
      return `product:${lineItem.product} ${filters.searchQuery}`.trim()
    if (!isRepoUsageLineItem(lineItem)) return ''
    if (groupType === UsageGrouping.ORG) return `org:${lineItem.org.name}`
    if (groupType === UsageGrouping.REPO) return `repo:${lineItem.org.name}/${lineItem.repo.name}`
    return ''
  }

  const {path} = useRoute(
    USAGE_ROUTE,
    {},
    {
      customer_id: customerId,
      group: UsageGrouping.SKU.toString(),
      period: periodType.toString(),
      query: getSearchQuery(),
    },
  )

  useEffect(() => {
    const fetchUsageBySku = async () => {
      if (!open) return

      setRequestState(RequestState.LOADING)
      try {
        // no need to re-request usage for none, SKU and product groupings, we already have it
        if (groupType === UsageGrouping.NONE) {
          setUsage(getUsageBySkuForDate() as ProductUsageLineItem[])
          setRequestState(RequestState.IDLE)
        } else if (groupType === UsageGrouping.SKU || groupType === UsageGrouping.PRODUCT) {
          setUsage(getUsageGroupingBySKU() as ProductUsageLineItem[])
          setRequestState(RequestState.IDLE)
        } else {
          const response = await doRequest(HTTPMethod.GET, path)
          if (response.ok) {
            setUsage(groupLineItems(response.data.usage, UsageGrouping.SKU) as ProductUsageLineItem[])
            setRequestState(RequestState.IDLE)
          } else {
            setRequestState(RequestState.ERROR)
          }
        }
      } catch {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'error', message: ERRORS.QUERY_USAGE_ERROR})
        setRequestState(RequestState.ERROR)
      }
    }
    setUsage([])
    fetchUsageBySku()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, periodType, groupType])

  return {usage, requestState, getSearchQuery}
}
