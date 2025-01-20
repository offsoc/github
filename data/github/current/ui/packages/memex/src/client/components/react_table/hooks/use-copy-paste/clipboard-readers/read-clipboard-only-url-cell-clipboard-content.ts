import type {TableDataType} from '../../../table-data-type'
import {ClipboardOnly_UrlColumnModel} from '../constants'
import type {ClipboardEntry} from '../types'

export const readClipboardOnlyUrlCellClipboardContent = (row: TableDataType): ClipboardEntry => {
  const url = row.getUrl()
  return {
    text: url,
    dataType: ClipboardOnly_UrlColumnModel.dataType,
    value: url,
  }
}
