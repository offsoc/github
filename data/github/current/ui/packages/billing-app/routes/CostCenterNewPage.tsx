import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import Layout from '../components/Layout'
import CostCenterForm from '../components/cost_centers/CostCenterForm'
import {getCostCenterType} from '../utils/cost-centers'

import type {AdminRole, Customer} from '../types/common'
import type {Subscription} from '../types/cost-centers'

export interface CostCenterNewPagePayload {
  adminRoles: AdminRole[]
  customer: Customer
  uri: string
  subscriptions: Subscription[]
  isCopilotStandalone: boolean
}

export function CostCenterNewPage() {
  const payload = useRoutePayload<CostCenterNewPagePayload>()
  const {adminRoles, customer, uri, subscriptions, isCopilotStandalone} = payload
  const newCostCenter = {
    costCenterKey: {
      customerId: customer.customerId,
      targetType: getCostCenterType(customer.billingTarget),
      targetId: '',
      uuid: '',
    },
    name: '',
    resources: [],
  }

  return (
    <Layout>
      <CostCenterForm
        action="new"
        adminRoles={adminRoles}
        costCenter={newCostCenter}
        customer={customer}
        encodedAzureSubscriptionUri={uri}
        subscriptions={subscriptions}
        isCopilotStandalone={isCopilotStandalone}
      />
    </Layout>
  )
}
