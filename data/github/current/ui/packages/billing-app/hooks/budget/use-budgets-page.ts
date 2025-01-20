import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import useRequest from '../use-request'

import {ERRORS} from '../../constants'
import {BUDGETS_ROUTE} from '../../routes'

import type {Budget} from '../../types/budgets'

type UseBudgetsPageParams = {
  // The customer ID to load budgets for. This can be different than the Enterprise's
  // customer id if a cost center is selected
  customerId: string
}

function useBudgetsPage({customerId}: UseBudgetsPageParams) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const {addToast} = useToastContext()

  useRequest({
    route: BUDGETS_ROUTE,
    reqParams: {customer_id: customerId},
    onStart: () => setBudgets([]),
    onSuccess: response => setBudgets(response.data.payload.budgets),
    onError: () => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: ERRORS.QUERY_BUDGETS_ERROR,
      })
    },
  })

  /** removes budget from state with a given uuid */
  function deleteBudgetFromPage(uuid: string) {
    const deleteIndex = budgets.findIndex(b => b.uuid === uuid)
    const updatedBudgets = [...budgets]

    updatedBudgets.splice(deleteIndex, 1)

    setBudgets(updatedBudgets)
  }

  return {budgets, deleteBudgetFromPage}
}

export default useBudgetsPage
