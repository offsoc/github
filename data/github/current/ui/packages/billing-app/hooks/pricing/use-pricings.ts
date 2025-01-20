// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useState} from 'react'

import useRequest from '../use-request'
import {STAFFTOOLS_PRICINGS_ROUTE} from '../../routes'

import {ERRORS} from '../../constants'
import {RequestState} from '../../enums'

import type {PricingDetails} from '../../types/pricings'

function usePricings() {
  const [pricings, setPricings] = useState<PricingDetails[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)
  const {addToast} = useToastContext()

  useRequest({
    route: STAFFTOOLS_PRICINGS_ROUTE,
    reqParams: {},
    onStart: () => {
      setPricings([])
      setRequestState(RequestState.LOADING)
    },
    onSuccess: response => {
      setPricings(response.data)
      setRequestState(RequestState.IDLE)
    },
    onError: () => {
      setRequestState(RequestState.ERROR)
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: ERRORS.QUERY_PRICINGS_ERROR,
      })
    },
  })

  return {pricings, requestState}
}

export default usePricings
