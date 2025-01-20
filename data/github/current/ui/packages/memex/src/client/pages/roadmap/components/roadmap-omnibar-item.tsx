import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {memo, useCallback, useMemo, useRef} from 'react'
import type {Row} from 'react-table'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import useIsVisible from '../../../components/board/hooks/use-is-visible'
import {Omnibar} from '../../../components/omnibar/omnibar'
import type {OmnibarItemAttrs} from '../../../components/omnibar/types'
import {useTableOmnibarFocus} from '../../../components/react_table/hooks/use-table-omnibar-focus'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import {getDraftItemUpdateColumnAction} from '../../../features/grouping/helpers'
import type {GroupingMetadataWithSource} from '../../../features/grouping/types'
import {shouldDisableGroupFooter} from '../../../helpers/table-group-utilities'
import {useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {Resources} from '../../../strings'
import {RoadmapTableColumnResizeProvider} from './roadmap-table-column-resize-provider'
import {RoadmapTableDragSash} from './roadmap-table-drag-sash'
import {RoadmapCell, RoadmapCellContent, RoadmapRow, type TestIdentifiersProps} from './roadmap-table-layout'

type RoadmapOmnibarItemProps = {
  groupId?: string
  groupMetadata?: GroupingMetadataWithSource
  groupRows?: Array<Row<TableDataType>>
}

const getOmnibarPlaceholder = (groupMetadata?: GroupingMetadataWithSource): string => {
  if (!groupMetadata || !shouldDisableGroupFooter(groupMetadata.sourceObject)) {
    return Resources.addItem
  }

  switch (groupMetadata.sourceObject.dataType) {
    case MemexColumnDataType.Milestone:
      return Resources.cannotAddItemsWhenGroupByMilestone
    default:
      return Resources.addItem
  }
}

const roadmapCellStyles = {
  position: 'sticky',
  left: 0,
}

export const RoadmapOmnibarItem = memo<RoadmapOmnibarItemProps & TestIdentifiersProps>(function RoadmapOmnibarItem({
  groupId,
  groupRows,
  groupMetadata,
  ...props
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const {omnibarRef, onFocus, onKeyDown} = useTableOmnibarFocus(groupId)
  const {isVisible} = useIsVisible({ref})
  const shouldScroll = useRef(false)
  const disabled = groupMetadata ? shouldDisableGroupFooter(groupMetadata.sourceObject) : false
  const defaultPlaceholder = getOmnibarPlaceholder(groupMetadata)
  const tableWidth = useRoadmapTableWidth()

  const omnibarItemAttrs: OmnibarItemAttrs | null = useMemo(() => {
    if (!groupMetadata || !groupRows) {
      return null
    }

    const updateAction = getDraftItemUpdateColumnAction(groupMetadata.sourceObject)
    const previousItemId = groupRows[groupRows.length - 1]?.original?.id
    return {
      updateColumnActions: updateAction ? [updateAction] : undefined,
      previousItemId,
    }
  }, [groupMetadata, groupRows])

  useLayoutEffect(() => {
    if (shouldScroll.current) {
      shouldScroll.current = false
      if (!ref?.current) {
        return
      }

      if ('scrollIntoViewIfNeeded' in ref.current && typeof ref.current.scrollIntoViewIfNeeded === 'function') {
        // This is part of webkit only, but not part of the official standard.
        ref.current.scrollIntoViewIfNeeded(false)
      } else {
        ref.current.scrollIntoView({block: 'nearest'})
      }
    }
  })

  const onAddItem = useCallback(() => {
    shouldScroll.current = isVisible
  }, [isVisible])

  return (
    <RoadmapRow ref={ref} {...testIdProps(`roadmap-omnibar-item`)}>
      <RoadmapCell
        sx={roadmapCellStyles}
        // Separate from sx to avoid recomputing the `sx` CSS class when the table width changes
        style={{width: tableWidth}}
        {...props}
      >
        <RoadmapCellContent
          sx={{
            padding: '0 0 0 12px',
            bg: disabled ? 'canvas.subtle' : 'canvas.default',
            color: disabled ? 'fg.muted' : 'inherit',
          }}
        >
          <Omnibar
            ref={omnibarRef}
            newItemAttributes={omnibarItemAttrs ?? undefined}
            defaultPlaceholder={defaultPlaceholder}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onAddItem={onAddItem}
            groupingMetadata={groupMetadata}
            disabled={disabled}
          />
          <RoadmapTableColumnResizeProvider>
            <RoadmapTableDragSash id="RoadmapTableDragSash-omnibar" />
          </RoadmapTableColumnResizeProvider>
        </RoadmapCellContent>
      </RoadmapCell>
    </RoadmapRow>
  )
})
