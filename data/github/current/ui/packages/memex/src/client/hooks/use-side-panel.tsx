import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useConfirm} from '@primer/react'
import {useQueryClient} from '@tanstack/react-query'
import {
  createContext,
  type Dispatch,
  memo,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {useBeforeUnload, useLocation} from 'react-router-dom'

import {apiGetItem} from '../api/memex-items/api-get-item'
import {SubIssueSidePanelItem} from '../api/memex-items/hierarchy'
import {ItemType} from '../api/memex-items/item-type'
import {type SidePanelItem, SidePanelTypeParam} from '../api/memex-items/side-panel-item'
import type {SuggestedRepository} from '../api/repository/contracts'
import {
  BulkAddSidePanelOpen,
  type BulkAddSidePanelOpenUIType,
  CommandPaletteUI,
  DraftOpen,
  SidePanelBoardOpen,
  SidePanelTableOpen,
} from '../api/stats/contracts'
import {useCommands} from '../commands/hook'
import {focusPrevious, useStableBoardNavigation} from '../components/board/navigation'
import type {OmnibarItemAttrs} from '../components/omnibar/types'
import {moveTableFocus, useStableTableNavigation} from '../components/react_table/navigation'
import useToasts, {ToastType} from '../components/toasts/use-toasts'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {isInstanceOfMemexItemModel, type MemexItemModel} from '../models/memex-item-model'
import {FocusType} from '../navigation/types'
import {HIERARCHY_PARAM, ITEM_ID_PARAM, PANE_PARAM, STATUS_UPDATE_ID_PARAM} from '../platform/url'
import {useGetSidePanelItemNotOnClient} from '../queries/side-panel'
import {useSearchParams} from '../router'
import {
  getQueryDataForSidePanelItemNotOnClientFromQueryClient,
  setQueryDataForSidePanelItemNotOnClientInQueryClient,
} from '../state-providers/memex-items/query-client-api/memex-items'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {useSetMemexItemData} from '../state-providers/memex-items/use-set-memex-item-data'
import {Resources} from '../strings'
import {usePostStats} from './common/use-post-stats'
import {useEnabledFeatures} from './use-enabled-features'
import {useProjectViewRouteMatch} from './use-project-view-route-match'

export type OpenSidePanelFn = (item: SidePanelItem, onClose?: () => void) => void

export type SidePanelContextValue = {
  sidePanelState: SidePanelState
  openProjectItemInPane: OpenSidePanelFn
  reloadPaneItem: () => void
  openPaneInfo: (statusUpdateId?: number) => void
  openPaneBulkAdd: (
    ui: BulkAddSidePanelOpenUIType,
    targetRepository?: SuggestedRepository,
    query?: string,
    newItemAttributes?: OmnibarItemAttrs,
  ) => void
  closePane: (opts?: {force?: boolean}) => Promise<boolean>
  dirtyItems: typeof defaultDirtyItems
  setDirtyItems: Dispatch<SetStateAction<typeof defaultDirtyItems>>
  hasUnsavedChanges: boolean
  isPaneOpened: boolean
  supportedItemTypes: Set<ItemType>
  openPaneHistoryItem: (item: HistoryItem) => void
  openPaneHierarchyHistoryItem: (item: HistoryItem) => void
  pinned: boolean
  setPinned: Dispatch<boolean>
  pinButtonRef: React.RefObject<HTMLButtonElement>
  initialFocusRef: React.RefObject<HTMLButtonElement>
  containerRef: React.RefObject<HTMLDivElement>
}

export type MemexItemSidePanelState = {
  type: typeof SidePanelTypeParam.ISSUE
  item: SidePanelItem
}

type MemexInfoSidePanelState = {
  type: typeof SidePanelTypeParam.INFO
}

type MemexBulkAddSidePanelState = {
  type: typeof SidePanelTypeParam.BULK_ADD
  targetRepository?: SuggestedRepository
  query?: string
  newItemAttributes?: OmnibarItemAttrs
}

export type HistoryItem = {
  historyIdx?: number
  item?: SidePanelItem
}

const supportedItemTypes = new Set<ItemType>([ItemType.DraftIssue, ItemType.Issue])

/**
 * @deprecated
 */
const DEPRECATED_SIDE_PANEL_PARAM = 'item'

export type SidePanelState = MemexItemSidePanelState | MemexInfoSidePanelState | MemexBulkAddSidePanelState | null

const infoTabState: MemexInfoSidePanelState = {type: SidePanelTypeParam.INFO}

function useClearParamsWhenNoVisibleItemForId({
  itemIdParam,
  paneItem,
  isHierarchyParam,
}: {
  itemIdParam: string | null
  isHierarchyParam: boolean
  paneItem?: MemexItemModel
}) {
  const {addToast} = useToasts()
  const [, setSearchParams] = useSearchParams()
  const addToastRef = useTrackingRef(addToast)

  useEffect(() => {
    if (!itemIdParam) return
    if (paneItem?.contentType && supportedItemTypes.has(paneItem.contentType)) return
    if (isHierarchyParam) return

    addToastRef.current({
      type: ToastType.error,
      message:
        paneItem?.contentType === ItemType.PullRequest
          ? Resources.sidePanelItemNotSupported
          : Resources.sidePanelItemNotFound,
    })

    setSearchParams(
      params => {
        params.delete(PANE_PARAM)
        params.delete(ITEM_ID_PARAM)
        params.delete(HIERARCHY_PARAM)
        return params
      },
      {replace: true},
    )
  }, [addToastRef, isHierarchyParam, itemIdParam, paneItem?.contentType, setSearchParams])
}

const defaultDirtyItems: ReadonlySet<symbol> = new Set()

export const SidePanelContext = createContext<SidePanelContextValue | null>(null)
const SidePanelCurrentItemIdContext = createContext<number | undefined>(undefined)
const SidePanelBreadcrumbHistoryContext = createContext<ReadonlyArray<SidePanelItem>>([])

function isValidSidePanelTypeParams(param: string | null): param is ObjectValues<typeof SidePanelTypeParam> {
  if (!param) return false
  return new Set<string>(Object.values(SidePanelTypeParam)).has(param)
}

function getPanelState(
  paneParam: string | null,
  opts: {
    [Key in ObjectValues<typeof SidePanelTypeParam>]: Extract<SidePanelState, {type: Key}> | null
  },
): SidePanelState {
  if (isValidSidePanelTypeParams(paneParam)) {
    return opts[paneParam]
  }
  return null
}

/**
 * When the pane param is SidePanelTypeParam.ITEM, redirect to SidePanelTypeParam.ISSUE
 * replace the history instead of appending
 */
function useRedirectWhenDeprecatedItemParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isDeprecatedItemParam = searchParams.get(PANE_PARAM) === DEPRECATED_SIDE_PANEL_PARAM

  useEffect(() => {
    if (!isDeprecatedItemParam) return
    setSearchParams(
      params => {
        params.set(PANE_PARAM, SidePanelTypeParam.ISSUE)
        return params
      },
      {replace: true},
    )
  }, [isDeprecatedItemParam, setSearchParams])
}
/**
 * Wraps the useGetSidePanelItemNotOnClient query hook to only run if all of the following are true:
 * 1. The memex_table_without_limits feature is enabled
 * 2. The itemIdParam is not null
 * 3. The paneItem is undefined
 *
 * When all 3 of those are true, it means we are in a MWL project where we have a itemIdParam from the URL,
 * but we were unable to find the item in `useMemexItems` because the item is not on the client.
 *
 * If the FF is disabled, we will return undefined for the query, and a no-op for setQueryDataForSidePanelItem, to avoid running the query at all for these projects.
 * If the FF is enabled, but we don't have an itemIdParam, or we do have an itemIdParam but we were able to find the item in `useMemexItems`,
 * we will return the query, but it will be disabled, to avoid a call to the queryFn.
 */
