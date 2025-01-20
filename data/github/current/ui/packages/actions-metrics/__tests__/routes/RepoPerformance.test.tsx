import {act, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {OrgPerformance} from '../../routes/OrgPerformance'
import {PerformanceTestUtils} from '../test-utils/views/performance/test-utils'
import {MockDataService} from '../test-utils/common/services/data-service.mock'
import {Services} from '../../common/services/services'
import {registerServices} from '../../common/services/service-registrations'
import type {IMetricsService} from '../../common/services/metrics-service'
import {TestUtils} from '../test-utils/utils/test-utils'
import {ScopeType} from '../../common/models/enums'

jest.setTimeout(5_000)

describe('Actions Metrics Org Performance', () => {
  beforeAll(() => {
    registerServices()
    PerformanceTestUtils.registerDataServiceMock()
  })
  it('only tries to fetch twice (performance data + cards data)', async () => {
    const fetchSpy = jest.spyOn(MockDataService.prototype, 'verifiedFetchJSONWrapper')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      render(<OrgPerformance />, {routePayload: TestUtils.getMockPayload(ScopeType.Repo)})
    })

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })
  it('renders items in table without repository data', async () => {
    render(<OrgPerformance />, {routePayload: TestUtils.getMockPayload(ScopeType.Repo)})

    await waitFor(() => {
      expect(screen.queryByText('repository-1')).not.toBeInTheDocument()
    })
  })
  it('renders items in table', async () => {
    render(<OrgPerformance />, {routePayload: TestUtils.getMockPayload(ScopeType.Repo)})

    await waitFor(() => {
      expect(screen.getByText('workflow-1')).toBeInTheDocument()
    })
  })
  it('renders correct # of items', async () => {
    render(<OrgPerformance />, {routePayload: TestUtils.getMockPayload(ScopeType.Repo)})
    const orgPerformanceService = Services.get<IMetricsService>('IMetricsService')

    const pageSize = orgPerformanceService.getMetricsView().value.virtualPageSize
    await waitFor(() => {
      expect(screen.getAllByText('workflow-', {exact: false})).toHaveLength(pageSize)
    })
  })
})
