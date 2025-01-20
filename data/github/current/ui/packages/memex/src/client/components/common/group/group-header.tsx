import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {forwardRef, useCallback, useMemo, useState} from 'react'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {PersistedOption} from '../../../api/columns/contracts/single-select'
import {GroupByCollapseToggleStatKey, GroupHide} from '../../../api/stats/contracts'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import type {GroupingMetadataWithSource} from '../../../features/grouping/types'
import {getGroupTestId, resolveRawTitleForGroupingContext} from '../../../helpers/table-group-utilities'
import {emojiImgToText} from '../../../helpers/util'
import {ViewType} from '../../../helpers/view-type'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useDeleteGroup} from '../../../hooks/use-delete-group'
import {useViewType} from '../../../hooks/use-view-type'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useUpdateOptions} from '../../../state-providers/columns/use-update-options'
import {SingleSelectOptionModal} from '../../fields/single-select/single-select-option-modal'
import {normalizeToFilterName} from '../../filter-bar/helpers/search-filter'
import {useSearch} from '../../filter-bar/search-context'
import {GroupMenu} from '../group-menu'
import {GroupHeaderExpansionButton} from './group-header-expansion-button'
import {GROUP_HEADER_HEIGHT, StyledGroupHeader} from './styled-group-header'

type Props = {
  /**
   * Indicate whether the group is marked as "expanded" (showing items) or
   * "collapsed" (items hidden).
   *
   * See `TableGroupContents` for rendering the rest of a group.
   */
  isCollapsed: boolean
  /**
   * Indicate whether the group should be highlighted or not.
   */
  isHighlighted?: boolean
  /**
   * Metadata related to the provided group.
   */
  metadata: GroupingMetadataWithSource
  /**
   * The items in this group.
   */
  itemsInGroup: ReadonlyArray<MemexItemModel>
  /**
   * Whether the group header should be sticky.
   */
  sticky?: boolean
  /**
   * Ref to the swimlanes header element.
   */
  swimlanesHeaderRef?: React.RefObject<HTMLDivElement> | null

  sx?: BetterSystemStyleObject
} & React.HTMLAttributes<HTMLDivElement>

/**
 * Header component for a group when viewing the project in table mode
 */
export const GroupHeader = forwardRef<HTMLDivElement, Props & {children?: React.ReactNode}>(
  ({isCollapsed, isHighlighted, metadata, itemsInGroup, children, sticky, swimlanesHeaderRef, ...props}, ref) => {
    const {sourceObject} = metadata

    const {groupedByColumnId, groupedByColumn, toggleGroupCollapsed} = useHorizontalGroupedBy()
    const {postStats} = usePostStats()
    const {viewType} = useViewType()
    const title = resolveRawTitleForGroupingContext(sourceObject)
    const testId = getGroupTestId(sourceObject)

    const [isEditingDetails, setIsEditingDetails] = useState(false)
    const isSingleSelectGroup =
      groupedByColumn?.dataType === MemexColumnDataType.SingleSelect &&
      sourceObject.dataType === MemexColumnDataType.SingleSelect &&
      sourceObject.kind !== 'empty'
    const singleSelectOption = isSingleSelectGroup ? sourceObject.value.option : null

    const isIterationGroup =
      groupedByColumn?.dataType === MemexColumnDataType.Iteration &&
      sourceObject.dataType === MemexColumnDataType.Iteration &&
      sourceObject.kind !== 'empty'
    const isEmptyGroup = sourceObject.kind === 'empty'

    const onCollapseToggle = useCallback(() => {
      const newState = !isCollapsed

      if (groupedByColumnId) {
        postStats({
          key: GroupByCollapseToggleStatKey,
          groupTitle: emojiImgToText(title),
          memexProjectColumnId: groupedByColumnId,
          collapsed: newState,
          numberOfRows: itemsInGroup.length,
        })
      }
      toggleGroupCollapsed(metadata.value)
    }, [isCollapsed, groupedByColumnId, toggleGroupCollapsed, metadata, postStats, title, itemsInGroup])

    const {updateColumnOption} = useUpdateOptions()
    const submitEditColumnDetails = (updated: PersistedOption) => {
      if (!isSingleSelectGroup) return
      updateColumnOption(groupedByColumn, updated)
      setIsEditingDetails(false)
    }

    const isHideable = groupedByColumn !== undefined && metadata.sourceObject.kind !== 'empty'
    const {insertFilter} = useSearch()
    const hideGroup = useCallback(() => {
      if (!isHideable) return

      insertFilter(`-${normalizeToFilterName(groupedByColumn.name)}`, title)

      postStats({
        name: GroupHide,
        context: JSON.stringify(metadata.sourceObject),
      })
    }, [isHideable, insertFilter, groupedByColumn, title, postStats, metadata.sourceObject])

    const {deleteGroup} = useDeleteGroup(groupedByColumn)
    const onDelete = useMemo(
      () =>
        deleteGroup &&
        (() => {
          if (isSingleSelectGroup) deleteGroup(sourceObject.value.option.id)
          else if (isIterationGroup) deleteGroup(sourceObject.value.iteration.id)
        }),
      [deleteGroup, isIterationGroup, isSingleSelectGroup, sourceObject],
    )

    const expandCollapseLabel = isCollapsed ? `Expand group ${title}` : `Collapse group ${title}`

    return (
      <>
        <StyledGroupHeader
          className={clsx({
            collapsed: isCollapsed,
            board: viewType === ViewType.Board,
            sticky,
            highlighted: isHighlighted,
          })}
          topOffset={swimlanesHeaderRef?.current?.getBoundingClientRect().height ?? 0}
          {...testIdProps(`group-header-${testId}`)}
          ref={ref}
          {...props}
        >
          <Box
            className={clsx({
              board: viewType === ViewType.Board,
              roadmap: viewType === ViewType.Roadmap,
            })}
            sx={{
              position: 'sticky',
              height: `${GROUP_HEADER_HEIGHT}px`,
              left: '16px',
              gap: 3,
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              '&.board': {
                left: '-8px',
              },
              '&.roadmap': {
                position: 'relative',
                width: '100%',
                left: 'unset',
              },
            }}
          >
            <GroupHeaderExpansionButton
              onCollapseToggle={onCollapseToggle}
              isCollapsed={isCollapsed}
              expandCollapseLabel={expandCollapseLabel}
              {...testIdProps(`group-by-toggle-collapsed-${testId}`)}
            />
            <Box sx={{alignItems: 'center', display: 'flex', overflow: 'hidden', cursor: 'default', gap: 2}}>
              {children}
            </Box>
            <GroupMenu
              name={title}
              items={itemsInGroup}
              onEditDetails={isSingleSelectGroup ? () => setIsEditingDetails(true) : undefined}
              onHide={isHideable ? hideGroup : undefined}
              onDelete={!isEmptyGroup ? onDelete : undefined}
            />
          </Box>
        </StyledGroupHeader>
        {isEditingDetails && singleSelectOption && (
          <SingleSelectOptionModal
            initialOption={singleSelectOption}
            onCancel={() => setIsEditingDetails(false)}
            onSave={updatedOption => submitEditColumnDetails({...singleSelectOption, ...updatedOption})}
          />
        )}
      </>
    )
  },
)

GroupHeader.displayName = 'GroupHeader'
