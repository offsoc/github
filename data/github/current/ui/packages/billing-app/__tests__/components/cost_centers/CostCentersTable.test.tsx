import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {PageContext} from '../../../App'
import CostCentersTable from '../../../components/cost_centers/CostCentersTable'
import {ResourceType} from '../../../enums/cost-centers'
import {CostCenterTabs} from '../../../routes/CostCentersPage'

import {mockCostCenter} from '../../../test-utils/mock-data'

import type {CostCenter} from '../../../types/cost-centers'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({business: 'github-inc'}),
}))

function TestComponent({
  costCenters = [mockCostCenter],
  isStafftoolsRoute = false,
  selectedTab = CostCenterTabs.Active,
  hasUserScopedCostCenters = true,
}: {
  costCenters?: CostCenter[]
  isStafftoolsRoute?: boolean
  selectedTab?: CostCenterTabs
  hasUserScopedCostCenters?: boolean
}) {
  return (
    <PageContext.Provider value={{isStafftoolsRoute, isEnterpriseRoute: true, isOrganizationRoute: false}}>
      <CostCentersTable
        costCenters={costCenters}
        selectedTab={selectedTab}
        hasUserScopedCostCenters={hasUserScopedCostCenters}
      />
    </PageContext.Provider>
  )
}

describe('CostCentersTable', () => {
  const uuid = mockCostCenter.costCenterKey.uuid

  test('Renders the cost center UUID when isStafftools is true', async () => {
    render(<TestComponent isStafftoolsRoute={true} />)

    const uuidElem = screen.queryByText(uuid)
    expect(uuidElem).toBeInTheDocument()
  })

  test('Does not render the cost center UUID when isStafftools is false', async () => {
    render(<TestComponent isStafftoolsRoute={false} />)

    const uuidElem = screen.queryByText(uuid)
    expect(uuidElem).toBeNull()
  })

  test('Does not render the cost center UUID when isStafftools is false but the feature flag for editing cost centers is enabled', async () => {
    render(<TestComponent isStafftoolsRoute={false} />)

    const uuidElem = screen.queryByText(uuid)
    expect(uuidElem).toBeNull()
  })

  test('Adds link to enterprise members page for cost center members', async () => {
    render(<TestComponent />)

    const peopleLink = screen.queryByTestId(`cost-center-url-${uuid}`)
    expect(peopleLink).toHaveAttribute('href', '/enterprises/github-inc/people?query=cost_center:test')
  })

  test('Does not add link to enterprise members page for stafftools', async () => {
    render(<TestComponent isStafftoolsRoute={true} />)

    const peopleLink = screen.queryByTestId(`cost-center-url-${uuid}`)
    expect(peopleLink).toBeNull()
  })

  test('Does not add link to enterprise members page when there are no user-scoped cost centers', async () => {
    render(<TestComponent hasUserScopedCostCenters={false} />)

    const peopleLink = screen.queryByTestId(`cost-center-url-${uuid}`)
    expect(peopleLink).toBeNull()
  })

  test('Adds link to enterprise members page with cost center slug in query for cost centers with user resources', async () => {
    const costCenters = [
      {
        ...mockCostCenter,
        name: 'User one',
        resources: [{id: 'user-1', type: ResourceType.User}],
      },
    ]

    render(<TestComponent costCenters={costCenters} />)

    const peopleLink = screen.queryByTestId(`cost-center-url-${uuid}`)

    // this also tests the slug creation logic. We expect the name to be lowercased and spaces are replaced with '-'
    expect(peopleLink).toHaveAttribute('href', `/enterprises/github-inc/people?query=cost_center:user-one`)
  })

  test('Adds link to enterprise members page with cost center uuid in query when there are duplicate slug names', async () => {
    const costCenterOneUUID = 'uuid-1'
    const costCenters = [
      {
        ...mockCostCenter,
        costCenterKey: {
          ...mockCostCenter.costCenterKey,
          uuid: costCenterOneUUID,
        },
        resources: [{id: 'user-1', type: ResourceType.User}],
      },
      {
        ...mockCostCenter,
        costCenterKey: {
          ...mockCostCenter.costCenterKey,
          uuid: 'uuid-2',
        },
        resources: [{id: 'user-2', type: ResourceType.User}],
      },
    ]

    render(<TestComponent costCenters={costCenters} />)

    const peopleLink = screen.queryByTestId(`cost-center-url-${costCenterOneUUID}`)
    expect(peopleLink).toHaveAttribute('href', `/enterprises/github-inc/people?query=cost_center:${costCenterOneUUID}`)
  })

  test('Hides pagination component when data length < pageSize', () => {
    const data: CostCenter[] = []
    for (let i = 0; i < 5; i++) {
      data.push({
        ...mockCostCenter,
        costCenterKey: {
          ...mockCostCenter.costCenterKey,
          uuid: `uuid-${i}`,
        },
        name: `User${i}`,
        resources: [{id: String(i), type: ResourceType.User}],
      })
    }
    render(<TestComponent costCenters={data} />)
    expect(screen.getAllByText('0 Repositories')).toHaveLength(5)
    expect(screen.queryByText('Next')).toBeNull()
  })

  test('Shows pagination component when data length > pageSize', () => {
    const data: CostCenter[] = []
    for (let i = 0; i < 30; i++) {
      data.push({
        ...mockCostCenter,
        costCenterKey: {
          ...mockCostCenter.costCenterKey,
          uuid: `uuid-${i}`,
        },
        name: `User${i}`,
        resources: [{id: String(i), type: ResourceType.User}],
      })
    }
    render(<TestComponent costCenters={data} />)
    expect(screen.getAllByText('0 Repositories')).toHaveLength(10)
    expect(screen.getByText('Next')).not.toBeNull()
  })
})
