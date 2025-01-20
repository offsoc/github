import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import {ErrorComponent} from '../components'
import BudgetForm from '../components/budget/BudgetForm'
import Layout from '../components/Layout'

import type {AdminRole} from '../types/common'
import type {Product} from '../types/products'

export interface BudgetNewPagePayload {
  slug: string
  current_user_id: string
  adminRoles: AdminRole[]
  enabledProducts: Product[]
}

export function BudgetNewPage() {
  const payload = useRoutePayload<BudgetNewPagePayload>()
  const {enabledProducts, slug, current_user_id, adminRoles} = payload

  return (
    <Layout>
      {enabledProducts.length > 0 ? (
        <BudgetForm
          slug={slug}
          currentUserId={current_user_id}
          adminRoles={adminRoles}
          enabledProducts={enabledProducts}
        />
      ) : (
        <ErrorComponent sx={{border: 0}} testid="new-budget-form-loading-error" text="Something went wrong" />
      )}
    </Layout>
  )
}
