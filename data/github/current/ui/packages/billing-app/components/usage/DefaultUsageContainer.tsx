import {DefaultUsageCard} from '.'
import useBudgetsPage from '../../hooks/budget/use-budgets-page'
import {useNetUsageData} from '../../hooks/usage'

import type {Customer} from '../../types/common'
import type {EnabledProduct} from '../../types/products'
import type {Filters} from '../../types/usage'

interface Props {
  customer: Customer
  filters: Filters
  isOnlyOrgAdmin: boolean
  product: EnabledProduct
}

export function DefaultUsageContainer({customer, filters, isOnlyOrgAdmin, product}: Props) {
  // Un-commenting this line will tell the budgets table to pull from cost center customers when selected,
  // but right now all cost centers are scoped under the enterprise. Leaving in place per @mattkorwel
  // const {budgets, deleteBudgetFromPage} = useBudgetsPage({slug, customerId: filters.customer.id})
  const {budgets} = useBudgetsPage({customerId: customer.customerId})
  const {netUsage, requestState: netUsageRequestState} = useNetUsageData({filters})

  return (
    <>
      <DefaultUsageCard
        budgets={budgets}
        isOrgAdmin={isOnlyOrgAdmin}
        product={product}
        requestState={netUsageRequestState}
        usage={netUsage}
      />
    </>
  )
}
