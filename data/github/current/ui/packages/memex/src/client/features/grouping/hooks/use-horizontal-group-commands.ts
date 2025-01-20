import {useCallback} from 'react'

import {CommandPaletteUI, GroupByStatKey} from '../../../api/stats/contracts'
import type {CommandSpec, CommandTreeSpec} from '../../../commands/command-tree'
import {useCommands} from '../../../commands/hook'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useProjectViewRouteMatch} from '../../../hooks/use-project-view-route-match'
import {useViews} from '../../../hooks/use-views'
import {useVisibleFields} from '../../../hooks/use-visible-fields'
import type {ColumnModel} from '../../../models/column-model'
import {isValidHorizontalGroupByColumn} from '../utils'
import {useHorizontalGroupedBy} from './use-horizontal-grouped-by'

export const useHorizontalGroupCommands = () => {
  const {postStats} = usePostStats()
  const {groupedByColumnId, setGroupedBy, clearGroupedBy} = useHorizontalGroupedBy()
  const {isProjectViewRoute} = useProjectViewRouteMatch()
  const {visibleFields} = useVisibleFields()
  const {currentView} = useViews()

  const clearGroupByWithStats = useCallback(
    (column: ColumnModel) => {
      if (!currentView) return
      clearGroupedBy(currentView.number)

      postStats({
        groupByEnabled: false,
        memexProjectColumnId: column.id,
        key: GroupByStatKey,
        ui: CommandPaletteUI,
      })
    },
    [clearGroupedBy, currentView, postStats],
  )

  const setGroupByWithStats = useCallback(
    (column: ColumnModel) => {
      if (!currentView) return
      setGroupedBy(currentView.number, column)

      postStats({
        groupByEnabled: true,
        memexProjectColumnId: column.id,
        key: GroupByStatKey,
        ui: CommandPaletteUI,
      })
    },
    [setGroupedBy, currentView, postStats],
  )

  useCommands(() => {
    if (!isProjectViewRoute) return null

    const commands: Array<CommandSpec> = []
    const tree: CommandTreeSpec = ['g', 'Group by...', commands]

    if (groupedByColumnId) {
      commands.push([
        'g',
        'Remove group by',
        'grouping.clear',
        () => visibleFields.map(col => clearGroupByWithStats(col)),
      ])
    }

    const filteredColumns = visibleFields.filter(col => isValidHorizontalGroupByColumn(col))

    for (const [groupableIndex, col] of Object.entries(filteredColumns)) {
      const isGroupedByColumn = col.id === groupedByColumnId
      if (isGroupedByColumn) {
        commands.push([groupableIndex, `Ungroup by: ${col.name}`, 'column.ungroup', () => clearGroupByWithStats(col)])
      } else {
        commands.push([groupableIndex, `Group by: ${col.name}`, 'column.group', () => setGroupByWithStats(col)])
      }
    }

    return tree
  }, [isProjectViewRoute, groupedByColumnId, visibleFields, setGroupByWithStats, clearGroupByWithStats])
}
