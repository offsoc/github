import type {Column, UseTableHooks} from 'react-table'

export const useRoadmapPillArea = <D extends object>(hooks: UseTableHooks<D>) => {
  hooks.columns.push(columnHook)
}

/**
 * Column representation of roadmap pill area in the roadmap view, used for navigation.
 */

export const ROADMAP_PILL_COLUMN_ID = 'roadmap-pill-area'

const roadmapPillArea = {
  Header: '',
  id: ROADMAP_PILL_COLUMN_ID,
  width: 50,
  canSort: false,
  nonNavigable: false,
  canBeShifted: false,
  canReorder: false,
  Placeholder: '',
  Cell: '',
  CellEditor: '',
}

const columnHook = <D extends object>(columns: Array<Column<D>>) => {
  return [...columns, roadmapPillArea]
}