const useGetSidePanelItemNotOnClientQuery = (itemIdParam: string | null, paneItem: MemexItemModel | undefined) => {
  const queryClient = useQueryClient()
  const {memex_table_without_limits} = useEnabledFeatures()

  const setQueryDataForSidePanelItem = useCallback(
    (item: SidePanelItem) => {
      if (!memex_table_without_limits) return
      if (!isInstanceOfMemexItemModel(item)) return
      setQueryDataForSidePanelItemNotOnClientInQueryClient(queryClient, item)
    },
    [memex_table_without_limits, queryClient],
  )
  if (!memex_table_without_limits) return {query: undefined, setQueryDataForSidePanelItem}

  const initialData = getQueryDataForSidePanelItemNotOnClientFromQueryClient(queryClient, itemIdParam)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const query = useGetSidePanelItemNotOnClient({
    variables: {itemId: itemIdParam},
    // We only want to enable the query if:
    // 1. We have an item id in the URL
    // 2. We do not yet have an item for that id
    // 3. No data was manually set for this item already as initialData
    enabled: !!(itemIdParam && !paneItem && !initialData),
    initialData,
  })

  return {query, setQueryDataForSidePanelItem}
}

const defaultItemPanelBreadcrumbHistory: ReadonlyArray<SidePanelItem> = []
export const SidePanelProviderRenderFunction = ({children}: {children: ReactNode}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const {items} = useMemexItems()
  const paneParam = searchParams.get(PANE_PARAM)
  const isBulkAddParam = paneParam === SidePanelTypeParam.BULK_ADD
  const isIssuePane = paneParam === DEPRECATED_SIDE_PANEL_PARAM || paneParam === SidePanelTypeParam.ISSUE
  const itemIdParam = searchParams.get(ITEM_ID_PARAM)
  const isHierarchyParam = searchParams.get(HIERARCHY_PARAM) === 'true'
  let paneItem = itemIdParam ? items.find(item => item.id === parseInt(itemIdParam)) : undefined
  const {query: sidePanelItemNotOnClientQuery, setQueryDataForSidePanelItem} = useGetSidePanelItemNotOnClientQuery(
    itemIdParam,
    paneItem,
  )

  if (!paneItem && sidePanelItemNotOnClientQuery?.data) {
    // If we have a result from the query, use that as the paneItem.
    // If the MWL FF is disabled, the query will be undefined, and we never made a request to fetch the
    // data (because the query itself was disabled), then we will use the paneItem from the URL.
    paneItem = sidePanelItemNotOnClientQuery.data
  }

  useRedirectWhenDeprecatedItemParam()

  // If we are in the process of loading the item from the server (because we have an itemIdParam from the URL
  // but we were unable to find the item in `useMemexItems`), we _don't_ want to clear the params from the URL.
  // Passing `null` as the first parameter (the item id), will cause the `useClearParamsWhenNoVisibleItemForId`
  // to return early and not clear the params.
  // Once the query resolves - either successfully or unsuccessfully, we can pass the itemIdParam, along with the
  // recently requested item, to this hook, so that it can use the proper logic.
  const isItemLoading = !!sidePanelItemNotOnClientQuery?.isLoading
  useClearParamsWhenNoVisibleItemForId({itemIdParam: isItemLoading ? null : itemIdParam, isHierarchyParam, paneItem})

  const [breadcrumbHistoryState, setBreadcrumbHistory] = useState<ReadonlyArray<SidePanelItem>>(
    paneItem ? [paneItem] : defaultItemPanelBreadcrumbHistory,
  )

  const historyEmpty = breadcrumbHistoryState.length === 0
  /**
   * when navigating back, if the history is empty, add the current item to the history
   */
  if (paneItem && historyEmpty) {
    setBreadcrumbHistory([paneItem])
  }

  const breadcrumbHistoryStateWithItem: typeof breadcrumbHistoryState = useMemo(() => {
    if (breadcrumbHistoryState.length === 0) return defaultItemPanelBreadcrumbHistory
    return breadcrumbHistoryState.reduce((acc, historyItem) => {
      if (!historyItem.memexItemId) {
        acc.push(historyItem)
        return acc
      }
      if (sidePanelItemNotOnClientQuery?.data) {
        // if the item was not on the client, and we have a result from the query,
        // don't try to look up the item from `useMemexItems`, as it won't be found.
        // Just use the result from the query.
        const itemId = historyItem.memexItemId()
        const itemLoaded = sidePanelItemNotOnClientQuery?.data.id === itemId
        if (itemLoaded) {
          acc.push(sidePanelItemNotOnClientQuery?.data)
        }
      } else {
        const itemId = historyItem.memexItemId()
        const item = items.find(i => i.id === itemId)
        if (item) {
          acc.push(item)
        }
      }
      return acc
    }, [] as Array<SidePanelItem>)
  }, [breadcrumbHistoryState, items, sidePanelItemNotOnClientQuery?.data])

  const lastHistoryItem = breadcrumbHistoryStateWithItem.at(-1)

  const itemPaneState = useMemo(() => {
    if (!isIssuePane) return null
    if (!lastHistoryItem) return null
    const itemState: MemexItemSidePanelState = {
      type: SidePanelTypeParam.ISSUE,
      item: lastHistoryItem,
    }
    return itemState
  }, [isIssuePane, lastHistoryItem])

  const {hasWritePermissions} = ViewerPrivileges()

  const location = useLocation()
  const bulkAddState = useMemo(() => {
    if (!hasWritePermissions || !isBulkAddParam) return null
    const bulkState: MemexBulkAddSidePanelState = {
      ...parseStatefulOpts(location.state),
      type: SidePanelTypeParam.BULK_ADD,
    }
    return bulkState
  }, [isBulkAddParam, hasWritePermissions, location.state])

  useEffect(() => {
    if (isBulkAddParam && !hasWritePermissions) {
      setSearchParams(
        params => {
          params.delete(PANE_PARAM)
          return params
        },
        {replace: true},
      )
    }
  }, [hasWritePermissions, isBulkAddParam, setSearchParams])

  const sidePanelState = getPanelState(paneParam, {
    [SidePanelTypeParam.ISSUE]: itemPaneState,
    [SidePanelTypeParam.INFO]: infoTabState,
    [SidePanelTypeParam.BULK_ADD]: bulkAddState,
  })

  useEffect(() => {
    if (!sidePanelState && onCloseRef.current) {
      onCloseRef.current?.()
      onCloseRef.current = undefined
    }
  }, [sidePanelState])

  const isPaneOpened = !!sidePanelState

  useEffect(() => {
    // Pull focus into the panel upon opening or updating. The modal version handles this automatically but not the
    // docked version
    if (itemIdParam && !containerRef.current?.contains(document.activeElement))
      setTimeout(() => initialFocusRef.current?.focus())
  }, [itemIdParam])

  const {postStats} = usePostStats()

  const [pinned, _setPinned] = useLocalStorage('projects.sidePanelPinned', false)

  const setPinned = useCallback(
    (value: boolean) => {
      _setPinned(value)
      // When the pin button is activated, we want to force focus to return to the same button in the new panel, even
      // when the overlay panel tries to pull focus to the close button
      setTimeout(() => pinButtonRef.current?.focus(), 25)
      postStats({
        name: 'side_panel_pin',
        context: value ? 'pin' : 'unpin',
      })
    },
    [_setPinned, postStats],
  )

  const [dirtyItems, setDirtyItems] = useState(defaultDirtyItems)
  const hasUnsavedChanges = dirtyItems.size > 0
  const resetDirtyItems = useCallback(() => setDirtyItems(defaultDirtyItems), [])

  const {setItemData} = useSetMemexItemData()

  const loadPaneItemData = useCallback(
    async (item: SidePanelItem) => {
      const memexProjectItemId = item.memexItemId?.()
      /**
       * Don't try to load item data if it's not a project item
       */
      if (memexProjectItemId === undefined) return
      const res = await apiGetItem({memexProjectItemId})
      if (res.ok) {
        setItemData(res.data.memexProjectItem)
      }
    },
    [setItemData],
  )

  const reloadPaneItem = useCallback(async () => {
    if (sidePanelState?.type !== SidePanelTypeParam.ISSUE) return
    loadPaneItemData(sidePanelState.item)
  }, [loadPaneItemData, sidePanelState])

  const onCloseRef = useRef<(() => void) | undefined>()

  const {sub_issues} = useEnabledFeatures()
  const openProjectItemInPane = useCallback(
    (item: SidePanelItem, newItemOnClose?: () => void) => {
      if (!supportedItemTypes.has(item.contentType)) return
      setQueryDataForSidePanelItem(item)
      setSearchParams(nextParams => {
        nextParams.set(PANE_PARAM, SidePanelTypeParam.ISSUE)
        nextParams.set(ITEM_ID_PARAM, item.id.toString())
        if (item.isHierarchy) {
          nextParams.set(HIERARCHY_PARAM, 'true')
        }
        return nextParams
      })
      onCloseRef.current = newItemOnClose

      setBreadcrumbHistory([item])
      postStats({
        /**
         * This is not just drafts, but we've historically
         * only sent this when the item pane is interacted with
         */
        name: DraftOpen,
        memexProjectItemId: item.id,
      })
    },
    [setQueryDataForSidePanelItem, setSearchParams, postStats],
  )

  const openPaneInfo = useCallback(
    (statusUpdateId?: number) => {
      if (searchParams.get(PANE_PARAM) === SidePanelTypeParam.INFO) return
      setSearchParams(params => {
        params.set(PANE_PARAM, SidePanelTypeParam.INFO)

        if (statusUpdateId) {
          params.set(STATUS_UPDATE_ID_PARAM, statusUpdateId.toString())
        }
        return params
      })
    },
    [searchParams, setSearchParams],
  )

  const openPaneBulkAdd = useCallback(
    (
      ui: BulkAddSidePanelOpenUIType,
      targetRepository?: SuggestedRepository,
      query?: string,
      newItemAttributes?: OmnibarItemAttrs,
    ) => {
      resetDirtyItems()
      setSearchParams(
        params => {
          params.set(PANE_PARAM, SidePanelTypeParam.BULK_ADD)
          return params
        },
        {
          state: {
            targetRepository,
            newItemAttributes,
            query,
          },
        },
      )
      postStats({name: BulkAddSidePanelOpen, ui})
    },
    [resetDirtyItems, postStats, setSearchParams],
  )

  const confirmClose = useConfirm()

  const confirmUnsaved = useCallback(async () => {
    if (!hasUnsavedChanges) return true
    return await confirmClose({
      ...Resources.sidePanelCloseConfirmation,
      confirmButtonType: 'danger',
    })
  }, [confirmClose, hasUnsavedChanges])

  const closePane = useCallback(
    async (opts?: {force?: boolean}) => {
      if (hasUnsavedChanges && !(opts && opts.force)) {
        const close = await confirmUnsaved()
        if (!close) return false
        resetDirtyItems()
      }
      setSearchParams(params => {
        params.delete(PANE_PARAM)
        params.delete(ITEM_ID_PARAM)
        params.delete(HIERARCHY_PARAM)

        // clear the status update id if it's present
        if (params.get(STATUS_UPDATE_ID_PARAM)) {
          params.delete(STATUS_UPDATE_ID_PARAM)
        }
        return params
      })

      setBreadcrumbHistory(defaultItemPanelBreadcrumbHistory)
      return true
    },
    [hasUnsavedChanges, resetDirtyItems, setSearchParams, confirmUnsaved],
  )

  const beforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        return (event.returnValue = '')
      }
    },
    [hasUnsavedChanges],
  )

  useBeforeUnload(beforeUnload)

  const updateBreadcrumbHistoryAndPostStats = useCallback(
    (historyItem?: HistoryItem) => {
      if (!historyItem) return

      const {historyIdx, item} = historyItem
      if (!item) return

      setBreadcrumbHistory(prev => {
        let next = prev.slice()
        if (historyIdx !== undefined) {
          next = prev.slice(0, historyIdx)
        }
        return [...next, item]
      })

      /**
       * This used to be called again by calling openPaneItem, but now we don't
       * call that method a second time, so we need to call postStats here
       *
       * We are currently using DraftOpen as the 'side panel item opened' event
       * which is odd, but history.  I don't want to break any dashboards that
       * might rely on this
       */
      postStats({
        name: DraftOpen,
        memexProjectItemId: item.id,
      })
    },
    [postStats],
  )

  const openPaneHistoryItem = useCallback(
    async (historyItem?: HistoryItem) => {
      if (sidePanelState?.type !== SidePanelTypeParam.ISSUE) return

      // If no SidePanelItem to open, open link in new tab as usual
      if (!historyItem) return
      const {item} = historyItem
      if (!item) return

      const close = await confirmUnsaved()
      if (!close) return

      loadPaneItemData(item)
      resetDirtyItems()
      updateBreadcrumbHistoryAndPostStats(historyItem)
    },
    [sidePanelState?.type, loadPaneItemData, resetDirtyItems, updateBreadcrumbHistoryAndPostStats, confirmUnsaved],
  )

  const openPaneHierarchyHistoryItem = useCallback(
    async (historyItem?: HistoryItem) => {
      // If no SidePanelItem to open, open link in new tab as usual
      if (!historyItem) return
      if (!historyItem.item?.isHierarchy) return

      const {item} = historyItem
      if (!item) return

      const close = await confirmUnsaved()
      if (!close) return

      loadPaneItemData(item)
      resetDirtyItems()
      updateBreadcrumbHistoryAndPostStats(historyItem)
    },
    [loadPaneItemData, resetDirtyItems, updateBreadcrumbHistoryAndPostStats, confirmUnsaved],
  )

  // If there is currently a hierarchy item initially set in the URL, then we should open it automatically
  useEffect(() => {
    if (sub_issues) {
      const parentIssue = items
        .find(item => {
          const parentId = item.getParentIssue()?.id

          if (!parentId) return false

          return parentId.toString() === itemIdParam
        })
        ?.getParentIssue()
      if (!parentIssue) return

      const {id, number, owner, repository: repo, state, stateReason, title, url} = parentIssue
      const parentItem = new SubIssueSidePanelItem({id, number, owner, repo, state, stateReason, title, url})

      if (isHierarchyParam && itemIdParam) {
        openProjectItemInPane(parentItem)
      }
    }
  }, [isHierarchyParam, itemIdParam, items, sub_issues, openProjectItemInPane])

  const {isProjectViewRoute} = useProjectViewRouteMatch()
  useCommands(() => {
    if (!isProjectViewRoute || sidePanelState?.type === SidePanelTypeParam.BULK_ADD) return null
    return ['a', 'Add items', BulkAddSidePanelOpen, () => openPaneBulkAdd(CommandPaletteUI)]
  }, [isProjectViewRoute, sidePanelState, openPaneBulkAdd])

  useCommands(() => {
    if (!sidePanelState) return null
    return pinned
      ? ['p', Resources.sidePanelUnpinLabel, 'side-panel-unpin', () => setPinned(false)]
      : ['p', Resources.sidePanelPinLabel, 'side-panel-pin', () => setPinned(true)]
  }, [sidePanelState, pinned, setPinned])

  const pinButtonRef = useRef<HTMLButtonElement>(null)
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const contextValue: SidePanelContextValue = useMemo(() => {
    return {
      sidePanelState,
      openProjectItemInPane,
      reloadPaneItem,
      openPaneInfo,
      openPaneBulkAdd,
      closePane,
      hasUnsavedChanges,
      setDirtyItems,
      dirtyItems,
      isPaneOpened,
      supportedItemTypes,
      openPaneHistoryItem,
      openPaneHierarchyHistoryItem,
      pinned,
      setPinned,
      pinButtonRef,
      initialFocusRef,
      containerRef,
    }
  }, [
    closePane,
    setDirtyItems,
    dirtyItems,
    hasUnsavedChanges,
    isPaneOpened,
    openPaneBulkAdd,
    openPaneHierarchyHistoryItem,
    openPaneHistoryItem,
    openPaneInfo,
    openProjectItemInPane,
    reloadPaneItem,
    sidePanelState,
    pinned,
    setPinned,
  ])
  return (
    <SidePanelContext.Provider value={contextValue}>
      <SidePanelCurrentItemIdContext.Provider
        value={sidePanelState && 'item' in sidePanelState ? sidePanelState.item.id : undefined}
      >
        <SidePanelBreadcrumbHistoryContext.Provider value={breadcrumbHistoryStateWithItem}>
          {children}
        </SidePanelBreadcrumbHistoryContext.Provider>
      </SidePanelCurrentItemIdContext.Provider>
    </SidePanelContext.Provider>
  )
}

