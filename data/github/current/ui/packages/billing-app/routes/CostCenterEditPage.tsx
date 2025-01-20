import Layout from '../components/Layout'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import CostCenterForm from '../components/cost_centers/CostCenterForm'

import type {AdminRole, Customer} from '../types/common'
import type {CostCenter, Subscription} from '../types/cost-centers'

export interface CostCenterEditPagePayload {
  adminRoles: AdminRole[]
  costCenter: CostCenter
  customer: Customer
  uri: string
  subscriptions: Subscription[]
  isCopilotStandalone: boolean
}

export function CostCenterEditPage() {
  const payload = useRoutePayload<CostCenterEditPagePayload>()
  const {adminRoles, costCenter, customer, uri, subscriptions, isCopilotStandalone} = payload

  return (
    <>
      <Layout>
        <CostCenterForm
          action="edit"
          adminRoles={adminRoles}
          costCenter={costCenter}
          customer={customer}
          encodedAzureSubscriptionUri={uri}
          subscriptions={subscriptions}
          isCopilotStandalone={isCopilotStandalone}
        />
      </Layout>
    </>
  )
}
