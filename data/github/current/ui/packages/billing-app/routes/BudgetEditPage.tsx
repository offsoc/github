import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import Layout from '../components/Layout'
import BudgetForm from '../components/budget/BudgetForm'

import type {EditBudget} from '../types/budgets'
import type {AdminRole} from '../types/common'
import type {Product} from '../types/products'

export interface BudgetEditPagePayload {
  slug: string
  budget: EditBudget
  adminRoles: AdminRole[]
  enabledProducts: Product[]
}

export function BudgetEditPage() {
  const payload = useRoutePayload<BudgetEditPagePayload>()

  return (
    <Layout>
      <BudgetForm
        budget={payload.budget}
        slug={payload.slug}
        adminRoles={payload.adminRoles}
        enabledProducts={payload.enabledProducts}
      />
    </Layout>
  )
}
