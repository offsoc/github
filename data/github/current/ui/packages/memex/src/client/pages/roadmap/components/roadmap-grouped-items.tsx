import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {Fragment, memo, useMemo} from 'react'
import type {Row} from 'react-table'

import {GroupHeader} from '../../../components/common/group/group-header'
import {GroupHeaderLabel} from '../../../components/common/group/label/group-header-label'
import {GROUP_HEADER_HEIGHT} from '../../../components/common/group/styled-group-header'
import {ReorderableRowsContext} from '../../../components/react_table/row-reordering/reorderable-rows'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import {TableGroupSeparator} from '../../../components/react_table/table-group-separator'
import type {ItemDataType} from '../../../components/react_table/use-item-data'
import type {GroupingMetadataWithSource} from '../../../features/grouping/types'
import {resolveRawTitleForGroupingContext} from '../../../helpers/table-group-utilities'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useAggregationSettings} from '../../../hooks/use-aggregation-settings'
import {useDroppableGroup} from '../../../hooks/use-droppable-group'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {pageTypeForGroups} from '../../../state-providers/memex-items/queries/query-keys'
import {ROADMAP_CELL_Z_INDEX} from '../roadmap-z-index'
import {RoadmapGroupPillArea} from './roadmap-group-pill-area'
import {RoadmapItems} from './roadmap-items'
import {RoadmapPagination} from './roadmap-pagination'
import {RoadmapTableColumnResizeProvider} from './roadmap-table-column-resize-provider'
import {RoadmapTableDragSash} from './roadmap-table-drag-sash'
import {rowGroupSx} from './roadmap-table-layout'

/**
 * Renders Roadmap item rows grouped by a specific column.
 */
export function GroupedRoadmapItems({
  collapsedGroupIds,
  tableGroups,
  itemData,
}: {
  collapsedGroupIds: Array<string>
  tableGroups: Array<Row<TableDataType>>
  itemData: ItemDataType
}) {
  const {memex_table_without_limits} = useEnabledFeatures()
  return (
    <Fragment>
      {tableGroups.map((group, index) => {
        const collapsed = collapsedGroupIds.includes(group.groupedValue)
        return (
          <Fragment key={group.id}>
            <RoadmapGroup
              metadata={{
                value: group.groupedValue,
                sourceObject: group.groupedSourceObject,
              }}
              totalCount={memex_table_without_limits ? group.totalCount : group.subRows.length}
              index={index}
              collapsed={collapsed}
              rows={group.subRows}
              itemData={itemData}
              groupId={group.id}
            />
            <TableGroupSeparator />
          </Fragment>
        )
      })}
      {memex_table_without_limits && <RoadmapPagination pageType={pageTypeForGroups} />}
    </Fragment>
  )
}

const groupHeaderSx = {
  position: 'sticky',
  left: 0,
  overflow: 'hidden',
  zIndex: ROADMAP_CELL_Z_INDEX,
  pl: 2,
  gap: 2,
}
/**
 * Renders a group of Roadmap items.
 */
const RoadmapGroup = memo(function RoadmapGroup({
  collapsed,
  metadata,
  rows,
  itemData,
  groupId,
  totalCount,
}: {
  collapsed: boolean
  metadata: GroupingMetadataWithSource
  index: number
  rows: Array<Row<TableDataType>>
  itemData: ItemDataType
  groupId: string
  totalCount: number
}) {
  const {hideItemsCount, getAggregatesForItems} = useAggregationSettings()
  const items = useMemo(() => rows.map(row => row.original), [rows])
  const aggregates = useMemo(() => getAggregatesForItems(items), [getAggregatesForItems, items])
  const title = resolveRawTitleForGroupingContext(metadata.sourceObject)

  const {hasWritePermissions} = ViewerPrivileges()

  const {setNodeRef, isOver} = useDroppableGroup({
    groupId,
    groupedValue: metadata.value,
    isCollapsed: collapsed,
    isEmpty: rows.length === 0,
  })
  const tableWidth = useRoadmapTableWidth()

  return (
    <Box
      {...testIdProps(`roadmap-group-${title}`)}
      role="rowgroup"
      sx={{
        ...(collapsed ? roadmapGroupCollapsedStyles : roadmapGroupStyles),
        borderColor: isOver ? 'accent.fg' : 'border.muted',
      }}
      ref={setNodeRef}
    >
      <RoadmapGroupHeaderRow>
        <GroupHeader
          isCollapsed={collapsed}
          metadata={metadata}
          itemsInGroup={rows.map(row => row.original)}
          sx={groupHeaderSx}
          style={{
            minWidth: tableWidth,
            width: tableWidth,
          }}
        >
          <GroupHeaderLabel
            sourceObject={metadata.sourceObject}
            aggregates={aggregates}
            hideItemsCount={hideItemsCount}
            rowCount={totalCount}
            titleSx={{
              flexShrink: 1,
            }}
            showTrackedByOwnerOnFocus
          />
          {hasWritePermissions && (
            <RoadmapTableColumnResizeProvider>
              <RoadmapTableDragSash id={`RoadmapTableDragSash-${metadata.value}`} />
            </RoadmapTableColumnResizeProvider>
          )}
        </GroupHeader>
        <RoadmapGroupPillArea rows={rows} />
      </RoadmapGroupHeaderRow>
      {!collapsed && (
        <ReorderableRowsContext rows={rows} groupedValue={metadata.value}>
          <RoadmapItems
            groupMetadata={metadata}
            rows={rows}
            isOmnibarFixed={false}
            itemData={itemData}
            groupId={groupId}
          />
        </ReorderableRowsContext>
      )}
    </Box>
  )
})

const roadmapGroupStyles = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  borderTop: '1px solid',
  borderTopColor: 'border.default',
  '&:first-child': {
    borderTop: 'none',
  },
  ...rowGroupSx,
}

const roadmapGroupCollapsedStyles = {
  ...roadmapGroupStyles,
  borderBottom: '1px solid',
  borderBottomColor: 'border.default',

  '&::after': {
    borderBottom: 'none',
  },
}

/**
 * Renders the group header row comprised of the table cell and summary pill area.
 */
const RoadmapGroupHeaderRow = ({children}: {children: React.ReactNode}) => {
  return (
    <Box sx={groupHeaderRowStyles} role="row" {...testIdProps('roadmap-group-header-row')}>
      {children}
    </Box>
  )
}

const groupHeaderRowStyles = {
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  height: `${GROUP_HEADER_HEIGHT}px`,
}
