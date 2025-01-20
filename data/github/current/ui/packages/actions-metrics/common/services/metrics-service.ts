import type {Column} from '@primer/react/drafts'
import type {
  FilterValue,
  MetricsExportRequest,
  MetricsItem,
  MetricsRequest,
  MetricsResponse,
  MetricsResponseItem,
  MetricsTab,
  MetricsView,
  MetricsViewReadOnly,
  CardData,
  Summary,
  CardHeading,
  ExportStatusResponse,
  StartExportResponse,
  OrderBy,
} from '../models/models'
import type {
  IObservableArray,
  IObservableValue,
  IReadonlyObservableArray,
  IReadonlyObservableValue,
} from '../observables/observable'
import {ObservableArray, ObservableValue} from '../observables/observable'
import type {IService, ServiceFactory} from './services'
import {ServiceBase, Services} from './services'
import type {IRoutingService} from './routing-service'
import {Utils} from '../utils/utils'
import {DateRangeType, ExportStatus, OrderByDirection, ScopeType, ZeroDataType} from '../models/enums'
import type {IDataService} from './data-service'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {FilterProvider} from '@github-ui/filter'
import {FilterUtils} from '../utils/filter-utils'
import type {IErrorService} from './error-service'
import {PATHS} from '../constants/controller_paths'
import type {IAnalyticsService} from './analytics-service'
import {LABELS} from '../resources/labels'
import type {IPayloadService} from './payload-service'
import {ORG_TABS, REPO_TABS, TIME_IN_MS} from '../constants/constants'

export interface SetOptions {
  /**
   * return modified view that would result from running operation without actually running it.
   */
  preview?: boolean
}

export interface IMetricsService extends IService {
  downloadExport: () => void
  getColumns: () => IReadonlyObservableArray<Column<MetricsItem>>
  getDefaultOrderBy: () => OrderBy
  getFilterProviders: () => IReadonlyObservableArray<FilterProvider>
  getIsExporting: () => IReadonlyObservableValue<boolean>
  getLoading: () => IReadonlyObservableValue<boolean>
  getMetrics: () => IReadonlyObservableArray<MetricsItem>
  getMetricsView: () => IReadonlyObservableValue<MetricsViewReadOnly>
  getServiceId: () => string
  getTabs: () => IObservableArray<MetricsTab>
  getViewUrl: (view: MetricsViewReadOnly) => string
  getZeroDataState: () => IReadonlyObservableValue<ZeroDataType>
  getCardData: () => IReadonlyObservableArray<CardData | undefined>
  setDateRange: (dateRangeType: DateRangeType, options?: SetOptions) => MetricsViewReadOnly
  setFilters: (filters?: FilterValue[], options?: SetOptions) => MetricsViewReadOnly
  setLoading: (isLoading: boolean) => void
  setMetricsViewFromSearchParams: () => void
  setOrderBy: (orderBy: OrderBy, options?: SetOptions) => MetricsViewReadOnly
  setPage: (zeroIndexPage: number, options?: SetOptions) => MetricsViewReadOnly
  setScope: () => void
  setTab: (tab?: string, options?: SetOptions) => MetricsViewReadOnly
}

export abstract class MetricsService extends ServiceBase implements IMetricsService {
  protected readonly isExporting = new ObservableValue<boolean>(false)
  protected readonly isLoading = new ObservableValue<boolean>(false)
  protected readonly metrics = new ObservableArray<MetricsItem>([])
  protected readonly metricsView = new ObservableValue<MetricsView>(DEFAULT_VIEW)
  protected readonly zeroData = new ObservableValue<ZeroDataType>(ZeroDataType.Start)
  protected readonly payloadService = Services.get<IPayloadService>('IPayloadService')
  protected readonly analyticsService = Services.get<IAnalyticsService>('IAnalyticsService')
  protected readonly dataService = Services.get<IDataService>('IDataService')
  protected readonly routingService = Services.get<IRoutingService>('IRoutingService')
  protected readonly errorService = Services.get<IErrorService>('IErrorService')
  protected readonly offsetsToIgnoreCacheFor = new Set<string>()
  protected readonly lastStateForTab = new Map<string, MetricsView>()
  protected readonly tabs = new ObservableArray<MetricsTab>()

