import type {MemexColumn, MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {PersistedOption} from '../../../api/columns/contracts/single-select'
import {BaseColumnModel} from './base'

export abstract class BaseSingleSelectColumnModel extends BaseColumnModel {
  public declare readonly id: number | typeof SystemColumnId.Status
  public declare readonly dataType: typeof MemexColumnDataType.SingleSelect
  public declare readonly settings: {
    width: number
    options: Array<PersistedOption>
  }
  constructor(column: MemexColumn) {
    super({
      ...column,
      settings: {
        ...column.settings,
        options: column.settings?.options ?? [],
      },
    })
  }
}