export const SidePanelProvider = memo(SidePanelProviderRenderFunction)

function parseStatefulOpts(state: any) {
  const opts: {
    targetRepository: SuggestedRepository | undefined
    query: string | undefined
    newItemAttributes: OmnibarItemAttrs | undefined
  } = {
    targetRepository: undefined,
    query: undefined,
    newItemAttributes: undefined,
  }

  if (state) {
    if ('targetRepository' in state) {
      opts.targetRepository = state.targetRepository
    }
    if ('query' in state) {
      opts.query = state.query
    }
    if ('newItemAttributes' in state) {
      opts.newItemAttributes = state.newItemAttributes
    }
  }

  return opts
}

export const useSidePanelBreadcrumbHistory = () => useContext(SidePanelBreadcrumbHistoryContext)

export const useSidePanelItemId = () => {
  const context = useContext(SidePanelCurrentItemIdContext)
  return context
}

export const useSidePanel = () => {
  const context = useContext(SidePanelContext)
  if (context === null) {
    throw new Error('useSidePanel must be used within a SidePanelProvider')
  }

  return context
}

// Use this hook when opening the pane from the table and you want to maintain
// focus position in the table.
export const useTableSidePanel = () => {
  const {openProjectItemInPane, ...rest} = useSidePanel()
  const {navigationDispatch} = useStableTableNavigation()
  const {postStats} = usePostStats()

  const openPaneWithTableFocus = useCallback(
    (item: SidePanelItem) => {
      openProjectItemInPane(item, () => {
        navigationDispatch(moveTableFocus({focusType: FocusType.Focus}))
      })
      postStats({name: SidePanelTableOpen, context: JSON.stringify({contentType: item.contentType})})
      navigationDispatch(moveTableFocus({focusType: FocusType.Suspended}))
    },
    [navigationDispatch, openProjectItemInPane, postStats],
  )

  return {
    openPane: openPaneWithTableFocus,
    ...rest,
  }
}

// Use this hook when opening the pane from the board and you want to maintain
// focus position.
export const useBoardSidePanel = () => {
  const {openProjectItemInPane, ...rest} = useSidePanel()
  const {navigationDispatch} = useStableBoardNavigation()
  const {postStats} = usePostStats()

  const openPaneWithTableFocus = useCallback(
    (item: SidePanelItem) => {
      openProjectItemInPane(item, () => {
        navigationDispatch(focusPrevious())
      })
      postStats({name: SidePanelBoardOpen, context: JSON.stringify({contentType: item.contentType})})
    },
    [navigationDispatch, openProjectItemInPane, postStats],
  )

  return {
    openPane: openPaneWithTableFocus,
    ...rest,
  }
}
