import {useEffect, useRef} from 'react'
import type {TableInstance, UseTableHooks} from 'react-table'

import {useColumnWidth} from '../../state-providers/columns/use-column-width'

export function usePersistColumnResize<D extends object>(hooks: UseTableHooks<D>) {
  hooks.useInstance.push(useInstance)
}

function useInstance<D extends object>(instance: TableInstance<D>) {
  const resizingColumnIdRef = useRef<string | null | undefined>(instance.state.columnResizing.isResizingColumn)

  const {updateWidth} = useColumnWidth()

  useEffect(() => {
    // We track what column is being resized by react-table - when it's no
    // longer being resized, we know to persist the size according to
    // react-table state.

    if (resizingColumnIdRef.current != null && !instance.state.columnResizing.isResizingColumn) {
      const column = instance.columns.find(c => c.id === resizingColumnIdRef.current)
      if (column && column.width !== null) {
        updateWidth(resizingColumnIdRef.current, Number(column.width))
      }
    }

    // set the ref
    resizingColumnIdRef.current = instance.state.columnResizing.isResizingColumn
  }, [instance.columns, instance.state.columnResizing, updateWidth])
}
