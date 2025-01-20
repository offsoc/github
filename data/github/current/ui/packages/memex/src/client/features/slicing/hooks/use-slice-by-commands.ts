import {useCallback} from 'react'

import {CommandPaletteUI, SliceByApplied, SliceByRemoved} from '../../../api/stats/contracts'
import type {CommandSpec, CommandTreeSpec} from '../../../commands/command-tree'
import {useCommands} from '../../../commands/hook'
import {sortColumnsDeterministically} from '../../../helpers/util'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useProjectViewRouteMatch} from '../../../hooks/use-project-view-route-match'
import {useViewType} from '../../../hooks/use-view-type'
import {useViews} from '../../../hooks/use-views'
import type {ColumnModel} from '../../../models/column-model'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {isSliceableField} from '../slice-utils'
import {useSliceBy} from './use-slice-by'

export const useSliceByCommands = () => {
  const {postStats} = usePostStats()
  const {viewType} = useViewType()
  const {sliceField, setSliceField, clearSliceField} = useSliceBy()
  const {isProjectViewRoute} = useProjectViewRouteMatch()
  const {allColumns} = useAllColumns()
  const {currentView} = useViews()

  const clearSliceBy = useCallback(
    (column?: ColumnModel) => {
      if (!currentView) return
      clearSliceField(currentView.number)

      postStats({
        name: SliceByRemoved,
        memexProjectColumnId: column?.id,
        ui: CommandPaletteUI,
        context: JSON.stringify({layout: viewType}),
      })
    },
    [clearSliceField, currentView, postStats, viewType],
  )

  const setSliceBy = useCallback(
    (column: ColumnModel) => {
      if (!currentView) return
      setSliceField(currentView.number, column)

      postStats({
        name: SliceByApplied,
        memexProjectColumnId: column.id,
        ui: CommandPaletteUI,
        context: JSON.stringify({layout: viewType}),
      })
    },
    [currentView, setSliceField, postStats, viewType],
  )

  useCommands(() => {
    if (!isProjectViewRoute) return null

    // Commnands are ordered by the key, so making this 'h' puts 'Slice by' directly below 'Group by' using 'g'
    // The key doesn't actually seem to be a shortcut key as the CommandTreeSpec doc implies
    const key = 'h'
    const commands: Array<CommandSpec> = []
    const tree: CommandTreeSpec = [key, 'Slice by...', commands]

    if (sliceField) {
      commands.push([key, 'Remove slice by', 'slicing.clear', clearSliceBy])
    }

    const sliceableFields = allColumns
      .filter(column => isSliceableField(column.dataType))
      .sort(sortColumnsDeterministically)

    for (const [sliceableIndex, col] of Object.entries(sliceableFields)) {
      const isSliceField = col.id === sliceField?.id
      if (isSliceField) {
        commands.push([sliceableIndex, `Unslice by: ${col.name}`, 'column.unslice', () => clearSliceBy(col)])
      } else {
        commands.push([sliceableIndex, `Slice by: ${col.name}`, 'column.slice', () => setSliceBy(col)])
      }
    }

    return tree
  }, [isProjectViewRoute, sliceField, allColumns, clearSliceBy, setSliceBy])
}
