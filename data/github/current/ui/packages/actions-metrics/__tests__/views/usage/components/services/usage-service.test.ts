import {waitFor} from '@testing-library/react'
import {UsageTestUtils} from '../../../../test-utils/views/usage/test-utils'
import {MockDataService} from '../../../../test-utils/common/services/data-service.mock'
import {Services} from '../../../../../common/services/services'
import {registerServices} from '../../../../../common/services/service-registrations'
import {REAL_PAGE_SIZE, VIRTUAL_PAGE_SIZE} from '../../../../../common/services/metrics-service'
import {DateRangeType, ScopeType, TabType} from '../../../../../common/models/enums'
import {MockRoutingService} from '../../../../test-utils/common/services/routing-service.mock'
import type {ICacheService} from '../../../../../common/services/cache-service'
import {FilterUtils} from '../../../../../common/utils/filter-utils'
import {UsageService} from '../../../../../views/usage/services/usage-service'
import {getUsageFilters} from '../../../../../views/usage/utils/filter-providers'
import type {IPayloadService} from '../../../../../common/services/payload-service'
import {TestUtils} from '../../../../test-utils/utils/test-utils'

const fetchSpy = jest.spyOn(MockDataService.prototype, 'verifiedFetchJSONWrapper')
let orgUsageService: UsageService

describe('actions-metrics org-usage-service caching', () => {
  beforeAll(() => {
    registerServices()
    UsageTestUtils.registerDataServiceMock()
    Services.add(MockRoutingService.serviceId, MockRoutingService)
    const payloadService = Services.get<IPayloadService>('IPayloadService')
    payloadService.init(TestUtils.getMockPayload(ScopeType.Org))
  })
  beforeEach(() => {
    orgUsageService = new UsageService()
    fetchSpy.mockClear()
    const cacheService = Services.get<ICacheService>('ICacheService')
    cacheService.clear()
  })

  it('changing tab and changing back should use cache', async () => {
    orgUsageService.setTab(TabType.Workflows)
    orgUsageService.setTab(TabType.Jobs)
    orgUsageService.setTab(TabType.Workflows)
    orgUsageService.setTab(TabType.Jobs)
    orgUsageService.setTab(TabType.Workflows)
    orgUsageService.setTab(TabType.Jobs)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2) // once for workflows and once for jobs
    })
  })

  it('changing page should be virtualized to use cache', async () => {
    orgUsageService.setPage(0)
    orgUsageService.setPage(1)
    orgUsageService.setPage(2)
    orgUsageService.setPage(3)
    orgUsageService.setPage(4)
    orgUsageService.setPage(5)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1) // once for first page
    })
  })

  it('should not use cache when switching between actual (non-virtualized) pages', async () => {
    orgUsageService.setPage(REAL_PAGE_SIZE / VIRTUAL_PAGE_SIZE)
    orgUsageService.setPage(0)
    orgUsageService.setPage(REAL_PAGE_SIZE / VIRTUAL_PAGE_SIZE)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(3)
    })
  })
})

describe('actions-metrics org-usage-service pagination', () => {
  beforeAll(() => {
    registerServices()
    UsageTestUtils.registerDataServiceMock()
    Services.add(MockRoutingService.serviceId, MockRoutingService)
    const payloadService = Services.get<IPayloadService>('IPayloadService')
    payloadService.init(TestUtils.getMockPayload(ScopeType.Org))
  })
  beforeEach(() => {
    orgUsageService = new UsageService()
    fetchSpy.mockClear()
    const cacheService = Services.get<ICacheService>('ICacheService')
    cacheService.clear()
  })

  it('sets page correctly', async () => {
    orgUsageService.setTab(TabType.Workflows)

    let view = orgUsageService.getMetricsView().value
    expect(view.virtualOffset).toEqual(0)
    expect(view.offset).toEqual(0)

    orgUsageService.setPage(1)

    view = orgUsageService.getMetricsView().value
    expect(view.virtualOffset).toEqual(VIRTUAL_PAGE_SIZE)
    expect(view.offset).toEqual(0)

    const newRealPage = REAL_PAGE_SIZE / VIRTUAL_PAGE_SIZE
    orgUsageService.setPage(newRealPage)

    view = orgUsageService.getMetricsView().value
    expect(view.virtualOffset).toEqual(newRealPage * VIRTUAL_PAGE_SIZE)
    expect(view.offset).toEqual(REAL_PAGE_SIZE)
  })
})

