import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {XIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {memo, type PropsWithChildren, useMemo} from 'react'
import {flushSync} from 'react-dom'

import {GroupByStatKey} from '../api/stats/contracts'
import {canServerGroupByColumnType} from '../features/server-capabilities'
import {onSubMenuMultiSelection, sortColumnsDeterministically} from '../helpers/util'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../hooks/use-enabled-features'
import {useMemexProjectViewRootHeight} from '../hooks/use-memex-app-root-height'
import {useViewOptionsStatsUiKey} from '../hooks/use-view-options-stats-ui-key'
import {useViewType} from '../hooks/use-view-type'
import {useViews} from '../hooks/use-views'
import type {ColumnModel} from '../models/column-model'
import {useAllColumns} from '../state-providers/columns/use-all-columns'
import {getColumnIcon} from './column-detail-helpers'

export type GroupByMenuProps = {
  id?: string
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
}

/**
 * The control used in the view options menu to specify the column
 * that is used for grouping.
 */
export const GroupByMenu = memo<PropsWithChildren<Omit<GroupByMenuProps, 'id'>>>(function GroupByMenu({
  open,
  setOpen,
  anchorRef,
  children,
}) {
  const {clientHeight} = useMemexProjectViewRootHeight({
    onResize: () => {
      if (open) {
        flushSync(() => {
          setOpen(false)
        })
        setOpen(true)
      }
    },
  })
  return (
    <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{maxHeight: clientHeight, overflow: 'auto'}}
        {...testIdProps('group-by-menu')}
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
      >
        {children}
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

type GroupByMenuOptionsProps = {
  id?: string
  groupedByColumn: ColumnModel | undefined
  setGroupedBy: (viewNumber: number, column: ColumnModel) => void
  isValidGroupByColumn: (column: ColumnModel) => boolean
  setOpen: (open: boolean) => void
  handleClearGroupBy?: () => void
  title: 'Group by' | 'Column by'
}

export const GroupByMenuOptions = memo<GroupByMenuOptionsProps>(function GroupByMenuOptions({
  id,
  groupedByColumn,
  setGroupedBy,
  isValidGroupByColumn,
  handleClearGroupBy,
  title,
  setOpen,
}) {
  const {currentView} = useViews()
  const {viewType} = useViewType()
  const {allColumns} = useAllColumns()
  const {postStats} = usePostStats()
  const statsUiKey = useViewOptionsStatsUiKey()
  const {memex_table_without_limits} = useEnabledFeatures()

  const columns = useMemo(() => {
    return allColumns
      .filter(isValidGroupByColumn)
      .sort(sortColumnsDeterministically)
      .map(column => {
        const onSelection = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
          // the column is currently visible, so the stat is that we are hiding it.
          if (!currentView) return

          const isGrouped = groupedByColumn === column

          if (isGrouped) {
            if (handleClearGroupBy) {
              handleClearGroupBy()
            } else {
              return
            }
          } else {
            setGroupedBy(currentView.number, column)
          }

          postStats({
            groupByEnabled: !isGrouped,
            memexProjectColumnId: column.id,
            key: GroupByStatKey,
            ui: statsUiKey,
            context: viewType,
          })

          setOpen(false)
          e.stopPropagation()
        }

        const Icon = getColumnIcon(column.dataType)
        return (
          <ActionList.Item
            key={column.id}
            selected={groupedByColumn === column}
            onSelect={onSelection}
            disabled={memex_table_without_limits && !canServerGroupByColumnType(column.dataType)}
            {...testIdProps(`group-by-${column.name}`)}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {column.name}
          </ActionList.Item>
        )
      })
  }, [
    allColumns,
    isValidGroupByColumn,
    groupedByColumn,
    memex_table_without_limits,
    currentView,
    postStats,
    statsUiKey,
    viewType,
    setOpen,
    handleClearGroupBy,
    setGroupedBy,
  ])

  return (
    <ActionList id={id} selectionVariant="single">
      <ActionList.Group>
        <ActionList.GroupHeading>{title}</ActionList.GroupHeading>
        {columns}
        {handleClearGroupBy && (
          <ActionList.Item
            selected={!groupedByColumn}
            key={'group-by-none'}
            onSelect={e => {
              onSubMenuMultiSelection(e)
              handleClearGroupBy()
            }}
            {...testIdProps('group-by-none')}
          >
            <ActionList.LeadingVisual>
              <XIcon />
            </ActionList.LeadingVisual>
            No grouping
          </ActionList.Item>
        )}
      </ActionList.Group>
    </ActionList>
  )
})