  protected latestMetricsRequest: MetricsView = DEFAULT_VIEW
  protected initialized = false
  protected response: unknown
  protected defaultTab: string
  protected scope = ScopeType.Unknown

  // should be initialized with a number of undefined elements that represents # of loading hero cards
  protected abstract readonly cardData: ObservableArray<CardData | undefined>
  protected abstract readonly cardCount: number // # of loading hero cards to show

  public abstract getColumns(): IObservableArray<Column<MetricsItem>>
  public abstract getFilterProviders(): IObservableArray<FilterProvider>
  public abstract getDefaultOrderBy(): OrderBy
  public abstract getServiceId(): string
  protected abstract setColumns(tab?: string): void
  protected abstract setFilterProviders(tab?: string): void
  protected abstract getCardHeading(key: string): CardHeading

  public downloadExport(): void {
    if (!this.isExporting.value) {
      this.analyticsService.logEvent('export.start', 'MetricsService', {view: JSON.stringify(this.metricsView.value)})

      // only allow 1 download operation at a time
      this.isExporting.value = true

      this.startExport()
    }
  }

  public getMetrics(): IObservableArray<MetricsItem> {
    return this.metrics
  }

  public getMetricsView(): IObservableValue<MetricsView> {
    return this.metricsView
  }

  public getLoading() {
    return this.isLoading
  }

  public getIsExporting(): IObservableValue<boolean> {
    return this.isExporting
  }

  public getViewUrl(view: MetricsView): string {
    const queryParams = this.setSearchParams(view, {preview: true})
    return this.routingService.getFullUrl(queryParams).toString()
  }

  public getZeroDataState() {
    return this.zeroData
  }

  public getCardData() {
    return this.cardData
  }

  public getTabs(): IObservableArray<MetricsTab> {
    return this.tabs
  }

  public setDateRange = (dateRangeType: DateRangeType, options?: SetOptions) => {
    const metricsView = this.metricsView.value

    if (metricsView.dateRangeType !== dateRangeType) {
      const newView = this.getDefaultGlobalView()
      newView.dateRangeType = dateRangeType
      newView.filters = metricsView.filters

      if (!options?.preview) {
        this.setMetricsView(newView)
        this.fetchCardData()
      }

      return newView
    }

    return metricsView
  }

  public setFilters(filters?: FilterValue[], options?: SetOptions) {
    const newView = {...this.metricsView.value}
    if (!Utils.objectEquals(filters, this.metricsView.value.filters)) {
      newView.filters = filters
      resetViewToFirstPage(newView)

      this.analyticsService.logEvent('filter.change', 'MetricsService', {view: JSON.stringify(this.metricsView.value)})

      !options?.preview && this.setMetricsView(newView)
    }

    return newView
  }

  public setLoading(isLoading: boolean) {
    if (this.isLoading.value !== isLoading) {
      this.isLoading.value = isLoading
      this.setZeroData()
    }
  }

  public setPage(zeroIndexPage: number, options?: SetOptions) {
    // we are virtualizing the pagination, so need to figure out the real offset
    const virtualOffset = zeroIndexPage * this.metricsView.value.virtualPageSize
    const realOffset = Utils.getRealOffsetFromVirtual(virtualOffset, REAL_PAGE_SIZE)

    const newView: MetricsView = {...this.metricsView.value, virtualOffset, offset: realOffset}
    !options?.preview && this.setMetricsView(newView)

    return newView
  }

