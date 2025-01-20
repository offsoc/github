import type {MemexColumn, MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export const DEFAULT_TITLE_COLUMN_WIDTH = 650

export class TitleColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Title
  public declare readonly dataType: typeof MemexColumnDataType.Title
  public declare readonly userDefined: false

  public constructor(column: MemexColumn) {
    super({
      ...column,
      settings: {
        ...column.settings,
        width: column.settings?.width ?? DEFAULT_TITLE_COLUMN_WIDTH,
      },
    })
  }
}
