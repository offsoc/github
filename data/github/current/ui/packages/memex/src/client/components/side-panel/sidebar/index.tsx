import type {ContainerBreakpointFunction} from '@github-ui/use-container-breakpoint'
import {Box} from '@primer/react'
import {useCallback, useMemo, useRef} from 'react'

import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {MemexColumnDataValue} from '../../../api/columns/contracts/storage'
import type {SidePanelItem} from '../../../api/memex-items/side-panel-item'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {useIssueContext} from '../../../state-providers/issues/use-issue-context'
import {
  getMemexItemContentForField,
  sidebarFieldsToDisplay,
} from '../../../state-providers/memex-items/memex-item-helpers'
import {SidePanelSidebarField} from './fields'
import {SidebarFields} from './fields/core'
import {SidePanelSidebarActions} from './sidebar-actions'

export const SidePanelSidebar: React.FC<{item: SidePanelItem; breakpoint: ContainerBreakpointFunction}> = ({
  item,
  breakpoint,
}) => (
  <Box
    sx={{
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: breakpoint(['0', '0', '1px', '1px']),
      borderTopWidth: breakpoint(['1px', '1px', '0', '0']),
      borderStyle: 'solid',
      borderColor: 'border.muted',
      width: breakpoint(['100%', '100%', '33%', '33%']),
      maxWidth: breakpoint(['', '', '300px', '400px']),
      minWidth: breakpoint(['', '', '280px', '400px']),
    }}
  >
    <SidePanelSidebarContent item={item} />
    <SidePanelSidebarActions item={item} />
  </Box>
)

const UNIVERSAL_FIELDS = new Set<SystemColumnId>([
  SystemColumnId.Labels,
  SystemColumnId.Assignees,
  SystemColumnId.Milestone,
])

const isUniversalField = (field: number | SystemColumnId): boolean =>
  typeof field !== 'number' && UNIVERSAL_FIELDS.has(field)

const SidePanelSidebarContent: React.FC<{item: SidePanelItem}> = ({item}) => {
  const listRef = useRef<HTMLDListElement>(null)
  const {allColumns} = useAllColumns()
  const {sidePanelMetadata} = useIssueContext()

  const allColumnData = useMemo(() => {
    const itemColumnValueMap = new Map<number | SystemColumnId, MemexColumnDataValue>()
    const allFieldsToDisplay = sidebarFieldsToDisplay(item.contentType, allColumns)
    return allFieldsToDisplay.map(field => ({
      content: getMemexItemContentForField(field, itemColumnValueMap, item),
      field,
    }))
  }, [allColumns, item])

  const fields = useMemo(() => {
    const fieldsToDisplay = allColumnData.reduce<[typeof allColumnData, typeof allColumnData]>(
      (acc, field) => {
        if (isUniversalField(field.field.id)) {
          acc[0].push(field)
        } else if (sidePanelMetadata.projectItemId) {
          acc[1].push(field)
        }
        return acc
      },
      [[], []],
    )

    return fieldsToDisplay.flat()
  }, [allColumnData, sidePanelMetadata.projectItemId])

  // move focus to the next field when submitted, replicating the behavior of the table view
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key === 'Enter') {
      event.stopPropagation()

      const nodes = listRef.current?.querySelectorAll('button, input')
      if (!nodes?.length) {
        return
      }
      const index = Array.from(nodes).indexOf(event.target as HTMLElement)
      const next = nodes[index + 1] as HTMLElement | undefined
      next?.focus()
    }
  }, [])

  return (
    <section>
      <h3 className="sr-only">Properties</h3>
      <SidebarFields listRef={listRef} onKeyDown={handleKeyDown}>
        {fields.map(e => (
          <SidePanelSidebarField
            metadata={sidePanelMetadata}
            item={item}
            content={e.content}
            field={e.field}
            key={e.field.id}
          />
        ))}
      </SidebarFields>
    </section>
  )
}
