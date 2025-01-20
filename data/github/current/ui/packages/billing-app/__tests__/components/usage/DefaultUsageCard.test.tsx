import {render, screen} from '@testing-library/react'
import {DefaultUsageCard} from '../../../components/usage'
import {RequestState} from '../../../enums'
import {BudgetLimitTypes} from '../../../enums/budgets'

import {MOCK_PRODUCT_ACTIONS} from '../../../test-utils/mock-data'

import type {Budget} from '../../../types/budgets'
import type {UsageLineItem} from '../../../types/usage'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

describe('DefaultUsageCard', () => {
  const test_budgets: Budget[] = []
  test_budgets.push({
    targetType: 'Enterprise',
    targetAmount: 1000,
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
    currentAmount: 500,
    targetName: 'test',
    targetId: '1',
    uuid: '1',
    alertEnabled: true,
  })
  test_budgets.push({
    targetType: 'Repository',
    targetAmount: 1000,
    budgetLimitType: BudgetLimitTypes.AlertingOnly,
    currentAmount: 500,
    targetName: 'test2',
    targetId: '2',
    uuid: '2',
    alertEnabled: false,
  })

  const line_items: UsageLineItem[] = [
    {
      appliedCostPerQuantity: 0.259,
      billedAmount: 2.59,
      discountAmount: 2.59,
      quantity: 10,
      fullQuantity: 10,
      usageAt: '2023-03-01T08:00:00.00Z',
      totalAmount: 0,
    },
    {
      appliedCostPerQuantity: 0.259,
      billedAmount: 2.59,
      discountAmount: 2.01,
      quantity: 10,
      fullQuantity: 10,
      usageAt: '2023-03-01T08:00:00.00Z',
      totalAmount: 0.58,
    },
  ]

  it('Renders correct numbers of total/discount/billed', async () => {
    render(
      <DefaultUsageCard
        budgets={test_budgets}
        isOrgAdmin={false}
        product={MOCK_PRODUCT_ACTIONS}
        requestState={RequestState.IDLE}
        usage={line_items}
      />,
    )

    expect(await screen.findByTestId('actions-totals')).toHaveTextContent(
      '$5.18consumed usage - $4.60in discounts = $0.58in billable usage',
    )
  })

  it('Renders a progress bar with data', async () => {
    render(
      <DefaultUsageCard
        budgets={test_budgets}
        isOrgAdmin={false}
        product={MOCK_PRODUCT_ACTIONS}
        requestState={RequestState.IDLE}
        usage={[]}
      />,
    )

    expect(await screen.findByTestId('actions-usage')).toBeInTheDocument()
  })

  it('Does not renders progress bar if orgAdmin only', async () => {
    render(
      <DefaultUsageCard
        budgets={test_budgets}
        isOrgAdmin={true}
        product={MOCK_PRODUCT_ACTIONS}
        requestState={RequestState.IDLE}
        usage={[]}
      />,
    )

    expect(screen.queryByTestId('actions-usage')).toBeNull()
  })
})