  public setOrderBy(orderBy?: OrderBy, options?: SetOptions) {
    let realViewValue = orderBy
    const defaultOrderBy = this.getDefaultOrderBy()
    if (realViewValue?.field === defaultOrderBy.field && realViewValue?.direction === defaultOrderBy.direction) {
      realViewValue = undefined
    }

    const newView = {...this.metricsView.value, orderBy: realViewValue}

    if (
      realViewValue?.field !== this.metricsView.value.orderBy?.field ||
      realViewValue?.direction !== this.metricsView.value.orderBy?.direction
    ) {
      resetViewToFirstPage(newView)

      !options?.preview && this.setMetricsView(newView)
    }

    return newView
  }

  public setTab = (tab?: string, options?: SetOptions) => {
    // if first tab force undefined to avoid mismatched values
    const realTabValue: string | undefined = tab === this.defaultTab ? undefined : tab
    if (this.metricsView.value.tab !== realTabValue) {
      this.lastStateForTab.set(this.metricsView.value.tab ?? '', {...this.metricsView.value})
      const newView = this.lastStateForTab.get(realTabValue ?? '') || this.getDefaultGlobalView()
      // set currently selected tab to new tab and reset everything
      newView.tab = realTabValue
      newView.dateRangeType = this.metricsView.value.dateRangeType
      !options?.preview && this.setMetricsView(newView)
      return newView
    }
    return this.metricsView.value
  }

  public setMetricsViewFromSearchParams(noFetch = false) {
    const params = this.routingService.getSearchParams()
    const view = {...this.getMetricsView().value}

    for (const key of params.keys()) {
      const transform = searchParamToView[key]
      const value = params.get(key)
      if (transform) {
        view[transform.prop as keyof MetricsView] = (
          transform?.transform ? transform.transform(view, value ?? undefined, this) : value ?? ''
        ) as never
      } else {
        view[key as keyof MetricsView] = (value ?? undefined) as never
      }
    }

    // make sure we handle default values where there might not be a query param
    // for example url?page=2 => url means page is 1 which is default value
    const defaultKeys = Object.keys(DEFAULT_VIEW)
      .filter(key => !IGNORED_PROPS.has(key))
      .filter(key => !params.has(viewToSearchParam[key]?.prop ?? key))

    for (const key of defaultKeys) {
      view[key as keyof MetricsView] = DEFAULT_VIEW[key as keyof MetricsRequest] as never
    }

    if (!Utils.objectEquals(view, this.metricsView.value, VIEW_KEYS)) {
      if (noFetch) {
        this.metricsView.value = view
      } else {
        this.setMetricsView(view)
      }
    }
  }

  public setScope = (): void => {
    const scope = this.payloadService.getScope()

    if (this.scope !== scope) {
      // when scope changes we want to:
      // 1. update tabs
      // 2. update columns
      // 3. update filters

      this.scope = scope

      // update tabs
      this.setTabsConfig()
      let currentTab = this.metricsView.value.tab
      if (currentTab) {
        const currentTabInTabsConfig = this.tabs.value.find(t => t.value === currentTab)

        if (!currentTabInTabsConfig) {
          this.setTab() // if current tab not in list of tabs then set default tab
          currentTab = this.metricsView.value.tab
        }
      }

      // update columns
      this.setColumns(currentTab)

      // update filters
      this.setFilterProviders(currentTab)
      const filters = this.metricsView.value.filters
      if (filters) {
        this.setFilters() // reset filters if filters set to avoid issue with invalid filter for current scope
      }
    }
  }

  public static override registerService = (serviceId: string, serviceFactory: ServiceFactory): void => {
    const serviceRegistrationId = 'IMetricsService'

    if (!Services.instantiated(serviceRegistrationId) || !Services.registered(serviceRegistrationId)) {
      // if service has not been instantiated or registered then go ahead and register
      Services.add(serviceRegistrationId, serviceFactory, true)
    } else {
      // service has been instantiated so safe to get without fetching data
      const service = Services.get<IMetricsService>(serviceRegistrationId)

      if (service.getServiceId() !== serviceId) {
        Services.add(serviceRegistrationId, serviceFactory, true)
      }
    }
  }

