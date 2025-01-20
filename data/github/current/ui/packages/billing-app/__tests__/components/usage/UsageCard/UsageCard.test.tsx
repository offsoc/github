import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import UsageCard from '../../../../components/usage/UsageCard/UsageCard'
import {RequestState, UsageCardVariant, UsagePeriod} from '../../../../enums'

import type {RepoUsageLineItem} from '../../../../types/usage'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

const MOCK_USAGE: RepoUsageLineItem[] = [
  {
    appliedCostPerQuantity: 0.259,
    billedAmount: 10.0,
    quantity: 10,
    fullQuantity: 10,
    usageAt: '2023-05-03T10:00:00.00Z',
    product: 'actions',
    repo: {name: 'checkout'},
    org: {name: 'actions', avatarSrc: ''},
  },
  {
    appliedCostPerQuantity: 0.259,
    billedAmount: 15.0,
    quantity: 10,
    fullQuantity: 10,
    usageAt: '2023-05-03T10:00:00.00Z',
    product: 'actions',
    repo: {name: 'cache'},
    org: {name: 'actions', avatarSrc: ''},
  },
  {
    appliedCostPerQuantity: 0.259,
    billedAmount: 17.388,
    quantity: 10,
    fullQuantity: 10,
    usageAt: '2023-05-03T10:00:00.00Z',
    product: 'actions',
    repo: {name: 'illuminati'},
    org: {name: 'monalisa', avatarSrc: ''},
  },
  {
    appliedCostPerQuantity: 0.259,
    billedAmount: 20.0,
    quantity: 10,
    fullQuantity: 10,
    usageAt: '2023-05-03T10:00:00.00Z',
    product: 'actions',
    repo: {name: 'internal-server'},
    org: {name: 'github', avatarSrc: ''},
  },
  {
    appliedCostPerQuantity: 0.259,
    billedAmount: 25.0,
    quantity: 10,
    fullQuantity: 10,
    usageAt: '2023-05-03T10:00:00.00Z',
    product: 'actions',
    repo: {name: 'smile'},
    org: {name: 'monalisa', avatarSrc: ''},
  },
  {
    appliedCostPerQuantity: 0.259,
    billedAmount: 1.0,
    quantity: 10,
    fullQuantity: 10,
    usageAt: '2023-05-03T10:00:00.00Z',
    product: 'actions',
    repo: {name: 'repository'},
    org: {name: 'org', avatarSrc: ''},
  },
]

describe('UsageCard - org variant', () => {
  describe('subtitle text', () => {
    test('Renders the correct plurality when there is 1 organization with usage', () => {
      const loneOrgUsage: RepoUsageLineItem[] = [MOCK_USAGE[0] as RepoUsageLineItem]
      render(
        <UsageCard
          usage={loneOrgUsage}
          otherUsage={[]}
          variant={UsageCardVariant.ORG}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top organization')
      expect(screen.queryByTestId('usage-list-table-other-usage')).toBeNull()
    })

    test('Renders the correct plurality when there are 2 organization with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 2)
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top two organizations')
      expect(screen.queryByTestId('usage-list-table-other-usage')).toBeNull()
    })

    test('Renders the correct plurality when there are 3 organization with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 3)
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top three organizations')
      expect(screen.queryByTestId('usage-list-table-other-usage')).toBeNull()
    })

    test('Renders the correct plurality when there are 4 organization with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 4)
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top four organizations')
      expect(screen.queryByTestId('usage-list-table-other-usage')).toBeNull()
    })

    test('Renders the correct plurality when there are 5 organization with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 5)
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top five organizations')
      expect(screen.queryByTestId('usage-list-table-other-usage')).toBeNull()
    })

    test('Renders the correct plurality when there are more than five organization with usage', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top five organizations')
      expect(screen.getByTestId('usage-list-table-other-usage')).toBeInTheDocument()
    })

    test('Renders the correct subtitle text when the filter is set to "hour"', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_HOUR}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('this hour')
    })

    test('Renders the correct subtitle text when the filter is set to "today"', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.TODAY}
          requestState={RequestState.IDLE}
        />,
      )

      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('today')
    })

    test('Renders the correct subtitle text when the filter is set to "this month"', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('this month')
    })

    test('Renders the correct subtitle text when the filter is set to "last month"', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.LAST_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('last month')
    })

    test('Renders the correct subtitle text when the period filter is set to "year"', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_YEAR}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('this year')
    })

    test('Renders the correct subtitle text when the period filter is set to "Last Year"', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.ORG}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.LAST_YEAR}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('last year')
    })
  })
})

describe('UsageCard - repo variant', () => {
  describe('subtitle text', () => {
    test('Renders the correct plurality when there is only one repository with usage', () => {
      const loneOrgUsage: RepoUsageLineItem[] = [MOCK_USAGE[0] as RepoUsageLineItem]
      render(
        <UsageCard
          variant={UsageCardVariant.REPO}
          usage={loneOrgUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top repository')
    })

    test('Renders the correct plurality when there are two repositories with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 2)
      render(
        <UsageCard
          variant={UsageCardVariant.REPO}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top two repositories')
    })

    test('Renders the correct plurality when there are three repositories with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 3)
      render(
        <UsageCard
          variant={UsageCardVariant.REPO}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top three repositories')
    })

    test('Renders the correct plurality when there are four repositories with usage', () => {
      const organizationUsage: RepoUsageLineItem[] = MOCK_USAGE.slice(0, 4)
      render(
        <UsageCard
          variant={UsageCardVariant.REPO}
          usage={organizationUsage}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top four repositories')
    })

    test('Renders the correct plurality when there are five repositories with usage', () => {
      render(
        <UsageCard
          variant={UsageCardVariant.REPO}
          usage={MOCK_USAGE}
          otherUsage={[]}
          usagePeriod={UsagePeriod.THIS_MONTH}
          requestState={RequestState.IDLE}
        />,
      )
      expect(screen.getByTestId('usage-card-subtitle').textContent).toMatch('Top five repositories')
    })
  })
})
