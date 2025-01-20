import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import useRequest from '../use-request'

import {ERRORS} from '../../constants'
import {DISCOUNTS_ROUTE} from '../../routes'
import {filterbyEnabledProducts, getUpdatedDiscountAmounts} from '../../utils/discount'

import type {DiscountState} from '../../types/customer'
import type {EnabledProduct} from '../../types/products'
import type {DiscountAmountsMap} from '../../types/discounts'

type LoadDiscountsParams = {
  enabledProducts: EnabledProduct[]
}

function useDiscounts({enabledProducts}: LoadDiscountsParams) {
  const [discountStates, setDiscountStates] = useState<DiscountState[]>([])
  const [discountTargetAmounts, setDiscountTargetAmounts] = useState<DiscountAmountsMap>({})
  const {addToast} = useToastContext()

  // getMonth() is 0 based, but we need to pass in a value between 1-12
  const month = new Date().getUTCMonth() + 1
  const year = new Date().getUTCFullYear()

  useRequest({
    route: DISCOUNTS_ROUTE,
    reqParams: {month: month.toString(), year: year.toString()},
    onStart: () => {
      setDiscountStates([])
      setDiscountTargetAmounts({})
    },
    onSuccess: response => {
      const enabledDiscounts = response.data.discounts.filter(filterbyEnabledProducts(enabledProducts))
      const targetAmounts = getUpdatedDiscountAmounts(enabledDiscounts)
      setDiscountStates(enabledDiscounts)
      setDiscountTargetAmounts(targetAmounts)
    },
    onError: () => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: ERRORS.QUERY_DISCOUNTS_ERROR,
      })
    },
  })

  return {discounts: discountStates, discountTargetAmounts}
}

export default useDiscounts