  protected init() {
    this.setScope()
    this.setTabsConfig()
    if (!this.isMetricsViewLoaded() && !this.initialized) {
      this.setLoading(true)
      this.initialized = true
      this.defaultTab = this.getTabs().value[0]?.value ?? ''

      this.setMetricsViewFromSearchParams(true) // make sure we set the view from search params before initial fetch

      // setting columns and filter providers needs to happen AFTER setting view from search params
      this.setColumns(this.metricsView.value.tab)
      this.setFilterProviders(this.metricsView.value.tab)

      // need to do this again to make sure filter is initialized correctly since filter providers may have been wrong
      this.setMetricsViewFromSearchParams(true)

      this.analyticsService.logEvent('view.init', 'MetricsService', {view: JSON.stringify(this.metricsView.value)})
      this.fetchData(this.metricsView.value)

      this.fetchCardData()
    }
  }

  protected setMetricsView(view: MetricsView) {
    const metricsView: MetricsView = this.metricsView.value

    if (!Utils.objectEquals(view, metricsView, VIEW_KEYS) || !metricsView.totalItems) {
      this.analyticsService.logEvent('view.change', 'MetricsService', {
        view: JSON.stringify(view),
        previous: JSON.stringify(metricsView),
      })

      this.setLoading(true)

      if (metricsView.tab !== view.tab) {
        this.setColumns(view.tab)
        this.setFilterProviders(view.tab)
      }

      this.metricsView.value = view
      this.metrics.value = []
      this.setSearchParams(this.metricsView.value)

      this.fetchData(view)
    }
  }

  protected isMetricsViewLoaded() {
    // only checks if some data has been loaded from fetch at some point, not that data is current
    return this.metricsView.value !== DEFAULT_VIEW && this.metricsView.value.totalItems !== undefined
  }

  protected async fetchData(view: MetricsView): Promise<[MetricsView, MetricsItem[]] | undefined> {
    const setKey = `${view.tab ?? ''}-${view.offset}`
    // try to prevent data inconsistencies by ignoring cache for old offset after new non-cached offset fetch
    const ignoreCache = this.offsetsToIgnoreCacheFor.has(setKey)
    let offsetToIgnoreCacheFor: number | undefined = undefined
    if (this.latestMetricsRequest.offset /* previous view offset */ !== view.offset) {
      // this is a real (not virtual) page change so want to skip cache if fetched again, but only prepare this
      // and handle after successful response in case request fails
      offsetToIgnoreCacheFor = this.latestMetricsRequest.offset /* previous view offset */
    }
    const requestBody = Utils.withOnlyRequestedKeys<MetricsRequest>(view, REQUEST_KEYS)
    this.latestMetricsRequest = view

    const newSetKey = `${view.tab ?? ''}-${offsetToIgnoreCacheFor}`
    offsetToIgnoreCacheFor !== undefined && this.offsetsToIgnoreCacheFor.add(newSetKey)

    // this will be cached by default so can continue to call fetch to get response for virtual pagination
    const response = await this.dataService.post<MetricsResponse<MetricsItem>>(this.getUrlPath(), requestBody, {
      ignoreCache,
    })

    if (response) {
      ignoreCache && this.offsetsToIgnoreCacheFor.delete(setKey)

      const [responseView, responseItems] = Utils.convertFromResponse<MetricsResponseItem, MetricsItem>(response)

      // make sure the latest request matches THIS request view before setting it since this is async
      if (Utils.objectEquals(view, this.latestMetricsRequest)) {
        this.metricsView.value = {
          ...view,
          ...responseView,
          totalItems: responseView.totalItems,
        }
        const sliceStart = view.virtualOffset - view.offset
        const sliceEnd = sliceStart + view.virtualPageSize
        this.metrics.value = responseItems.slice(sliceStart, sliceEnd)
        this.setLoading(false)
        this.fixPageOutOfBounds()
      }

      return [responseView, responseItems]
    }

    // need to force a rerender to fix bug in pagination component
    this.metricsView.value = {...this.metricsView.value}
    this.setLoading(false)
    return undefined
  }

