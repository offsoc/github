import type {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {useHasColumnData} from '../../state-providers/columns/use-has-column-data'

export const useIsColumnLoaded = (columnId: number | SystemColumnId) => {
  const isColumnLoaded = useLazyIsColumnLoaded()
  return isColumnLoaded(columnId)
}

function useLazyIsColumnLoaded() {
  const {hasColumnData} = useHasColumnData()
  return (columnId: number | SystemColumnId) => hasColumnData(columnId)
}
