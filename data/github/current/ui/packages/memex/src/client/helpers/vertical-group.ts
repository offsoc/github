import type {Iteration} from '../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {PersistedOption} from '../api/columns/contracts/single-select'
import type {ColumnModel} from '../models/column-model'
import {getAllIterations} from './iterations'

/**
 * Given the column's id, returns the column's associated vertical group,
 * @param columnModel the column that is being queried
 * @param id the id of vertical group to be returned
 * @returns Either the Iteration or SelectOption that is associated with the column depending on the column's type
 */
export const findVerticalGroupById = (column: ColumnModel, id: string): Iteration | PersistedOption | undefined => {
  switch (column.dataType) {
    case MemexColumnDataType.Iteration: {
      return getAllIterations(column).find(i => i.id === id) ?? undefined
    }
    case MemexColumnDataType.SingleSelect: {
      return column.settings.options?.find(i => i.id === id) ?? undefined
    }
  }
}

/**
 * Given the column's id, returns the column's associated vertical group's label,
 * @param columnModel the column that is being queried
 * @param id the id of vertical group to be returned
 * @returns The title if the vertical group is an Interation and name if the vertical group is a SelectOption
 */
export const findVerticalGroupLabelById = (column: ColumnModel, id: string): string | undefined => {
  const verticalGroup = findVerticalGroupById(column, id)
  if (!verticalGroup) {
    return undefined
  }

  if ('title' in verticalGroup) {
    return verticalGroup.title
  }

  return verticalGroup.name
}
