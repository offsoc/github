import type {TableInstance, UseTableHooks} from 'react-table'

export function usePreventColumnAutoResize<D extends object>(hooks: UseTableHooks<D>) {
  hooks.useInstance.push(useInstance)
}

function useInstance<D extends object>(instance: TableInstance<D>) {
  // Prevent live updates from resetting column widths if the user is resizing
  Object.assign(instance, {
    autoResetResize: !instance.state.columnResizing.isResizingColumn,
  })
}
