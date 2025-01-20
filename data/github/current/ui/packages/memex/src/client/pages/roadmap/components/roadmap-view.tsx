import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {BaseStyles, Box} from '@primer/react'
import {clsx} from 'clsx'
import {
  forwardRef,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import type {TableInstance} from 'react-table'

import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {ObserverProvider} from '../../../components/board/hooks/use-is-visible'
import {BaseProjectViewFilterInput} from '../../../components/filter-bar/base-project-view-filter-input'
import {OMNIBAR_HEIGHT} from '../../../components/omnibar/omnibar'
import {AddColumnModal} from '../../../components/react_table/add-column-modal'
import {TableDragToFillProvider} from '../../../components/react_table/bulk-fill-values'
import {CopyPasteProvider} from '../../../components/react_table/hooks/use-copy-paste'
import {useIsOmnibarFixed} from '../../../components/react_table/hooks/use-is-omnibar-fixed'
import {useReactTable} from '../../../components/react_table/hooks/use-react-table'
import {
  type TableFocusMeta,
  TableNavigationProvider,
  useTableNavigation,
} from '../../../components/react_table/navigation'
import {ReorderableRowsContext} from '../../../components/react_table/row-reordering/reorderable-rows'
import {RowReorderSash} from '../../../components/react_table/row-reordering/row-reorder-sash'
import {RowReorderingProvider} from '../../../components/react_table/row-reordering/row-reordering-provider'
import {TableCellBulkSelectionProvider} from '../../../components/react_table/table-cell-bulk-selection'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import {TableProvider} from '../../../components/react_table/table-provider'
import {useItemData} from '../../../components/react_table/use-item-data'
import {useRoadmapPillArea} from '../../../components/react_table/use-roadmap-pill-area'
import {useSelectionBlur} from '../../../components/react_table/use-selection-blur'
import {useTableFocus} from '../../../components/react_table/use-table-focus'
import {ROADMAP_ROW_HEIGHT} from '../../../components/roadmap/constants'
import {SlicerItemsProvider, useSlicerItems} from '../../../components/slicer-panel/slicer-items-provider'
import {SlicerPanel} from '../../../components/slicer-panel/slicer-panel'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import {useSliceBy} from '../../../features/slicing/hooks/use-slice-by'
import {isRoadmapColumnModel} from '../../../helpers/roadmap-helpers'
import {addNoGroupWhenGroupsDisabled} from '../../../helpers/table-group-utilities'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useInitialTableFocusAction} from '../../../hooks/use-initial-table-focus-action'
import {useLoadMissingFieldsById} from '../../../hooks/use-load-required-fields'
import {useMeasureScrollbars} from '../../../hooks/use-measure-scrollbars'
import {useRoadmapSettings, useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {useSidePanel} from '../../../hooks/use-side-panel'
import {LoadingStates, useViewLoadingState} from '../../../hooks/use-view-loading-state'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {usePaginatedTotalCount} from '../../../state-providers/memex-items/queries/use-paginated-total-count'
import {useAddFieldModal} from '../../../state-providers/modals/use-add-field-modal'
import {useViewOptionsMenuRef} from '../../../state-providers/view-options/use-view-options-menu-ref'
import {rowGroupSx} from '../components/roadmap-table-layout'
import {useRoadmapHeaderHeight} from '../hooks/use-roadmap-header-height'
import {getHeaderFocus, makeFocusableColumnFilter, makeFocusableRowFilter} from '../roadmap-navigation-meta'
import {
  RoadmapViewProvider,
  useRoadmapIsScrollingLocked,
  useRoadmapNavigation,
  useRoadmapView,
} from '../roadmap-view-provider'
import {RoadmapControls} from './roadmap-controls'
import {GroupedRoadmapItems} from './roadmap-grouped-items'
import {RoadmapHeader} from './roadmap-header'
import {RoadmapItems} from './roadmap-items'
import {RoadmapMarkers} from './roadmap-marker'
import {RoadmapMarkersInRangeProvider} from './roadmap-markers-in-range'
import {RoadmapFixedOmnibar} from './roadmap-omnibar'

interface RoadmapRef {
  focusIn: () => void
}

/**
 * Roadmap view component - a.k.a. Roadmap view.
 * This component is in the `/pages/roadmap/components` directory,
 * as oppposed to `/components` to align with future changes to our
 * directory structure as described in https://github.com/github/planning-tracking/issues/1007
 */

const plugins = [useRoadmapPillArea]

export const RoadmapView = memo(
  forwardRef<RoadmapRef>(function RoadmapView(_, ref) {
    const {addPotentiallyMissingFieldIds} = useLoadMissingFieldsById()
    const {hasWritePermissions} = ViewerPrivileges()
    const {dateFields, markerFields, getTimeSpanFromColumnData} = useRoadmapSettings()
    const {allColumns} = useAllColumns()
    const tableProps = useMemo(
      () => ({fields: allColumns.filter(col => col.id === SystemColumnId.Title), plugins}),
      [allColumns],
    )
    const table = useReactTable(tableProps)
    const metaRef = useRef<TableFocusMeta>({
      instance: table,
      getHeaderFocus,
      focusableRowFilter: makeFocusableRowFilter({hasWritePermissions, getTimeSpanFromColumnData}),
      focusableColumnFilter: makeFocusableColumnFilter({hasWritePermissions, getTimeSpanFromColumnData}),
    })

    useEffect(() => {
      metaRef.current.focusableRowFilter = makeFocusableRowFilter({hasWritePermissions, getTimeSpanFromColumnData})
      metaRef.current.focusableColumnFilter = makeFocusableColumnFilter({
        hasWritePermissions,
        getTimeSpanFromColumnData,
      })
    }, [hasWritePermissions, getTimeSpanFromColumnData])

    useEffect(() => {
      const fields = [
        ...new Set([
          ...dateFields.filter(isRoadmapColumnModel).map(field => field.id),
          ...markerFields.map(field => field.id),
        ]),
      ]
      addPotentiallyMissingFieldIds(fields)
    }, [dateFields, markerFields, addPotentiallyMissingFieldIds])

    const {memex_table_without_limits} = useEnabledFeatures()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const totalCount = memex_table_without_limits ? usePaginatedTotalCount() : table.flatRows.length

    return (
      <RoadmapViewProvider>
        <TableProvider table={table} cellHeight={ROADMAP_ROW_HEIGHT}>
          <TableNavigationProvider metaRef={metaRef}>
            <TableCellBulkSelectionProvider>
              <TableDragToFillProvider>
                <SlicerItemsProvider>
                  <CopyPasteProvider>
                    <BaseProjectViewFilterInput filterCount={useDeferredValue(totalCount)} />
                    <RoadmapMarkersInRangeProvider rows={table.flatRows}>
                      <RoadmapContent table={table} ref={ref} />
                    </RoadmapMarkersInRangeProvider>
                  </CopyPasteProvider>
                </SlicerItemsProvider>
              </TableDragToFillProvider>
            </TableCellBulkSelectionProvider>
          </TableNavigationProvider>
        </TableProvider>
      </RoadmapViewProvider>
    )
  }),
)

// Roadmap item rows are virtualized.  If not within the OBSERVER_Y_MARGIN of the viewport, render an empty placeholder row.
// Nested roadmap pills also conditionally rendered.  If outside the viewport X, render an empty pill and navigation arrow.
const OBSERVER_Y_MARGIN = 10 * ROADMAP_ROW_HEIGHT

/**
 * The main scrollable container of the Roadmap view, including the header
 */

type RoadmapContentProps = {
  table: TableInstance<TableDataType>
}

const roadmapViewContainerSx = {
  flex: '1 1 auto',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gridArea: '2/2',
  overflow: 'hidden',
}

const roadmapViewSx = {
  ...roadmapViewContainerSx,
}

const roadmapScrollContainerSx = {
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  inset: 0,
  backgroundColor: 'canvas.subtle',
  overflow: 'auto',
  scrollbarGutter: 'stable',
  '&.is-scrolling-locked': {
    overflow: 'hidden',
  },
  '&.is-omnibar-fixed': {
    // Leave enough space at the bottom for the omnibar not to obscure the last row.
    paddingBottom: `${OMNIBAR_HEIGHT + 12}px`,
  },
  '&.horizontal-scrollbar-hidden': {
    // If the horizontal scrollbar is not visible, we need to ensure there is enough padding on both the top and
    // bottom of the omnibar when the Roadmap viewport is scrolled to the very bottom of the window.
    paddingBottom: `${OMNIBAR_HEIGHT + 24}px`,
  },
  '&.is-grouped': {
    paddingBottom: 0,
  },
}

const RoadmapContent = forwardRef<RoadmapRef, RoadmapContentProps>(function RoadmapContent({table}, forwardedRef) {
  const isScrollingLocked = useRoadmapIsScrollingLocked()
  const {onKeyDown, onBlur} = useTableFocus()
  const {collapsedGroups} = useHorizontalGroupedBy()
  const {today} = useRoadmapView()
  const tableWidth = useRoadmapTableWidth()
  const headerHeight = useRoadmapHeaderHeight()
  const {roadmapRef, scrollToDate, shiftToNextRange, shiftToPrevRange} = useRoadmapNavigation()
  const {horizontalScrollbarSize} = useMeasureScrollbars(roadmapRef)
  const {rows, groupedRows} = table
  const containerRef = useRef<HTMLDivElement>(null)
  const {loadingState} = useViewLoadingState()
  const {hasWritePermissions} = ViewerPrivileges()
  const {setShowAddFieldModal, showAddFieldModal} = useAddFieldModal()
  const {anchorRef} = useViewOptionsMenuRef()
  const {navigationDispatch} = useTableNavigation()
  const {memex_disable_autofocus} = useEnabledFeatures()

  const initialFocusAction = useInitialTableFocusAction(table)
  const focusIn = useCallback(() => {
    if (initialFocusAction) navigationDispatch(initialFocusAction)
  }, [navigationDispatch, initialFocusAction])

  // focus in on init
  useEffect(() => {
    if (!memex_disable_autofocus) focusIn()
  }, [focusIn, memex_disable_autofocus])

  useImperativeHandle(forwardedRef, () => ({focusIn}))

  const effectiveTableHeight =
    loadingState === LoadingStates.loaded
      ? rows.length * ROADMAP_ROW_HEIGHT + headerHeight
      : ROADMAP_ROW_HEIGHT + headerHeight

  const showFixedOmnibar = useIsOmnibarFixed({table, totalHeight: effectiveTableHeight, scrollRef: containerRef})
  const {sliceField} = useSliceBy()
  const {slicerItems} = useSlicerItems()
  const {openProjectItemInPane} = useSidePanel()

  const shouldScrollToToday = useRef(true)
  useEffect(() => {
    if (shouldScrollToToday.current) {
      shouldScrollToToday.current = false
      scrollToDate(today)
    }
  }, [today, scrollToDate])

  const onScroll = useCallback(() => {
    if (roadmapRef?.current) {
      const {scrollLeft, scrollWidth, clientWidth} = roadmapRef.current
      if (scrollLeft + clientWidth + 1 > scrollWidth) {
        shiftToNextRange()
      } else if (scrollLeft <= 0) {
        shiftToPrevRange()
      }
    }
  }, [shiftToNextRange, shiftToPrevRange, roadmapRef])

  // Listen for changes to the browser window size, so we can check if it occludes the table
  const windowInnerWidth = useSyncExternalStore(subscribeToResize, () => window.innerWidth)
  // 1) If the browser width is smaller than the table width, we need to adjust the root margin to
  //    not account for the table width, because the table will be occluded by the browser window.
  //    So, the visible area will be positioned outside of the window, and the items will be seen
  //    as "not visible."
  // 2) Otherwise, if the browser can accomodate the table, then we will consider the "visible area"
  //    as the area to the right of the table.
  const rootMargin = useMemo(
    () =>
      tableWidth < windowInnerWidth
        ? `${OBSERVER_Y_MARGIN}px 0px ${OBSERVER_Y_MARGIN}px -${tableWidth}px`
        : `${OBSERVER_Y_MARGIN}px 0px ${OBSERVER_Y_MARGIN}px 0px`,
    [tableWidth, windowInnerWidth],
  )

  const tableGroups = groupedRows ? addNoGroupWhenGroupsDisabled(groupedRows) : undefined
  const isGrouped = tableGroups !== undefined

  const itemData = useItemData(table, {sticky: true})

  return (
    <>
      <ObserverProvider rootRef={roadmapRef} rootMargin={rootMargin} sizeEstimate={ROADMAP_ROW_HEIGHT}>
        <Box sx={roadmapViewContainerSx}>
          <RoadmapControls />
          <Box
            ref={containerRef}
            role="grid"
            sx={roadmapViewSx}
            data-hpc
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            {...testIdProps('roadmap-view')}
          >
            <Box
              ref={roadmapRef}
              onScroll={onScroll}
              className={clsx({
                'is-scrolling-locked': isScrollingLocked,
                'is-grouped': isGrouped,
                'is-omnibar-fixed': showFixedOmnibar,
                'horizontal-scrollbar-hidden': horizontalScrollbarSize === 0,
              })}
              sx={roadmapScrollContainerSx}
              {...testIdProps('roadmap-scroll-container')}
            >
              <RoadmapHeader />
              <RowReorderingProvider>
                <RoadmapItemsArea isGrouped={isGrouped}>
                  <RoadmapMarkers />
                  {isGrouped && rows.length ? (
                    <GroupedRoadmapItems
                      collapsedGroupIds={collapsedGroups}
                      tableGroups={tableGroups}
                      itemData={itemData}
                    />
                  ) : (
                    <ReorderableRowsContext rows={rows}>
                      <RoadmapItems rows={rows} isOmnibarFixed={showFixedOmnibar} itemData={itemData} />
                    </ReorderableRowsContext>
                  )}
                  <RowReorderSash
                    rows={isGrouped ? tableGroups : rows}
                    isGrouped={isGrouped}
                    scrollRef={roadmapRef}
                    headerHeight={headerHeight}
                    tableWidth={tableWidth}
                  />
                </RoadmapItemsArea>
              </RowReorderingProvider>
            </Box>
            {showFixedOmnibar && hasWritePermissions && <RoadmapFixedOmnibar rows={rows} />}
          </Box>
        </Box>
      </ObserverProvider>
      {sliceField && <SlicerPanel slicerItems={slicerItems} openSidePanel={openProjectItemInPane} />}
      {/* Currently only invoked via command palette */}
      {showAddFieldModal && (
        <AddColumnModal isOpen={showAddFieldModal} setOpen={setShowAddFieldModal} anchorRef={anchorRef} onSave={noop} />
      )}
    </>
  )
})

const roadmapItemsAreaSx = {
  position: 'relative',
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  contain: 'content',
}

const roadmapItemsAreaWithShadowSx = {
  ...roadmapItemsAreaSx,
  boxShadow: 'shadow.medium',
}

const roadmapItemsSx = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}

const roadmapItemsWithDelimiterSx = {
  ...roadmapItemsSx,
  boxShadow: 'shadow.medium',
  ...rowGroupSx,
}
/**
 * The Roadmap area below the sticky header containing all items
 */
const RoadmapItemsArea = memo(function RoadmapItemsArea({
  isGrouped,
  children,
}: {
  isGrouped: boolean
  children: React.ReactNode
}) {
  const {totalWidth} = useRoadmapView()
  const {containerRef} = useSelectionBlur()

  return (
    <BaseStyles fontSize="14px">
      <Box
        sx={isGrouped ? roadmapItemsAreaSx : roadmapItemsAreaWithShadowSx}
        style={{width: totalWidth}}
        ref={containerRef}
        {...testIdProps('roadmap-items')}
      >
        <Box sx={isGrouped ? roadmapItemsSx : roadmapItemsWithDelimiterSx}>{children}</Box>
      </Box>
    </BaseStyles>
  )
})

function subscribeToResize(notify: () => void) {
  window.addEventListener('resize', notify)
  return () => window.removeEventListener('resize', notify)
}
