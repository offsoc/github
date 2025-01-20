import {useCallback} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {intervalDatesDescription, isCurrentIteration} from '../../helpers/iterations'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useDeleteGroup} from '../../hooks/use-delete-group'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {ColumnModel} from '../../models/column-model'
import type {HorizontalGroup, ItemsGroupedByVerticalColumn} from '../../models/horizontal-group'
import type {MemexItemModel} from '../../models/memex-item-model'
import {isIteration, MissingVerticalGroupId, type VerticalGroup} from '../../models/vertical-group'
import {ColumnsPagination} from './board-pagination'
import {Column, type ColumnHeaderType} from './column/column'
import {useUpdateBoardColumnDetails} from './hooks/use-update-board-column-details'

const defaultItemsGroupedByFieldPerOption: ReadonlyArray<MemexItemModel> = []
export function Columns({
  groupByFieldOptions,
  itemsGroupedByField,
  groupByField,
  scrollToItemId,
  lastNewColumnNameRef,
  horizontalGroup,
  horizontalGroupIndex,
  headerType = 'visible',
  hideColumn,
  isLastGroup,
}: {
  groupByFieldOptions: ReadonlyArray<VerticalGroup>
  itemsGroupedByField: ItemsGroupedByVerticalColumn
  groupByField?: ColumnModel
  scrollToItemId?: number
  lastNewColumnNameRef: React.RefObject<string>
  horizontalGroup?: HorizontalGroup
  headerType?: ColumnHeaderType
  hideColumn: (option: VerticalGroup) => boolean
  isLastGroup?: boolean
  horizontalGroupIndex: number
}) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {deleteGroup} = useDeleteGroup(groupByField)
  const {updateColumnDetails} = useUpdateBoardColumnDetails(groupByField)
  const {memex_table_without_limits} = useEnabledFeatures()

  /**
   * Returns whether the current `verticalGroup` corresponds to
   * an `Iteration` data type whose value is equal to the "current"
   * iteration - i.e. an iteration that is in progress date-wise
   */
  const isVerticalGroupCurrentIteration = useCallback(
    (verticalGroup: VerticalGroup): boolean => {
      if (!groupByField) return false

      if (groupByField.dataType !== MemexColumnDataType.Iteration) return false
      if (!isIteration(verticalGroup.groupMetadata)) return false
      return isCurrentIteration(new Date(), verticalGroup.groupMetadata)
    },
    [groupByField],
  )

  return (
    <>
      {groupByFieldOptions.map((verticalGroup, index) => {
        const group = itemsGroupedByField[verticalGroup.id]
        const filteredItemsFromField = group?.items ?? defaultItemsGroupedByFieldPerOption
        const isEditable = hasWritePermissions && verticalGroup.id !== MissingVerticalGroupId
        const isDraggable = groupByField?.dataType !== MemexColumnDataType.Iteration

        return (
          <Column
            key={verticalGroup.id}
            hidden={hideColumn(verticalGroup)}
            verticalGroup={verticalGroup}
            groupId={group?.groupId}
            totalCount={group?.totalCount}
            items={filteredItemsFromField}
            index={index}
            onDelete={deleteGroup}
            onUpdateDetails={updateColumnDetails}
            scrollToItemId={scrollToItemId}
            initialNameFocus={lastNewColumnNameRef.current === verticalGroup.name}
            // TODO: Change this to something that ensures it's an editable column
            // instead of hard-coded MissingStatusColumn.Id.
            isUserEditable={isEditable}
            isDraggable={isDraggable}
            isCurrentIteration={isVerticalGroupCurrentIteration(verticalGroup)}
            iterationDateRange={
              isIteration(verticalGroup.groupMetadata)
                ? intervalDatesDescription(verticalGroup.groupMetadata) ?? ''
                : ''
            }
            horizontalGroup={horizontalGroup}
            headerType={headerType}
            isLastGroup={isLastGroup}
            horizontalGroupIndex={horizontalGroupIndex}
          />
        )
      })}
      {memex_table_without_limits && groupByFieldOptions.length > 0 && <ColumnsPagination headerType={headerType} />}
    </>
  )
}
