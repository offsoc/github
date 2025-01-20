import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {CommandPaletteUI} from '../../../api/stats/contracts'
import {ViewTypeParam} from '../../../api/view/contracts'
import type {CommandSpec, CommandTreeSpec} from '../../../commands/command-tree'
import {useCommands} from '../../../commands/hook'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useProjectViewRouteMatch} from '../../../hooks/use-project-view-route-match'
import {useViews} from '../../../hooks/use-views'
import {useVisibleFields} from '../../../hooks/use-visible-fields'
import type {ColumnModel} from '../../../models/column-model'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {useAddFieldModal} from '../../../state-providers/modals/use-add-field-modal'

// The title column cannot be hidden
const canChangeVisibility = (column: ColumnModel) => !(column.dataType === MemexColumnDataType.Title)

export const useFieldCommands = () => {
  const {currentView} = useViews()
  const {allColumns} = useAllColumns()
  const {setShowAddFieldModal} = useAddFieldModal()
  const {toggleField, visibleFields} = useVisibleFields()
  const {hasWritePermissions} = ViewerPrivileges()
  const {isProjectViewRoute} = useProjectViewRouteMatch()

  useCommands(() => {
    if (!isProjectViewRoute || !currentView) return null

    const commands: Array<CommandSpec> = []

    if (hasWritePermissions) {
      commands.push(['c', 'Create new field', 'field.create', () => setShowAddFieldModal(true)])
    }

    const args: CommandTreeSpec = ['m', 'Manage fields...', commands]

    // Roadmap view options do not expose the ability to show/hide fields
    if (currentView.localViewState.layout === ViewTypeParam.Roadmap) return args

    const actionableColumns = allColumns.filter(canChangeVisibility)

    for (const [groupableIndex, col] of Object.entries(actionableColumns)) {
      if (visibleFields.find(field => field.id === col.id)) {
        commands.push([
          groupableIndex,
          `Hide: ${col.name}`,
          'column.hide',
          () => toggleField(currentView.number, col, undefined, CommandPaletteUI),
        ])
      } else {
        commands.push([
          groupableIndex,
          `Show: ${col.name}`,
          'column.show',
          () => toggleField(currentView.number, col, undefined, CommandPaletteUI),
        ])
      }
    }
    return args
  }, [
    isProjectViewRoute,
    currentView,
    hasWritePermissions,
    allColumns,
    setShowAddFieldModal,
    toggleField,
    visibleFields,
  ])
}
