import {Fragment, memo} from 'react'
import type {Row} from 'react-table'

import type {TableDataType} from '../../../components/react_table/table-data-type'
import type {ItemDataType} from '../../../components/react_table/use-item-data'
import type {GroupingMetadataWithSource} from '../../../features/grouping/types'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {pageTypeForUngroupedItems} from '../../../state-providers/memex-items/queries/query-keys'
import {RoadmapItem} from './roadmap-item'
import {RoadmapOmnibarItem} from './roadmap-omnibar-item'
import {RoadmapPagination} from './roadmap-pagination'

/**
 * Renders the collection of Roadmap items as rows
 */
export const RoadmapItems = memo(function RoadmapItems({
  groupMetadata,
  groupId,
  rows,
  isOmnibarFixed,
  itemData,
}: {
  groupMetadata?: GroupingMetadataWithSource
  groupId?: string
  rows: Array<Row<TableDataType>>
  isOmnibarFixed: boolean
  itemData: ItemDataType
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {memex_table_without_limits} = useEnabledFeatures()

  return (
    <Fragment>
      {rows.map(row => {
        return <RoadmapItem key={row.original.id} row={row} itemData={itemData} />
      })}
      {memex_table_without_limits && (
        <RoadmapPagination pageType={groupMetadata ? {groupId: groupMetadata.value} : pageTypeForUngroupedItems} />
      )}
      {hasWritePermissions && !isOmnibarFixed && (
        <RoadmapOmnibarItem groupMetadata={groupMetadata} groupRows={rows} groupId={groupId} />
      )}
    </Fragment>
  )
})
