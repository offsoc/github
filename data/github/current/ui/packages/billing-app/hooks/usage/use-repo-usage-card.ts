import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import useRequest from '../use-request'
import {REPO_USAGE_ROUTE} from '../../routes'

import {ERRORS, GROUP_BY_ORG_TYPE} from '../../constants'
import {RequestState, UsagePeriod} from '../../enums'

import type {Filters, RepoUsageLineItem, OtherUsageLineItem} from '../../types/usage'

type UseRepoUsageCardParams = {
  filters: Filters
}

function useRepoUsageCard({filters}: UseRepoUsageCardParams) {
  const [usage, setUsage] = useState<RepoUsageLineItem[]>([])
  const [otherUsage, setOtherUsage] = useState<OtherUsageLineItem[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)
  const {addToast} = useToastContext()

  useRequest({
    route: REPO_USAGE_ROUTE,
    reqParams: {
      customer_id: filters.customer.id,
      period: (filters.period?.type ?? UsagePeriod.DEFAULT).toString(),
      // Set group to either org or repo to ensure we query the byOrgAndRepo partition. https://github.com/github/billing-platform/blob/main/lib/api/api.go#L122
      group: (filters.group?.type ?? GROUP_BY_ORG_TYPE).toString(),
    },
    onStart: () => {
      setUsage([])
      setOtherUsage([])
      setRequestState(RequestState.LOADING)
    },
    onSuccess: response => {
      setUsage(response.data.usage)
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

  return {usage, otherUsage, requestState}
}

export default useRepoUsageCard
