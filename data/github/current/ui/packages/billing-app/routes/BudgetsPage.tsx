import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Heading, LinkButton, Text} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'

import BudgetsTable from '../components/budget/BudgetsTable'
import Layout from '../components/Layout'
import {BUDGET_SCOPE_CUSTOMER, BUDGET_SCOPE_ENTERPRISE} from '../constants'
import useBudgetsPage from '../hooks/budget/use-budgets-page'
import useRoute from '../hooks/use-route'
import {NEW_BUDGET_ROUTE} from '../routes'
import {pageHeadingStyle} from '../utils'
import {useContext} from 'react'
import {isOnTrial} from '../utils/business'

import {PageContext} from '../App'
import type {Budget} from '../types/budgets'
import type {AdminRole, Customer} from '../types/common'
import type {Product} from '../types/products'
import {GoalIcon, InfoIcon} from '@primer/octicons-react'

export interface BudgetsPagePayload {
  customer: Customer
  type: string
  budgets: Budget[]
  adminRoles: AdminRole[]
  enabledProducts: Product[]
  helpUrl: string
}

export function BudgetsPage() {
  const payload = useRoutePayload<BudgetsPagePayload>()
  const {adminRoles, customer, enabledProducts, helpUrl} = payload
  const {customerId} = customer

  const {budgets, deleteBudgetFromPage} = useBudgetsPage({customerId})
  const enterpriseBudgets = budgets
    .filter(b => b.targetType === BUDGET_SCOPE_CUSTOMER || b.targetType === BUDGET_SCOPE_ENTERPRISE) // TODO: remove 'Enterprise' after data migration
    .sort((a, b) => {
      return a.targetName > b.targetName ? 1 : -1
    })
  const nonEnterpriseBudgets = budgets
    .filter(b => b.targetType !== BUDGET_SCOPE_CUSTOMER && b.targetType !== BUDGET_SCOPE_ENTERPRISE) // TODO: remove 'Enterprise' after data migration
    .sort((a, b) => {
      return a.targetName > b.targetName ? 1 : -1
    })
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute
  const trialCustomer = isOnTrial(customer.plan)
  const budgetsDocsUrl = `${helpUrl}/early-access/billing/billing-private-beta#using-budgets-and-alerts`

  const {path: newBudgetPath} = useRoute(NEW_BUDGET_ROUTE)
  return (
    <Layout>
      <header className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Budgets and alerts
        </Heading>
        {!isStafftoolsRoute && !trialCustomer && (
          <LinkButton
            href={newBudgetPath}
            sx={{color: 'btn.text', ':hover': {textDecoration: 'none'}}}
            underline={false}
          >
            <Text sx={{fontWeight: 'normal'}}>New budget</Text>
          </LinkButton>
        )}
      </header>
      {trialCustomer ? (
        <div className="text-center">
          <Blankslate border>
            <Blankslate.Visual>
              <GoalIcon size={24} />
            </Blankslate.Visual>
            <Blankslate.Heading>Track spending using budgets</Blankslate.Heading>
            <Blankslate.Description>
              <span>
                You can create budgets to track your spending on products like Actions and Copilot for an organization,
                repository, cost center or the entire enterprise.
              </span>
              <br />
              <br />
              <span>
                <InfoIcon size={16} /> This is a paid feature and is not included as part of your trial.
              </span>
            </Blankslate.Description>
            <Blankslate.SecondaryAction href={budgetsDocsUrl}>Learn more about budgets</Blankslate.SecondaryAction>
          </Blankslate>
        </div>
      ) : (
        <>
          <div>
            <BudgetsTable
              budgets={enterpriseBudgets}
              adminRoles={adminRoles}
              deleteBudget={deleteBudgetFromPage}
              enabledProducts={enabledProducts}
              isEnterpriseTable
            />
          </div>
          <br />
          <div>
            <BudgetsTable
              budgets={nonEnterpriseBudgets}
              adminRoles={adminRoles}
              deleteBudget={deleteBudgetFromPage}
              enabledProducts={enabledProducts}
            />
          </div>
        </>
      )}
    </Layout>
  )
}
