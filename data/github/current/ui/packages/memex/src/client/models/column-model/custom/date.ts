import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class DateColumnModel extends BaseColumnModel {
  public declare readonly id: number
  public declare readonly dataType: typeof MemexColumnDataType.Date
  public declare readonly userDefined: true
}
