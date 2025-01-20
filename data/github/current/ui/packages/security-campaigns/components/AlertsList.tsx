import type React from 'react'
import {useCallback} from 'react'
import pluralize from 'pluralize'
import {Box} from '@primer/react'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ListViewSectionFilterLink} from '@github-ui/list-view/ListViewSectionFilterLink'
import type {ActionBarProps} from '@github-ui/action-bar'

import type {GetAlertsCursor} from '../types/get-alerts-request'
import {PrevNextPagination} from './PrevNextPagination'

const openAlertsQuery = 'is:open'
const closedAlertsQuery = 'is:closed'
export const defaultQuery = openAlertsQuery

export type AlertsListProps = {
  onToggleSelectAll?: (isSelectAllChecked: boolean) => void
  openCount: number | undefined
  closedCount: number | undefined
  prevCursor: string | undefined
  nextCursor: string | undefined
  isLoading: boolean
  isError: boolean

  query: string
  onStateFilterChange: (state: 'open' | 'closed') => void

  onCursorChange: (newCursor: GetAlertsCursor | null) => void

  setSelectedItems?: React.Dispatch<React.SetStateAction<Set<number>>>

  actions?: ActionBarProps['actions']
  isSelectable?: boolean

  children: React.ReactNode
}

export function AlertsList({
  onToggleSelectAll,
  actions,
  children,
  closedCount,
  isLoading,
  isSelectable,
  nextCursor,
  onCursorChange,
  onStateFilterChange,
  openCount,
  prevCursor,
  query,
  setSelectedItems,
}: AlertsListProps) {
  const onSectionFilterClicked = useCallback(
    (event: React.MouseEvent, state: 'open' | 'closed') => {
      event.preventDefault()

      onStateFilterChange(state)
      onCursorChange(null)
      setSelectedItems?.(new Set())
    },
    [onCursorChange, setSelectedItems, onStateFilterChange],
  )

  const totalCount = (openCount ?? 0) + (closedCount ?? 0)
  const title = `${totalCount.toLocaleString()} ${pluralize('alert', totalCount)}`

  return (
    <div>
      <Box sx={{borderWidth: 1, borderStyle: 'solid', borderRadius: 2, borderColor: 'border.default', mb: 3}}>
        <ListView
          metadata={
            <ListViewMetadata
              onToggleSelectAll={onToggleSelectAll}
              actionsLabel="Actions"
              sectionFilters={[
                <ListViewSectionFilterLink
                  key="open"
                  title="Open"
                  href="#"
                  count={openCount ?? 0}
                  onClick={e => onSectionFilterClicked(e, 'open')}
                  isSelected={query.includes(openAlertsQuery)}
                  isLoading={isLoading}
                />,
                <ListViewSectionFilterLink
                  key="closed"
                  title="Closed"
                  href="#"
                  count={closedCount ?? 0}
                  onClick={e => onSectionFilterClicked(e, 'closed')}
                  isSelected={query.includes(closedAlertsQuery)}
                  isLoading={isLoading}
                />,
              ]}
              actions={actions}
            />
          }
          title={title}
          titleHeaderTag="h3"
          isSelectable={isSelectable}
          totalCount={totalCount}
        >
          {children}
        </ListView>
      </Box>

      <PrevNextPagination onCursorChange={onCursorChange} prevCursor={prevCursor} nextCursor={nextCursor} />
    </div>
  )
}
