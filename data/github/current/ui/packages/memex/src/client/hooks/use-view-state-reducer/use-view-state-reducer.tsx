import cloneDeep from 'lodash-es/cloneDeep'
import {useCallback, useEffect, useMemo, useReducer} from 'react'
import invariant from 'tiny-invariant'

import type {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {getDefaultAggregationSettings, type PageView, type ViewSort, ViewTypeParam} from '../../api/view/contracts'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {defined, filterFalseyValues} from '../../helpers/util'
import {
  EnumValueError,
  getViewTypeFromViewTypeParam,
  getViewTypeParamFromViewType,
  ViewType,
} from '../../helpers/view-type'
import {getSessionDataForKey, setSessionDataForKey} from '../../platform/session-storage'
import {
  FILTER_QUERY_PARAM,
  HIDE_ITEMS_COUNT_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  SLICE_BY_COLUMN_ID_KEY,
  SLICE_VALUE_KEY,
  SORTED_BY_COLUMN_DIRECTION_KEY,
  SORTED_BY_COLUMN_ID_KEY,
  SUM_FIELDS_PARAM,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VIEW_TYPE_PARAM,
  VISIBLE_FIELDS_PARAM,
} from '../../platform/url'
import {PROJECT_ROUTE, PROJECT_VIEW_ROUTE} from '../../routes'
import {useFindColumn} from '../../state-providers/columns/use-find-column'
import {effects, useExecuteReducerEffects, withReducerEffects} from '../common/with-reducer-effects'
import {useDefaultLayoutSettings} from '../use-default-layout-settings'
import {useViewDeserializer} from '../use-view-deserializer'
import {getViewDirtyStates} from './get-view-dirty-states'
import {useHandleUrlUpdate} from './handle-url-update'
import {reducer} from './reducer'
import type {BaseViewState, NormalizedPageView, ViewState} from './types'
import {type ViewStateActions, ViewStateActionTypes} from './view-state-action-types'

/**
 * A specific action key to read for history related dispatch action args
 */
const historyAction = Symbol('historyAction')
type AdditionalHistoryActionArgs = {[historyAction]?: {navigate: false} | {navigate?: true; replace?: boolean}}

/**
 * Returns truthy when the full window.location.pathname
 * matches the full path of a valid project view route
 */
function pathnameMatchesProjectViewRoute(pathname: string) {
  for (const route of [PROJECT_VIEW_ROUTE, PROJECT_ROUTE]) {
    if (route.matchFullPath(pathname)) {
      return true
    }
  }
  return false
}

/**
 * A reducer that tracks both the initial view as loaded from the server,
 * as well as the current view state and a hydrated version of the current
 * view state
 */
export const useViewStateReducer = () => {
  const {findColumn} = useFindColumn()
  const deserializeView = useViewDeserializer()
  const {getLayoutSettingsWithDefaults} = useDefaultLayoutSettings()

  /**
   * Given a possible view type and a base view state, return the
   * serverViewState and localViewState, with the localViewState
   * modified by any query parameters
   */
  const getViewStateWithUrlOverrides = useCallback(
    ({initialViewData}: {initialViewData: PageView}) => {
      /**
       * Using match path with a full window URL to ensure that we only read the incoming url
       * for this data, as opposed to the route data, which is not updated yet when this runs
       *
       * Once we refactor this context to be driven by URLs, instead of state we should
       * be able to remove this
       *
       * When the pathanme matches the _full_ route of one of the project view paths, read its query
       * params to override the view state, otherwise ignore it, to avoid overriding the view state
       * with query parameters that are used in other views.
       */
      const searchParams = pathnameMatchesProjectViewRoute(window.location.pathname)
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams()

      const horizontalUrlGroupedColumn = searchParams.get(HORIZONTAL_GROUPED_BY_COLUMN_KEY)
      const verticalUrlGroupedColumn = searchParams.get(VERTICAL_GROUPED_BY_COLUMN_KEY)
      const urlSortColumns = searchParams.getAll(SORTED_BY_COLUMN_ID_KEY)
      const urlFilterParams = searchParams.get(FILTER_QUERY_PARAM)
      const urlVisibleFieldsParam = searchParams.get(VISIBLE_FIELDS_PARAM)
      const urlViewTypeParam = searchParams.get(VIEW_TYPE_PARAM)
      const urlHideItemsCountParam = searchParams.get(HIDE_ITEMS_COUNT_PARAM)
      const urlSumFieldIdsParam = searchParams.get(SUM_FIELDS_PARAM)
      const urlSliceByColumn = searchParams.get(SLICE_BY_COLUMN_ID_KEY)
      const urlSliceValue = searchParams.get(SLICE_VALUE_KEY)

      const initialServerViewState: NormalizedPageView = {
        ...initialViewData,
        filter: initialViewData.filter ?? '',
        aggregationSettings: initialViewData.aggregationSettings || getDefaultAggregationSettings(),
      }

      const initialLocalViewState: NormalizedPageView = cloneDeep(initialServerViewState)

      if (horizontalUrlGroupedColumn != null) {
        const groupByColumn = findColumn(horizontalUrlGroupedColumn)
        if (groupByColumn) {
          initialLocalViewState.groupBy = [groupByColumn.databaseId]
        } else {
          initialLocalViewState.groupBy = []
        }
      }

      if (verticalUrlGroupedColumn != null) {
        const groupByColumn = findColumn(verticalUrlGroupedColumn)
        if (groupByColumn) {
          initialLocalViewState.verticalGroupBy = [groupByColumn.databaseId]
        } else {
          initialLocalViewState.verticalGroupBy = []
        }
      }

      if (urlSortColumns.length > 0) {
        const urlSortDirections = searchParams.getAll(SORTED_BY_COLUMN_DIRECTION_KEY)
        initialLocalViewState.sortBy = urlSortColumns
          .map<ViewSort | undefined>((columnName, index) => {
            const column = findColumn(columnName)
            const direction = urlSortDirections[index] === 'desc' ? 'desc' : 'asc'
            return column ? [column.databaseId, direction] : undefined
          })
          .filter(defined)
      }

      if (urlFilterParams != null) {
        initialLocalViewState.filter = urlFilterParams
      }

      if (urlVisibleFieldsParam != null) {
        try {
          const parsedFields = JSON.parse(urlVisibleFieldsParam) as Array<SystemColumnId>
          if (Array.isArray(parsedFields)) {
            const nextVisibleFields = filterFalseyValues(parsedFields.map(columnId => findColumn(columnId)?.databaseId))
            initialLocalViewState.visibleFields = nextVisibleFields
          }
        } catch (e) {
          // ignore parse errors for url
        }
      }

      if (urlSliceByColumn) {
        const sliceByColumn = findColumn(urlSliceByColumn)
        if (sliceByColumn) {
          initialLocalViewState.sliceBy = {
            field: sliceByColumn.databaseId,
            filter: '',
          }
        }
      }

      if (urlSliceValue) {
        initialLocalViewState.sliceValue = urlSliceValue
      }

      if (urlViewTypeParam && Object.values(ViewType).includes(urlViewTypeParam as ViewType)) {
        const allowRoadmapAccess = urlViewTypeParam === ViewType.Roadmap
        const isBoardOrTable = urlViewTypeParam === ViewType.Board || urlViewTypeParam === ViewType.Table

        // Apply layout settings defaults for roadmap view
        if (
          allowRoadmapAccess &&
          initialLocalViewState.layout !== ViewTypeParam.Roadmap &&
          urlViewTypeParam === ViewType.Roadmap
        ) {
          initialLocalViewState.layoutSettings = getLayoutSettingsWithDefaults(initialLocalViewState.layoutSettings)
        }

        if (isBoardOrTable || allowRoadmapAccess) {
          initialLocalViewState.layout = getViewTypeParamFromViewType(urlViewTypeParam as ViewType)
        }
      }

      if (
        initialLocalViewState.layout === ViewTypeParam.Board ||
        (initialLocalViewState.layout === ViewTypeParam.Table && initialLocalViewState.groupBy.length > 0)
      ) {
        if (urlHideItemsCountParam != null) {
          try {
            const hideItemsCount = JSON.parse(urlHideItemsCountParam)
            if (typeof hideItemsCount == 'boolean') {
              initialLocalViewState.aggregationSettings.hideItemsCount = hideItemsCount
            }
          } catch (e) {
            // ignore parse errors for url
          }
        }

        if (urlSumFieldIdsParam != null) {
          try {
            const parsedFields = JSON.parse(urlSumFieldIdsParam) as Array<SystemColumnId>
            if (Array.isArray(parsedFields)) {
              const sumFields = filterFalseyValues(parsedFields.map(columnId => findColumn(columnId)?.databaseId))
              initialLocalViewState.aggregationSettings.sum = sumFields
            }
          } catch (e) {
            // ignore parse errors for url
          }
        }
      }

      return initialLocalViewState
    },
    [findColumn, getLayoutSettingsWithDefaults],
  )

  const handleUrlUpdate = useHandleUrlUpdate()

  const addDeserializedStateAndDirtyStatesToView = useCallback(
    (vs: BaseViewState) => {
      return {
        ...vs,
        localViewStateDeserialized: deserializeView(vs.localViewState),
        ...getViewDirtyStates(vs),
      }
    },
    [deserializeView],
  )

  const convertViewsToState = useCallback(
    (
      views: Array<PageView>,
      {
        currentViewNumber,
        sessionStorageViews,
      }: {currentViewNumber?: number; sessionStorageViews?: Record<number, NormalizedPageView> | null},
    ) => {
      const viewsDictionary: {[number: number]: BaseViewState} = {}

      for (const view of views) {
        const normalizedView: NormalizedPageView = {
          ...view,
          filter: view.filter ?? '',
          aggregationSettings: view.aggregationSettings || getDefaultAggregationSettings(),
        }

        let localViewState: NormalizedPageView
        if (view.number === currentViewNumber) {
          localViewState = getViewStateWithUrlOverrides({initialViewData: normalizedView})
        } else if (sessionStorageViews?.[view.number]) {
          const sessionViewData = sessionStorageViews[view.number]
          invariant(sessionViewData, 'session view data is defined')
          localViewState = {
            ...sessionViewData,
            aggregationSettings: sessionViewData.aggregationSettings ?? view.aggregationSettings ?? {},
          }
        } else {
          localViewState = normalizedView
        }

        viewsDictionary[view.number] = {
          id: normalizedView.id,
          name: normalizedView.name,
          number: normalizedView.number,
          serverViewState: normalizedView,
          localViewState,
        }
      }

      return viewsDictionary
    },
    [getViewStateWithUrlOverrides],
  )

  /**
   * A reducer decorated with a custom navigation emitter
   * and some derived state
   */
  const decoratedReducer = useMemo(() => {
    return withReducerEffects<ViewState, ViewStateActions, AdditionalHistoryActionArgs>(
      reducer,
      (state, _previousState, {[historyAction]: history}) => {
        const currentView =
          typeof state.currentViewNumber === 'number' ? state.views[state.currentViewNumber] : undefined
        if (!currentView) return
        if (history?.navigate === false) return
        handleUrlUpdate(addDeserializedStateAndDirtyStatesToView(currentView), {replace: history?.replace})
      },
    )
  }, [addDeserializedStateAndDirtyStatesToView, handleUrlUpdate])
  /**
   * This reducer is initialized by lazily-loading the current memex view
   * and merging it with valid params from the URL
   *
   * We don't `useCallback` the initializer here, because it only
   * gets called on mounting, and doing so would cause a comparison
   * for changes on subsequent renders, which is more expensive than just
   * leaving as is
   */
  const [state, viewStateDispatch] = useReducer(decoratedReducer, null, function lazyInitState() {
    const initialViews = fetchJSONIslandData('memex-views') ?? []
    const viewRouteMatch = PROJECT_VIEW_ROUTE.matchFullPath(window.location.pathname)

    const viewNumberParam =
      viewRouteMatch && viewRouteMatch.params.viewNumber
        ? parseInt(viewRouteMatch.params.viewNumber, 10)
        : initialViews[0]?.number

    const currentView = initialViews.find(view => view.number === viewNumberParam)

    const views = convertViewsToState(initialViews, {
      currentViewNumber: currentView?.number,
      sessionStorageViews: getViewSessionData(),
    })

    const viewsOrder = initialViews.map(view => view.number)

    if (!currentView) {
      return {
        views,
        currentViewNumber: undefined,
        viewsOrder,
        [effects]: [],
      }
    }

    return {
      views,
      currentViewNumber: currentView.number,
      viewsOrder,
      [effects]: [],
    }
  })

  useExecuteReducerEffects(state)

  const setAndInitializeStateWithoutNavigation = useCallback(
    (viewData: PageView) => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetLocalViewState,
        localViewState: getViewStateWithUrlOverrides({initialViewData: viewData}),
        viewNumber: viewData.number,
        currentViewNumber: viewData.number,
        [historyAction]: {navigate: false},
      })
    },
    [getViewStateWithUrlOverrides],
  )

  const setViews = useCallback(
    (views: Array<PageView>, currentViewNumber?: number) => {
      viewStateDispatch({
        views: convertViewsToState(views, {
          currentViewNumber: state.currentViewNumber,
        }),
        currentViewNumber,
        type: ViewStateActionTypes.SetViews,
      })
    },
    [convertViewsToState, state.currentViewNumber],
  )

  /**
   * Reset state from the url when back/forward is pressed, without dispatching a
   * history action
   */
  useEffect(() => {
    function handlePopState() {
      /**
       * Using match path with a full window URL to ensure that we only read the incoming url
       * for this data, as opposed to the route data, which is not updated yet when this runs
       *
       * Once we refactor this context to be driven by URLs, instead of state we should
       * be able to remove this
       */
      const match = PROJECT_VIEW_ROUTE.matchFullPath(window.location.pathname)

      if (!match?.params.viewNumber) {
        const viewNumbers = Object.keys(state.views).map(numberString => parseInt(numberString, 10))
        const firstView = state.views[Math.min(...viewNumbers)]
        if (firstView) {
          setAndInitializeStateWithoutNavigation(firstView.serverViewState)
        }
        return
      }

      const viewNumber = parseInt(match.params.viewNumber, 10)

      const view = state.views[viewNumber]
      if (view) {
        setAndInitializeStateWithoutNavigation(view.serverViewState)
      } else {
        viewStateDispatch({
          type: ViewStateActionTypes.GoToViewNumber,
          viewNumber: undefined,
          [historyAction]: {navigate: false},
        })
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [setAndInitializeStateWithoutNavigation, state.views])

  const viewsListSorted = useMemo(() => {
    /**
     * `state.viewsOrder` is an array that denotes the order of views: [view1, view2, view3]
     * where the index of the element in the array denotes it's position.
     *
     * `viewsOrderLookup` makes lookup a little more efficient for sorting by creating a map
     * of viewNumber => position which avoids having to do an `indexOf` for each pair of elements
     * during sorting
     */
    const viewsOrderLookup: {[key: number]: number} = (state.viewsOrder ?? []).reduce(
      (acc, viewNumber, viewPosition) => ({...acc, [viewNumber]: viewPosition}),
      {},
    )
    return Object.values(state.views)
      .map(view => {
        return {
          ...view,
          ...getViewDirtyStates(view),
        }
      })
      .sort((a, b) => (viewsOrderLookup[a.number] ?? 0) - (viewsOrderLookup[b.number] ?? 0))
  }, [state.views, state.viewsOrder])

  useEffect(() => {
    const serializedViewsMap: Record<number, NormalizedPageView> = Object.fromEntries(
      Object.entries(state.views).map(([number, view]) => {
        return [number, view.localViewState]
      }),
    )
    setViewSessionData(serializedViewsMap)
  }, [state.views])

  const currentView = state.currentViewNumber != null ? state.views[state.currentViewNumber] : undefined

  const currentViewWithDeserializedStateAndDirtyStates = useMemo(() => {
    if (!currentView) return undefined
    return addDeserializedStateAndDirtyStatesToView(currentView)
  }, [currentView, addDeserializedStateAndDirtyStatesToView])

  return {
    currentView: currentViewWithDeserializedStateAndDirtyStates,
    viewsMap: state.views,
    views: viewsListSorted,
    viewStateDispatch,
    setViews,
  }
}

export function validateViewSessionData(viewData: Record<number, NormalizedPageView>): boolean {
  for (const view of Object.values(viewData)) {
    // Validate that the view type is valid
    try {
      getViewTypeFromViewTypeParam(view.layout)
    } catch (e: unknown) {
      if (e instanceof EnumValueError) {
        return false
      }
    }
  }

  return true
}

const MEMEX_VIEWS_KEY = 'memex-views'
/**
 * Get the json string of the memex views stored for the current project
 */
function getViewSessionData() {
  const data = getSessionDataForKey(MEMEX_VIEWS_KEY)
  if (!data) return null
  const parsedData = JSON.parse(data) as Record<number, NormalizedPageView>

  // Validate the incoming data
  if (!validateViewSessionData(parsedData)) {
    return null
  }

  return parsedData
}
/**
 * Set the json string of the memex views data in session storage, scoped for the current project
 */
function setViewSessionData(value: Record<number, NormalizedPageView>) {
  return setSessionDataForKey(MEMEX_VIEWS_KEY, JSON.stringify(value))
}
