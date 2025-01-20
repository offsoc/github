import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {BaseStyles, Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, memo, useCallback, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef} from 'react'
import type {TableInstance} from 'react-table'

import {useSliceBy} from '../../features/slicing/hooks/use-slice-by'
import {resetScrollPositionImmediately} from '../../helpers/scroll-utilities'
import {addNoGroupWhenGroupsDisabled} from '../../helpers/table-group-utilities'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useInitialTableFocusAction} from '../../hooks/use-initial-table-focus-action'
import {useMeasureScrollbars} from '../../hooks/use-measure-scrollbars'
import {useTableSidePanel} from '../../hooks/use-side-panel'
import {LoadingStates, useViewLoadingState} from '../../hooks/use-view-loading-state'
import {useViews} from '../../hooks/use-views'
import {useVisibleFields} from '../../hooks/use-visible-fields'
import {usePaginatedMemexItemsQuery} from '../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {usePaginatedTotalCount} from '../../state-providers/memex-items/queries/use-paginated-total-count'
import {OmnibarContainer} from '../omnibar/omnibar-container'
import {SlicerItemsProvider, useSlicerItems} from '../slicer-panel/slicer-items-provider'
import {SlicerPanel} from '../slicer-panel/slicer-panel'
import {TableDragToFillProvider} from './bulk-fill-values'
import {CELL_HEIGHT, TABLE_HEADER_HEIGHT} from './constants'
import {CopyPasteProvider} from './hooks/use-copy-paste'
import {useIsOmnibarFixed} from './hooks/use-is-omnibar-fixed'
import {useReactTable} from './hooks/use-react-table'
import {useScrollToNewItem} from './hooks/use-scroll-to-new-item'
import {focusSearchInput, type TableFocusMeta, TableNavigationProvider, useTableNavigation} from './navigation'
import {useRecordComponent} from './performance-measurements'
import {TableBodyWithObserver} from './table-body-with-observer'
import {TableCellBulkSelectionProvider} from './table-cell-bulk-selection'
import type {TableDataType} from './table-data-type'
import {TableFilterInput} from './table-filter-input'
import {TableOmnibar} from './table-omnibar'
import {PLACEHOLDER_ROW_COUNT} from './table-pagination'
import {TableProvider} from './table-provider'
import {useAddColumnHeader} from './use-add-column-header'
import {useItemData} from './use-item-data'
import {useSelectionBlur} from './use-selection-blur'
import {useTableFocus} from './use-table-focus'

const plugins = [useAddColumnHeader]

interface TableRef {
  focusIn: () => void
}

const getHeaderFocus = () => focusSearchInput().focus

export const ReactTable = memo(
  forwardRef<TableRef>(function ReactTable(_, ref) {
    useRecordComponent('Table', 'ReactTable', '')
    const {visibleFields} = useVisibleFields()
    const tableProps = useMemo(() => ({fields: visibleFields, plugins}), [visibleFields])
    const table = useReactTable(tableProps)

    const metaRef = useRef<TableFocusMeta>({instance: table, getHeaderFocus})
    const {memex_table_without_limits} = useEnabledFeatures()

    // `memex_table_without_limits` will not change after initial render
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const totalCount = memex_table_without_limits ? usePaginatedTotalCount() : table.flatRows.length

    return (
      <TableProvider table={table} cellHeight={CELL_HEIGHT}>
        <TableNavigationProvider metaRef={metaRef}>
          <TableCellBulkSelectionProvider>
            <TableDragToFillProvider>
              <SlicerItemsProvider>
                <CopyPasteProvider>
                  <TableFilterInput filterCount={useDeferredValue(totalCount)} />
                  <InnerTable table={table} ref={ref} />
                </CopyPasteProvider>
              </SlicerItemsProvider>
            </TableDragToFillProvider>
          </TableCellBulkSelectionProvider>
        </TableNavigationProvider>
      </TableProvider>
    )
  }),
)

type InnerTableProps = {
  table: TableInstance<TableDataType>
}