  protected async startExport() {
    const url = this.getUrlPath() + PATHS.getExport
    const requestBody = Utils.withOnlyRequestedKeys<MetricsExportRequest>(
      this.metricsView.value,
      REQUEST_KEYS.filter(k => k !== 'offset' && k !== 'pageSize'),
    )

    requestBody.headers = this.getColumns().value.map(column => {
      return {
        key: column.id!,
        display: column.header as string,
      }
    })

    const start = new Date()

    const response = await this.dataService.post<StartExportResponse>(url, requestBody)

    if (response?.export_id) {
      let statusResponse: ExportStatusResponse | undefined
      const durationStart = new Date()
      let currentDuration = 0
      do {
        await Utils.sleep(EXPORT_STATUS_SLEEP_DURATION)
        statusResponse = await this.getExportStatus(response.export_id)
        currentDuration = new Date().getTime() - durationStart.getTime()
      } while (statusResponse?.status === ExportStatus.EXPORT_STATUS_PENDING && currentDuration < EXPORT_TIMEOUT)

      const end = new Date()

      if (statusResponse?.status === ExportStatus.EXPORT_STATUS_COMPLETE) {
        Utils.downloadFileFromURL(statusResponse.download_url)
      } else if (statusResponse?.status) {
        let error = new Error(`Export has failed for export id: ${response.export_id}`)
        if (statusResponse.status === ExportStatus.EXPORT_STATUS_PENDING) {
          error = new Error(`Export has taken too long to complete for export id: ${response.export_id}`)
        } else if (statusResponse.status === ExportStatus.EXPORT_STATUS_UNKNOWN) {
          error = new Error(`Export has failed with unknown status for export id: ${response.export_id}`)
        }

        error.name = 'MetricsServiceExportError'
        this.errorService.log(error, LABELS.exportError)
      } else {
        const error = new Error(`Export has failed due to unknown error for export id: ${response.export_id}`)
        error.name = 'MetricsServiceExportError'
        this.errorService.log(error, undefined) // don't want to show error message because one is already showing
      }

      const duration = (end.getTime() - start.getTime()) / 1000

      this.analyticsService.logEvent('export.end', 'MetricsService', {
        view: JSON.stringify(this.metricsView.value),
        export_id: response.export_id,
        duration,
        success: statusResponse?.status === ExportStatus.EXPORT_STATUS_COMPLETE,
      })
    }

    this.isExporting.value = false
  }

  protected async getExportStatus(exportId: string) {
    const url = this.getUrlPath() + PATHS.getExportStatus

    return this.dataService.post<ExportStatusResponse>(url, {exportId}, {skipCache: true}) // must skip cache
  }

  protected getUrlPath(): string {
    return ssrSafeLocation.pathname
  }

  protected setSearchParams(view: MetricsView, options?: SetOptions): URLSearchParams {
    const searchParams = new URLSearchParams()

    for (const key of Object.keys(DEFAULT_VIEW)) {
      if (!IGNORED_PROPS.has(key) && view[key as keyof MetricsView] !== DEFAULT_VIEW[key as keyof MetricsRequest]) {
        const transform = viewToSearchParam[key]
        let searchParamValue = `${view[key as keyof MetricsView] ?? ''}`
        let searchParamKey = key

        if (transform) {
          searchParamValue = transform.transform
            ? (transform.transform(view) as string | undefined) ?? ''
            : `${view[key as keyof MetricsView] ?? ''}`
          searchParamKey = transform.prop
        }

        if (searchParamValue) {
          searchParams.set(searchParamKey, searchParamValue)
        }
      }
    }

    !options?.preview && this.routingService.setSearchParams(searchParams)

    return searchParams
  }