describe('actions-metrics org-usage-service view changes', () => {
  beforeAll(() => {
    registerServices()
    UsageTestUtils.registerDataServiceMock()
    Services.add(MockRoutingService.serviceId, MockRoutingService)
    const payloadService = Services.get<IPayloadService>('IPayloadService')
    payloadService.init(TestUtils.getMockPayload(ScopeType.Org))
  })
  beforeEach(() => {
    orgUsageService = new UsageService()
    fetchSpy.mockClear()
    const cacheService = Services.get<ICacheService>('ICacheService')
    cacheService.clear()
  })

  it('changing tab should reset view on new tab', async () => {
    orgUsageService.setTab(TabType.Workflows)
    orgUsageService.setDateRange(DateRangeType.CurrentWeek)
    orgUsageService.setPage(2)
    orgUsageService.setFilters(getFilter('runner_type:hosted'))

    orgUsageService.setTab(TabType.Jobs)

    const view = orgUsageService.getMetricsView().value

    expect(view.virtualOffset).toEqual(0)
    expect(view.filters).toEqual(undefined)
    expect(view.tab).toEqual(TabType.Jobs)
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentWeek)
  })

  it('changing back to previously seen tab should persist view', async () => {
    orgUsageService.setTab(TabType.Workflows)
    orgUsageService.setDateRange(DateRangeType.CurrentWeek)
    orgUsageService.setFilters(getFilter('runner_type:hosted'))
    orgUsageService.setPage(1)

    orgUsageService.setTab(TabType.Jobs)
    orgUsageService.setFilters(getFilter('runner_type:self-hosted'))
    orgUsageService.setPage(REAL_PAGE_SIZE / VIRTUAL_PAGE_SIZE)

    orgUsageService.setTab(TabType.Workflows)
    let view = orgUsageService.getMetricsView().value

    expect(view.virtualOffset).toEqual(VIRTUAL_PAGE_SIZE)
    expect(view.filters![0]?.values[0]).toEqual('hosted')
    expect(view.tab).toEqual(undefined)
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentWeek)

    orgUsageService.setTab(TabType.Jobs)
    view = orgUsageService.getMetricsView().value

    expect(view.virtualOffset).toEqual(REAL_PAGE_SIZE)
    expect(view.filters![0]?.values[0]).toEqual('self-hosted')
    expect(view.tab).toEqual(TabType.Jobs)
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentWeek)
  })

  it('changing filters should reset view for current tab', async () => {
    orgUsageService.setTab(TabType.Jobs)
    orgUsageService.setDateRange(DateRangeType.CurrentWeek)
    orgUsageService.setPage(1)

    let view = orgUsageService.getMetricsView().value
    expect(view.virtualOffset).toEqual(VIRTUAL_PAGE_SIZE)
    expect(view.tab).toEqual(TabType.Jobs)
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentWeek)

    orgUsageService.setFilters(getFilter('runner_type:hosted'))

    view = orgUsageService.getMetricsView().value
    expect(view.virtualOffset).toEqual(0)
    expect(view.tab).toEqual(TabType.Jobs)
    expect(view.filters![0]?.values[0]).toEqual('hosted')
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentWeek)
  })

  it('changing date range should reset view for current tab except filters', async () => {
    orgUsageService.setTab(TabType.Jobs)
    orgUsageService.setFilters(getFilter('runner_type:hosted'))
    orgUsageService.setDateRange(DateRangeType.CurrentMonth)
    orgUsageService.setPage(1)

    let view = orgUsageService.getMetricsView().value
    expect(view.filters![0]?.values[0]).toEqual('hosted')
    expect(view.virtualOffset).toEqual(VIRTUAL_PAGE_SIZE)
    expect(view.tab).toEqual(TabType.Jobs)
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentMonth)

    orgUsageService.setDateRange(DateRangeType.CurrentWeek)

    view = orgUsageService.getMetricsView().value
    expect(view.virtualOffset).toEqual(0)
    expect(view.tab).toEqual(TabType.Jobs)
    expect(view.dateRangeType).toEqual(DateRangeType.CurrentWeek)
    expect(view.filters![0]?.values[0]).toEqual('hosted')
  })

  it('columns change correctly on tab change', async () => {
    const tabs = orgUsageService.getTabs().value
    let currentTab = tabs[0]?.value ?? ''
    orgUsageService.setTab(currentTab)

    let setColumns = orgUsageService.getColumns().value
    let expectedColumns = orgUsageService.getColumnConfig().get(currentTab)

    expect(currentTab).toBeTruthy()
    expect(setColumns).toBeTruthy()
    expect(expectedColumns).toBeTruthy()
    expect(setColumns).toEqual(expectedColumns)

    currentTab = tabs[1]?.value ?? ''
    orgUsageService.setTab(currentTab)

    setColumns = orgUsageService.getColumns().value
    expectedColumns = orgUsageService.getColumnConfig().get(currentTab)

    expect(currentTab).toBeTruthy()
    expect(setColumns).toBeTruthy()
    expect(expectedColumns).toBeTruthy()
    expect(setColumns).toEqual(expectedColumns)
  })

  it('filter providers change correctly on tab change', async () => {
    const tabs = orgUsageService.getTabs().value
    let currentTab = tabs[0]?.value ?? ''
    orgUsageService.setTab(currentTab)

    let setFilters = orgUsageService.getFilterProviders().value
    let expectedFilters = getUsageFilters(currentTab)

    expect(currentTab).toBeTruthy()
    expect(setFilters).toBeTruthy()
    expect(expectedFilters).toBeTruthy()
    expect(setFilters.map(f => f.key)).toEqual(expectedFilters.map(f => f.key))

    currentTab = tabs[1]?.value ?? ''
    orgUsageService.setTab(currentTab)

    setFilters = orgUsageService.getFilterProviders().value
    expectedFilters = getUsageFilters(currentTab)

    expect(currentTab).toBeTruthy()
    expect(setFilters).toBeTruthy()
    expect(expectedFilters).toBeTruthy()
    expect(setFilters.map(f => f.key)).toEqual(expectedFilters.map(f => f.key))
  })
})

function getFilter(filter: string) {
  return FilterUtils.parseFilter(orgUsageService.getFilterProviders().value, filter)
}
