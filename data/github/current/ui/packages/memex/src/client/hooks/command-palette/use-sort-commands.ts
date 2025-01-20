import {useCallback, useMemo} from 'react'

import {CommandPaletteUI, FieldSortAsc, FieldSortDesc} from '../../api/stats/contracts'
import type {SortDirection} from '../../api/view/contracts'
import type {CommandSpec, CommandTreeSpec} from '../../commands/command-tree'
import {useCommands} from '../../commands/hook'
import {sortColumnsVisisbleInOrderHiddenAlpha} from '../../helpers/util'
import type {ColumnModel} from '../../models/column-model'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {Resources} from '../../strings'
import {usePostStats} from '../common/use-post-stats'
import {useProjectViewRouteMatch} from '../use-project-view-route-match'
import {useSortedBy} from '../use-sorted-by'
import {useViews} from '../use-views'
import {useVisibleFields} from '../use-visible-fields'

export const useSortCommands = () => {
  const {currentView} = useViews()
  const {allColumns} = useAllColumns()
  const {visibleFields} = useVisibleFields()
  const {getColumnSort, isSorted, clearSortedBy, setPrimarySortPreservingSecondary} = useSortedBy()
  const {isProjectViewRoute} = useProjectViewRouteMatch()
  const {postStats} = usePostStats()

  const columnItems = useMemo(() => {
    return allColumns.slice().sort((a, b) => sortColumnsVisisbleInOrderHiddenAlpha(a, b, visibleFields))
  }, [allColumns, visibleFields])

  const commandSetSortedBy = useCallback(
    (column: ColumnModel, direction: SortDirection) => {
      if (!currentView) return

      setPrimarySortPreservingSecondary(column, direction)

      postStats({
        name: direction === 'desc' ? FieldSortDesc : FieldSortAsc,
        ui: CommandPaletteUI,
        context: column.id,
        index: 0,
      })
    },
    [currentView, postStats, setPrimarySortPreservingSecondary],
  )

  useCommands(() => {
    if (!isProjectViewRoute || !currentView) return null

    const commands: Array<CommandSpec> = []
    const tree: CommandTreeSpec = ['s', 'Sort by...', commands]

    if (isSorted) {
      commands.push(['s', 'Remove sort by', 'sorting.clear', () => clearSortedBy()])
    }

    for (const [sortableIndex, col] of Object.entries(columnItems)) {
      const thisColumnSort = getColumnSort(col)
      const sortAscending = () => commandSetSortedBy(col, 'asc')
      const sortDescending = () => commandSetSortedBy(col, 'desc')

      if (!thisColumnSort) {
        commands.push([sortableIndex, `${Resources.sortBy}: ${col.name}, asc`, 'column.sort', sortAscending])
      } else if (thisColumnSort.direction === 'asc') {
        commands.push([sortableIndex, `${Resources.sortBy}: ${col.name}, desc`, 'column.sort', sortDescending])
      } else {
        commands.push([sortableIndex, `${Resources.unsortBy}: ${col.name}`, 'column.unsort', () => clearSortedBy()])
      }
    }

    return tree
  }, [isProjectViewRoute, currentView, isSorted, clearSortedBy, columnItems, getColumnSort, commandSetSortedBy])
}