  protected setZeroData() {
    const loading = this.isLoading.value
    const filters = !!this.metricsView.value.filters
    const data = !!this.metrics.length

    if (loading) {
      this.zeroData.value = ZeroDataType.None
    } else if (!filters && !data) {
      this.zeroData.value = ZeroDataType.Start
    } else if (filters && !data) {
      this.zeroData.value = ZeroDataType.Search
    } else {
      this.zeroData.value = ZeroDataType.None
    }
  }

  protected fixPageOutOfBounds() {
    const view = this.metricsView.value
    if (view.totalItems) {
      // if page not out of bounds this will be noop
      this.setPage(Utils.getCurrentPage(view.virtualOffset, view.virtualPageSize, view.totalItems))
    }
  }

  protected getDefaultGlobalView(): MetricsView {
    // return new default view while persisting global props (e.g. tab and dateRangeType)
    const metricsView = this.metricsView.value
    const tab = metricsView.tab === this.defaultTab ? undefined : metricsView.tab
    const newView = {...DEFAULT_VIEW, tab, dateRangeType: metricsView.dateRangeType, version: metricsView.version}
    return newView
  }

  protected async fetchCardData() {
    // Triggers loading state in UI
    this.cardData.value = new Array<CardData | undefined>(this.cardCount)
    this.cardData.value.fill(undefined)

    const params = new URLSearchParams()
    params.append('date_range_type', this.metricsView.value.dateRangeType!)

    if (this.metricsView.value.version) {
      params.append('version', this.metricsView.value.version)
    }

    const url = new URL(`${this.getUrlPath()}/${PATHS.summary}`, ssrSafeLocation.origin)
    url.search = params.toString()

    const data = await this.dataService.get<Summary>(url.toString())

    if (data) {
      const cardData = Object.entries(data).map<CardData>(([k, v]) => ({
        metric: k,
        value: v,
        ...this.getCardHeading(k),
      }))

      this.cardData.value = cardData
    }
  }

  protected setOrderByHelper = Utils.debounce((field: string) => {
    // used by table to set orderby without direction

    let direction = OrderByDirection.ORDER_BY_DIRECTION_ASC // UI defaults to asc first, and we have no way of changing it
    const defaultOrderBy = this.getDefaultOrderBy()

    if (
      this.metricsView.value.orderBy?.field === field ||
      (this.metricsView.value.orderBy?.field === undefined && field === defaultOrderBy.field)
    ) {
      direction =
        this.metricsView.value.orderBy?.direction === OrderByDirection.ORDER_BY_DIRECTION_ASC
          ? OrderByDirection.ORDER_BY_DIRECTION_DESC
          : OrderByDirection.ORDER_BY_DIRECTION_ASC
    }

    this.setOrderBy({field, direction})
  }, 5)

  protected setColumnsHelper(
    columnMap: Map<string, Array<Column<MetricsItem>>>,
    nonSortableColumns: Set<string>,
    tab?: string,
  ) {
    // helper method that services that implement MetricsService can call in their own setColumns function

    const columns = tab && columnMap.has(tab) ? [...columnMap.get(tab)!] : [...columnMap.get(this.defaultTab)!]

    for (const col of columns) {
      if (col.id && !nonSortableColumns.has(col.id)) {
        col.sortBy = () => {
          this.setOrderByHelper(Utils.snakeToCamel(col.id!))
          return 0
        }

        col.field = 'id' // required for sorting to work, even though it makes no sense
      }
    }

    this.getColumns().value = columns.filter(c => Utils.columnValidForScope(c.id ?? '', this.scope))
  }

