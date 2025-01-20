import type {TableDataType} from '../../table-data-type'
import {parseValidColumn} from './parse-valid-column'
import type {ClipboardCellData, ClipboardColumnModel} from './types'

export function extractCellData(columnModel: ClipboardColumnModel, row: TableDataType): ClipboardCellData | undefined {
  let repositoryId: number | undefined
  if (row.contentRepositoryId) {
    repositoryId = row.contentRepositoryId
  }

  const column = parseValidColumn(columnModel)
  if (!column) {
    return
  }

  return {repositoryId, column, row}
}
