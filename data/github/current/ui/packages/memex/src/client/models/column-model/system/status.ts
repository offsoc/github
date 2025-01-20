import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseSingleSelectColumnModel} from '../abstract/base-single-select'

export class StatusColumnModel extends BaseSingleSelectColumnModel {
  public declare readonly id: typeof SystemColumnId.Status
  public declare readonly dataType: typeof MemexColumnDataType.SingleSelect
  public declare readonly userDefined: false
}
