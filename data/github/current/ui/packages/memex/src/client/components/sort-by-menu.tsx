import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {XIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box} from '@primer/react'
import {memo, useCallback, useId, useMemo} from 'react'
import {flushSync} from 'react-dom'

import {FieldSortAsc, FieldSortDesc} from '../api/stats/contracts'
import {canServerSortByColumnType} from '../features/server-capabilities'
import {onSubMenuMultiSelection, sortColumnsDeterministically} from '../helpers/util'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../hooks/use-enabled-features'
import {useMemexProjectViewRootHeight} from '../hooks/use-memex-app-root-height'
import {useSortedBy} from '../hooks/use-sorted-by'
import {useViewOptionsStatsUiKey} from '../hooks/use-view-options-stats-ui-key'
import {useAllColumns} from '../state-providers/columns/use-all-columns'
import {getColumnIcon} from './column-detail-helpers'
import {ColumnSortIcon} from './common/column-sort-icon'
import {describeSortRanking, nextSortDirection} from './sorted-by'

type MenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
  id?: string
}

export const SortByMenu = memo<MenuProps>(function SortByMenu({id: externalId, open, setOpen, anchorRef}) {
  const fallbackId = useId()
  const id = externalId ?? fallbackId

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

  const labelId = `${id}_label`
  const descriptionId = `${id}_description`

  return (
    <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{maxHeight: clientHeight, overflow: 'auto'}}
        {...testIdProps('sort-by-menu')}
        role="dialog"
        aria-label="Select a field to sort by"
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
      >
        <Box id={labelId} sx={{fontWeight: 'bold', m: 3, mb: 2, fontSize: 0, color: 'fg.muted'}}>
          Sort by
        </Box>
        <Box id={descriptionId} sx={{mx: 3, my: 1, fontSize: 0, color: 'fg.muted'}}>
          Select up to 2 fields
        </Box>
        <Options id={id} key={String(open)} setOpen={setOpen} labelledBy={labelId} describedBy={descriptionId} />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

const Options = memo(function Options({
  setOpen,
  id,
  labelledBy,
  describedBy,
}: Pick<MenuProps, 'setOpen' | 'id'> & {
  labelledBy: string
  describedBy?: string
}) {
  const {allColumns} = useAllColumns()
  const {sorts, isSorted, clearSortedBy, setColumnSort} = useSortedBy()
  const {postStats} = usePostStats()
  const statsUiKey = useViewOptionsStatsUiKey()
  const {memex_table_without_limits} = useEnabledFeatures()

  const columnItems = useMemo(() => {
    const baseColumnItems = allColumns
      .slice()
      .sort(sortColumnsDeterministically)
      .map(column => {
        const sortIndex = sorts.findIndex(sort => sort.column.id === column.id)
        const columnSort = sorts[sortIndex]

        const onSelection = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
          const direction = nextSortDirection(columnSort?.direction ?? null)
          const expectedIndex = columnSort ? sortIndex : 0
          setColumnSort(column, direction)

          postStats({
            name: direction === 'desc' ? FieldSortDesc : FieldSortAsc,
            ui: statsUiKey,
            context: column.id,
            index: expectedIndex,
          })

          e.stopPropagation()
        }

        const Icon = getColumnIcon(column.dataType)

        const showRanking = sorts.length > 1

        return (
          <ActionList.Item
            key={column.id}
            onSelect={e => {
              onSubMenuMultiSelection(e)
              onSelection(e)
            }}
            selected={columnSort !== undefined}
            {...testIdProps(`sort-by-${column.name}`)}
            disabled={memex_table_without_limits && !canServerSortByColumnType(column.dataType)}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {column.name}

            {/* The conditional has to be duplicated because if we combine it, we'd have to render the items in a
            fragment (<></>) which would break slots (ActionList.TrailingVisual must be a direct child of
            ActionList.Item) And we can't just put the hidden text inside the trailing visual either because it would
            be hidden from screen readers. */}
            {columnSort !== undefined && (
              <span className="sr-only">
                ({showRanking ? `${describeSortRanking(sortIndex)} ` : ''}sort:{' '}
                {columnSort.direction === 'asc' ? 'ascending' : 'descending'})
              </span>
            )}
            {columnSort !== undefined && (
              <ActionList.TrailingVisual>
                <ColumnSortIcon direction={columnSort.direction} index={showRanking ? sortIndex : undefined} />
              </ActionList.TrailingVisual>
            )}
          </ActionList.Item>
        )
      })

    return baseColumnItems
  }, [allColumns, sorts, memex_table_without_limits, setColumnSort, postStats, statsUiKey])

  const handleClearSort = useCallback(() => {
    clearSortedBy()
    setOpen(false)
  }, [clearSortedBy, setOpen])

  return (
    <ActionList id={id} selectionVariant="single" aria-labelledby={labelledBy} aria-describedby={describedBy}>
      {columnItems}
      <ActionList.Item
        selected={!isSorted}
        key={'sort-by-none'}
        onSelect={handleClearSort}
        {...testIdProps('sort-by-none')}
      >
        <ActionList.LeadingVisual>
          <XIcon />
        </ActionList.LeadingVisual>
        No sorting
      </ActionList.Item>
    </ActionList>
  )
})
