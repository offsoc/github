import {useCallback} from 'react'

import {useTableInstance} from '../table-provider'

/** Get all visible rows in the table, filtering out rows that are hidden in collapsd groups. */
export const useGetVisibleRows = () => {
  const tableInstance = useTableInstance()
  return useCallback(
    () =>
      tableInstance.groupedRows?.flatMap(group => (group.isCollapsed ? [] : group.subRows)) ?? tableInstance.flatRows,
    [tableInstance],
  )
}