  protected setTabsConfig() {
    switch (this.payloadService.getScope()) {
      case ScopeType.Org:
        this.tabs.value = ORG_TABS
        break

      case ScopeType.Repo:
        this.tabs.value = REPO_TABS
        break

      default:
        this.tabs.value = []
        break
    }

    this.defaultTab = this.getTabs().value[0]?.value ?? ''
  }
}

export const REAL_PAGE_SIZE = 500 // need to make sure that this is always divisible by the virtual page size
export const VIRTUAL_PAGE_SIZE = 25
const EXPORT_TIMEOUT = 5 * TIME_IN_MS.minute
const EXPORT_STATUS_SLEEP_DURATION = 1 * TIME_IN_MS.second

const DEFAULT_VIEW: MetricsView = {
  dateRangeType: DateRangeType.CurrentMonth,
  offset: 0,
  pageSize: REAL_PAGE_SIZE,
  orderBy: undefined,
  tab: undefined,
  filters: undefined,
  virtualOffset: 0,
  virtualPageSize: VIRTUAL_PAGE_SIZE,
  startTime: new Date(),
  endTime: new Date(),
  version: undefined,
  requestType: undefined,
}

export const DEFAULT_ORDER_BY_DIRECTION = OrderByDirection.ORDER_BY_DIRECTION_DESC

const IGNORED_PROPS = new Set<string>()
IGNORED_PROPS.add('pageSize')
IGNORED_PROPS.add('offset')
IGNORED_PROPS.add('startTime')
IGNORED_PROPS.add('endTime')
IGNORED_PROPS.add('requestType')

const REQUEST_KEYS = Object.keys(DEFAULT_VIEW).filter(k => !k.startsWith('virtual') && !k.endsWith('Time'))
const VIEW_KEYS = Object.keys(DEFAULT_VIEW).filter(k => !k.endsWith('Time'))

const searchParamToView: {[key: string]: Transform | undefined} = {
  page: {
    prop: 'virtualOffset',
    transform: (view, str) => {
      const currentPage = Number(str)
      const virtualOffset = Utils.getOffsetFromPage(view!.virtualPageSize, currentPage) - 1
      view!.offset = Utils.getRealOffsetFromVirtual(virtualOffset, REAL_PAGE_SIZE)
      return virtualOffset
    },
  },
  size: {
    prop: 'virtualPageSize',
    transform: (view, str) => {
      return Number(str)
    },
  },
  filters: {
    prop: 'filters',
    transform: (view, str, service) => {
      return FilterUtils.parseFilter(service!.getFilterProviders().value, str)
    },
  },
  sort: {
    prop: 'orderBy',
    transform: (view, str) => {
      // sort=field,direction if direction is not default, otherwise just field
      const parts = str!.split(',')
      const field = parts[0]
      const direction = parts[1] || DEFAULT_ORDER_BY_DIRECTION
      return {field, direction}
    },
  },
}

const viewToSearchParam: {[key: string]: Transform | undefined} = {
  virtualOffset: {
    prop: 'page',
    transform: view => {
      return Utils.getCurrentPage(view!.virtualOffset, view!.virtualPageSize, view!.totalItems) + 1
    },
  },
  virtualPageSize: {
    prop: 'size',
    transform: view => {
      return view!.virtualPageSize.toString()
    },
  },
  filters: {
    prop: 'filters',
    transform: view => {
      return FilterUtils.stringifyFilters(view!.filters)
    },
  },
  orderBy: {
    prop: 'sort',
    transform: view => {
      return `${view!.orderBy?.field}${
        DEFAULT_ORDER_BY_DIRECTION === view!.orderBy?.direction ? '' : `,${view!.orderBy?.direction}`
      }`
    },
  },
}

interface Transform {
  prop: string
  transform?: (view?: MetricsView, str?: string, service?: IMetricsService) => unknown
}

const resetViewToFirstPage = (view: MetricsView) => {
  view.offset = 0
  view.virtualOffset = 0
}