const tableBodyContainerSx = {position: 'relative', flex: '1 1 auto', width: '100%'} as const
const InnerTable = forwardRef<TableRef, InnerTableProps>(function InnerTable({table}, forwardedRef) {
  const {onKeyDown, onBlur} = useTableFocus()
  const {navigationDispatch} = useTableNavigation()
  const {memex_table_without_limits, memex_disable_autofocus} = useEnabledFeatures()

  const initialFocusAction = useInitialTableFocusAction(table)
  const focusIn = useCallback(() => {
    if (initialFocusAction) navigationDispatch(initialFocusAction)
  }, [navigationDispatch, initialFocusAction])

  // focus in on init
  useEffect(() => {
    if (!memex_disable_autofocus) focusIn()
  }, [focusIn, memex_disable_autofocus])

  useImperativeHandle(forwardedRef, () => ({focusIn}))

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const {hasWritePermissions} = ViewerPrivileges()
  const {loadingState} = useViewLoadingState()
  const {openPane: openSidePanel} = useTableSidePanel()

  let placeholderRowCount = 0
  if (memex_table_without_limits) {
    // Disable this rule to keep pagination behind a FF
    // FF are static for the lifetime of the component
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {hasNextPage} = usePaginatedMemexItemsQuery()
    placeholderRowCount = hasNextPage ? PLACEHOLDER_ROW_COUNT : 0
  }
  const effectiveTableHeight =
    loadingState === LoadingStates.loaded
      ? (table.rows.length + placeholderRowCount) * CELL_HEIGHT + TABLE_HEADER_HEIGHT
      : CELL_HEIGHT + TABLE_HEADER_HEIGHT
  const isOmnibarFixed = useIsOmnibarFixed({table, totalHeight: effectiveTableHeight, scrollRef})
  const {horizontalScrollbarSize, verticalScrollbarSize} = useMeasureScrollbars(scrollRef)

  // When a new item is added, wait for paint and scroll the table to the new
  // row (the bottom).
  const {onNewItem} = useScrollToNewItem(scrollRef, table.rows, {left: 0, rowHeight: CELL_HEIGHT})

  const {currentView} = useViews()
  const currentViewNumber = currentView?.number

  const {containerRef} = useSelectionBlur()
  const {sliceField} = useSliceBy()
  const {slicerItems} = useSlicerItems()

  const itemData = useItemData(table)

  useLayoutEffect(() => {
    resetScrollPositionImmediately(scrollRef.current)
  }, [currentViewNumber])

  const tableGroups = table?.groupedRows ? addNoGroupWhenGroupsDisabled(table.groupedRows) : undefined

  const rootStyleObject = useMemo<BetterSystemStyleObject>(
    () => ({
      flex: '1 1 auto',
      flexDirection: 'column',
      width: '100%',
      position: 'relative',
      backgroundImage: theme =>
        table.groupedRows
          ? 'none'
          : `url("data:image/svg+xml,%3Csvg viewBox='0 0 1 1' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='transparent' /%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg viewBox='0 0 1 1' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='${encodeURIComponent(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              theme.colors.border.muted,
            )}' /%3E%3C/svg%3E")`,
      backgroundSize: '1px 37px',
      backgroundPositionY: '15px',
      backgroundRepeat: 'repeat-x, repeat',
      bg: table.groupedRows
        ? theme => `${theme.colors.canvas.inset}`
        : isOmnibarFixed
          ? theme => `${theme.colors.canvas.default}`
          : theme => `${theme.colors.canvas.inset}`,
      display: 'flex',
      gridArea: '2/2',
    }),
    [isOmnibarFixed, table.groupedRows],
  )

  return (
    <>
      <Box
        {...table.getTableProps({onKeyDown, onBlur, role: 'grid'})}
        {...testIdProps('table-root')}
        sx={rootStyleObject}
      >
        <Box sx={tableBodyContainerSx} data-hpc>
          <BaseStyles fontSize="14px">
            <TableBodyWithObserver
              scrollRef={scrollRef}
              containerRef={containerRef}
              table={table}
              tableGroups={tableGroups}
              isOmnibarFixed={isOmnibarFixed}
              loadingState={loadingState}
              hasWritePermissions={hasWritePermissions}
              itemData={itemData}
            />
          </BaseStyles>
        </Box>
        {(!tableGroups || tableGroups.length === 0) && hasWritePermissions && (
          <OmnibarContainer
            horizontalScrollbarSize={horizontalScrollbarSize}
            verticalScrollbarSize={verticalScrollbarSize}
            isFixed={isOmnibarFixed}
            effectiveTableHeight={effectiveTableHeight}
          >
            <TableOmnibar onAddItem={onNewItem} isFixed={isOmnibarFixed} />
          </OmnibarContainer>
        )}
      </Box>
      {sliceField && <SlicerPanel slicerItems={slicerItems} openSidePanel={openSidePanel} />}
    </>
  )
})
