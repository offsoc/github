import {testIdProps} from '@github-ui/test-id-props'
import {Box, Spinner} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import chunk from 'lodash-es/chunk'
import {useMemo} from 'react'
import type {Row, TableInstance} from 'react-table'

import {getGroupFooterPlaceholder, shouldDisableGroupFooter} from '../../helpers/table-group-utilities'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {LoadingStates} from '../../hooks/use-view-loading-state'
import {pageTypeForGroups, pageTypeForUngroupedItems} from '../../state-providers/memex-items/queries/query-keys'
import {usePaginatedMemexItemsQuery} from '../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {ObserverProvider} from '../board/hooks/use-is-visible'
import {OMNIBAR_SIBLING_PADDING_BOTTOM} from '../omnibar/omnibar'
import {BulkAddItemsProvider} from '../side-panel/bulk-add/bulk-add-items-provider'
import {ColumnDropZoneSash} from './column-drop-zone-sash'
import {CELL_HEIGHT, TABLE_HEADER_HEIGHT} from './constants'
import {ReorderableRowsContext} from './row-reordering/reorderable-rows'
import {RowReorderSash} from './row-reordering/row-reorder-sash'
import {RowReorderingProvider} from './row-reordering/row-reordering-provider'
import type {TableDataType} from './table-data-type'
import {TableGroup} from './table-group'
import {TableHeader} from './table-header'
import {TablePage} from './table-page'
import {TablePagination} from './table-pagination'
import {StyledTableRow, tableRowStyle} from './table-row'
import {TableRowChunk, VIRTUALIZATION_CHUNK_SIZE} from './table-row-chunk'
import type {ItemDataType} from './use-item-data'

type TableBodyProps = {
  scrollRef: React.MutableRefObject<HTMLDivElement | null>
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  table: TableInstance<TableDataType>
  tableGroups?: Array<Row<TableDataType>>
  isOmnibarFixed: boolean
  loadingState: LoadingStates
  hasWritePermissions: boolean
  itemData: ItemDataType
}

const innerStyleObject: BetterSystemStyleObject = {
  flexDirection: 'column',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  overflow: 'auto',
  userSelect: 'none',
  scrollBehavior: 'smooth',
  '@media (prefers-reduced-motion)': {
    scrollBehavior: 'auto',
  },
  display: 'flex',
  'body.is-dragging &': {
    scrollBehavior: 'auto',
  },
}

// when `memex_table_without_limits` is disabled, we need a constant unchanging mock of
// usePaginatedMemexItemsQuery data to prevent rerenders
const fakeData = {data: []}

export function TableBodyWithObserver({
  scrollRef,
  containerRef,
  table,
  isOmnibarFixed,
  loadingState,
  tableGroups,
  itemData,
  hasWritePermissions,
}: TableBodyProps) {
  const isGrouped = tableGroups !== undefined
  const {memex_table_without_limits} = useEnabledFeatures()
  // `memex_table_without_limits` will not change after initial render
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data} = memex_table_without_limits ? usePaginatedMemexItemsQuery() : fakeData
  const pagedRows = useMemo(() => {
    if (!memex_table_without_limits) {
      return [table.rows]
    }
    const pages = []
    let start = 0
    for (const datum of data) {
      const pageSize = datum?.nodes.length || 0
      if (pageSize === 0) {
        continue
      }
      pages.push(table.rows.slice(start, start + pageSize))
      start += pageSize
    }
    return pages
  }, [data, table.rows, memex_table_without_limits])
  return (
    <ObserverProvider rootRef={scrollRef} sizeEstimate={CELL_HEIGHT * VIRTUALIZATION_CHUNK_SIZE}>
      <Box sx={innerStyleObject} {...testIdProps('table-scroll-container')} ref={scrollRef}>
        <div
          style={{
            userSelect: 'none',
            position: 'relative',
            width: table.totalColumnsWidth,
            minWidth: '100%',
            // Leave enough space at the bottom for the omnibar not to obscure the last row.
            paddingBottom: isOmnibarFixed ? OMNIBAR_SIBLING_PADDING_BOTTOM : 'unset',
          }}
        >
          <TableHeader
            headerGroups={table.headerGroups}
            height={TABLE_HEADER_HEIGHT}
            scrollRef={scrollRef}
            tableWidth={table.totalColumnsWidth}
          />
          <ColumnDropZoneSash visibleColumns={table.visibleColumns} height={TABLE_HEADER_HEIGHT} sticky />
          <div ref={containerRef}>
            <RowReorderingProvider>
              <BulkAddItemsProvider>
                {loadingState === LoadingStates.loading ? (
                  <StyledTableRow
                    style={tableRowStyle}
                    sx={{display: 'flex', alignItems: 'center', pl: 3, gap: 1}}
                    {...testIdProps('view-loading-indicator')}
                  >
                    <Spinner size="small" />
                    Loading...
                  </StyledTableRow>
                ) : loadingState === LoadingStates.missing ? null : tableGroups ? (
                  tableGroups.map(group => {
                    return (
                      <TableGroup
                        key={group.id}
                        groupId={group.id}
                        rows={group.subRows}
                        metadata={{
                          value: group.groupedValue,
                          sourceObject: group.groupedSourceObject,
                        }}
                        totalCount={memex_table_without_limits ? group.totalCount : group.subRows.length}
                        firstRowIndex={group.subRows[0]?.index ?? 0}
                        itemData={itemData}
                        isCollapsed={group.isCollapsed}
                        scrollRef={scrollRef}
                        shouldDisableFooter={shouldDisableGroupFooter(group.groupedSourceObject)}
                        footerPlaceholder={getGroupFooterPlaceholder(group)}
                        isEditable={hasWritePermissions}
                      />
                    )
                  })
                ) : (
                  <ReorderableRowsContext rows={table.rows}>
                    {pagedRows.map((page, pageIndex) => (
                      <TablePage index={pageIndex} key={pageIndex} {...testIdProps(`table-page-${pageIndex}`)}>
                        {chunk(page, VIRTUALIZATION_CHUNK_SIZE).map((rowChunk, index) => (
                          <TableRowChunk
                            key={index}
                            rows={rowChunk}
                            rowOffset={VIRTUALIZATION_CHUNK_SIZE * index}
                            chunkIndex={index}
                            chunkSize={VIRTUALIZATION_CHUNK_SIZE}
                            itemData={itemData}
                          />
                        ))}
                      </TablePage>
                    ))}
                  </ReorderableRowsContext>
                )}
                <RowReorderSash
                  rows={isGrouped ? tableGroups : table.rows}
                  isGrouped={isGrouped}
                  scrollRef={scrollRef}
                />
              </BulkAddItemsProvider>
            </RowReorderingProvider>
            {memex_table_without_limits && (
              <TablePagination pageType={isGrouped ? pageTypeForGroups : pageTypeForUngroupedItems} />
            )}
          </div>
          <ColumnDropZoneSash visibleColumns={table.visibleColumns} />
        </div>
      </Box>
    </ObserverProvider>
  )
}
